import os
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from sqlalchemy.orm import Session
from app.core.database import get_db, get_mongo_db
from app.api.deps import get_current_user
from app.models.sql import User, Survey, MonitoringSite, Device, Observation
from app.services.ai.iucn_service import get_conservation_status, IUCN_CATEGORY_DESCRIPTIONS
from app.services.ai.taxonomy_service import get_gbif_taxonomy
from app.services.population_analytics import PopulationAnalytics
from app.services.gis_service import GISService
from bson.objectid import ObjectId

LOCAL_IUCN_MAP = {
    "panthera leo": "VU", "lion": "VU",
    "panthera tigris": "EN", "tiger": "EN",
    "panthera pardus": "VU", "leopard": "VU",
    "loxodonta africana": "EN", "african elephant": "EN",
    "ailurus fulgens": "EN", "red panda": "EN",
    "canis lupus": "LC", "gray wolf": "LC", "wolf": "LC",
    "ursus arctos": "LC", "brown bear": "LC", "grizzly bear": "LC"
}

LOCAL_TAXONOMY_MAP = {
    "panthera leo": "Mammalia", "lion": "Mammalia",
    "panthera tigris": "Mammalia", "tiger": "Mammalia",
    "panthera pardus": "Mammalia", "leopard": "Mammalia",
    "loxodonta africana": "Mammalia", "african elephant": "Mammalia",
    "ailurus fulgens": "Mammalia", "red panda": "Mammalia",
    "canis lupus": "Mammalia", "gray wolf": "Mammalia",
    "ursus arctos": "Mammalia", "grizzly bear": "Mammalia"
}

def is_valid_species_name(name: str) -> bool:
    if not name or not isinstance(name, str):
        return False
    clean = name.strip().lower()
    return clean not in ["unknown", "engine", "yolov8", "birdnet", "animalclap", "n/a", "none", "background", "no animal detected", "unknown species detected"]

def resolve_fast_iucn(species_name: str) -> str:
    if not species_name: return "LC"
    clean = species_name.strip().lower()
    if clean in LOCAL_IUCN_MAP:
        return LOCAL_IUCN_MAP[clean]
    if any(k in clean for k in ["tiger", "elephant", "panda", "rhino", "gorilla", "orangutan"]):
        return "EN"
    if any(k in clean for k in ["lion", "leopard", "cheetah", "hippo", "polar bear"]):
        return "VU"
    if any(k in clean for k in ["whale", "otter", "tamarin"]):
        return "CR"
    return "LC"

def resolve_fast_taxonomy(species_name: str) -> str:
    if not species_name: return "Mammalia"
    clean = species_name.strip().lower()
    if clean in LOCAL_TAXONOMY_MAP:
        return LOCAL_TAXONOMY_MAP[clean]
    if any(k in clean for k in ["owl", "eagle", "falcon", "penguin", "bird", "parus", "sparrow", "hawk", "duck", "goose", "corbun", "commyn", "busflu"]):
        return "Aves"
    if any(k in clean for k in ["snake", "lizard", "turtle", "gecko", "python", "cobra", "viper"]):
        return "Reptilia"
    if any(k in clean for k in ["frog", "toad", "salamander"]):
        return "Amphibia"
    if any(k in clean for k in ["spider", "beetle", "butterfly", "ant", "bee", "wasp", "fly"]):
        return "Insecta"
    return "Mammalia"

def _get_effective_predictions(current_user: User, mongo_db: Any, file_type: Optional[str] = None) -> List[Dict[str, Any]]:
    user_role = str(getattr(current_user.role, "value", current_user.role))
    
    if user_role in ["Admin", "ForestDept", "Officer"]:
        query = {}
        if file_type:
            query["media_type"] = file_type
        return list(mongo_db["predictions"].find(query).sort([("prediction_timestamp", -1), ("_id", -1)]))

    user_id = current_user.id
    user_media_query = {"uploaded_by": user_id}
    if file_type:
        user_media_query["file_type"] = file_type
    user_media_docs = list(mongo_db["uploaded_media"].find(user_media_query))
    user_media_ids = [str(m["_id"]) for m in user_media_docs]

    user_preds_query = {
        "$or": [
            {"user_id": user_id},
            {"uploaded_media_id": {"$in": user_media_ids}}
        ]
    }
    if file_type:
        user_preds_query["media_type"] = file_type

    user_preds = list(mongo_db["predictions"].find(user_preds_query).sort([("prediction_timestamp", -1), ("_id", -1)]))
    return user_preds

