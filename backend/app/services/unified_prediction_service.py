import os
import json
from pathlib import Path
from datetime import datetime, timezone
from fastapi import UploadFile, HTTPException, Request
from app.models.user import User
from app.models.unified_prediction import UnifiedPredictionRecord
from app.services.prediction_service import PredictionService
from app.services.audio_prediction_service import AudioPredictionService
from app.models.observation import ObservationRecord
from app.utils.audit import create_audit_log
from beanie import PydanticObjectId
from app.models.notification import Notification
from app.models.analytics_cache import AdvancedAnalyticsCache

# Load species biological data
SPECIES_DATA_PATH = Path(__file__).resolve().parent.parent / "core" / "species_data.json"
_SPECIES_DATA = {}
if SPECIES_DATA_PATH.exists():
    with open(SPECIES_DATA_PATH, "r", encoding="utf-8") as f:
        _SPECIES_DATA = json.load(f)

IMAGE_EXTENSIONS = {"jpg", "jpeg", "png", "webp"}
AUDIO_EXTENSIONS = {"wav", "mp3", "flac"}

class UnifiedPredictionService:

    @staticmethod
    def _get_similar_species(species_info: dict, current_species_name: str) -> list:
        similar = []
        family = species_info.get("Family")
        habitat = species_info.get("Habitat")
        diet = species_info.get("Diet")
        conservation = species_info.get("Conservation Status")
        
        for name, data in _SPECIES_DATA.items():
            if name == current_species_name or name == "Unknown":
                continue
            
            score = 0
            if family and data.get("Family") == family:
                score += 3
            if habitat and data.get("Habitat") == habitat:
                score += 1
            if diet and data.get("Diet") == diet:
                score += 1
            if conservation and data.get("Conservation Status") == conservation:
                score += 1
                
            if score > 0:
                similar.append((name, score))
                
        # Sort by score descending
        similar.sort(key=lambda x: x[1], reverse=True)
        return [s[0] for s in similar[:5]]

    @staticmethod
    def _generate_explanation(species_name: str, confidence: float, source_type: str, species_info: dict) -> str:
        if species_name == "Unknown":
            return json.dumps({
                "source": source_type,
                "reasoning": "No strong feature matches found.",
                "confidence_reasoning": f"{confidence}% confidence is below the threshold for positive identification.",
                "context": "N/A"
            })
            
        reasoning = f"Visual features matched typical patterns for {species_name}." if source_type == "Image" else f"Acoustic features such as frequency and rhythm matched typical vocalizations for {species_name}."
        confidence_level = "high" if confidence >= 90 else "moderate" if confidence >= 70 else "low"
        
        return json.dumps({
            "source": source_type,
            "reasoning": reasoning,
            "confidence_reasoning": f"The {confidence}% score indicates a {confidence_level} likelihood of this being a correct match.",
            "context": f"This aligns with its known habitat: {species_info.get('Habitat', 'Unknown')}."
        })

    @staticmethod
    async def predict_unified(
        file: UploadFile,
        current_user: User,
        request: Request
    ) -> dict:
        """
        Routes the file to the appropriate module based on extension,
        then creates and returns a UnifiedPredictionRecord.
        """
        ext = file.filename.split('.')[-1].lower() if '.' in file.filename else ''
        
        # Route to appropriate service
        source_type = None
        raw_record = None
        model_name = ""
        model_version = ""
        
        if ext in IMAGE_EXTENSIONS:
            source_type = "Image"
            raw_record = await PredictionService.process_and_predict(file, "Unified Upload", current_user, request)
            model_name = "AI Species Recognition (Vision)"
            model_version = getattr(raw_record, "model_version", "1.0.0")
        elif ext in AUDIO_EXTENSIONS:
            source_type = "Audio"
            raw_record = await AudioPredictionService.process_and_predict(file, current_user, request)
            model_name = "AI Bioacoustic Recognition"
            model_version = getattr(raw_record, "model_version", "1.0.0 (Audio)")
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type .{ext}. Please upload a valid image or audio file."
            )
            
        species_name = raw_record.species_name
        
        # Enrich with species data
        species_info = _SPECIES_DATA.get(species_name, _SPECIES_DATA.get("Unknown", {}))
        
        unified_record = UnifiedPredictionRecord(
            species_name=species_name,
            confidence_score=raw_record.confidence_score,
            prediction_source=source_type,
            prediction_timestamp=getattr(raw_record, "prediction_timestamp", datetime.now(timezone.utc)),
            model_name=model_name,
            model_version=model_version,
            scientific_name=species_info.get("Scientific Name"),
            taxonomy={
                "Kingdom": species_info.get("Kingdom"),
                "Phylum": species_info.get("Phylum"),
                "Class": species_info.get("Class"),
                "Order": species_info.get("Order"),
                "Genus": species_info.get("Genus"),
                "Species": species_info.get("Species")
            },
            family=species_info.get("Family"),
            category=species_info.get("Category"),
            conservation_status=species_info.get("Conservation Status"),
            habitat=species_info.get("Habitat"),
            diet=species_info.get("Diet"),
            average_lifespan=species_info.get("Average Lifespan"),
            average_weight=species_info.get("Average Weight"),
            geographic_distribution=species_info.get("Geographic Distribution"),
            brief_description=species_info.get("Brief Description"),
            typical_behaviour=species_info.get("Typical Behaviour"),
            active_time=species_info.get("Active Time"),
            population_trend=species_info.get("Population Trend"),
            average_height=species_info.get("Average Height"),
            length=species_info.get("Length"),
            speed=species_info.get("Speed"),
            predators=species_info.get("Predators"),
            prey=species_info.get("Prey"),
            reproduction=species_info.get("Reproduction"),
            interesting_facts=species_info.get("Interesting Facts"),
            native_regions=species_info.get("Native Regions"),
            climate=species_info.get("Climate"),
            food_chain_level=species_info.get("Food Chain Level"),
            endemic_status=species_info.get("Endemic Status"),
            protected_areas=species_info.get("Protected Areas"),
            scientific_reference_url=species_info.get("Scientific Reference URL"),
            top_predictions=[p.dict() for p in getattr(raw_record, "top_predictions", [])],
            explanation=UnifiedPredictionService._generate_explanation(species_name, raw_record.confidence_score, source_type, species_info),
            similar_species=UnifiedPredictionService._get_similar_species(species_info, species_name),
            inference_time=getattr(raw_record, "prediction_time", 0.0),
            prediction_engine=getattr(raw_record, "detection_source", "Unknown"),
            source_record_id=str(raw_record.id),
            user_id=str(current_user.id),
            user_name=current_user.full_name
        )
        
        await unified_record.insert()
        
        # Invalidate Biodiversity Analytics Cache
        await AdvancedAnalyticsCache.find_all().delete()

        # Handle Notifications
        if raw_record.confidence_score < 50:
            await Notification(
                title="Low Confidence Prediction",
                message=f"Prediction for {species_name} has low confidence ({raw_record.confidence_score}%).",
                type="prediction",
                priority="Medium",
                user_id=str(current_user.id),
                related_resource_id=str(unified_record.id)
            ).insert()

        if species_info.get("Conservation Status") in ["Endangered", "Critically Endangered", "Vulnerable"]:
            await Notification(
                title="At-Risk Species Detected",
                message=f"{species_name} ({species_info.get('Conservation Status')}) was detected.",
                type="alert",
                priority="High",
                user_id=str(current_user.id),
                related_resource_id=str(unified_record.id)
            ).insert()

        # Check if New Species (Only 1 prediction exists for this species so far)
        count = await UnifiedPredictionRecord.find({"species_name": species_name}).count()
        if count == 1 and species_name != "Unknown":
            await Notification(
                title="New Species Detected",
                message=f"First time detection for {species_name}!",
                type="info",
                priority="Success",
                user_id=str(current_user.id),
                related_resource_id=str(unified_record.id)
            ).insert()

        return unified_record.dict()

    @staticmethod
    async def link_to_observation(
        unified_id: str,
        observation_id: str,
        current_user: User,
        request: Request
    ) -> dict:
        """
        Links a unified prediction to an observation.
        This also updates the underlying specific record.
        """
        try:
            unified_obj_id = PydanticObjectId(unified_id)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid unified prediction ID format.")
            
        unified = await UnifiedPredictionRecord.get(unified_obj_id)
        if not unified:
            raise HTTPException(status_code=404, detail="Unified prediction not found.")
            
        if unified.status == "Saved":
            raise HTTPException(status_code=400, detail="Prediction is already linked to an observation.")

        try:
            obs_obj_id = PydanticObjectId(observation_id)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid observation ID format.")
            
        observation = await ObservationRecord.get(obs_obj_id)
        if not observation:
            raise HTTPException(status_code=404, detail="Observation record not found.")

        # Update Observation
        observation.prediction_id = unified_id
        observation.prediction_source = f"Unified AI ({unified.prediction_source})"
        if not observation.confidence_score:
            observation.confidence_score = unified.confidence_score
        observation.updated_at = datetime.now(timezone.utc)
        await observation.save()

        # Update Unified Record
        unified.observation_id = observation_id
        unified.status = "Saved"
        unified.updated_at = datetime.now(timezone.utc)
        await unified.save()
        
        # Attempt to link underlying raw record without duplicating audit logs
        # (This avoids leaving the raw record as 'Pending')
        try:
            raw_id = unified.source_record_id
            if unified.prediction_source == "Image":
                from app.models.prediction import PredictionRecord
                raw = await PredictionRecord.get(PydanticObjectId(raw_id))
                if raw:
                    raw.observation_id = observation_id
                    raw.status = "Saved"
                    await raw.save()
            elif unified.prediction_source == "Audio":
                from app.models.audio_prediction import AudioPredictionRecord
                raw = await AudioPredictionRecord.get(PydanticObjectId(raw_id))
                if raw:
                    raw.observation_id = observation_id
                    raw.status = "Saved"
                    await raw.save()
        except Exception as e:
            print(f"Warning: Failed to update raw prediction status: {e}")

        create_audit_log(
            user=current_user,
            request=request,
            action="UNIFIED_PREDICTION_LINKED",
            module="Predictions",
            description=f"Unified Prediction {unified_id} linked to observation {observation_id}.",
            resource_id=unified_id,
            status="Success",
            severity="SUCCESS"
        )
        
        await Notification(
            title="Prediction Linked",
            message=f"Prediction successfully linked to Observation {observation_id}.",
            type="observation",
            priority="Success",
            user_id=str(current_user.id),
            related_resource_id=str(unified_id)
        ).insert()

        return {
            "message": "Unified Prediction successfully linked to existing observation.",
            "unified_id": unified_id,
            "observation_id": observation_id
        }
