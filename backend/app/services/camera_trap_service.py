from typing import List, Optional, Tuple, Any
from sqlalchemy.orm import Session
from app.repositories.camera_trap_repository import camera_trap_repository
from app.repositories.monitoring_site_repository import monitoring_site_repository
from app.models.camera_trap import CameraTrap
from app.models.enums import DeviceStatus
from app.core.exceptions import ConflictException, NotFoundException

class CameraTrapService:
    def create_camera(
        self,
        db: Session,
        *,
        model: str,
        serial_number: str,
        status: DeviceStatus,
        site_id: Optional[Any]
    ) -> CameraTrap:
        # Check uniqueness of serial
        existing = camera_trap_repository.get_by_serial(db, serial_number=serial_number)
        if existing:
            raise ConflictException(f"Camera trap with serial '{serial_number}' already exists")
            
        if site_id:
            site = monitoring_site_repository.get(db, site_id)
            if not site:
                raise NotFoundException("Associated monitoring site not found")
                
        camera = CameraTrap(
            model=model,
            serial_number=serial_number,
            status=status,
            site_id=site_id
        )
        db.add(camera)
        db.commit()
        db.refresh(camera)
        return camera

    def get_camera(self, db: Session, camera_id: Any) -> CameraTrap:
        camera = camera_trap_repository.get(db, camera_id)
        if not camera:
            raise NotFoundException("Camera trap not found")
        return camera

    def search_cameras(
        self,
        db: Session,
        *,
        site_id: Optional[Any] = None,
        status: Optional[DeviceStatus] = None,
        search_query: Optional[str] = None,
        skip: int = 0,
        limit: int = 10
    ) -> Tuple[List[CameraTrap], int]:
        return camera_trap_repository.search(
            db, site_id=site_id, status=status, search_query=search_query, skip=skip, limit=limit
        )

    def update_camera(
        self,
        db: Session,
        *,
        camera_id: Any,
        model: Optional[str] = None,
        serial_number: Optional[str] = None,
        status: Optional[DeviceStatus] = None,
        site_id: Optional[Any] = None
    ) -> CameraTrap:
        camera = self.get_camera(db, camera_id)
        
        update_data = {}
        if model is not None:
            update_data["model"] = model
            
        if serial_number is not None and serial_number != camera.serial_number:
            existing = camera_trap_repository.get_by_serial(db, serial_number=serial_number)
            if existing:
                raise ConflictException(f"Serial number '{serial_number}' is taken")
            update_data["serial_number"] = serial_number
            
        if status is not None:
            update_data["status"] = status
            
        if site_id is not None:
            if site_id:
                site = monitoring_site_repository.get(db, site_id)
                if not site:
                    raise NotFoundException("Associated monitoring site not found")
            update_data["site_id"] = site_id
            
        return camera_trap_repository.update(db, db_obj=camera, obj_in=update_data)

    def delete_camera(self, db: Session, camera_id: Any) -> CameraTrap:
        camera = self.get_camera(db, camera_id)
        return camera_trap_repository.remove(db, id=camera_id)

camera_trap_service = CameraTrapService()
