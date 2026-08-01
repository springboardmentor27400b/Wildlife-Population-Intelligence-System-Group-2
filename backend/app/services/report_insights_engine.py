from typing import Dict, Any, List

class ReportInsightsEngine:
    @staticmethod
    def analyze(data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Takes the base analytics payload and generates rule-based insights,
        recommendations, report quality metrics, and statistics.
        """
        summary = data.get("summary", {})
        
        # Recommendations
        conservation_recs = []
        habitat_recs = []
        monitoring_recs = []
        data_recs = []
        future_recs = []
        
        # Rule: High endangered count
        if summary.get("endangered_count", 0) > 0:
            conservation_recs.append("Prioritize anti-poaching patrols in areas with recent endangered species detections.")
            habitat_recs.append("Conduct immediate habitat suitability assessments around endangered species detection zones.")
            future_recs.append(f"Initiate targeted surveys focusing on the {summary.get('endangered_count')} endangered species detected.")
        else:
            conservation_recs.append("Maintain current conservation efforts. No endangered species spikes detected.")
            
        # Rule: AI vs Human observations (Data Quality)
        total_obs = summary.get("total_observations", 0)
        total_preds = summary.get("total_predictions", 0)
        
        if total_preds > (total_obs * 2) and total_obs > 0:
            data_recs.append("AI predictions significantly outnumber verified field observations. Increase manual verification bandwidth.")
            monitoring_recs.append("Deploy more human field researchers to validate high-volume camera trap sites.")
        elif total_obs > total_preds:
            data_recs.append("Field observations are strong. Consider deploying more automated sensors to increase spatial coverage.")
        else:
            data_recs.append("Balanced data collection between automated sensors and field research.")
            
        if summary.get("average_confidence", 0) < 70:
            monitoring_recs.append("AI confidence is low on average. Clean sensor lenses or reposition bioacoustic devices.")
        else:
            monitoring_recs.append("Sensor network is capturing high-quality data. Maintain current device positions.")

        # Report Quality Metrics
        # Completeness based on basic presence of data
        data_coverage = "High" if total_preds + total_obs > 100 else ("Medium" if total_preds + total_obs > 20 else "Low")
        
        missing_data = []
        if total_obs == 0: missing_data.append("No human field observations recorded.")
        if total_preds == 0: missing_data.append("No AI predictions recorded from sensors.")
        if not data.get("distributions", {}).get("species"): missing_data.append("No specific species distributions identified.")
        
        completeness_score = 100 - (len(missing_data) * 20)
        if completeness_score < 0: completeness_score = 0
        
        report_quality = {
            "completeness_score": completeness_score,
            "data_coverage": data_coverage,
            "missing_data_summary": missing_data if missing_data else ["All critical data dimensions present."]
        }
        
        # Report Statistics
        import time
        report_statistics = {
            "total_pages": "Dynamic", # Will be set by PDF generator
            "total_species": summary.get("total_species", 0),
            "total_observations": total_obs,
            "total_predictions": total_preds,
            "total_endangered_species": summary.get("endangered_count", 0),
            "total_habitats": len(data.get("distributions", {}).get("habitat", [])),
            "generation_time_ms": int(time.time() * 1000) % 1000 # Mock gen time
        }

        return {
            "recommendations": {
                "conservation": conservation_recs,
                "habitat": habitat_recs,
                "monitoring": monitoring_recs,
                "data_collection": data_recs,
                "future_survey": future_recs
            },
            "report_quality": report_quality,
            "report_statistics": report_statistics
        }
