import uuid
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.database.db import supabase
import random

class MapService:
    @staticmethod
    def _apply_filters(
        query,
        species: Optional[str] = None,
        monitoring_site_id: Optional[str] = None,
        verification_status: Optional[str] = None,
        prediction_source: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        search: Optional[str] = None,
    ):
        if species:
            query = query.ilike("species_name", f"%{species}%")
        if monitoring_site_id:
            query = query.eq("monitoring_site_id", monitoring_site_id)
        if verification_status:
            query = query.eq("verification_status", verification_status)
        if prediction_source:
            if prediction_source.upper() == "AI":
                query = query.eq("prediction_source", "AI")
            else:
                query = query.neq("prediction_source", "AI")
        if start_date:
            query = query.gte("observed_at", start_date.isoformat())
        if end_date:
            query = query.lte("observed_at", end_date.isoformat())
        if search:
            # Simple OR search is complex in postgrest, we'll rely on species name primarily
            # Real full-text search requires a dedicated postgres function, but we can do an ilike on species_name
            query = query.ilike("species_name", f"%{search}%")
        return query

    @staticmethod
    async def get_map_sites() -> List[Dict[str, Any]]:
        res = supabase.table("monitoring_sites").select("*").execute()
        result = []
        for s in (res.data or []):
            result.append({
                "id": str(s.get("id")),
                "site_name": s.get("site_name"),
                "location": s.get("location"),
                "state": s.get("state"),
                "district": s.get("district"),
                "latitude": s.get("latitude"),
                "longitude": s.get("longitude"),
                "habitat_type": s.get("habitat_type"),
                "area_sq_km": s.get("area_sq_km"),
                "status": s.get("status"),
                "type": "site"
            })
        return result

    @staticmethod
    async def get_map_observations(
        species: Optional[str] = None,
        monitoring_site_id: Optional[str] = None,
        verification_status: Optional[str] = None,
        prediction_source: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        search: Optional[str] = None,
        page: int = 1,
        limit: int = 200
    ) -> Dict[str, Any]:
        # Count total
        count_query = supabase.table("observation_records").select("*", count="exact").limit(0)
        count_query = MapService._apply_filters(count_query, species, monitoring_site_id, verification_status, prediction_source, start_date, end_date, search)
        
        try:
            res_count = count_query.execute()
            total = res_count.count if res_count.count is not None else 0
        except Exception:
            total = 0

        # Fetch paginated observations
        skip = (page - 1) * limit
        query = supabase.table("observation_records").select("*").order("observed_at", desc=True).range(skip, skip + limit - 1)
        query = MapService._apply_filters(query, species, monitoring_site_id, verification_status, prediction_source, start_date, end_date, search)
        
        try:
            res_obs = query.execute()
            observations = res_obs.data or []
        except Exception:
            observations = []

        # Fetch sites for coordinate fallback
        try:
            sites_res = supabase.table("monitoring_sites").select("id, latitude, longitude").execute()
            site_coords = {str(s['id']): {"lat": s.get('latitude'), "lng": s.get('longitude')} for s in (sites_res.data or [])}
        except Exception:
            site_coords = {}

        result_obs = []
        for obs in observations:
            lat = obs.get("latitude")
            lng = obs.get("longitude")
            
            # If coordinates are missing, fallback to site coordinates with a jitter
            if lat is None or lng is None:
                coords = site_coords.get(str(obs.get("monitoring_site_id")))
                if coords and coords.get("lat") is not None and coords.get("lng") is not None:
                    jitter = 0.0008
                    lat = coords["lat"] + random.uniform(-jitter, jitter)
                    lng = coords["lng"] + random.uniform(-jitter, jitter)
                else:
                    # Skip if no coordinates can be resolved
                    continue

            result_obs.append({
                "id": str(obs.get("id")),
                "species_name": obs.get("species_name"),
                "scientific_name": obs.get("scientific_name"),
                "observation_type": obs.get("notes"), # Maps to original behavior
                "monitoring_site_id": obs.get("monitoring_site_id"),
                "monitoring_site_name": obs.get("monitoring_site_name"),
                "observer_name": obs.get("observer_name"),
                "observed_at": obs.get("observed_at"),
                "count": obs.get("count"),
                "confidence_score": None,
                "verification_status": obs.get("verification_status"),
                "file_url": None,
                "notes": obs.get("notes"),
                "latitude": lat,
                "longitude": lng,
                "prediction_source": None,
                "prediction_id": str(obs.get("id")),
                "type": "observation"
            })

        # Fetch prediction locations if coordinates exist
        try:
            pred_query = supabase.table("unified_prediction_records").select("*").not_.is_("latitude", "null").not_.is_("longitude", "null")
            if species:
                pred_query = pred_query.ilike("species_name", f"%{species}%")
            if start_date:
                pred_query = pred_query.gte("created_at", start_date.isoformat())
            if end_date:
                pred_query = pred_query.lte("created_at", end_date.isoformat())
                
            res_preds = pred_query.execute()
            predictions = res_preds.data or []
        except Exception:
            predictions = []

        result_preds = []
        for pred in predictions:
            result_preds.append({
                "id": str(pred.get("id")),
                "species_name": pred.get("species_name"),
                "scientific_name": pred.get("scientific_name", pred.get("species_name")),
                "observation_type": "AI Recognition",
                "monitoring_site_id": "AI_Inference",
                "monitoring_site_name": "AI Inference Site",
                "observer_name": pred.get("user_name"),
                "observed_at": pred.get("created_at"),
                "count": 1,
                "confidence_score": pred.get("confidence_score"),
                "verification_status": pred.get("status", "Pending"),
                "file_url": None,
                "notes": f"AI model run. status: {pred.get('status')}",
                "latitude": pred.get("latitude"),
                "longitude": pred.get("longitude"),
                "prediction_source": "AI",
                "prediction_id": str(pred.get("id")),
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
    async def get_heatmap_data(
        species: Optional[str] = None,
        monitoring_site_id: Optional[str] = None,
        verification_status: Optional[str] = None,
        prediction_source: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        search: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        
        query = supabase.table("observation_records").select("*")
        query = MapService._apply_filters(query, species, monitoring_site_id, verification_status, prediction_source, start_date, end_date, search)
        
        try:
            res = query.execute()
            observations = res.data or []
        except Exception:
            observations = []
        
        # Load sites for coordinate mapping
        try:
            sites_res = supabase.table("monitoring_sites").select("id, latitude, longitude").execute()
            site_coords = {str(s['id']): {"lat": s.get('latitude'), "lng": s.get('longitude')} for s in (sites_res.data or [])}
        except Exception:
            site_coords = {}

        site_counts: Dict[str, Dict[str, Any]] = {}
        for obs in observations:
            lat = obs.get("latitude")
            lng = obs.get("longitude")
            
            # Fallback to site coords if needed
            if lat is None or lng is None:
                coords = site_coords.get(str(obs.get("monitoring_site_id")))
                if coords and coords.get("lat") is not None and coords.get("lng") is not None:
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
            site_counts[key]["intensity"] += obs.get("count", 0)

        return list(site_counts.values())

    @staticmethod
    async def get_species_distribution(
        species: Optional[str] = None,
        monitoring_site_id: Optional[str] = None,
        verification_status: Optional[str] = None,
        prediction_source: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        search: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        # Map to the new RPC. It accepts start_date and end_date.
        # Additional filters like monitoring_site_id aren't supported directly by the RPC,
        # but that is acceptable for the global distribution view.
        
        try:
            rpc_params = {}
            if start_date:
                rpc_params["start_date"] = start_date.isoformat()
            if end_date:
                rpc_params["end_date"] = end_date.isoformat()
                
            res = supabase.rpc("rpc_get_map_species_distribution", rpc_params).execute()
            return res.data or []
        except Exception:
            return []

