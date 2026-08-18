from app.core.database import SessionLocal
from app.models.sql import Survey, MonitoringSite

db = SessionLocal()
surveys = db.query(Survey).all()
print(f"Total surveys: {len(surveys)}")
for s in surveys:
    print(f"  ID={s.id}, Title='{s.title}', Status='{s.status}', Country='{getattr(s, 'country', None)}'")

sites = db.query(MonitoringSite).all()
print(f"Total monitoring sites: {len(sites)}")
for st in sites:
    print(f"  ID={st.id}, Name='{st.name}', Habitat='{st.habitat_type}', Area={st.area_sq_km}")
