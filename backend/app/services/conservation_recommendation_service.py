import uuid
import pandas as pd
import io
import json
import hashlib
from datetime import datetime, timezone, timedelta
from fpdf import FPDF

from app.database.db import supabase
from app.services.habitat_intelligence_service import HabitatIntelligenceService

class ConservationRecommendationService:

    @staticmethod
    def _generate_cache_key(prefix: str, filters: dict) -> str:
        filter_str = json.dumps(filters, sort_keys=True)
        return f"{prefix}_{hashlib.md5(filter_str.encode()).hexdigest()}"

    @staticmethod
    async def get_conservation_insights(filters: dict = None):
        if filters is None:
            filters = {}

        cache_key = ConservationRecommendationService._generate_cache_key("conservation_recommendation", filters)
        
        try:
            cached = supabase.table("advanced_analytics_cache").select("*").eq("query_hash", cache_key).execute()
            if cached.data and datetime.fromisoformat(cached.data[0]['expires_at']) > datetime.utcnow():
                return cached.data[0]['payload']
        except Exception:
            pass

        # 1. Fetch dependencies
        obs_query = supabase.table("observation_records").select("*")
        if filters.get("start_date"):
            obs_query = obs_query.gte("observed_at", filters["start_date"])
        if filters.get("end_date"):
            obs_query = obs_query.lte("observed_at", filters["end_date"])
            
        try:
            observations = obs_query.execute().data or []
        except Exception:
            observations = []

        try:
            sites = supabase.table("monitoring_sites").select("*").execute().data or []
        except Exception:
            sites = []

        try:
            predictions = supabase.table("unified_prediction_records").select("*").execute().data or []
        except Exception:
            predictions = []
        
        # We need Habitat Intelligence data
        habitat_data = await HabitatIntelligenceService.get_habitat_summary(filters)

        # 2. Process data by Species
        species_map = {}
        
        # Get biological data
        import os
        from pathlib import Path
        SPECIES_DATA_PATH = Path(__file__).resolve().parent.parent / "core" / "species_data.json"
        _SPECIES_DATA = {}
        if SPECIES_DATA_PATH.exists():
            with open(SPECIES_DATA_PATH, "r", encoding="utf-8") as f:
                _SPECIES_DATA = json.load(f)

        for obs in observations:
            name = obs.get("species_name")
            if not name or name == "Unknown": continue
            if name not in species_map:
                species_map[name] = {
                    "observations": 0,
                    "sites": set(),
                    "confidence_sum": 0,
                    "confidence_count": 0,
                    "info": _SPECIES_DATA.get(name, {})
                }
            species_map[name]["observations"] += obs.get("count") or 1
            if obs.get("monitoring_site_name"):
                species_map[name]["sites"].add(obs.get("monitoring_site_name"))
            # For observations, we might not have a confidence score unless it's mapped to AI predictions
            conf = obs.get("count_accuracy") or 0 
            if conf:
                species_map[name]["confidence_sum"] += conf
                species_map[name]["confidence_count"] += 1
                
        for pred in predictions:
            name = pred.get("species_name")
            if not name or name == "Unknown": continue
            if name not in species_map:
                species_map[name] = {
                    "observations": 0,
                    "sites": set(),
                    "confidence_sum": 0,
                    "confidence_count": 0,
                    "info": _SPECIES_DATA.get(name, {})
                }
            species_map[name]["observations"] += 1
            conf = pred.get("confidence_score", 0)
            if conf:
                species_map[name]["confidence_sum"] += conf
                species_map[name]["confidence_count"] += 1

        # 3. Generate Recommendations
        species_recommendations = []
        high_priority_species = 0
        endangered_species = 0
        
        for name, data in species_map.items():
            obs_count = data["observations"]
            info = data["info"]
            conservation_status = info.get("Conservation Status", "Least Concern")
            
            # Base logic
            priority_score = 10
            threat_level = "Low"
            recommended_action = "Routine Monitoring"
            recovery_plan = "No active intervention required."
            
            if conservation_status in ["Critically Endangered", "Endangered"]:
                priority_score += 50
                threat_level = "Critical" if conservation_status == "Critically Endangered" else "High"
                endangered_species += 1
                recommended_action = "Immediate Intervention & Habitat Protection"
                recovery_plan = "Establish strict anti-poaching zones, monitor critical habitats 24/7, and initiate captive breeding assessments."
            elif conservation_status == "Vulnerable":
                priority_score += 30
                threat_level = "High"
                endangered_species += 1
                recommended_action = "Targeted Conservation"
                recovery_plan = "Increase monitoring frequency and assess local habitat fragmentation."
            elif obs_count < 5:
                priority_score += 20
                threat_level = "Moderate"
                recommended_action = "Enhance Detection"
                recovery_plan = "Deploy additional acoustic/vision sensors in known range to confirm population."
                
            # Cap score
            priority_score = min(100, priority_score + (10 if len(data["sites"]) < 2 else 0))
            
            if priority_score >= 70:
                high_priority_species += 1
                
            avg_confidence = round(data["confidence_sum"] / data["confidence_count"], 1) if data["confidence_count"] > 0 else 0

            species_recommendations.append({
                "species_name": name,
                "scientific_name": info.get("Scientific Name", "Unknown"),
                "conservation_status": conservation_status,
                "priority_score": priority_score,
                "threat_level": threat_level,
                "recommended_action": recommended_action,
                "recovery_plan": recovery_plan,
                "observation_count": obs_count,
                "sites_present": len(data["sites"]),
                "ai_confidence": avg_confidence,
                "image_url": info.get("image_url", None) # Optional, depends on frontend structure
            })
            
        species_recommendations.sort(key=lambda x: x["priority_score"], reverse=True)
        
        # 4. Site Recommendations
        site_recommendations = []
        for site in habitat_data.get("sites", []):
            site_priority = 0
            site_action = "Routine Patrol"
            if site.get("risk_level") == "Critical":
                site_priority = 90
                site_action = "Emergency Habitat Restoration & Security Deployment"
            elif site.get("risk_level") == "High":
                site_priority = 75
                site_action = "Intensify Monitoring & Limit Human Access"
            elif site.get("quality_score", 0) < 60:
                site_priority = 50
                site_action = "Evaluate Ecological Stressors"
                
            site_recommendations.append({
                "site_name": site.get("site_name"),
                "quality_score": site.get("quality_score"),
                "risk_level": site.get("risk_level"),
                "biodiversity_index": site.get("biodiversity_index"),
                "priority_score": site_priority,
                "recommended_action": site_action
            })
            
        site_recommendations.sort(key=lambda x: x["priority_score"], reverse=True)

        # 5. Build Final Response
        ecosystem_score = round(sum(s["quality_score"] for s in site_recommendations) / len(site_recommendations), 1) if site_recommendations else 0
        
        # Threat Distribution
        threat_dist = {"Low": 0, "Moderate": 0, "High": 0, "Critical": 0}
        for s in species_recommendations:
            threat_dist[s["threat_level"]] += 1
            
        # Priority distribution (Pie)
        priority_dist = [
            {"name": "Low Priority (<40)", "value": len([s for s in species_recommendations if s["priority_score"] < 40])},
            {"name": "Moderate Priority (40-69)", "value": len([s for s in species_recommendations if 40 <= s["priority_score"] < 70])},
            {"name": "High Priority (70-89)", "value": len([s for s in species_recommendations if 70 <= s["priority_score"] < 90])},
            {"name": "Critical Priority (90+)", "value": len([s for s in species_recommendations if s["priority_score"] >= 90])}
        ]

        result = {
            "summary": {
                "high_priority_species": high_priority_species,
                "endangered_species": endangered_species,
                "critical_habitats": habitat_data.get("summary", {}).get("critical_habitats", 0),
                "ecosystem_score": ecosystem_score,
                "total_recommendations": len(species_recommendations) + len(site_recommendations)
            },
            "species_recommendations": species_recommendations,
            "site_recommendations": site_recommendations,
            "threat_distribution": threat_dist,
            "priority_distribution": [p for p in priority_dist if p["value"] > 0],
            "monthly_progress": habitat_data.get("trends", [])  # Reusing habitat trends to represent general progress visually
        }

        # Handle Caching
        try:
            supabase.table("advanced_analytics_cache").upsert({ "id": str(uuid.uuid4()),
                "query_hash": cache_key,
                "payload": result,
                "expires_at": (datetime.utcnow() + timedelta(seconds=300)).isoformat()
            }, on_conflict="query_hash").execute()
        except Exception:
            pass

        # Handle Notifications for Critical Status
        try:
            for rec in species_recommendations:
                if rec["priority_score"] >= 90:
                    supabase.table("notifications").insert({ "id": str(uuid.uuid4()),
                        "title": f"Critical Conservation Priority: {rec['species_name']}",
                        "message": f"{rec['species_name']} requires {rec['recommended_action']}. Priority Score: {rec['priority_score']}",
                        "type": "alert",
                        "priority": "High",
                        "user_id": "admin_all",
                        "is_read": False,
                        "created_at": datetime.utcnow().isoformat()
                    }).execute()
        except Exception as e:
            print("Conservation Notification Error:", e)

        return result

    @staticmethod
    async def export_pdf(filters: dict):
        data = await ConservationRecommendationService.get_conservation_insights(filters)
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", 'B', 16)
        pdf.cell(0, 10, "Conservation Recommendations Report", ln=True, align="C")
        pdf.ln(10)
        
        pdf.set_font("Arial", 'B', 12)
        pdf.cell(0, 10, f"Ecosystem Score: {data['summary']['ecosystem_score']}", ln=True)
        pdf.cell(0, 10, f"High Priority Species: {data['summary']['high_priority_species']}", ln=True)
        pdf.cell(0, 10, f"Endangered Species: {data['summary']['endangered_species']}", ln=True)
        pdf.ln(10)
        
        pdf.set_font("Arial", 'B', 14)
        pdf.cell(0, 10, "Top Species Recommendations", ln=True)
        pdf.set_font("Arial", '', 10)
        for i, s in enumerate(data["species_recommendations"][:10]):
            pdf.cell(0, 6, f"{i+1}. {s['species_name']} (Priority: {s['priority_score']}) - {s['threat_level']}", ln=True)
            pdf.multi_cell(0, 6, f"Action: {s['recommended_action']}\nPlan: {s['recovery_plan']}")
            pdf.ln(4)
            
        pdf_bytes = pdf.output(dest='S').encode('latin1')
        return io.BytesIO(pdf_bytes)

    @staticmethod
    async def export_excel(filters: dict):
        data = await ConservationRecommendationService.get_conservation_insights(filters)
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df_species = pd.DataFrame(data["species_recommendations"])
            df_sites = pd.DataFrame(data["site_recommendations"])
            df_species.to_excel(writer, sheet_name='Species Recommendations', index=False)
            df_sites.to_excel(writer, sheet_name='Site Recommendations', index=False)
        output.seek(0)
        return output

    @staticmethod
    async def export_csv(filters: dict):
        data = await ConservationRecommendationService.get_conservation_insights(filters)
        df = pd.DataFrame(data["species_recommendations"])
        output = io.BytesIO()
        df.to_csv(output, index=False)
        output.seek(0)
        return output

    @staticmethod
    async def export_json(filters: dict):
        data = await ConservationRecommendationService.get_conservation_insights(filters)
        return io.BytesIO(json.dumps(data, indent=2).encode('utf-8'))