router = APIRouter()

@router.get("/biodiversity", response_model=Dict[str, Any])
def get_biodiversity_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    mongo_db = Depends(get_mongo_db)
):
    """
    Returns real biodiversity analytics dynamically computed from
    observations, surveys, sites, and AI predictions.
    Delegates analytical business logic to PopulationAnalytics service.
    """
    user_id = current_user.id
    user_role = str(getattr(current_user.role, "value", current_user.role))

    if user_role in ["Admin", "ForestDept", "Officer"]:
        user_observations = db.query(Observation).all()
        user_surveys = db.query(Survey).all()
        user_sites = db.query(MonitoringSite).all()
    else:
        user_observations = db.query(Observation).filter(Observation.researcher_id == user_id).all()
        user_surveys = db.query(Survey).filter(Survey.created_by == user_id).all()
        user_sites = db.query(MonitoringSite).all()

    survey_lookup = {s.id: s.title for s in db.query(Survey).all()}
    site_lookup = {st.id: st.name for st in db.query(MonitoringSite).all()}

    mongo_preds = _get_effective_predictions(current_user, mongo_db)

    # Enrich media filename if missing from prediction record
    media_ids = [str(p.get("uploaded_media_id")) for p in mongo_preds if p.get("uploaded_media_id")]
    media_docs = list(mongo_db["uploaded_media"].find({"_id": {"$in": [ObjectId(m_id) for m_id in media_ids if ObjectId.is_valid(m_id)]}})) if media_ids else []
    media_dict = {str(m["_id"]): m.get("filename") for m in media_docs}
    for p in mongo_preds:
        if not p.get("filename") and str(p.get("uploaded_media_id")) in media_dict:
            p["filename"] = media_dict[str(p.get("uploaded_media_id"))]

    completed_preds = [
        p for p in mongo_preds 
        if (p.get("media_type") == "image" or not p.get("media_type")) and (p.get("processing_status") == "completed" or p.get("primary_species") or p.get("common_name"))
    ]

    return PopulationAnalytics.compute_biodiversity_analytics(
        user_id=user_id,
        user_name=current_user.full_name,
        user_observations=user_observations,
        user_surveys=user_surveys,
        user_sites=user_sites,
        survey_lookup=survey_lookup,
        site_lookup=site_lookup,
        completed_preds=completed_preds,
        is_valid_species_func=is_valid_species_name,
        fast_iucn_func=resolve_fast_iucn,
        fast_tax_func=resolve_fast_taxonomy,
        iucn_desc_func=get_conservation_status
    )


@router.get("/biodiversity/shannon", response_model=Dict[str, Any])
def get_shannon_biodiversity_index(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    mongo_db = Depends(get_mongo_db)
):
    mongo_preds = _get_effective_predictions(current_user, mongo_db)
    return PopulationAnalytics.calculate_biodiversity_metrics(mongo_preds)


# ====================================================
# TASK 4: Phase 4 Population Analytics Endpoints
# ====================================================

@router.get("/population/count", response_model=Dict[str, Any])
def get_population_count_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    mongo_db = Depends(get_mongo_db)
):
    mongo_preds = _get_effective_predictions(current_user, mongo_db)
    return PopulationAnalytics.calculate_population_count(mongo_preds)


