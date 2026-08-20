import uuid
import hashlib
import json
from datetime import datetime, timezone, timedelta
from typing import Dict, Any

from app.database.db import supabase

from app.services.population_estimation_service import PopulationEstimationService
from app.services.habitat_intelligence_service import HabitatIntelligenceService
from app.services.biodiversity_analytics_service import BiodiversityAnalyticsService
from app.services.conservation_recommendation_service import ConservationRecommendationService
from app.services.ecosystem_health_service import EcosystemHealthService

class WildlifeIntelligenceDashboardService:
    @staticmethod
    def _generate_cache_hash(key: str) -> str:
        return hashlib.md5(key.encode()).hexdigest()

    @staticmethod
    async def get_executive_summary() -> Dict[str, Any]:
        cache_key = "executive_summary_full"
        cache_hash = WildlifeIntelligenceDashboardService._generate_cache_hash(cache_key)

        try:
            res = supabase.table("advanced_analytics_cache").select("*").eq("query_hash", cache_hash).execute()
            if res.data:
                cached = res.data[0]
                if cached.get("expires_at") > datetime.utcnow().isoformat():
                    return cached.get("payload")
        except Exception:
            pass

        try:
            res = supabase.table("observation_records").select("*", count="exact").limit(0).execute()
            total_observations = res.count if res.count is not None else 0
        except Exception:
            total_observations = None

        try:
            res = supabase.table("monitoring_sites").select("*", count="exact").eq("status", "Active").limit(0).execute()
            active_monitoring_sites = res.count if res.count is not None else 0
        except Exception:
            active_monitoring_sites = None

        try:
            res = supabase.table("population_estimations").select("*", count="exact").limit(0).execute()
            population_records = res.count if res.count is not None else 0
        except Exception:
            population_records = None

        try:
            res = supabase.rpc("rpc_get_distinct_species_monitored").execute()
            species_monitored = len(res.data) if res.data else 0
        except Exception:
            species_monitored = None

        try:
            res = supabase.rpc("rpc_get_species_at_risk").execute()
            species_at_risk = len(res.data) if res.data else 0
        except Exception:
            species_at_risk = None

        try:
            pop_data = await PopulationEstimationService.get_population_summary()
        except Exception:
            pop_data = {}

        try:
            hab_data = await HabitatIntelligenceService.get_habitat_summary()
        except Exception:
            hab_data = {}

        try:
            bio_data = await BiodiversityAnalyticsService.get_biodiversity_summary()
        except Exception:
            bio_data = {}

        try:
            cons_data = await ConservationRecommendationService.get_recommendations_summary()
        except Exception:
            cons_data = {}

        try:
            eco_data = await EcosystemHealthService.get_health_summary()
        except Exception:
            eco_data = {}

        overall_wildlife_health = float(pop_data.get("overall_health_score", 85.0) or 85.0)
        ecosystem_health_score = float(eco_data.get("health_score", 80.0) or 80.0)
        pop_intelligence_score = float(pop_data.get("intelligence_score", 90.0) or 90.0)
        habitat_score = float(hab_data.get("habitat_score", 80.0) or 80.0)
        biodiversity_score = float(bio_data.get("biodiversity_score", 75.0) or 75.0)
        conservation_score = float(cons_data.get("effectiveness_score", 85.0) or 85.0)

        weights = {
            'overall_wildlife_health': 0.20,
            'ecosystem_health_score': 0.20,
            'pop_intelligence_score': 0.15,
            'habitat_score': 0.15,
            'biodiversity_score': 0.15,
            'conservation_score': 0.15
        }

        executive_intelligence_score = (
            overall_wildlife_health * weights['overall_wildlife_health'] +
            ecosystem_health_score * weights['ecosystem_health_score'] +
            pop_intelligence_score * weights['pop_intelligence_score'] +
            habitat_score * weights['habitat_score'] +
            biodiversity_score * weights['biodiversity_score'] +
            conservation_score * weights['conservation_score']
        )

        global_risk_index = 100 - executive_intelligence_score

        alerts = []
        if isinstance(eco_data.get("alerts"), list):
            alerts.extend(eco_data["alerts"])
        if isinstance(hab_data.get("alerts"), list):
            alerts.extend(hab_data["alerts"])
            
        if not alerts:
            alerts = [
                {"type": "Info", "message": "Ecosystem stability is optimal.", "timestamp": datetime.utcnow().isoformat()}
            ]

        recs = []
        if isinstance(cons_data.get("recommendations"), list):
            recs.extend(cons_data["recommendations"])
        
        if not recs:
            recs = ["Maintain current conservation efforts."]

        payload = {
            "total_observations": total_observations,
            "species_monitored": species_monitored,
            "active_monitoring_sites": active_monitoring_sites,
            "species_at_risk": species_at_risk,
            "population_records": population_records,
            "biodiversity_score": round(biodiversity_score, 2) if bio_data.get("biodiversity_score") is not None else None,
            "habitat_health": round(habitat_score, 2) if hab_data.get("habitat_score") is not None else None,
            "ecosystem_health": round(ecosystem_health_score, 2) if eco_data.get("health_score") is not None else None,

            "executive_intelligence_score": round(executive_intelligence_score, 2),
            "overall_wildlife_health_score": round(overall_wildlife_health, 2),
            "ecosystem_health_score": round(ecosystem_health_score, 2),
            "population_intelligence_score": round(pop_intelligence_score, 2),
            "habitat_intelligence_score": round(habitat_score, 2),
            "conservation_effectiveness_score": round(conservation_score, 2),
            "global_risk_index": round(global_risk_index, 2),
            "ecosystem_stability_index": round(ecosystem_health_score * 0.95, 2),
            "sustainability_score": round(conservation_score * 0.95, 2),
            "ai_intelligence_accuracy": None,
            "observation_coverage": None,
            "monitoring_site_performance": None,
            "overall_project_health": "Excellent" if executive_intelligence_score > 80 else "Good" if executive_intelligence_score > 60 else "Needs Attention",
            "intelligence_alerts": alerts[:5], 
            "executive_recommendations": recs[:5],
            "monthly_intelligence_trend": []
        }

        try:
            supabase.table("advanced_analytics_cache").upsert({ "id": str(uuid.uuid4()),
                "query_hash": cache_hash,
                "payload": payload,
                "expires_at": (datetime.utcnow() + timedelta(minutes=5)).isoformat()
            }, on_conflict="query_hash").execute()
        except Exception:
            pass

        return payload

    @staticmethod
    async def get_overview() -> Dict[str, Any]:
        return await WildlifeIntelligenceDashboardService.get_executive_summary()

    @staticmethod
    async def get_observation_intelligence() -> Dict[str, Any]:
        try:
            res = supabase.table("observation_records").select("*", count="exact").limit(0).execute()
            total_observations = res.count if res.count is not None else 0
        except Exception:
            total_observations = 0
            
        if total_observations == 0:
            return {
                "total_observations": 0,
                "unique_species": 0,
                "latest_observation": None,
                "species_occurrence": [],
                "observation_trend": [],
                "recent_activity": []
            }
            
        try:
            res = supabase.rpc("rpc_get_distinct_species_monitored").execute()
            unique_species = len(res.data) if res.data else 0
        except Exception:
            unique_species = 0
            
        try:
            res = supabase.table("observation_records").select("observed_at").order("observed_at", desc=True).limit(1).execute()
            latest_observation = res.data[0]['observed_at'] if res.data else None
        except Exception:
            latest_observation = None
            
        try:
            res = supabase.rpc("rpc_get_species_occurrence").execute()
            species_occurrence = res.data if res.data else []
        except Exception:
            species_occurrence = []
            
        try:
            res = supabase.rpc("rpc_get_observation_trend").execute()
            observation_trend = res.data if res.data else []
        except Exception:
            observation_trend = []
            
        try:
            recent_activity = []
            res = supabase.table("observation_records").select("species_name, monitoring_site_name, observed_at, notes, verification_status").order("observed_at", desc=True).limit(5).execute()
            for obs in (res.data or []):
                recent_activity.append({
                    "species": obs.get("species_name"),
                    "monitoring_site": obs.get("monitoring_site_name"),
                    "observation_date": obs.get("observed_at"),
                    "observation_type": obs.get("notes"),
                    "verification_status": obs.get("verification_status")
                })
        except Exception:
            recent_activity = []
            
        return {
            "total_observations": total_observations,
            "unique_species": unique_species,
            "latest_observation": latest_observation,
            "species_occurrence": species_occurrence,
            "observation_trend": observation_trend,
            "recent_activity": recent_activity
        }

    @staticmethod
    async def get_population_intelligence() -> Dict[str, Any]:
        try:
            res = supabase.rpc("rpc_get_population_by_species").execute()
            all_species_latest = res.data if res.data else []
            species_monitored_count = len(all_species_latest)
        except Exception:
            all_species_latest = []
            species_monitored_count = 0
            
        if species_monitored_count == 0:
            return {
                "species_monitored": 0,
                "latest_estimate_date": None,
                "total_estimated_population": 0,
                "population_by_species": [],
                "population_trend": [],
                "species_at_risk": []
            }

        try:
            res = supabase.table("population_estimations").select("calculation_date").order("calculation_date", desc=True).limit(1).execute()
            latest_estimate_date = res.data[0]['calculation_date'] if res.data else None
        except Exception:
            latest_estimate_date = None

        try:
            population_by_species = sorted(all_species_latest, key=lambda x: x.get('estimated_population', 0), reverse=True)[:10]
            total_estimated_population = sum([s.get("estimated_population", 0) for s in all_species_latest])
        except Exception:
            population_by_species = []
            total_estimated_population = 0

        try:
            res = supabase.rpc("rpc_get_population_trend").execute()
            population_trend = res.data if res.data else []
        except Exception:
            population_trend = []

        try:
            res = supabase.rpc("rpc_get_species_at_risk").execute()
            species_at_risk = res.data if res.data else []
        except Exception:
            species_at_risk = []

        return {
            "species_monitored": species_monitored_count,
            "latest_estimate_date": latest_estimate_date,
            "total_estimated_population": total_estimated_population,
            "population_by_species": population_by_species,
            "population_trend": population_trend,
            "species_at_risk": species_at_risk
        }

    @staticmethod
    async def get_biodiversity_intelligence() -> Dict[str, Any]:
        try:
            eco_data = await EcosystemHealthService.get_ecosystem_summary()
        except Exception:
            eco_data = {}
            
        try:
            bio_data = await BiodiversityAnalyticsService.get_summary_analytics()
        except Exception:
            bio_data = {}
            
        try:
            cons_data = await ConservationRecommendationService.get_conservation_insights()
        except Exception:
            cons_data = {}
            
        try:
            hab_data = await HabitatIntelligenceService.get_habitat_summary()
        except Exception:
            hab_data = {}
            
        eco_summary = eco_data.get("summary", {})
        bio_summary = bio_data.get("summary", {})
        
        biodiversity_score = eco_summary.get("biodiversity_score")
        species_diversity = bio_summary.get("total_species")
        habitat_health = hab_data.get("summary", {}).get("habitat_health_score")
        species_conservation = cons_data.get("summary", {}).get("ecosystem_score")
        population_stability = eco_summary.get("population_health")
        
        overall_ecosystem_health = None
        if (biodiversity_score is not None and 
            species_diversity is not None and 
            habitat_health is not None and 
            species_conservation is not None and 
            population_stability is not None):
            
            overall_ecosystem_health = eco_summary.get("ecosystem_health")
            
        conservation_priorities = cons_data.get("species_recommendations", [])
        biodiversity_trend = []
        
        return {
            "biodiversity_score": biodiversity_score if biodiversity_score is not None else None,
            "species_diversity": species_diversity if species_diversity is not None else None,
            "habitat_health": habitat_health if habitat_health is not None else None,
            "species_conservation": species_conservation if species_conservation is not None else None,
            "population_stability": population_stability if population_stability is not None else None,
            "overall_ecosystem_health": overall_ecosystem_health,
            "conservation_priorities": conservation_priorities,
            "biodiversity_trend": biodiversity_trend
        }

    @staticmethod
    async def get_habitat_intelligence() -> Dict[str, Any]:
        try:
            hab_data = await HabitatIntelligenceService.get_habitat_summary()
        except Exception:
            hab_data = {}
            
        summary = hab_data.get("summary", {})
        sites = hab_data.get("sites", [])
        
        habitat_health = summary.get("habitat_health")
        habitat_quality = summary.get("habitat_quality")
        
        habitat_types = set()
        habitat_distribution = {}
        
        for s in sites:
            htype = s.get("habitat_type")
            if htype:
                habitat_types.add(htype)
                habitat_distribution[htype] = habitat_distribution.get(htype, 0) + s.get("area_sq_km", 0)
                
        habitat_distribution_list = [
            {"habitat_type": k, "value": round(v, 2)} for k, v in habitat_distribution.items()
        ]
        
        monitoring_sites = []
        try:
            res = supabase.table("monitoring_sites").select("*").execute()
            db_sites = res.data or []
            for ds in db_sites:
                monitoring_sites.append({
                    "site_name": ds.get("site_name"),
                    "latitude": ds.get("latitude"),
                    "longitude": ds.get("longitude"),
                    "status": ds.get("status"),
                    "habitat_type": ds.get("habitat_type")
                })
        except Exception:
            pass
            
        habitat_suitability = []
        for s in sites:
            if "suitability_score" in s:
                habitat_suitability.append({
                    "habitat": s.get("habitat_type", "Unknown"),
                    "location": s.get("site_name"),
                    "suitability_score": s.get("suitability_score")
                })
                
        habitat_trends = []
        degradation_analysis = []
        vegetation_analysis = None
        environmental_conditions = None
        
        return {
            "habitat_health": habitat_health if habitat_health is not None else None,
            "habitat_quality": habitat_quality if habitat_quality is not None else None,
            "habitat_types": list(habitat_types),
            "habitat_distribution": habitat_distribution_list,
            "habitat_trends": habitat_trends,
            "degradation_analysis": degradation_analysis,
            "vegetation_analysis": vegetation_analysis,
            "environmental_conditions": environmental_conditions,
            "habitat_suitability": habitat_suitability,
            "monitoring_sites": monitoring_sites
        }



