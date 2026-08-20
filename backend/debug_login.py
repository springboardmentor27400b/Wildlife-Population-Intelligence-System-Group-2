from app.routes.auth import login
from app.schemas.user import UserLogin
from app.database.database import SessionLocal
from app.models.user import User

print('starting')
db = SessionLocal()
try:
    user_data = UserLogin(email='researcher@example.com', password='secret123')
    result = login(user_data, db)
    print(result)
except Exception as exc:
    import traceback
    traceback.print_exc()
finally:
    db.close()
