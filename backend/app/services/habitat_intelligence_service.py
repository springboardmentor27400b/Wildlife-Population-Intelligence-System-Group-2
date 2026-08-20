import uuid
import os
import json
import io
import hashlib
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any, List
from fastapi.responses import StreamingResponse
from app.database.db import supabase
from pathlib import Path
import pandas as pd
from fpdf import FPDF
import math

class HabitatIntelligenceService:

    @staticmethod
    def _generate_cache_hash(params: dict) -> str:
        return hashlib.md5(json.dumps(params, default=str).encode()).hexdigest()

    @staticmethod
    async def get_raw_habitat_data(
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        species: Optional[str] = None,
        site_name: Optional[str] = None,
        min_quality: Optional[int] = None,
        risk_level: Optional[str] = None
    ) -> Dict[str, Any]:
        
        # We need Sites, Observations, Population records
        try:
            sites = supabase.table("monitoring_sites").select("*").execute().data or []
        except Exception:
            sites = []
        
        obs_query = supabase.table("observation_records").select("*").eq("verification_status", "Verified")
        pop_query = supabase.table("population_estimations").select("*")
        pred_query = supabase.table("unified_prediction_records").select("*")

        if start_date and end_date:
            try:
                obs_query = obs_query.gte("observed_at", start_date).lte("observed_at", end_date)
                pred_query = pred_query.gte("prediction_timestamp", start_date).lte("prediction_timestamp", end_date)
            except Exception:
                pass
                
        if species:
            obs_query = obs_query.eq("species_name", species)
            pop_query = pop_query.eq("species_name", species)
            pred_query = pred_query.eq("species_name", species)
            
        if site_name:
            obs_query = obs_query.eq("monitoring_site_name", site_name)
            pop_query = pop_query.eq("monitoring_site_name", site_name)

        try:
            observations = obs_query.execute().data or []
        except Exception:
            observations = []

        try:
            populations = pop_query.execute().data or []
        except Exception:
            populations = []

        try:
            predictions = pred_query.execute().data or []
        except Exception:
            predictions = []

        # Build Site Aggregations
        site_stats = {}
        for s in sites:
            s_name = s.get("site_name")
            site_stats[s_name] = {
                "id": str(s.get("id")),
                "site_name": s_name,
                "location": s.get("location"),
                "habitat_type": s.get("habitat_type"),
                "area_sq_km": s.get("area_sq_km") or 10.0,
                "observations": [],
                "populations": [],
                "predictions": []
            }
            
        for obs in observations:
            site = obs.get("monitoring_site_name")
            if site in site_stats:
                site_stats[site]["observations"].append(obs)

        # For accurate habitat intelligence, we use the observations to derive site-level stats
        processed_sites = []
        global_species_set = set()
        total_pop_density = 0
        total_health = 0
        
        # Calculate max obs count across all sites to normalize density
        max_obs_count = max([len(data["observations"]) for data in site_stats.values()]) if site_stats else 1
        if max_obs_count == 0: max_obs_count = 1

        for site_name_key, data in site_stats.items():
            obs_list = data["observations"]
            
            # Species Richness
            species_set = set([o.get("species_name") for o in obs_list if o.get("species_name")])
            richness = len(species_set)
            global_species_set.update(species_set)
            
            # Observation Density (obs per sq km)
            obs_density = len(obs_list) / data["area_sq_km"]
            
            # Biodiversity Index (Shannon Index approximation)
            # -sum(p_i * ln(p_i))
            total_individuals = sum([o.get("count", 1) for o in obs_list])
            shannon_index = 0.0
            if total_individuals > 0:
                sp_counts = {}
                for o in obs_list:
                    sp_name = o.get("species_name")
                    if sp_name:
                        sp_counts[sp_name] = sp_counts.get(sp_name, 0) + o.get("count", 1)
                for count in sp_counts.values():
                    pi = count / total_individuals
                    shannon_index -= pi * math.log(pi)
            
            # Normalize biodiversity (0-100 scale, assuming max index ~ 3.0 for natural habitats)
            normalized_biodiversity = min(100, (shannon_index / 3.0) * 100)
            
            # Ecosystem Health (Derived from biodiversity and observation frequency)
            health_score = min(100, (normalized_biodiversity * 0.6) + ((len(obs_list)/max_obs_count)*100 * 0.4))
            total_health += health_score
            
            # Habitat Quality Score (Weighted Algorithm)
            # 40% Biodiversity, 30% Species Richness (normalized), 30% Health
            richness_score = min(100, (richness / 10) * 100) # Assuming 10 is high richness
            quality_score = (normalized_biodiversity * 0.4) + (richness_score * 0.3) + (health_score * 0.3)
            
            # Suitability Score (Are the species found here suitable for this habitat?)
            # Simple mock: 80% base + up to 20% from health
            suitability_score = 70 + (health_score * 0.3)
            
            # Risk Level
            # Inversely proportional to quality/health. High if quality < 40.
            risk_level = "Low"
            if quality_score < 40:
                risk_level = "Critical"
            elif quality_score < 60:
                risk_level = "High"
            elif quality_score < 75:
                risk_level = "Moderate"
                
            # Mock missing indices based on existing data
            stability_index = min(100, health_score * 0.9 + (10 if len(obs_list) > 5 else 0))
            occupancy_rate = min(100, (len(obs_list) / (data["area_sq_km"] * 10)) * 100) if data["area_sq_km"] > 0 else 0
            ai_accuracy = None
            pop_growth_rate = None
            recovery_trend = None

            processed_sites.append({
                "site_name": site_name_key,
                "habitat_type": data["habitat_type"],
                "area_sq_km": data["area_sq_km"],
                "quality_score": round(quality_score, 1),
                "suitability_score": round(suitability_score, 1),
                "health_score": round(health_score, 1),
                "risk_level": risk_level,
                "biodiversity_index": round(shannon_index, 2),
                "species_diversity_index": round(shannon_index, 2),
                "habitat_stability_index": round(stability_index, 1),
                "habitat_occupancy_rate": round(occupancy_rate, 1),
                "habitat_recovery_trend": None,
                "population_growth_rate": None,
                "ai_detection_accuracy": None,
                "species_richness": richness,
                "total_observations": len(obs_list),
                "observation_density": round(obs_density, 2),
                "species_present": list(species_set)
            })

        # Filter post-processing
        if min_quality is not None:
            processed_sites = [s for s in processed_sites if s["quality_score"] >= float(min_quality)]
        if risk_level:
            processed_sites = [s for s in processed_sites if s["risk_level"].lower() == risk_level.lower()]

        # Aggregate Summaries
        avg_quality = sum([s["quality_score"] for s in processed_sites]) / len(processed_sites) if processed_sites else 0
        avg_suitability = sum([s["suitability_score"] for s in processed_sites]) / len(processed_sites) if processed_sites else 0
        avg_health = sum([s["health_score"] for s in processed_sites]) / len(processed_sites) if processed_sites else 0
        avg_biodiversity = sum([s["biodiversity_index"] for s in processed_sites]) / len(processed_sites) if processed_sites else 0
        
        healthy_habitats = len([s for s in processed_sites if s["health_score"] >= 70])
        critical_habitats = len([s for s in processed_sites if s["risk_level"] in ["Critical", "High"]])

        # Monthly Trends (Removed mock data)
        trend_data = []

        return {
            "summary": {
                "habitat_quality": round(avg_quality, 1),
                "habitat_suitability": round(avg_suitability, 1),
                "habitat_health": round(avg_health, 1),
                "biodiversity_index": round(avg_biodiversity, 2),
                "healthy_habitats": healthy_habitats,
                "critical_habitats": critical_habitats,
                "total_sites": len(processed_sites)
            },
            "sites": sorted(processed_sites, key=lambda x: x["quality_score"], reverse=True),
            "trends": trend_data,
            "species_distribution": [{"name": s["site_name"], "richness": s["species_richness"]} for s in processed_sites],
            "risk_distribution": [{"name": level, "value": len([s for s in processed_sites if s["risk_level"] == level])} for level in ["Low", "Moderate", "High", "Critical"]],
            "population_density_heatmap": [{"x": s["observation_density"], "y": s["species_richness"], "z": s["quality_score"], "name": s["site_name"]} for s in processed_sites]
        }

    @staticmethod
    async def get_habitat_summary(
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        species: Optional[str] = None,
        site_name: Optional[str] = None,
        min_quality: Optional[int] = None,
        risk_level: Optional[str] = None
    ) -> Dict[str, Any]:
        
        params = {
            "start_date": start_date, "end_date": end_date, "species": species,
            "site_name": site_name, "min_quality": min_quality, "risk_level": risk_level,
            "type": "habitat_summary"
        }
        query_hash = HabitatIntelligenceService._generate_cache_hash(params)

        try:
            cached = supabase.table("advanced_analytics_cache").select("*").eq("query_hash", query_hash).execute()
            if cached.data and datetime.fromisoformat(cached.data[0]['expires_at']) > datetime.utcnow():
                return cached.data[0]['payload']
        except Exception:
            pass

        data = await HabitatIntelligenceService.get_raw_habitat_data(
            start_date, end_date, species, site_name, min_quality, risk_level
        )

        # Generate Notifications based on anomalies
        try:
            for site in data["sites"]:
                if site["risk_level"] == "Critical":
                    supabase.table("notifications").insert({ "id": str(uuid.uuid4()),
                        "title": f"Critical Habitat Risk: {site['site_name']}",
                        "message": f"Habitat Quality has dropped to {site['quality_score']}. Immediate conservation required.",
                        "type": "alert",
                        "priority": "High",
                        "user_id": "admin_all",
                        "is_read": False,
                        "created_at": datetime.utcnow().isoformat()
                    }).execute()
                elif site["risk_level"] == "High":
                    supabase.table("notifications").insert({ "id": str(uuid.uuid4()),
                        "title": f"High Habitat Risk: {site['site_name']}",
                        "message": f"Habitat Quality has dropped to {site['quality_score']}.",
                        "type": "alert",
                        "priority": "High",
                        "user_id": "admin_all",
                        "is_read": False,
                        "created_at": datetime.utcnow().isoformat()
                    }).execute()
                
                if site["habitat_recovery_trend"] == "Improving" and site["quality_score"] > 80:
                    supabase.table("notifications").insert({ "id": str(uuid.uuid4()),
                        "title": f"Habitat Recovery: {site['site_name']}",
                        "message": f"Habitat quality significantly improved to {site['quality_score']}.",
                        "type": "alert",
                        "priority": "Low",
                        "user_id": "admin_all",
                        "is_read": False,
                        "created_at": datetime.utcnow().isoformat()
                    }).execute()
        except Exception as e:
            print("Error generating habitat notifications:", e)

        # Cache it (5 min TTL)
        try:
            supabase.table("advanced_analytics_cache").upsert({ "id": str(uuid.uuid4()),
                "query_hash": query_hash,
                "payload": data,
                "expires_at": (datetime.utcnow() + timedelta(minutes=5)).isoformat()
            }, on_conflict="query_hash").execute()
        except Exception:
            pass

        return data

    @staticmethod
    async def get_site_details(site_id_or_name: str) -> Dict[str, Any]:
        data = await HabitatIntelligenceService.get_habitat_summary()
        # Find site
        site_info = next((s for s in data["sites"] if s["site_name"].lower() == site_id_or_name.lower()), None)
        
        if not site_info:
            return {"error": "Site not found"}
            
        # Mock some detailed history for the details drawer
        return {
            "site_info": site_info,
            "observation_history": [],
            "prediction_history": [],
            "conservation_recommendation": "Increase patrols and restrict human movement in core zones." if site_info["risk_level"] in ["High", "Critical"] else "Maintain current protection levels."
        }

    # Exports
    @staticmethod
    async def export_excel(
        start_date: Optional[str] = None, end_date: Optional[str] = None,
        species: Optional[str] = None, site_name: Optional[str] = None,
        min_quality: Optional[int] = None, risk_level: Optional[str] = None
    ) -> StreamingResponse:
        data = await HabitatIntelligenceService.get_habitat_summary(start_date, end_date, species, site_name, min_quality, risk_level)
        df = pd.DataFrame(data["sites"])
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
            if not df.empty:
                df.to_excel(writer, sheet_name="Habitats", index=False)
            else:
                pd.DataFrame([{"Message": "No data"}]).to_excel(writer, sheet_name="Habitats")
        output.seek(0)
        return StreamingResponse(
            output,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": "attachment; filename=habitat_intelligence.xlsx"}
        )

    @staticmethod
    async def export_csv(
        start_date: Optional[str] = None, end_date: Optional[str] = None,
        species: Optional[str] = None, site_name: Optional[str] = None,
        min_quality: Optional[int] = None, risk_level: Optional[str] = None
    ) -> StreamingResponse:
        data = await HabitatIntelligenceService.get_habitat_summary(start_date, end_date, species, site_name, min_quality, risk_level)
        df = pd.DataFrame(data["sites"])
        output = io.StringIO()
        df.to_csv(output, index=False)
        output.seek(0)
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=habitat_intelligence.csv"}
        )

    @staticmethod
    async def export_json(
        start_date: Optional[str] = None, end_date: Optional[str] = None,
        species: Optional[str] = None, site_name: Optional[str] = None,
        min_quality: Optional[int] = None, risk_level: Optional[str] = None
    ) -> StreamingResponse:
        data = await HabitatIntelligenceService.get_habitat_summary(start_date, end_date, species, site_name, min_quality, risk_level)
        return StreamingResponse(
            iter([json.dumps(data, indent=2)]),
            media_type="application/json",
            headers={"Content-Disposition": "attachment; filename=habitat_intelligence.json"}
        )

    @staticmethod
    async def export_pdf(
        start_date: Optional[str] = None, end_date: Optional[str] = None,
        species: Optional[str] = None, site_name: Optional[str] = None,
        min_quality: Optional[int] = None, risk_level: Optional[str] = None
    ) -> StreamingResponse:
        data = await HabitatIntelligenceService.get_habitat_summary(start_date, end_date, species, site_name, min_quality, risk_level)
        
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", 'B', 16)
        pdf.cell(0, 10, "Habitat Intelligence Report", ln=1, align='C')
        pdf.ln(10)
        
        pdf.set_font("Arial", 'B', 12)
        pdf.cell(0, 10, f"Average Habitat Quality: {data['summary']['habitat_quality']}", ln=1)
        pdf.cell(0, 10, f"Critical Habitats: {data['summary']['critical_habitats']}", ln=1)
        pdf.ln(10)
        
        pdf.set_font("Arial", 'B', 10)
        pdf.cell(50, 10, "Site Name", border=1)
        pdf.cell(30, 10, "Quality", border=1)
        pdf.cell(30, 10, "Risk Level", border=1)
        pdf.cell(30, 10, "Biodiversity", border=1, ln=1)
        
        pdf.set_font("Arial", '', 10)
        for s in data["sites"]:
            pdf.cell(50, 10, str(s.get('site_name', '')[:20]), border=1)
            pdf.cell(30, 10, str(s.get('quality_score', 0)), border=1)
            pdf.cell(30, 10, str(s.get('risk_level', 'Unknown')), border=1)
            pdf.cell(30, 10, str(s.get('biodiversity_index', 0)), border=1, ln=1)
            
        output = io.BytesIO()
        pdf.output(output)
        output.seek(0)
        
        return StreamingResponse(
            output,
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=habitat_intelligence.pdf"}
        )



