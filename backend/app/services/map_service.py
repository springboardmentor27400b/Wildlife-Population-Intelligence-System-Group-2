from typing import Optional, List, Dict, Any
from datetime import datetime
from app.models.observation import ObservationRecord
from app.models.site import MonitoringSite
from app.models.prediction import PredictionRecord
from beanie import PydanticObjectId
import random

class MapService:
    @staticmethod
    def build_filter_query(
        species: Optional[str] = None,
        monitoring_site_id: Optional[str] = None,
        verification_status: Optional[str] = None,
        prediction_source: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        search: Optional[str] = None,
    ) -> Dict[str, Any]:
        query = {}
        
        # Apply filters
        if species:
            query["species_name"] = {"$regex": species, "$options": "i"}
        if monitoring_site_id:
            query["monitoring_site_id"] = monitoring_site_id
        if verification_status:
            # Match Verification Status
            query["verification_status"] = verification_status
        if prediction_source:
            if prediction_source.upper() == "AI":
                query["prediction_source"] = "AI"
            else:
                query["$or"] = [
                    {"prediction_source": {"$ne": "AI"}},
                    {"prediction_source": None}
                ]

        if start_date or end_date:
            date_query = {}
            if start_date:
                date_query["$gte"] = start_date
            if end_date:
                date_query["$lte"] = end_date
            query["observed_at"] = date_query

        # Apply search by species, site name, or observer
        if search:
            search_regex = {"$regex": search, "$options": "i"}
            query["$or"] = [
                {"species_name": search_regex},
                {"monitoring_site_name": search_regex},
                {"observer_name": search_regex}
            ]

        return query

    @staticmethod
    async def get_map_sites() -> List[Dict[str, Any]]:
        sites = await MonitoringSite.find_all().to_list()
        result = []
        for s in sites:
            result.append({
                "id": str(s.id),
                "site_name": s.site_name,
                "location": s.location,
                "state": s.state,
                "district": s.district,
                "latitude": s.latitude,
                "longitude": s.longitude,
                "habitat_type": s.habitat_type,
                "area_sq_km": s.area_sq_km,
                "status": s.status,
                "type": "site"
            })
        return result

    @staticmethod
    async def get_map_observations(
        query: Dict[str, Any],
        page: int = 1,
        limit: int = 200
    ) -> Dict[str, Any]:
        total = await ObservationRecord.find(query).count()
        skip = (page - 1) * limit
        observations = await ObservationRecord.find(query).sort("-observed_at").skip(skip).limit(limit).to_list()

        # Fetch sites for coordinate fallback
        sites_list = await MonitoringSite.find_all().to_list()
        site_coords = {str(s.id): {"lat": s.latitude, "lng": s.longitude} for s in sites_list}

        result_obs = []
        for obs in observations:
            lat = obs.latitude
            lng = obs.longitude
            
            # If coordinates are missing, fallback to site coordinates with a jitter
            if lat is None or lng is None:
                coords = site_coords.get(obs.monitoring_site_id)
                if coords:
                    jitter = 0.0008
                    lat = coords["lat"] + random.uniform(-jitter, jitter)
                    lng = coords["lng"] + random.uniform(-jitter, jitter)
                else:
                    # Skip if no coordinates can be resolved
                    continue

            result_obs.append({
                "id": str(obs.id),
                "species_name": obs.species_name,
                "scientific_name": obs.scientific_name,
                "observation_type": obs.observation_type,
                "monitoring_site_id": obs.monitoring_site_id,
                "monitoring_site_name": obs.monitoring_site_name,
                "observer_name": obs.observer_name,
                "observed_at": obs.observed_at.isoformat(),
                "count": obs.count,
                "confidence_score": obs.confidence_score,
                "verification_status": obs.verification_status,
                "file_url": obs.file_url,
                "notes": obs.notes,
                "latitude": lat,
                "longitude": lng,
                "prediction_source": getattr(obs, "prediction_source", None),
                "prediction_id": getattr(obs, "prediction_id", None),
                "type": "observation"
            })

        # Fetch prediction locations if coordinates exist
        # We can construct a query matching species, dates, search on prediction records
        pred_query = {}
        if "species_name" in query:
            pred_query["species_name"] = query["species_name"]
        
        # Predictions with coordinates
        pred_query["latitude"] = {"$ne": None}
        pred_query["longitude"] = {"$ne": None}
        
        predictions = await PredictionRecord.find(pred_query).to_list()
        result_preds = []
        for pred in predictions:
            result_preds.append({
                "id": str(pred.id),
                "species_name": pred.species_name,
                "scientific_name": pred.species_name,
                "observation_type": "AI Recognition",
                "monitoring_site_id": "AI_Inference",
                "monitoring_site_name": "AI Inference Site",
                "observer_name": pred.user_name,
                "observed_at": pred.created_at.isoformat(),
                "count": 1,
                "confidence_score": pred.confidence_score,
                "verification_status": "Pending",  # Default prediction status
                "file_url": pred.file_url,
                "notes": f"AI model run. status: {pred.status}",
                "latitude": pred.latitude,
                "longitude": pred.longitude,
                "prediction_source": "AI",
                "prediction_id": str(pred.id),
                "type": "prediction"
            })

        return {
            "total": total,
            "page": page,
            "limit": limit,
            "observations": result_obs,
            "predictions": result_preds
        }

    @staticmethod
    async def get_heatmap_data(query: Dict[str, Any]) -> List[Dict[str, Any]]:
        observations = await ObservationRecord.find(query).to_list()
        
        # Load sites for coordinate mapping
        sites_list = await MonitoringSite.find_all().to_list()
        site_coords = {str(s.id): {"lat": s.latitude, "lng": s.longitude} for s in sites_list}

        site_counts: Dict[str, Dict[str, Any]] = {}
        for obs in observations:
            lat = obs.latitude
            lng = obs.longitude
            
            # Fallback to site coords if needed
            if lat is None or lng is None:
                coords = site_coords.get(obs.monitoring_site_id)
                if coords:
                    lat = coords["lat"]
                    lng = coords["lng"]
                else:
                    continue

            # Key by coordinate precision (approx 3 decimal places to cluster)
            key = f"{round(lat, 3)},{round(lng, 3)}"
            if key not in site_counts:
                site_counts[key] = {
                    "lat": lat,
                    "lng": lng,
                    "intensity": 0
                }
            site_counts[key]["intensity"] += obs.count

        return list(site_counts.values())

    @staticmethod
    async def get_species_distribution(query: Dict[str, Any]) -> List[Dict[str, Any]]:
        pipeline = [
            {"$match": query},
            {
                "$group": {
                    "_id": "$species_name",
                    "observation_count": {"$sum": "$count"},
                    "verified_count": {
                        "$sum": {
                            "$cond": [{"$eq": ["$verification_status", "Verified"]}, "$count", 0]
                        }
                    },
                    "pending_count": {
                        "$sum": {
                            "$cond": [
                                {
                                    "$in": [
                                        "$verification_status",
                                        ["Pending Verification", "Pending Validation", "Pending"]
                                    ]
                                },
                                "$count",
                                0
                            ]
                        }
                    }
                }
            },
            {"$sort": {"observation_count": -1}},
            {"$limit": 20}
        ]
        
        res = await ObservationRecord.aggregate(pipeline).to_list()
        return [
            {
                "species_name": item["_id"],
                "observation_count": item["observation_count"],
                "verified_count": item["verified_count"],
                "pending_count": item["pending_count"]
            }
            for item in res if item["_id"]
        ]
