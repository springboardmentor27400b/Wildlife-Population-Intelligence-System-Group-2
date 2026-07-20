from fastapi import APIRouter, Depends
from app.models.user import User
from app.models.site import MonitoringSite
from app.models.device import SensorDevice
from app.models.upload import FieldUpload
from app.models.observation import ObservationRecord
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

    # Basic total counts
    total_users_task = User.find_all().count()
    total_sites_task = MonitoringSite.find_all().count()
    total_devices_task = SensorDevice.find_all().count()
    total_uploads_task = FieldUpload.find_all().count()
    total_obs_task = ObservationRecord.find_all().count()
    
    # MoM counts - previous month (from prev_month_start to current_month_start - 1 microsecond)
    prev_users_task = User.find(User.created_at >= prev_month_start, User.created_at < current_month_start).count()
    prev_sites_task = MonitoringSite.find(MonitoringSite.created_at >= prev_month_start, MonitoringSite.created_at < current_month_start).count()
    prev_devices_task = SensorDevice.find(SensorDevice.created_at >= prev_month_start, SensorDevice.created_at < current_month_start).count()
    prev_uploads_task = FieldUpload.find(FieldUpload.uploaded_at >= prev_month_start, FieldUpload.uploaded_at < current_month_start).count()
    prev_obs_task = ObservationRecord.find(ObservationRecord.created_at >= prev_month_start, ObservationRecord.created_at < current_month_start).count()

    # Current month counts
    curr_users_task = User.find(User.created_at >= current_month_start).count()
    curr_sites_task = MonitoringSite.find(MonitoringSite.created_at >= current_month_start).count()
    curr_devices_task = SensorDevice.find(SensorDevice.created_at >= current_month_start).count()
    curr_uploads_task = FieldUpload.find(FieldUpload.uploaded_at >= current_month_start).count()
    curr_obs_task = ObservationRecord.find(ObservationRecord.created_at >= current_month_start).count()
    
    verified_obs_task = ObservationRecord.find(ObservationRecord.verification_status == "Verified").count()
    pending_obs_task = ObservationRecord.find(ObservationRecord.verification_status == "Pending Validation").count()
    
    recent_obs_task = ObservationRecord.find_all().sort("-created_at").limit(5).to_list()
    
    # Aggregation tasks
    species_agg_task = ObservationRecord.aggregate([
        {"$group": {"_id": "$species_name", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]).to_list()
    
    monthly_agg_task = ObservationRecord.aggregate([
        {"$group": {
            "_id": {"$month": "$observed_at"},
            "count": {"$sum": 1}
        }},
        {"$sort": {"_id": 1}}
    ]).to_list()

    # Execute all independent tasks concurrently
    results = await asyncio.gather(
        total_users_task, total_sites_task, total_devices_task, total_uploads_task, total_obs_task,
        prev_users_task, prev_sites_task, prev_devices_task, prev_uploads_task, prev_obs_task,
        curr_users_task, curr_sites_task, curr_devices_task, curr_uploads_task, curr_obs_task,
        verified_obs_task, pending_obs_task, recent_obs_task, species_agg_task, monthly_agg_task
    )
    
    (total_users, total_sites, total_devices, total_uploads, total_obs,
     prev_users, prev_sites, prev_devices, prev_uploads, prev_obs,
     curr_users, curr_sites, curr_devices, curr_uploads, curr_obs,
     verified_obs, pending_obs, recent_observations, species_agg, monthly_agg) = results

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
        
    # Format species distribution
    species_distribution = [{"species": item["_id"], "count": item["count"]} for item in species_agg if item["_id"]]
    total_species = len(species_distribution)

    # Format monthly observations
    monthly_observations = []
    for item in monthly_agg:
        if item["_id"]:
            try:
                month_name = calendar.month_abbr[item["_id"]]
                monthly_observations.append({"month": month_name, "count": item["count"]})
            except IndexError:
                pass
                
    # Observation Trend (last 7 days)
    seven_days_ago = now - timedelta(days=7)
    trend_agg = await ObservationRecord.aggregate([
        {"$match": {"created_at": {"$gte": seven_days_ago}}},
        {"$group": {
            "_id": {
                "year": {"$year": "$created_at"},
                "month": {"$month": "$created_at"},
                "day": {"$dayOfMonth": "$created_at"}
            },
            "count": {"$sum": 1}
        }},
        {"$sort": {"_id.year": 1, "_id.month": 1, "_id.day": 1}}
    ]).to_list()
    
    observation_trend = []
    for item in trend_agg:
        d = item["_id"]
        date_str = f"{d['month']:02d}/{d['day']:02d}"
        observation_trend.append({"date": date_str, "count": item["count"]})

    return {
        "metrics": {
            "total_users": {"value": total_users, "mom_change": get_mom_change(curr_users, prev_users)},
            "total_monitoring_sites": {"value": total_sites, "mom_change": get_mom_change(curr_sites, prev_sites)},
            "total_sensor_devices": {"value": total_devices, "mom_change": get_mom_change(curr_devices, prev_devices)},
            "total_uploads": {"value": total_uploads, "mom_change": get_mom_change(curr_uploads, prev_uploads)},
            "total_observations": {"value": total_obs, "mom_change": get_mom_change(curr_obs, prev_obs)},
            "verified_observations": {"value": verified_obs, "mom_change": None}, # MoM doesn't make as much sense here without tracking status changes over time
            "pending_observations": {"value": pending_obs, "mom_change": None},
            "total_species": {"value": total_species, "mom_change": None}
        },
        "recent_observations": recent_obs_list,
        "species_distribution": species_distribution,
        "monthly_observations": monthly_observations,
        "observation_trend": observation_trend
    }
