import uuid
import pandas as pd
import io
import json
import hashlib
from datetime import datetime, timezone, timedelta
from fpdf import FPDF

from app.database.db import supabase

from app.services.biodiversity_analytics_service import BiodiversityAnalyticsService
from app.services.population_estimation_service import PopulationEstimationService
from app.services.habitat_intelligence_service import HabitatIntelligenceService
from app.services.conservation_recommendation_service import ConservationRecommendationService

class EcosystemHealthService:

    @staticmethod
    def _generate_cache_key(prefix: str, filters: dict) -> str:
        filter_str = json.dumps(filters, sort_keys=True)
        return f"{prefix}_{hashlib.md5(filter_str.encode()).hexdigest()}"

    @staticmethod
    async def get_ecosystem_summary(filters: dict = None):
        if filters is None:
            filters = {}

        cache_key = EcosystemHealthService._generate_cache_key("ecosystem_health", filters)
        
        try:
            cached = supabase.table("advanced_analytics_cache").select("*").eq("query_hash", cache_key).execute()
            if cached.data and datetime.fromisoformat(cached.data[0]['expires_at']) > datetime.utcnow():
                return cached.data[0]['payload']
        except Exception:
            pass

        # Parallel fetching of the 4 major intelligence engines
        # We await them sequentially here to avoid complex task management, but they use the same DB connection pool
        biodiversity_data = await BiodiversityAnalyticsService.get_summary_analytics(
            start_date=filters.get("start_date"), end_date=filters.get("end_date")
        )
        population_data = await PopulationEstimationService.get_population_summary(
            start_date=filters.get("start_date"), end_date=filters.get("end_date")
        )
        habitat_data = await HabitatIntelligenceService.get_habitat_summary(
            start_date=filters.get("start_date"), end_date=filters.get("end_date")
        )
        conservation_data = await ConservationRecommendationService.get_conservation_insights(
            filters=filters
        )

        # Base scores extraction
        bio_health_score = biodiversity_data.get("summary", {}).get("biodiversity_health_score", 0)
        pop_growth = population_data.get("summary", {}).get("population_growth", 0)
        hab_score = habitat_data.get("summary", {}).get("habitat_health_score", 0)
        ecosystem_conservation_score = conservation_data.get("summary", {}).get("ecosystem_score", 0)
        
        # 1. Ecosystem Health Score (0-100)
        # Formula: (Biodiversity * 0.3) + (Habitat * 0.4) + (Conservation * 0.3)
        ecosystem_health = round((bio_health_score * 0.3) + (hab_score * 0.4) + (ecosystem_conservation_score * 0.3), 1)

        # 2. Stability Index
        # Stable if population growth is steady (near 0 is fine, negative is bad) and biodiversity is high
        stability_index = min(100, max(0, round(bio_health_score + (pop_growth * 5), 1)))

        # 3. Sustainability Score
        # Driven by habitat quality and lack of critical conservation priorities
        high_priority_count = conservation_data.get("summary", {}).get("high_priority_species", 0)
        sustainability_score = min(100, max(0, round(hab_score - (high_priority_count * 2), 1)))
        
        # 4. Conservation Effectiveness
        # Trend over time (simplified)
        cons_effectiveness = min(100, round(ecosystem_conservation_score * 1.1, 1))

        # 5. Risk Level
        risk_level = "Low"
        if ecosystem_health < 40:
            risk_level = "Critical"
        elif ecosystem_health < 60:
            risk_level = "High"
        elif ecosystem_health < 80:
            risk_level = "Moderate"

        # Monthly Trends (Removed mock data)
        health_trends = []

        result = {
            "summary": {
                "ecosystem_health": ecosystem_health,
                "stability_index": stability_index,
                "sustainability_score": sustainability_score,
                "biodiversity_score": bio_health_score,
                "population_health": min(100, max(0, 50 + pop_growth * 10)),
                "conservation_effectiveness": cons_effectiveness,
                "risk_level": risk_level,
                "recovery_progress": min(100, round((ecosystem_health / 100) * 100, 1))
            },
            "trends": {
                "health_trends": health_trends,
                "biodiversity_trends": biodiversity_data.get("trends", [])[-6:],
                "population_trends": population_data.get("trends", [])[-6:]
            },
            "distributions": {
                "habitat_health": habitat_data.get("distributions", {}).get("quality_bands", []),
                "risk_distribution": conservation_data.get("threat_distribution", {}),
                "site_comparison": [
                    {
                        "site": site.get("site_name"),
                        "health": site.get("quality_score", 0),
                        "risk": site.get("risk_level", "Low"),
                        "biodiversity_index": site.get("biodiversity_index", 0)
                    } for site in habitat_data.get("sites", [])[:6]
                ]
            },
            "tables": {
                "site_health": habitat_data.get("sites", []),
                "species_contribution": conservation_data.get("species_recommendations", []),
                "conservation_summary": conservation_data.get("site_recommendations", [])
            }
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

        # Handle Notifications
        try:
            if risk_level == "Critical":
                supabase.table("notifications").insert({ "id": str(uuid.uuid4()),
                    "title": "Critical Ecosystem Alert",
                    "message": f"Ecosystem Health has dropped to {ecosystem_health} (Critical Risk).",
                    "type": "alert",
                    "priority": "High",
                    "user_id": "admin_all",
                    "is_read": False,
                    "created_at": datetime.utcnow().isoformat()
                }).execute()
            elif ecosystem_health >= 90:
                supabase.table("notifications").insert({ "id": str(uuid.uuid4()),
                    "title": "Ecosystem Recovery Milestone",
                    "message": f"Ecosystem Health has reached excellent levels ({ecosystem_health}).",
                    "type": "achievement",
                    "priority": "Low",
                    "user_id": "admin_all",
                    "is_read": False,
                    "created_at": datetime.utcnow().isoformat()
                }).execute()
        except Exception as e:
            print("Ecosystem Notification Error:", e)

        return result

    @staticmethod
    async def export_pdf(filters: dict):
        data = await EcosystemHealthService.get_ecosystem_summary(filters)
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", 'B', 16)
        pdf.cell(0, 10, "Ecosystem Health Report", ln=True, align="C")
        pdf.ln(10)
        
        pdf.set_font("Arial", 'B', 12)
        pdf.cell(0, 10, f"Ecosystem Health Score: {data['summary']['ecosystem_health']}/100", ln=True)
        pdf.cell(0, 10, f"Stability Index: {data['summary']['stability_index']}/100", ln=True)
        pdf.cell(0, 10, f"Sustainability Score: {data['summary']['sustainability_score']}/100", ln=True)
        pdf.cell(0, 10, f"Risk Level: {data['summary']['risk_level']}", ln=True)
        pdf.ln(10)
        
        pdf.set_font("Arial", 'B', 14)
        pdf.cell(0, 10, "Top Site Health Statistics", ln=True)
        pdf.set_font("Arial", '', 10)
        for i, s in enumerate(data["tables"]["site_health"][:10]):
            pdf.cell(0, 6, f"{i+1}. {s.get('site_name', 'Unknown')} - Quality: {s.get('quality_score', 0)} - Risk: {s.get('risk_level', 'Unknown')}", ln=True)
            
        pdf_bytes = pdf.output(dest='S').encode('latin1')
        return io.BytesIO(pdf_bytes)

    @staticmethod
    async def export_excel(filters: dict):
        data = await EcosystemHealthService.get_ecosystem_summary(filters)
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df_sites = pd.DataFrame(data["tables"]["site_health"])
            df_species = pd.DataFrame(data["tables"]["species_contribution"])
            df_sites.to_excel(writer, sheet_name='Site Health', index=False)
            df_species.to_excel(writer, sheet_name='Species Contribution', index=False)
        output.seek(0)
        return output

    @staticmethod
    async def export_csv(filters: dict):
        data = await EcosystemHealthService.get_ecosystem_summary(filters)
        df = pd.DataFrame(data["tables"]["site_health"])
        output = io.BytesIO()
        df.to_csv(output, index=False)
        output.seek(0)
        return output

    @staticmethod
    async def export_json(filters: dict):
        data = await EcosystemHealthService.get_ecosystem_summary(filters)
        return io.BytesIO(json.dumps(data, indent=2).encode('utf-8'))


