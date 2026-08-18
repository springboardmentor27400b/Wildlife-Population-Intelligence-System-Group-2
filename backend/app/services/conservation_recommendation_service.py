from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.services.population_analytics import PopulationAnalytics
from app.services.gis_service import GISService

class ConservationRecommendationService:
    """
    Module 9 Service: Conservation Recommendation Engine.
    Generates data-driven ecological recommendations using PDF Modules 6-8 telemetry:
    - Conservation Priority Rankings
    - Habitat Restoration Actions
    - Wildlife Protection Strategies
    - Monitoring Optimization
    - Resource Allocation Breakdown
    Applies the Six-Month Analytics Window (Module 9).
    """

    @classmethod
    def generate_recommendations(
        cls,
        user_id: int,
        db: Session,
        mongo_db
    ) -> Dict[str, Any]:
        # Fetch predictions and apply 6-month window filter
        user_media_docs = list(mongo_db["uploaded_media"].find({"uploaded_by": user_id}))
        user_media_ids = [str(m["_id"]) for m in user_media_docs]

        mongo_preds = list(mongo_db["predictions"].find({
            "$or": [
                {"user_id": user_id},
                {"uploaded_media_id": {"$in": user_media_ids}}
            ]
        }))

        filtered_info = PopulationAnalytics.get_6month_filtered_predictions(mongo_preds)
        active_preds = filtered_info["filtered_predictions"]
        using_6m = filtered_info["using_6month_window"]

        bio_metrics = PopulationAnalytics.calculate_biodiversity_metrics(active_preds)
        gis_metrics = GISService.get_latest_habitat_suitability()
        count_metrics = PopulationAnalytics.calculate_population_count(active_preds)

        rel_abundance = bio_metrics.get("relative_abundance", [])
        total_individuals = bio_metrics.get("total_individuals_N", 0)
        mean_ndvi = gis_metrics.get("mean_ndvi")
        has_raster = gis_metrics.get("has_raster", False)

        # 1. Conservation Priority Rankings
        priority_rankings = []
        for idx, item in enumerate(rel_abundance[:5]):
            sp = item["species"]
            cnt = item["count"]
            pct = item["percentage"]
            if idx == 0:
                priority = "High Priority (Dominant Taxa Monitoring)"
            elif pct < 15.0:
                priority = "Critical Priority (Low Relative Abundance)"
            else:
                priority = "Medium Priority (Stable Telemetry)"
            
            priority_rankings.append({
                "species": sp,
                "count": cnt,
                "relative_abundance_pct": pct,
                "priority_level": priority
            })

        # 2. Habitat Restoration Recommendations
        restoration_actions = []
        if has_raster and mean_ndvi is not None:
            if mean_ndvi < 0.20:
                restoration_actions.append({
                    "action": "Urgent Vegetation Reforestation",
                    "target_ndvi": "≥ 0.50",
                    "current_ndvi": mean_ndvi,
                    "description": "Satellite NDVI indicates sparse vegetation (< 0.20). Implement targeted tree planting to expand canopy coverage."
                })
            elif mean_ndvi < 0.50:
                restoration_actions.append({
                    "action": "Grassland & Shrubland Enhancement",
                    "target_ndvi": "≥ 0.50",
                    "current_ndvi": mean_ndvi,
                    "description": "Moderate vegetation detected. Protect corridor pathways to prevent degradation into low-density soil."
                })
            else:
                restoration_actions.append({
                    "action": "Canopy Conservation & Fire Prevention",
                    "target_ndvi": "Maintain ≥ 0.50",
                    "current_ndvi": mean_ndvi,
                    "description": "High vegetation index detected. Establish firebreaks and prevent illegal deforestation in dense sectors."
                })
        else:
            restoration_actions.append({
                "action": "Pending Satellite Data Integration",
                "target_ndvi": "N/A",
                "current_ndvi": "N/A",
                "description": "Upload RED and NIR GeoTIFF rasters to generate satellite-derived habitat restoration actions."
            })

        # 3. Wildlife Protection Strategies
        protection_strategies = [
            {
                "strategy": "Targeted Ranger Patrol Routing",
                "recommended_frequency": "Daily Patrols",
                "focus_area": "High Detections Clusters & Waterhole Sectors"
            },
            {
                "strategy": "Anti-Poaching Bio-Acoustic Monitoring",
                "recommended_frequency": "Continuous 24/7 Monitoring",
                "focus_area": "Perimeter Monitoring Boundaries"
            }
        ]

        # 4. Monitoring Optimization
        site_breakdown = count_metrics.get("site_breakdown", [])
        monitoring_optimization = []
        if site_breakdown:
            for s in site_breakdown[:6]:
                cnt = s.get("deduplicated_count", 0)
                site_raw = s.get("site_id")
                site_label = f"Site #{site_raw}" if isinstance(site_raw, int) or (isinstance(site_raw, str) and site_raw.isdigit()) else str(site_raw)

                if cnt >= 50:
                    rec = f"High-density wildlife corridor ({cnt} events). Deploy +3 camera traps & bio-acoustic sensors to capture heavy animal movement."
                elif cnt >= 10:
                    rec = f"Moderate animal movement ({cnt} events). Maintain active sensor grid and schedule routine monthly battery check."
                elif cnt >= 2:
                    rec = f"Low movement recorded ({cnt} events). Consider repositioning +1 camera sensor toward high-traffic perimeter trails."
                elif cnt == 1:
                    rec = f"Sparse detection recorded ({cnt} event). Calibrate AI trigger sensitivity and verify sensor lens orientation."
                else:
                    rec = f"No active detections logged. Relocate sensor grid to active waterhole or feeding corridor."

                monitoring_optimization.append({
                    "site_id": site_raw,
                    "deduplicated_count": cnt,
                    "recommendation": rec
                })
        else:
            monitoring_optimization.append({
                "site_id": "Sector A-1",
                "deduplicated_count": total_individuals,
                "recommendation": "Deploy primary camera trap grid to establish field baseline telemetry."
            })

        # 5. Resource & Budget Allocation
        total_sites = max(1, len(site_breakdown))
        resource_allocations = []
        if site_breakdown:
            for s in site_breakdown:
                share = round((s["deduplicated_count"] / max(1, total_individuals)) * 100, 1)
                resource_allocations.append({
                    "site_id": f"Site #{s['site_id']}",
                    "allocated_budget_percentage": max(15.0, share),
                    "rationale": f"Proportional allocation based on {s['deduplicated_count']} recorded detection events."
                })
        else:
            resource_allocations.append({
                "site_id": "Primary Ecosystem Reserve",
                "allocated_budget_percentage": 100.0,
                "rationale": "100% allocation to primary survey sector."
            })

        return {
            "using_6month_window": using_6m,
            "total_observations_analyzed": len(active_preds),
            "priority_rankings": priority_rankings,
            "restoration_actions": restoration_actions,
            "protection_strategies": protection_strategies,
            "monitoring_optimization": monitoring_optimization,
            "resource_allocations": resource_allocations
        }
