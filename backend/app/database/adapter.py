from app.database.db import supabase
from pydantic import BaseModel

TABLE_MAP = {
    'User': 'users', 'Role': 'roles', 'Notification': 'notifications',
    'SensorDevice': 'sensor_devices', 'ObservationRecord': 'observation_records',
    'PredictionRecord': 'prediction_records', 'AudioPredictionRecord': 'audio_prediction_records',
    'UnifiedPredictionRecord': 'unified_prediction_records', 'MonitoringSite': 'monitoring_sites',
    'PopulationEstimationRecord': 'population_estimations', 'FieldUpload': 'field_uploads',
    'ReportHistory': 'report_history', 'AdvancedAnalyticsCache': 'advanced_analytics_cache',
    'AuditLog': 'audit_logs'
}

async def find_one(model_cls, field, value):
    table = TABLE_MAP.get(model_cls.__name__)
    res = supabase.table(table).select("*").eq(field, value).execute()
    if res.data:
        return model_cls(**res.data[0])
    return None

async def find_all(model_cls):
    table = TABLE_MAP.get(model_cls.__name__)
    res = supabase.table(table).select("*").execute()
    return [model_cls(**d) for d in res.data]

async def insert(model: BaseModel):
    table = TABLE_MAP.get(model.__class__.__name__)
    res = supabase.table(table).insert(model.model_dump(mode='json', exclude_none=True)).execute()
    if res.data:
        for k, v in res.data[0].items():
            setattr(model, k, v)
    return model

async def save(model: BaseModel):
    table = TABLE_MAP.get(model.__class__.__name__)
    res = supabase.table(table).update(model.model_dump(mode='json', exclude_none=True, exclude={'id'})).eq("id", model.id).execute()
    return model

async def delete(model: BaseModel):
    table = TABLE_MAP.get(model.__class__.__name__)
    supabase.table(table).delete().eq("id", model.id).execute()

async def get(model_cls, id_val):
    table = TABLE_MAP.get(model_cls.__name__)
    res = supabase.table(table).select("*").eq("id", str(id_val)).execute()
    if res.data:
        return model_cls(**res.data[0])
    return None

async def count_documents(model_cls):
    table = TABLE_MAP.get(model_cls.__name__)
    res = supabase.table(table).select("id", count="exact").execute()
    return res.count