@router.get("/population/density", response_model=Dict[str, Any])
def get_population_density_analytics(
    site_id: Optional[int] = Query(None, description="Optional monitoring site ID filter"),
    species: Optional[str] = Query(None, description="Optional species name filter"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    mongo_db = Depends(get_mongo_db)
):
    mongo_preds = _get_effective_predictions(current_user, mongo_db)

    area_sq_km = 1.0
    if site_id is not None:
        site = db.query(MonitoringSite).filter(MonitoringSite.id == site_id).first()
        if site and getattr(site, "area_sq_km", None):
            area_sq_km = float(site.area_sq_km)
    else:
        all_sites = db.query(MonitoringSite).all()
        total_area = sum([getattr(s, "area_sq_km", 1.0) or 1.0 for s in all_sites])
        area_sq_km = max(total_area, 1.0)

    return PopulationAnalytics.estimate_density(
        predictions=mongo_preds,
        area_sq_km=area_sq_km,
        species_filter=species
    )


@router.get("/population/trends", response_model=Dict[str, Any])
def get_population_trend_analytics(
    interval: str = Query("daily", regex="^(daily|weekly|monthly)$", description="Aggregation interval: daily, weekly, or monthly"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    mongo_db = Depends(get_mongo_db)
):
    mongo_preds = _get_effective_predictions(current_user, mongo_db)
    return PopulationAnalytics.calculate_trends(predictions=mongo_preds, time_interval=interval)


# ====================================================
# PHASE 4 GIS: Sentinel-2 NDVI & Habitat Suitability
# ====================================================

@router.get("/gis/habitat", response_model=Dict[str, Any])
def get_gis_habitat_suitability(
    current_user: User = Depends(get_current_user)
):
    """
    Phase 4 GIS Endpoint: Returns latest calculated NDVI raster statistics & habitat suitability classification.
    """
    return GISService.get_latest_habitat_suitability()


@router.post("/gis/upload-rasters", response_model=Dict[str, Any])
async def upload_and_process_rasters(
    red_band: UploadFile = File(..., description="Sentinel-2 RED Band (Band 4) JP2 or GeoTIFF raster file"),
    nir_band: UploadFile = File(..., description="Sentinel-2 NIR Band (Band 8) JP2 or GeoTIFF raster file"),
    current_user: User = Depends(get_current_user)
):
    """
    Phase 4 GIS Endpoint: Uploads RED and NIR JP2/GeoTIFF band rasters, calculates NDVI:
    NDVI = (NIR - RED) / (NIR + RED)
    Writes the output raster file and returns spatial statistics and habitat suitability classification.
    """
    if not red_band.filename.lower().endswith(('.jp2', '.tif', '.tiff')) or not nir_band.filename.lower().endswith(('.jp2', '.tif', '.tiff')):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Supported formats: Sentinel-2 JP2 and GeoTIFF. Both files must be valid raster files (.jp2, .tif, or .tiff)."
        )

    storage_dir = GISService._ensure_storage_dir()
    timestamp_prefix = os.urandom(4).hex()
    
    red_path = os.path.join(storage_dir, f"temp_red_{timestamp_prefix}_{red_band.filename}")
    nir_path = os.path.join(storage_dir, f"temp_nir_{timestamp_prefix}_{nir_band.filename}")
    output_path = os.path.join(storage_dir, f"ndvi_sentinel2_{timestamp_prefix}.tif")

    try:
        with open(red_path, "wb") as f_red:
            content_red = await red_band.read()
            f_red.write(content_red)

        with open(nir_path, "wb") as f_nir:
            content_nir = await nir_band.read()
            f_nir.write(content_nir)

        # Process NDVI using Rasterio
        analysis_result = GISService.calculate_ndvi(
            red_band_path=red_path,
            nir_band_path=nir_path,
            output_path=output_path
        )
        return analysis_result

    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except FileNotFoundError as fnfe:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(fnfe))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Raster processing error: {str(e)}")
    finally:
        # Cleanup temporary input band files
        if os.path.exists(red_path):
            os.remove(red_path)
        if os.path.exists(nir_path):
            os.remove(nir_path)


# ====================================================
# MODULE 9: Conservation Recommendation Engine
# ====================================================

@router.get("/conservation-recommendations", response_model=Dict[str, Any])
def get_conservation_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    mongo_db = Depends(get_mongo_db)
):
    """
    Module 9 Endpoint: Returns data-driven conservation recommendations, habitat restoration actions,
    protection strategies, monitoring optimization, and resource allocations.
    """
    from app.services.conservation_recommendation_service import ConservationRecommendationService
    return ConservationRecommendationService.generate_recommendations(
        user_id=current_user.id,
        db=db,
        mongo_db=mongo_db
    )

