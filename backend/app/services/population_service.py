import uuid
import math
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.observation import Observation
from app.models.monitoring_site import MonitoringSite

class PopulationAnalysisService:
    def resolve_observation_species(self, obs: Observation) -> str:
        # Resolve from latest completed AI analysis if available
        if obs.ai_analyses:
            sorted_analyses = sorted(obs.ai_analyses, key=lambda a: a.created_at, reverse=True)
            latest = sorted_analyses[0]
            if latest.status == "Completed":
                if latest.image_json and latest.image_json.get("success") and latest.image_json.get("detections"):
                    return latest.image_json["detections"][0]["species"]
                elif latest.audio_json and latest.audio_json.get("success") and latest.audio_json.get("top_prediction"):
                    return latest.audio_json["top_prediction"]["common_name"]
        return obs.species

    def analyze_population(self, db: Session, species_name: Optional[str] = None) -> Dict[str, Any]:
        """
        Performs density estimation, trend calculations, growth forecasts, and compiles chart datasets.
        """
        # Query total observations
        query = db.query(Observation)
        if species_name:
             query = query.filter(Observation.species.ilike(f"%{species_name}%"))
        observations = query.all()
        
        # Calculate density: total detections / total monitoring sites
        total_sites = db.query(func.count(MonitoringSite.id)).scalar() or 1
        total_animals = sum(obs.count for obs in observations)
        density = round(total_animals / total_sites, 2)
        
        # Resolve species counts for distribution
        species_counts = {}
        for obs in observations:
            sp = self.resolve_observation_species(obs)
            if sp:
                species_counts[sp] = species_counts.get(sp, 0) + obs.count
                
        # Sighting distributions by month for charts
        # We group observations by month (last 6 months)
        monthly_counts = {}
        now = datetime.now()
        for i in range(5, -1, -1):
            month_date = now - timedelta(days=i*30)
            month_key = month_date.strftime("%b")
            monthly_counts[month_key] = 0
            
        for obs in observations:
            m_key = obs.observed_at.strftime("%b")
            if m_key in monthly_counts:
                 monthly_counts[m_key] += obs.count
                 
        # Linear Regression forecast for next 2 months
        y_values = list(monthly_counts.values())
        x_values = list(range(len(y_values)))
        
        if len(x_values) > 1:
            # Simple line fit: y = mx + c
            x_mean = sum(x_values) / len(x_values)
            y_mean = sum(y_values) / len(y_values)
            num = sum((x - x_mean) * (y - y_mean) for x, y in zip(x_values, y_values))
            den = sum((x - x_mean) ** 2 for x in x_values)
            m = num / (den + 1e-9)
            c = y_mean - m * x_mean
            
            # Predict next 2 months
            p1 = max(0, int(m * (len(x_values)) + c))
            p2 = max(0, int(m * (len(x_values) + 1) + c))
            forecast = [p1, p2]
            
            # Growth rate
            growth_rate = round(m * 100 / (y_mean + 1e-9), 2)
        else:
            forecast = [total_animals, total_animals]
            growth_rate = 0.0
            
        trend = "Increasing" if growth_rate > 2.0 else "Decreasing" if growth_rate < -2.0 else "Stable"
        decline_rate = abs(growth_rate) if growth_rate < 0 else 0.0
        
        # Risk level determination
        risk_level = "High" if trend == "Decreasing" or decline_rate > 5.0 else "Low"
        
        chart_data = [
            {"month": m, "count": count}
            for m, count in monthly_counts.items()
        ]
        
        # Append future predictions to chart details
        pred_months = ["Month +1", "Month +2"]
        for m, count in zip(pred_months, forecast):
             chart_data.append({"month": m, "count": count, "is_prediction": True})
             
        # Species distribution details
        species_dist = []
        for sp, count in species_counts.items():
            pct = round((count / total_animals) * 100, 1) if total_animals > 0 else 0.0
            species_dist.append({"species": sp, "count": count, "percentage": pct})
            
        # Species sorted by count
        sorted_species = sorted(species_counts.items(), key=lambda x: x[1], reverse=True)
        top_species = [s[0] for s in sorted_species[:10]] # Top 10 species
        rare_species = [s[0] for s in sorted_species if s[1] <= 2]
        
        # Habitat and Site Distributions
        habitat_counts = {}
        site_counts = {}
        for obs in observations:
            if obs.site:
                hab = obs.site.habitat_type.value if hasattr(obs.site.habitat_type, "value") else obs.site.habitat_type
                habitat_counts[hab] = habitat_counts.get(hab, 0) + obs.count
                
                site_name = obs.site.name
                site_counts[site_name] = site_counts.get(site_name, 0) + obs.count
                
        dist_by_habitat = [
            {"habitat": hab, "count": count}
            for hab, count in habitat_counts.items()
        ]
        
        dist_by_site = [
            {"site": name, "count": count}
            for name, count in site_counts.items()
        ]

        # Map location summary heatmap data
        heatmap_data = []
        for obs in observations:
            heatmap_data.append({
                "lat": obs.latitude,
                "lng": obs.longitude,
                "species": self.resolve_observation_species(obs),
                "count": obs.count
            })
            
        return {
            "population_density": density,
            "population_trend": trend,
            "growth_rate_pct": max(0.0, growth_rate) if growth_rate > 0 else 0.0,
            "decline_rate_pct": decline_rate,
            "risk_level": risk_level,
            "future_forecast": forecast,
            "chart_data": chart_data,
            "species_distribution": species_dist,
            "top_species": top_species,
            "rare_species": rare_species,
            "heatmap_data": heatmap_data,
            # Milestone 3 extended metrics
            "total_species": len(species_counts),
            "total_observations": total_animals,
            "population_growth": max(0.0, growth_rate) if growth_rate > 0 else 0.0,
            "observation_growth": max(0.0, growth_rate) if growth_rate > 0 else 0.0,
            "rare_species_count": len(rare_species),
            "most_observed_species": sorted_species[0][0] if sorted_species else "None",
            "distribution_by_habitat": dist_by_habitat,
            "distribution_by_site": dist_by_site,
            "migration_activity_index": min(100.0, float(len(site_counts) * 18.0 + 35.0)) if len(site_counts) > 0 else 0.0
        }

from sqlalchemy import func
population_service = PopulationAnalysisService()
