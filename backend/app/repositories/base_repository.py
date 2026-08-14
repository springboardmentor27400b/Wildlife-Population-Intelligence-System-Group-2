import uuid
from typing import Any, Dict, Generic, List, Optional, Type, TypeVar, Union
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import Base

ModelType = TypeVar("ModelType", bound=Base)
CreateSchemaType = TypeVar("CreateSchemaType", bound=BaseModel)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=BaseModel)

class BaseRepository(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    def __init__(self, model: Type[ModelType]):
        """
        Repository object with default methods to Create, Read, Update, Delete (CRUD).
        """
        self.model = model

    def _parse_id(self, id: Any) -> Any:
        """Parse string ID to UUID if applicable."""
        if isinstance(id, str):
            try:
                return uuid.UUID(id)
            except ValueError:
                pass
        return id

    def get(self, db: Session, id: Any) -> Optional[ModelType]:
        parsed_id = self._parse_id(id)
        # Using Session.get() as recommended in SQLAlchemy 2.0
        return db.get(self.model, parsed_id)

    def get_multi(
        self, db: Session, *, skip: int = 0, limit: int = 100
    ) -> List[ModelType]:
        return db.query(self.model).offset(skip).limit(limit).all()

    def create(self, db: Session, *, obj_in: CreateSchemaType) -> ModelType:
        obj_in_data = jsonable_encoder(obj_in)
        db_obj = self.model(**obj_in_data)  # type: ignore
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(
        self,
        db: Session,
        *,
        db_obj: ModelType,
        obj_in: Union[UpdateSchemaType, Dict[str, Any]]
    ) -> ModelType:
        obj_data = jsonable_encoder(db_obj)
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.model_dump(exclude_unset=True)
        for field in obj_data:
            if field in update_data:
                # Handle possible UUID conversions
                val = update_data[field]
                if field.endswith("_id") or field == "id":
                    val = self._parse_id(val)
                setattr(db_obj, field, val)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def remove(self, db: Session, *, id: Any) -> Optional[ModelType]:
        parsed_id = self._parse_id(id)
        obj = db.get(self.model, parsed_id)
        if obj:
            db.delete(obj)
            db.commit()
        return obj
