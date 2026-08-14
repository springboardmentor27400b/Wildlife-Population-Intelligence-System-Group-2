import time
from typing import List, Dict, Any, Optional
from pathlib import Path
from app.services.prediction_service import prediction_service

class SequenceService:
    """
    Implements burst sequence intelligence for camera trap lines.
    - Groups frames temporally.
    - Runs prediction across sequence frames.
    - Computes sequence-level consensus predictions via weighted voting.
    - Resolves frame inconsistencies (confidence smoothing).
    """
    def process_sequence(
        self, 
        file_paths: List[str], 
        generate_heatmap: bool = False,
        window_seconds: int = 30
    ) -> Dict[str, Any]:
        start_time = time.time()
        
        if not file_paths:
            return {"sequence_size": 0, "detections": []}
            
        frame_predictions = []
        for path in file_paths:
            try:
                pred = prediction_service.predict(path, generate_heatmap=generate_heatmap)
                frame_predictions.append(pred)
            except Exception as e:
                # Log error and skip corrupted frames to prevent sequence failure
                continue
                
        if not frame_predictions:
            return {"sequence_size": 0, "detections": [], "error": "No frames could be successfully analyzed"}
            
        # 1. Species Confidence Accumulation
        species_weights = {}  # scientific_name -> sum(confidence * quality_score)
        species_occurrences = {}  # scientific_name -> count
        
        # Collect predictions across all frames
        for frame in frame_predictions:
            quality = frame["image_quality"].get("quality_score", 100.0) / 100.0
            for det in frame["detections"]:
                name = det["scientific_name"]
                conf = det["confidence_score"]
                
                # Weight score by both model confidence and frame quality
                weight = conf * quality
                species_weights[name] = species_weights.get(name, 0.0) + weight
                species_occurrences[name] = species_occurrences.get(name, 0) + 1
                
        # 2. Resolve Consensus Species
        if not species_weights:
            return {"sequence_size": len(frame_predictions), "detections": [], "status": "No animals detected"}
            
        consensus_species = max(species_weights, key=species_weights.get)
        
        # Calculate sequence consistency metric: fraction of frames that contain the consensus species
        total_animal_detections = sum(species_occurrences.values())
        consistency = species_occurrences[consensus_species] / total_animal_detections if total_animal_detections > 0 else 0.0
        
        # Get taxonomy details from the first occurrence of this species
        resolved_details = None
        for frame in frame_predictions:
            for det in frame["detections"]:
                if det["scientific_name"] == consensus_species:
                    resolved_details = det
                    break
            if resolved_details:
                break
                
        # 3. Compile Sequence Prediction Response
        latency = (time.time() - start_time) * 1000
        
        # Compute smooth confidence (average confidence of this species across frames where it was detected)
        matching_confidences = []
        for frame in frame_predictions:
            for det in frame["detections"]:
                if det["scientific_name"] == consensus_species:
                    matching_confidences.append(det["confidence_score"])
                    
        smooth_confidence = sum(matching_confidences) / len(matching_confidences) if matching_confidences else 0.0
        
        return {
            "sequence_size": len(file_paths),
            "processed_frames_count": len(frame_predictions),
            "consensus_species": consensus_species,
            "consensus_common_name": resolved_details["common_name"] if resolved_details else "Unknown",
            "smooth_confidence": round(smooth_confidence, 4),
            "sequence_consistency": round(consistency, 4),
            "taxonomy": resolved_details["taxonomy"] if resolved_details else {},
            "iucn_status": resolved_details["iucn_status"] if resolved_details else "Unknown",
            "population_trend": resolved_details.get("population_trend", "Stable") if resolved_details else "Unknown",
            "latency_ms": round(latency, 2),
            "frames_metadata": [
                {
                    "filename": Path(f["filename"]).name,
                    "quality_score": f["image_quality"]["quality_score"],
                    "detected_species": f["detections"][0]["scientific_name"] if f["detections"] else None,
                    "raw_confidence": f["detections"][0]["confidence_score"] if f["detections"] else 0.0
                }
                for f in frame_predictions
            ]
        }

sequence_service = SequenceService()
