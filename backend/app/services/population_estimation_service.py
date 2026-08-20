import os
import json
import io
import hashlib
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any, List
from fastapi.responses import StreamingResponse
from app.models.site import MonitoringSite
from app.models.notification import Notification
from pathlib import Path
import pandas as pd
from fpdf import FPDF
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from app.database.db import supabase

class PopulationEstimationService:

    @staticmethod
    def get_confidence_weight(confidence: float) -> float:
        if confidence >= 90: return 1.0
        if confidence >= 80: return 0.9
        if confidence >= 70: return 0.8
        if confidence >= 60: return 0.7
        return 0.0

    @staticmethod
    def _generate_cache_hash(params: dict) -> str:
        return hashlib.md5(json.dumps(params, default=str).encode()).hexdigest()

    @staticmethod
    async def get_raw_population_data(
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        species: Optional[str] = None,
        site_name: Optional[str] = None,
        min_confidence: Optional[float] = None,
        source: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Calculates the estimated population based on a weighted merge of verified observations 
        and AI predictions.
        """
        # Base queries
        obs_query = supabase.table("observation_records").select("*").eq("verification_status", "Verified")
        pred_query = supabase.table("unified_prediction_records").select("*")

        disable_obs = False
        disable_pred = False

        if start_date and end_date:
            try:
                start_dt = datetime.strptime(start_date, "%Y-%m-%d").replace(tzinfo=timezone.utc).isoformat()
                end_dt = datetime.strptime(end_date, "%Y-%m-%d").replace(hour=23, minute=59, second=59, tzinfo=timezone.utc).isoformat()
                obs_query = obs_query.gte("observed_at", start_dt).lte("observed_at", end_dt)
                pred_query = pred_query.gte("prediction_timestamp", start_dt).lte("prediction_timestamp", end_dt)
            except ValueError:
                pass

        if species:
            obs_query = obs_query.eq("species_name", species)
            pred_query = pred_query.eq("species_name", species)

        if site_name:
            obs_query = obs_query.eq("monitoring_site_name", site_name)
            
        if source:
            if source.lower() == "verified observation":
                disable_pred = True
            else:
                pred_query = pred_query.eq("prediction_source", source)
                disable_obs = True

        if min_confidence:
            pred_query = pred_query.gte("confidence_score", float(min_confidence))

        # Fetch Data
        try:
            observations = [] if disable_obs else obs_query.execute().data
        except Exception:
            observations = []
            
        try:
            predictions = [] if disable_pred else pred_query.execute().data
        except Exception:
            predictions = []

        # Build Occurrence Grid: [Date][Site][Species] = { verified_count, ai_weight, sources, avg_confidence, count }
        occurrence_grid = {}

        # 1. Process Observations
        for obs in observations:
            date_str = obs.get("observed_at", "")[:10]
            site = obs.get("monitoring_site_name") or "Unknown Site"
            sp = obs.get("species_name")

            if date_str not in occurrence_grid: occurrence_grid[date_str] = {}
            if site not in occurrence_grid[date_str]: occurrence_grid[date_str][site] = {}
            if sp not in occurrence_grid[date_str][site]:
                occurrence_grid[date_str][site][sp] = {
                    "verified_count": 0, "ai_weight": 0.0, 
                    "confidences": [], "scientific_name": obs.get("scientific_name")
                }
            
            occurrence_grid[date_str][site][sp]["verified_count"] += obs.get("count", 1)

        # 2. Process Predictions
        for pred in predictions:
            if pred.get("observation_id"):
                pass 
                
            weight = PopulationEstimationService.get_confidence_weight(pred.get("confidence_score", 0))
            if weight == 0.0:
                continue 

            date_str = pred.get("prediction_timestamp", "")[:10]
            site = "Unknown Site" 

            sp = pred.get("species_name")

            if date_str not in occurrence_grid: occurrence_grid[date_str] = {}
            if site not in occurrence_grid[date_str]: occurrence_grid[date_str][site] = {}
            if sp not in occurrence_grid[date_str][site]:
                occurrence_grid[date_str][site][sp] = {
                    "verified_count": 0, "ai_weight": 0.0, 
                    "confidences": [], "scientific_name": pred.get("scientific_name")
                }

            occurrence_grid[date_str][site][sp]["ai_weight"] += weight
            occurrence_grid[date_str][site][sp]["confidences"].append(pred.get("confidence_score", 0))

        # 3. Aggregate Populations
        total_estimated = 0
        species_population = {}
        site_population = {}
        trend_data = {}
        total_confidence = 0
        confidence_count = 0
        site_population_matrix = []

        for date_str, sites in occurrence_grid.items():
            if not date_str: continue
            if date_str not in trend_data:
                trend_data[date_str] = 0
                
            for site, species_dict in sites.items():
                if site not in site_population:
                    site_population[site] = 0
                    
                for sp, data in species_dict.items():
                    if sp not in species_population:
                        species_population[sp] = {
                            "name": sp,
                            "scientific_name": data["scientific_name"],
                            "estimated_population": 0,
                            "verified_count": 0,
                            "ai_count": 0,
                            "average_confidence": 0,
                            "confidences": []
                        }
                    
                    daily_site_estimate = data["verified_count"] if data["verified_count"] > 0 else data["ai_weight"]
                    
                    total_estimated += daily_site_estimate
                    trend_data[date_str] += daily_site_estimate
                    site_population[site] += daily_site_estimate
                    
                    if daily_site_estimate > 0:
                        site_population_matrix.append({
                            "site": site,
                            "species": sp,
                            "date": date_str,
                            "population": daily_site_estimate
                        })
                    
                    species_population[sp]["estimated_population"] += daily_site_estimate
                    species_population[sp]["verified_count"] += data["verified_count"]
                    species_population[sp]["ai_count"] += data["ai_weight"]
                    species_population[sp]["confidences"].extend(data["confidences"])
                    
                    if data["confidences"]:
                        total_confidence += sum(data["confidences"])
                        confidence_count += len(data["confidences"])

        avg_overall_confidence = round(total_confidence / confidence_count, 2) if confidence_count > 0 else 0
        
        formatted_species = []
        for sp, data in species_population.items():
            avg_conf = round(sum(data["confidences"]) / len(data["confidences"]), 2) if data["confidences"] else 0
            formatted_species.append({
                "species": sp,
                "scientific_name": data["scientific_name"],
                "estimated_population": round(data["estimated_population"], 1),
                "verified_count": data["verified_count"],
                "ai_count": round(data["ai_count"], 1),
                "average_confidence": avg_conf
            })
            
        formatted_sites = [{"site": k, "population": round(v, 1)} for k, v in site_population.items()]
        formatted_trends = [{"date": k, "population": round(v, 1)} for k, v in sorted(trend_data.items())]

        return {
            "summary": {
                "total_estimated_population": round(total_estimated, 1),
                "total_species": len(species_population),
                "average_confidence": avg_overall_confidence
            },
            "species_population": sorted(formatted_species, key=lambda x: x["estimated_population"], reverse=True),
            "site_population": sorted(formatted_sites, key=lambda x: x["population"], reverse=True),
            "trends": formatted_trends,
            "raw_site_species": site_population_matrix
        }

    @staticmethod
    async def get_population_summary(
        start_date: Optional[str] = None, end_date: Optional[str] = None,
        species: Optional[str] = None, site_name: Optional[str] = None,
        min_confidence: Optional[float] = None, source: Optional[str] = None
    ) -> Dict[str, Any]:
        
        params = {
            "start_date": start_date, "end_date": end_date, "species": species,
            "site_name": site_name, "min_confidence": min_confidence, "source": source,
            "type": "population_summary"
        }
        query_hash = PopulationEstimationService._generate_cache_hash(params)
        
        try:
            res = supabase.table("advanced_analytics_cache").select("*").eq("query_hash", query_hash).execute()
            if res.data:
                cached = res.data[0]
                if cached.get("expires_at") > datetime.utcnow().isoformat():
                    return cached.get("payload")
        except Exception:
            pass

        data = await PopulationEstimationService.get_raw_population_data(
            start_date, end_date, species, site_name, min_confidence, source
        )
        
        growth = 0
        if len(data["trends"]) >= 2:
            first = data["trends"][0]["population"]
            last = data["trends"][-1]["population"]
            if first > 0:
                growth = round(((last - first) / first) * 100, 1)

        data["summary"]["population_growth"] = growth
        
        SPECIES_DATA_PATH = Path(__file__).resolve().parent.parent / "core" / "species_data.json"
        high_risk_count = 0
        if SPECIES_DATA_PATH.exists():
            with open(SPECIES_DATA_PATH, "r", encoding="utf-8") as f:
                core_data = json.load(f)
                for sp in data["species_population"]:
                    info = core_data.get(sp["species"], {})
                    status = info.get("Conservation Status", "Unknown")
                    sp["conservation_status"] = status
                    if status in ["Endangered", "Critically Endangered", "Vulnerable"]:
                        high_risk_count += 1
                        
        data["summary"]["high_risk_species"] = high_risk_count

        forecasts = []
        trends = data.get("trends", [])
        if len(trends) >= 3:
            for i in range(2, len(trends)):
                avg = (trends[i-2]["population"] + trends[i-1]["population"] + trends[i]["population"]) / 3
                forecasts.append({"date": trends[i]["date"], "forecast": round(avg, 1)})
            next_avg = (trends[-3]["population"] + trends[-2]["population"] + trends[-1]["population"]) / 3
            forecasts.append({"date": "Forecast", "forecast": round(next_avg, 1)})
            
        data["forecasts"] = forecasts

        if not min_confidence and not source:
            try:
                today_str = datetime.utcnow().strftime("%Y-%m-%d")
                for sp in data["species_population"]:
                    res = supabase.table("population_estimations").select("*").eq("species_name", sp["species"]).eq("calculation_date", today_str).execute()
                    if not res.data:
                        import uuid
                        record = {
                            "id": str(uuid.uuid4()),
                            "species_name": sp["species"],
                            "scientific_name": None,
                            "monitoring_site_name": "All Sites",
                            "estimated_population": sp["estimated_population"],
                            "confidence_score": sp["average_confidence"],
                            "growth_trend": growth,
                            "statistics": {"verified": sp["verified_count"], "ai": sp["ai_count"]},
                            "calculation_date": today_str
                        }
                        supabase.table("population_estimations").insert(record).execute()
                        
                        if sp.get("conservation_status") in ["Endangered", "Critically Endangered"]:
                            supabase.table("notifications").insert({ "id": str(uuid.uuid4()),
                                "title": f"Endangered Species Alert: {sp['species']}",
                                "message": f"Estimated population is {sp['estimated_population']}. Monitor closely.",
                                "type": "alert",
                                "priority": "High",
                                "user_id": "admin_all",
                                "is_read": False,
                                "created_at": datetime.utcnow().isoformat()
                            }).execute()
                        
                        if abs(growth) > 20:
                            supabase.table("notifications").insert({ "id": str(uuid.uuid4()),
                                "title": f"Abnormal Population Change: {sp['species']}",
                                "message": f"Population changed by {growth}% recently. Current estimate: {sp['estimated_population']}.",
                                "type": "alert",
                                "priority": "High",
                                "user_id": "admin_all",
                                "is_read": False,
                                "created_at": datetime.utcnow().isoformat()
                            }).execute()
            except Exception as e:
                print("Error saving estimation records:", e)

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
    async def get_species_detail(species_name: str) -> Dict[str, Any]:
        data = await PopulationEstimationService.get_raw_population_data(species=species_name)
        
        species_info = {}
        SPECIES_DATA_PATH = Path(__file__).resolve().parent.parent / "core" / "species_data.json"
        if SPECIES_DATA_PATH.exists():
            with open(SPECIES_DATA_PATH, "r", encoding="utf-8") as f:
                core_data = json.load(f)
                species_info = core_data.get(species_name, {})
                
        return {
            "species": species_name,
            "population_data": data["species_population"][0] if data["species_population"] else {},
            "trends": data["trends"],
            "sites": data["site_population"],
            "biological_info": species_info
        }

    # Export methods (PDF, Excel, etc.)
    @staticmethod
    async def export_excel(
        start_date: Optional[str] = None, end_date: Optional[str] = None,
        species: Optional[str] = None, site_name: Optional[str] = None
    ) -> StreamingResponse:
        data = await PopulationEstimationService.get_population_summary(start_date, end_date, species, site_name)
        
        df = pd.DataFrame(data["species_population"])
        if not df.empty:
            df.columns = ["Species", "Scientific Name", "Estimated Pop", "Verified Count", "AI Count", "Avg Confidence", "Conservation Status"]
            
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
            df.to_excel(writer, sheet_name="Population", index=False)
            
            # Trend sheet
            df_trends = pd.DataFrame(data["trends"])
            df_trends.to_excel(writer, sheet_name="Trends", index=False)
            
        output.seek(0)
        return StreamingResponse(
            output,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": "attachment; filename=population_estimation.xlsx"}
        )

    @staticmethod
    async def export_csv(
        start_date: Optional[str] = None, end_date: Optional[str] = None,
        species: Optional[str] = None, site_name: Optional[str] = None
    ) -> StreamingResponse:
        data = await PopulationEstimationService.get_population_summary(start_date, end_date, species, site_name)
        df = pd.DataFrame(data["species_population"])
        if not df.empty:
            df.columns = ["Species", "Scientific Name", "Estimated Pop", "Verified Count", "AI Count", "Avg Confidence", "Conservation Status"]
            
        output = io.StringIO()
        df.to_csv(output, index=False)
        output.seek(0)
        
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=population_estimation.csv"}
        )

    @staticmethod
    async def export_json(
        start_date: Optional[str] = None, end_date: Optional[str] = None,
        species: Optional[str] = None, site_name: Optional[str] = None
    ) -> StreamingResponse:
        data = await PopulationEstimationService.get_population_summary(start_date, end_date, species, site_name)
        return StreamingResponse(
            iter([json.dumps(data, indent=2)]),
            media_type="application/json",
            headers={"Content-Disposition": "attachment; filename=population_estimation.json"}
        )

    @staticmethod
    async def export_pdf(
        start_date: Optional[str] = None, end_date: Optional[str] = None,
        species: Optional[str] = None, site_name: Optional[str] = None
    ) -> StreamingResponse:
        data = await PopulationEstimationService.get_population_summary(start_date, end_date, species, site_name)
        
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", 'B', 16)
        pdf.cell(0, 10, "Wildlife Population Estimation Report", ln=1, align='C')
        pdf.ln(10)
        
        pdf.set_font("Arial", 'B', 12)
        pdf.cell(0, 10, f"Total Estimated Population: {data['summary']['total_estimated_population']}", ln=1)
        pdf.cell(0, 10, f"Total Species Detected: {data['summary']['total_species']}", ln=1)
        pdf.cell(0, 10, f"Average Confidence: {data['summary']['average_confidence']}%", ln=1)
        pdf.ln(10)
        
        pdf.set_font("Arial", 'B', 10)
        pdf.cell(50, 10, "Species", border=1)
        pdf.cell(40, 10, "Est. Population", border=1)
        pdf.cell(30, 10, "Verified", border=1)
        pdf.cell(30, 10, "AI Added", border=1)
        pdf.cell(40, 10, "Status", border=1, ln=1)
        
        pdf.set_font("Arial", '', 10)
        for sp in data["species_population"]:
            pdf.cell(50, 10, str(sp.get('species', '')[:20]), border=1)
            pdf.cell(40, 10, str(sp.get('estimated_population', 0)), border=1)
            pdf.cell(30, 10, str(sp.get('verified_count', 0)), border=1)
            pdf.cell(30, 10, str(sp.get('ai_count', 0)), border=1)
            pdf.cell(40, 10, str(sp.get('conservation_status', 'Unknown')[:18]), border=1, ln=1)
            
        output = io.BytesIO()
        pdf.output(output)
        output.seek(0)
        
        return StreamingResponse(
            output,
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=population_estimation.pdf"}
        )
