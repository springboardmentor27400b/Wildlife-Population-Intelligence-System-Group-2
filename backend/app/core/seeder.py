import uuid
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.user import User
from app.core.security import get_password_hash

def seed_db(db: Session) -> None:
    # 1. Seed Administrator
    admin_user = db.query(User).filter(User.email == "admin@wildlife.org").first()
    if not admin_user:
        default_admin = User(
            id=uuid.uuid4(),
            email="admin@wildlife.org",
            hashed_password=get_password_hash("AdminPass123!"),
            full_name="System Administrator",
            role="Administrator",
            is_active=True,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        db.add(default_admin)
        print("Administrator seeded successfully!")
        
    # 2. Seed Wildlife Researcher
    researcher_user = db.query(User).filter(User.email == "researcher@wildlife.org").first()
    if not researcher_user:
        default_researcher = User(
            id=uuid.uuid4(),
            email="researcher@wildlife.org",
            hashed_password=get_password_hash("ResearcherPass123!"),
            full_name="Dr. Jane Goodall",
            role="Wildlife Researcher",
            is_active=True,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        db.add(default_researcher)
        print("Wildlife Researcher seeded successfully!")
        
    # 3. Seed Conservation Officer
    conservation_user = db.query(User).filter(User.email == "conservation@wildlife.org").first()
    if not conservation_user:
        default_conservation = User(
            id=uuid.uuid4(),
            email="conservation@wildlife.org",
            hashed_password=get_password_hash("ConservationPass123!"),
            full_name="Officer Sarah Connor",
            role="Conservation Officer",
            is_active=True,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        db.add(default_conservation)
        print("Conservation Officer seeded successfully!")
        
    # 4. Seed Forest Department Officer
    forest_user = db.query(User).filter(User.email == "forest@wildlife.org").first()
    if not forest_user:
        default_forest = User(
            id=uuid.uuid4(),
            email="forest@wildlife.org",
            hashed_password=get_password_hash("ForestPass123!"),
            full_name="Ranger David Attenborough",
            role="Forest Department Officer",
            is_active=True,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        db.add(default_forest)
        print("Forest Department Officer seeded successfully!")
        
    try:
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Failed to commit seeded users: {e}")
        
    # Seed 54 species profiles if table is empty
    from app.core.seeding import seed_species_table
    seed_species_table(db)
