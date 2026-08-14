from app.core.database import SessionLocal
from app.models.observation import Observation

def sync():
    db = SessionLocal()
    try:
        obs_list = db.query(Observation).all()
        updated = 0
        for obs in obs_list:
            if obs.ai_predictions:
                latest_pred = obs.ai_predictions[-1]
                if obs.count != latest_pred.detection_count:
                    print(f"Updating Observation {obs.id} ({obs.species}): count {obs.count} -> {latest_pred.detection_count}")
                    obs.count = latest_pred.detection_count
                    db.add(obs)
                    updated += 1
        db.commit()
        print(f"Successfully synchronized {updated} observation counts!")
    except Exception as e:
        db.rollback()
        print(f"Failed to sync: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    sync()
