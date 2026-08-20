from app.database.database import Base, engine

from app.models.base import *

def create_tables():
    Base.metadata.create_all(bind=engine)