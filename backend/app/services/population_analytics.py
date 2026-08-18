import math
from datetime import datetime, timedelta
from collections import defaultdict, Counter
from typing import List, Dict, Any, Optional

class PopulationAnalytics:
    """
    Service layer providing Phase 4 Population Analytics calculations:
    - Task 1 & Task 5: 10-minute time-block de-duplication
    - Population counting & species breakdowns
    - Population density estimation (Density D = (N * Avg Confidence) / Area)
    - Population trend analysis over time
    - Decoupled business logic from API endpoints
    """

    @staticmethod
    def get_time_block(raw_timestamp: Any, window_minutes: int = 10) -> str:
        """
        Rounds a timestamp to a 10-minute interval block string (YYYY-MM-DD THH:MM).
        """
        if not raw_timestamp:
            dt = datetime.utcnow()
        elif isinstance(raw_timestamp, datetime):
            dt = raw_timestamp
        elif isinstance(raw_timestamp, str):
            try:
                dt = datetime.fromisoformat(raw_timestamp.replace("Z", "+00:00"))
            except Exception:
                return str(raw_timestamp)[:16]
        else:
            return str(raw_timestamp)

        minute = (dt.minute // window_minutes) * window_minutes
        block_dt = dt.replace(minute=minute, second=0, microsecond=0)
        return block_dt.strftime("%Y-%m-%dT%H:%M")

    @classmethod
    def get_6month_filtered_predictions(cls, predictions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Six-Month Analytics Window Helper (Modules 6-10):
        Checks whether observations exist during the last 6 months (180 days).
        If YES: returns calculations using ONLY those observations.
        If NO: returns calculations using ALL available observations (automatic fallback).
        """
        if not predictions:
            return {"filtered_predictions": [], "using_6month_window": False, "observation_count": 0}

        now = datetime.utcnow()
        six_months_ago = now - timedelta(days=180)

        preds_6m = []
        for p in predictions:
            raw_ts = p.get("prediction_timestamp") or p.get("created_at") or p.get("timestamp")
            if not raw_ts:
                continue
            dt = None
            if isinstance(raw_ts, datetime):
                dt = raw_ts
            elif isinstance(raw_ts, str):
                try:
                    dt = datetime.fromisoformat(raw_ts.replace("Z", "+00:00")).replace(tzinfo=None)
                except Exception:
                    dt = None
            if dt and dt >= six_months_ago:
                preds_6m.append(p)

        if preds_6m:
            return {
                "filtered_predictions": preds_6m,
                "using_6month_window": True,
                "observation_count": len(preds_6m)
            }
        else:
            return {
                "filtered_predictions": predictions,
                "using_6month_window": False,
                "observation_count": len(predictions)
            }

    @classmethod
    def deduplicate_detections(
        cls,
        predictions: List[Dict[str, Any]],
        window_minutes: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Task 5: Time-block De-duplication Strategy.
        Groups detections into 10-minute windows using (time_block, site_id, species)
        to avoid counting the same individual animal repeatedly.
        """
        grouped = {}
        for pred in predictions:
            species = pred.get("common_name") or pred.get("primary_species") or "Unknown"
            site_id = pred.get("monitoring_site_id") or pred.get("site_id") or "unassigned"
            raw_ts = pred.get("prediction_timestamp") or pred.get("created_at") or ""
            
            time_block = cls.get_time_block(raw_ts, window_minutes=window_minutes)
            group_key = (time_block, site_id, species)

            if group_key not in grouped:
                grouped[group_key] = pred
            else:
                existing_conf = float(grouped[group_key].get("confidence") or 0.0)
                new_conf = float(pred.get("confidence") or 0.0)
                if new_conf > existing_conf:
                    grouped[group_key] = pred

        return list(grouped.values())

    @classmethod
    def calculate_population_count(
        cls,
        predictions: List[Dict[str, Any]],
        window_minutes: int = 10
    ) -> Dict[str, Any]:
        """
        Task 4: Population count calculation logic (Module 6).
        Applies 6-month window filtering with automatic fallback to all observations.
        """
        filtered_info = cls.get_6month_filtered_predictions(predictions)
        active_preds = filtered_info["filtered_predictions"]
        using_6m = filtered_info["using_6month_window"]

        raw_total = len(active_preds)
        deduped_preds = cls.deduplicate_detections(active_preds, window_minutes=window_minutes)
        deduped_total = len(deduped_preds)

        raw_species_counter = Counter()
        deduped_species_counter = Counter()
        site_counts = defaultdict(int)

        for p in active_preds:
            sp = p.get("common_name") or p.get("primary_species") or "Unknown"
            raw_species_counter[sp] += 1

        for p in deduped_preds:
            sp = p.get("common_name") or p.get("primary_species") or "Unknown"
            st = p.get("monitoring_site_id") or p.get("site_id") or "unassigned"
            deduped_species_counter[sp] += 1
            site_counts[st] += 1

        species_breakdown = [
            {
                "species": sp,
                "raw_count": raw_species_counter[sp],
                "deduplicated_count": cnt
            }
            for sp, cnt in deduped_species_counter.most_common()
        ]

        site_breakdown = [
            {
                "site_id": st,
                "deduplicated_count": cnt
            }
            for st, cnt in site_counts.items()
        ]

        return {
            "total_raw_detections": raw_total,
            "total_deduplicated_population": deduped_total,
            "deduplication_window_minutes": window_minutes,
            "species_breakdown": species_breakdown,
            "site_breakdown": site_breakdown
        }

    @classmethod
    def estimate_density(
        cls,
        predictions: List[Dict[str, Any]],
        area_sq_km: float = 1.0,
        species_filter: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Task 4: Density Estimation math formula (Module 6):
        Density D = (N * Avg Confidence) / Area
        Applies 6-month window filtering with automatic fallback to all observations.
        """
        filtered_info = cls.get_6month_filtered_predictions(predictions)
        active_preds = filtered_info["filtered_predictions"]
        using_6m = filtered_info["using_6month_window"]

        target_preds = active_preds
        if species_filter:
            sf_lower = species_filter.strip().lower()
            target_preds = [
                p for p in active_preds
                if (p.get("common_name") or p.get("primary_species") or "").strip().lower() == sf_lower
            ]

        deduped_preds = cls.deduplicate_detections(target_preds)
        N = len(deduped_preds)
        safe_area = max(float(area_sq_km or 1.0), 0.0001)

        if N == 0:
            return {
                "density_per_sq_km": 0.0,
                "deduplicated_individuals_N": 0,
                "average_confidence": 0.0,
                "area_sq_km": safe_area,
                "species_filter": species_filter,
                "using_6month_window": using_6m
            }

        confidences = [float(p.get("confidence") or 0.0) for p in deduped_preds if p.get("confidence") is not None]
        avg_confidence = (sum(confidences) / len(confidences)) if confidences else 1.0

        density = (N * avg_confidence) / safe_area

        return {
            "density_per_sq_km": round(density, 4),
            "deduplicated_individuals_N": N,
            "average_confidence": round(avg_confidence, 4),
            "area_sq_km": safe_area,
            "species_filter": species_filter,
            "using_6month_window": using_6m
        }

    @classmethod
    def calculate_trends(
        cls,
        predictions: List[Dict[str, Any]],
        time_interval: str = "daily"
    ) -> Dict[str, Any]:
        """
        Task 4: Population Trend Analysis logic (Module 6).
        Applies 6-month window filtering with automatic fallback to all observations.
        """
        filtered_info = cls.get_6month_filtered_predictions(predictions)
        active_preds = filtered_info["filtered_predictions"]
        using_6m = filtered_info["using_6month_window"]

        # Group by interval
        interval_groups = defaultdict(list)
        for p in active_preds:
            raw_ts = p.get("prediction_timestamp") or p.get("created_at") or ""
            if not raw_ts:
                continue

            dt = None
            if isinstance(raw_ts, datetime):
                dt = raw_ts
            elif isinstance(raw_ts, str):
                try:
                    dt = datetime.fromisoformat(raw_ts.replace("Z", "+00:00"))
                except Exception:
                    continue

            if not dt:
                continue

            if time_interval == "daily":
                period_key = dt.strftime("%Y-%m-%d")
            elif time_interval == "weekly":
                period_key = f"{dt.year}-W{dt.isocalendar()[1]:02d}"
            elif time_interval == "monthly":
                period_key = dt.strftime("%Y-%m")
            else:
                period_key = dt.strftime("%Y-%m-%d")

            interval_groups[period_key].append(p)

        trends = []
        for period in sorted(interval_groups.keys()):
            period_preds = interval_groups[period]
            deduped = cls.deduplicate_detections(period_preds)
            species_set = set([p.get("common_name") or p.get("primary_species") for p in period_preds if p.get("common_name") or p.get("primary_species")])
            trends.append({
                "period": period,
                "deduplicated_count": len(deduped),
                "total_animals": len(period_preds),
                "species_count": len(species_set)
            })

        return {
            "time_interval": time_interval,
            "total_periods": len(trends),
            "using_6month_window": using_6m,
            "trends": trends
        }

    @staticmethod
    def calculate_shannon_index(species_counts: Dict[str, int]) -> float:
        """
        Phase 4 Requirement: Calculates Shannon Diversity Index (H'):
        H' = - sum(p_i * ln(p_i))
        Where p_i is the proportion of total individuals belonging to species i.
        """
        total_individuals = sum(species_counts.values())
        if total_individuals == 0:
            return 0.0
        
        shannon_index = 0.0
        for count in species_counts.values():
            if count > 0:
                p_i = count / total_individuals
                shannon_index -= p_i * math.log(p_i)
                
        return round(shannon_index, 3)

    @classmethod
    def calculate_biodiversity_metrics(
        cls,
        predictions: List[Dict[str, Any]],
        window_minutes: int = 10
    ) -> Dict[str, Any]:
        """
        Phase 4 Step 2: Calculates Shannon Diversity Index (H'), Species Richness (S),
        Species Evenness (J'), and Species Relative Abundances (p_i) (Module 7).
        Applies 6-month window filtering with automatic fallback to all observations.
        """
        filtered_info = cls.get_6month_filtered_predictions(predictions)
        active_preds = filtered_info["filtered_predictions"]
        using_6m = filtered_info["using_6month_window"]

        deduped_preds = cls.deduplicate_detections(active_preds, window_minutes=window_minutes)
        species_counts = Counter()

        for p in deduped_preds:
            sp = p.get("common_name") or p.get("primary_species") or "Unknown"
            clean = sp.strip().lower()
            if clean not in ["unknown", "n/a", "none", "background", "no animal detected", "unknown species detected"]:
                species_counts[sp] += 1

        total_individuals = sum(species_counts.values())
        species_richness = len(species_counts)
        shannon_index = cls.calculate_shannon_index(species_counts)

        # Pielou's Species Evenness J' = H' / ln(S) for S > 1
        evenness = 0.0
        if species_richness > 1:
            max_shannon = math.log(species_richness)
            evenness = round(shannon_index / max_shannon, 3) if max_shannon > 0 else 0.0
        elif species_richness == 1:
            evenness = 1.0

        # Relative abundance breakdown (p_i = n_i / N)
        relative_abundance = []
        for sp, count in species_counts.most_common():
            proportion = (count / total_individuals) if total_individuals > 0 else 0.0
            relative_abundance.append({
                "species": sp,
                "count": count,
                "proportion": round(proportion, 4),
                "percentage": round(proportion * 100, 2)
            })

        if shannon_index >= 2.5:
            diversity_status = "High Biodiversity"
        elif shannon_index >= 1.5:
            diversity_status = "Moderate Biodiversity"
        elif shannon_index > 0.0:
            diversity_status = "Low Biodiversity"
        else:
            diversity_status = "No Verified Telemetry"

        return {
            "shannon_index": shannon_index,
            "species_richness": species_richness,
            "species_evenness": evenness,
            "total_individuals_N": total_individuals,
            "diversity_status": diversity_status,
            "deduplication_window_minutes": window_minutes,
            "using_6month_window": using_6m,
            "relative_abundance": relative_abundance
        }

    @classmethod
    def compute_biodiversity_analytics(
        cls,
        user_id: int,
        user_name: str,
        user_observations: list,
        user_surveys: list,
        user_sites: list,
        survey_lookup: dict,
        site_lookup: dict,
        completed_preds: list,
        is_valid_species_func,
        fast_iucn_func,
        fast_tax_func,
        iucn_desc_func
    ) -> Dict[str, Any]:
        """
        Task 2: Service execution logic for /api/analytics/biodiversity.
        Moved out of analytics.py API endpoint.
        """
        species_counter = Counter()
        species_confidence = defaultdict(list)
        species_iucn = {}
        species_taxonomy = {}
        
        total_animals = 0
        total_confidences = []
        
        survey_stats = defaultdict(lambda: {"species": set(), "animals": 0, "observations": 0})
        site_stats = defaultdict(lambda: {"species": set(), "animals": 0, "observations": 0})
        timeline_counter = defaultdict(lambda: {"detections": 0, "animals": 0})
        taxonomic_counter = Counter()
        iucn_counter = Counter()

        recent_observations = []
        seen_recent_keys = set()

        for pred in completed_preds:
            c_name = pred.get("common_name") or pred.get("primary_species") or "Unknown Species"
            s_name = pred.get("scientific_name") or c_name
            
            is_unknown = (not is_valid_species_func(c_name)) or (pred.get("is_low_confidence") is True)
            
            conf = float(pred.get("confidence") or 0.0)
            animals = int(pred.get("number_of_animals_detected") or pred.get("bounding_box_count") or (1 if not is_unknown else 0))
            
            total_animals += animals
            if conf > 0:
                total_confidences.append(conf)

            if not is_unknown:
                species_counter[c_name] += 1
                species_confidence[c_name].append(conf)

                if c_name not in species_iucn:
                    species_iucn[c_name] = fast_iucn_func(s_name or c_name)
                
                cat = species_iucn[c_name]
                iucn_counter[cat] += 1

                if c_name not in species_taxonomy:
                    species_taxonomy[c_name] = fast_tax_func(s_name or c_name)

                t_class = species_taxonomy[c_name]
                taxonomic_counter[t_class] += 1

            s_id = pred.get("survey_id")
            st_id = pred.get("monitoring_site_id") or pred.get("site_id")
            dev_id = pred.get("device_id")
            obs_id = pred.get("observation_id")
            media_id = pred.get("uploaded_media_id")
            media_filename = pred.get("filename") or ""

            if s_id in survey_lookup:
                survey_stats[s_id]["observations"] += 1
                if not is_unknown:
                    survey_stats[s_id]["species"].add(c_name)
                    survey_stats[s_id]["animals"] += animals

            if st_id in site_lookup:
                site_stats[st_id]["observations"] += 1
                if not is_unknown:
                    site_stats[st_id]["species"].add(c_name)
                    site_stats[st_id]["animals"] += animals

            raw_time = pred.get("prediction_timestamp") or datetime.utcnow().isoformat()
            try:
                date_str = str(raw_time).split("T")[0]
            except Exception:
                date_str = "Recent"
            timeline_counter[date_str]["detections"] += 1
            timeline_counter[date_str]["animals"] += animals

            ext = media_filename.split(".")[-1].lower() if media_filename else ""
            is_image_asset = ext in ["jpg", "jpeg", "png", "webp", "bmp", "gif"] or pred.get("media_type") == "image"

            if is_image_asset:
                surv_name = survey_lookup.get(s_id, "Unassigned Survey")
                site_name = site_lookup.get(st_id, "Unassigned Site")
                dedup_key = (c_name, surv_name, site_name)
                if dedup_key not in seen_recent_keys and len(recent_observations) < 10:
                    seen_recent_keys.add(dedup_key)
                    recent_observations.append({
                        "prediction_id": str(pred.get("_id")),
                        "uploaded_media_id": str(media_id) if media_id else None,
                        "observation_id": obs_id,
                        "user_id": pred.get("user_id") or user_id,
                        "common_name": c_name,
                        "scientific_name": s_name if not is_unknown else "N/A",
                        "confidence": conf if not is_unknown else None,
                        "is_low_confidence": is_unknown,
                        "survey_id": s_id,
                        "survey_name": surv_name,
                        "monitoring_site_id": st_id,
                        "site_name": site_name,
                        "device_id": dev_id,
                        "filename": media_filename,
                        "thumbnail_url": f"/api/observations/media/{media_filename}" if media_filename else None,
                        "timestamp": date_str
                    })

        user_image_observations = [o for o in user_observations if len(o.uploaded_images or []) > 0]
        total_obs_count = len(user_image_observations) if len(user_image_observations) > 0 else len(completed_preds)
        total_species_count = len(species_counter)
        
        endangered_species = [s for s, cat in species_iucn.items() if cat in ["EN", "CR", "VU"]]
        endangered_species_count = len(endangered_species)

        avg_conf_pct = (sum(total_confidences) / len(total_confidences) * 100) if total_confidences else 0.0
        active_surveys_count = len([s for s in user_surveys if s.status == "Active"])

        species_distribution = [
            {"species": sp, "count": cnt} for sp, cnt in species_counter.most_common(10)
        ]

        taxonomic_diversity = [
            {"group": grp, "count": cnt} for grp, cnt in taxonomic_counter.most_common()
        ]

        iucn_labels_map = {
            "CR": "Critically Endangered",
            "EN": "Endangered",
            "VU": "Vulnerable",
            "NT": "Near Threatened",
            "LC": "Least Concern",
            "DD": "Data Deficient",
            "NE": "Not Evaluated"
        }
        conservation_distribution = [
            {"category": iucn_labels_map.get(cat, cat), "code": cat, "count": cnt}
            for cat, cnt in iucn_counter.items()
        ]

        sorted_timeline_dates = sorted(timeline_counter.keys())
        observation_timeline = [
            {"date": d, "detections": timeline_counter[d]["detections"], "animals": timeline_counter[d]["animals"]}
            for d in sorted_timeline_dates
        ]

        survey_biodiversity = []
        for s_id, title in survey_lookup.items():
            if s_id in survey_stats:
                st = survey_stats[s_id]
                survey_biodiversity.append({
                    "survey_id": s_id,
                    "title": title,
                    "species_count": len(st["species"]),
                    "animal_count": st["animals"],
                    "observation_count": st["observations"]
                })

        site_biodiversity = []
        for st_id, name in site_lookup.items():
            if st_id in site_stats:
                st = site_stats[st_id]
                site_biodiversity.append({
                    "site_id": st_id,
                    "name": name,
                    "species_count": len(st["species"]),
                    "animal_count": st["animals"],
                    "observation_count": st["observations"]
                })

        top_species = []
        for sp, cnt in species_counter.most_common(5):
            confs = species_confidence[sp]
            sp_avg_conf = (sum(confs) / len(confs) * 100) if confs else 0.0
            cat = species_iucn.get(sp, "LC")
            top_species.append({
                "common_name": sp,
                "scientific_name": sp,
                "count": cnt,
                "avg_confidence": round(sp_avg_conf, 1),
                "iucn_category": cat,
                "iucn_label": iucn_labels_map.get(cat, cat)
            })

        high_c = len([c for c in total_confidences if c >= 0.85])
        med_c = len([c for c in total_confidences if 0.70 <= c < 0.85])
        mod_c = len([c for c in total_confidences if 0.50 <= c < 0.70])
        low_c = len([c for c in total_confidences if c < 0.50])
        confidence_analysis = {
            "high_confidence_count": high_c,
            "medium_confidence_count": med_c,
            "moderate_confidence_count": mod_c,
            "low_confidence_count": low_c,
            "brackets": [
                {"bracket": "High (≥85%)", "count": high_c},
                {"bracket": "Medium (70-84%)", "count": med_c},
                {"bracket": "Moderate (50-69%)", "count": mod_c},
                {"bracket": "Low (<50%)", "count": low_c}
            ]
        }

        insights = []
        if species_counter:
            top_sp_name, top_sp_cnt = species_counter.most_common(1)[0]
            insights.append(f"Most Frequently Detected Species: {top_sp_name} with {top_sp_cnt} verified observation(s).")
        else:
            insights.append("Most Frequently Detected Species: No verified species detections registered yet.")

        if survey_biodiversity:
            top_surv = max(survey_biodiversity, key=lambda x: x["species_count"])
            insights.append(f"Survey with Highest Biodiversity: {top_surv['title']} ({top_surv['species_count']} unique species identified).")
        else:
            insights.append("Survey with Highest Biodiversity: Survey telemetries actively monitoring field sectors.")

        if site_biodiversity:
            top_site = max(site_biodiversity, key=lambda x: x["observation_count"])
            insights.append(f"Monitoring Site with Highest Activity: {top_site['name']} ({top_site['observation_count']} recorded detection events).")
        else:
            insights.append("Monitoring Site with Highest Activity: Field sensors actively monitoring observation zones.")

        if taxonomic_counter:
            top_tax_grp, top_tax_cnt = taxonomic_counter.most_common(1)[0]
            insights.append(f"Dominant Taxonomic Class: {top_tax_grp} accounts for {top_tax_cnt} species classification(s).")
        else:
            insights.append("Dominant Taxonomic Class: Vertebrate bioacoustic & vision classifications active.")

        if endangered_species_count > 0:
            insights.append(f"Endangered Species Alert: {endangered_species_count} species with EN/CR/VU status detected in telemetry.")
        else:
            insights.append("Endangered Species Alert: All detected species currently categorized under Least Concern or stable status.")

        shannon_index = cls.calculate_shannon_index(species_counter)
        species_richness = len(species_counter)
        species_evenness = (
            round(shannon_index / math.log(species_richness), 3)
            if species_richness > 1 else (1.0 if species_richness == 1 else 0.0)
        )

        insights.append(f"Average Classifier Accuracy: Mean AI prediction confidence stands at {round(avg_conf_pct, 1)}%.")
        insights.append(f"Shannon Diversity Index (H'): Calculated at {shannon_index} (Richness: {species_richness}, Evenness: {species_evenness}).")

        return {
            "user_id": user_id,
            "user_name": user_name,
            "overview_kpis": {
                "total_observations": total_obs_count,
                "total_species_identified": total_species_count,
                "total_animals_detected": total_animals,
                "endangered_species_count": endangered_species_count,
                "avg_confidence": round(avg_conf_pct, 1),
                "active_surveys": active_surveys_count,
                "shannon_index": shannon_index,
                "species_richness": species_richness,
                "species_evenness": species_evenness
            },
            "biodiversity_index": {
                "shannon_index": shannon_index,
                "species_richness": species_richness,
                "species_evenness": species_evenness,
                "formula": "H' = -sum(p_i * ln(p_i))",
                "diversity_status": (
                    "High Biodiversity" if shannon_index >= 2.5
                    else ("Moderate Biodiversity" if shannon_index >= 1.5
                    else ("Low Biodiversity" if shannon_index > 0.0
                    else "No Verified Telemetry"))
                )
            },
            "species_distribution": species_distribution,
            "taxonomic_diversity": taxonomic_diversity,
            "conservation_distribution": conservation_distribution,
            "observation_timeline": observation_timeline,
            "survey_biodiversity": survey_biodiversity,
            "site_biodiversity": site_biodiversity,
            "top_species": top_species,
            "confidence_analysis": confidence_analysis,
            "insights": insights,
            "recent_observations": recent_observations
        }
