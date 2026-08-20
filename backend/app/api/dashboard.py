from fastapi import APIRouter, Depends
from app.models.user import User
from app.models.site import MonitoringSite
from app.models.device import SensorDevice
from app.models.upload import FieldUpload
from app.models.observation import ObservationRecord
from app.models.unified_prediction import UnifiedPredictionRecord
from app.api.auth import get_current_user
import asyncio
import calendar
from datetime import datetime, timezone, timedelta

router = APIRouter()

def get_mom_change(current_count, previous_count):
    if previous_count == 0:
        return None
    return round(((current_count - previous_count) / previous_count) * 100, 1)

@router.get("/")
async def get_dashboard_analytics(current_user: User = Depends(get_current_user)):
    now = datetime.now(timezone.utc)
    # Calculate start of current month and previous month
    current_month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    # Handle January edge case for previous month
    if current_month_start.month == 1:
        prev_month_start = current_month_start.replace(year=current_month_start.year - 1, month=12)
    else:
        prev_month_start = current_month_start.replace(month=current_month_start.month - 1)

    from app.database.db import supabase

    # Basic total counts
    total_users = supabase.table("users").select("id", count="exact").execute().count or 0
    total_sites = supabase.table("monitoring_sites").select("id", count="exact").execute().count or 0
    total_devices = supabase.table("sensor_devices").select("id", count="exact").execute().count or 0
    total_uploads = supabase.table("field_uploads").select("id", count="exact").execute().count or 0
    total_obs = supabase.table("observation_records").select("id", count="exact").execute().count or 0
    
    # MoM counts - previous month
    prev_m = prev_month_start.isoformat()
    curr_m = current_month_start.isoformat()
    
    prev_users = supabase.table("users").select("id", count="exact").gte("created_at", prev_m).lt("created_at", curr_m).execute().count or 0
    prev_sites = supabase.table("monitoring_sites").select("id", count="exact").gte("created_at", prev_m).lt("created_at", curr_m).execute().count or 0
    prev_devices = supabase.table("sensor_devices").select("id", count="exact").gte("created_at", prev_m).lt("created_at", curr_m).execute().count or 0
    prev_uploads = supabase.table("field_uploads").select("id", count="exact").gte("uploaded_at", prev_m).lt("uploaded_at", curr_m).execute().count or 0
    prev_obs = supabase.table("observation_records").select("id", count="exact").gte("created_at", prev_m).lt("created_at", curr_m).execute().count or 0

    # Current month counts
    curr_users = supabase.table("users").select("id", count="exact").gte("created_at", curr_m).execute().count or 0
    curr_sites = supabase.table("monitoring_sites").select("id", count="exact").gte("created_at", curr_m).execute().count or 0
    curr_devices = supabase.table("sensor_devices").select("id", count="exact").gte("created_at", curr_m).execute().count or 0
    curr_uploads = supabase.table("field_uploads").select("id", count="exact").gte("uploaded_at", curr_m).execute().count or 0
    curr_obs = supabase.table("observation_records").select("id", count="exact").gte("created_at", curr_m).execute().count or 0
    
    verified_obs = supabase.table("observation_records").select("id", count="exact").eq("verification_status", "Verified").execute().count or 0
    pending_obs = supabase.table("observation_records").select("id", count="exact").eq("verification_status", "Pending Validation").execute().count or 0
    
    total_predictions = supabase.table("unified_prediction_records").select("id", count="exact").execute().count or 0
    
    recent_res = supabase.table("observation_records").select("*").order("created_at", desc=True).limit(5).execute()
    recent_observations = [ObservationRecord(**d) for d in recent_res.data]
    
    # Aggregations in memory
    all_obs_res = supabase.table("observation_records").select("species_name, observed_at, created_at").execute()
    
    from collections import Counter
    species_counter = Counter([d["species_name"] for d in all_obs_res.data if d.get("species_name")])
    species_distribution = [{"species": k, "count": v} for k, v in species_counter.most_common()]
    total_species = len(species_distribution)

    monthly_counter = Counter()
    for d in all_obs_res.data:
        dt_str = d.get("observed_at")
        if dt_str:
            try:
                dt = datetime.fromisoformat(dt_str.replace("Z", "+00:00"))
                monthly_counter[dt.month] += 1
            except:
                pass
                
    monthly_observations = []
    for month_num in sorted(monthly_counter.keys()):
        try:
            month_name = calendar.month_abbr[month_num]
            monthly_observations.append({"month": month_name, "count": monthly_counter[month_num]})
        except:
            pass

    # Observation Trend (last 7 days)
    seven_days_ago = now - timedelta(days=7)
    trend_counter = Counter()
    for d in all_obs_res.data:
        dt_str = d.get("created_at")
        if dt_str:
            try:
                dt = datetime.fromisoformat(dt_str.replace("Z", "+00:00"))
                if dt >= seven_days_ago:
                    trend_counter[(dt.year, dt.month, dt.day)] += 1
            except:
                pass
                
    observation_trend = []
    for (y, m, day), count in sorted(trend_counter.items()):
        observation_trend.append({"date": f"{m:02d}/{day:02d}", "count": count})

    # Format recent observations
    recent_obs_list = [
        {
            "id": str(obs.id),
            "species": obs.species_name,
            "monitoring_site": obs.monitoring_site_name,
            "observer": obs.observer_name,
            "status": obs.verification_status,
            "created_at": obs.created_at,
            "file_url": obs.file_url
        } for obs in recent_observations
    ]

    return {
        "metrics": {
            "total_users": {"value": total_users, "mom_change": get_mom_change(curr_users, prev_users)},
            "total_monitoring_sites": {"value": total_sites, "mom_change": get_mom_change(curr_sites, prev_sites)},
            "total_sensor_devices": {"value": total_devices, "mom_change": get_mom_change(curr_devices, prev_devices)},
            "total_uploads": {"value": total_uploads, "mom_change": get_mom_change(curr_uploads, prev_uploads)},
            "total_observations": {"value": total_obs, "mom_change": get_mom_change(curr_obs, prev_obs)},
            "verified_observations": {"value": verified_obs, "mom_change": None}, # MoM doesn't make as much sense here without tracking status changes over time
            "pending_observations": {"value": pending_obs, "mom_change": None},
            "total_predictions": {"value": total_predictions, "mom_change": None},
            "total_species": {"value": total_species, "mom_change": None}
        },
        "recent_observations": recent_obs_list,
        "species_distribution": species_distribution,
        "monthly_observations": monthly_observations,
        "observation_trend": observation_trend
    }
