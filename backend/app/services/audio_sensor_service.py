from typing import List, Optional, Tuple, Any
from sqlalchemy.orm import Session
from app.repositories.audio_sensor_repository import audio_sensor_repository
from app.repositories.monitoring_site_repository import monitoring_site_repository
from app.models.audio_sensor import AudioSensor
from app.models.enums import DeviceStatus
from app.core.exceptions import ConflictException, NotFoundException

class AudioSensorService:
    def create_sensor(
        self,
        db: Session,
        *,
        model: str,
        serial_number: str,
        status: DeviceStatus,
        site_id: Optional[Any]
    ) -> AudioSensor:
        # Check uniqueness
        existing = audio_sensor_repository.get_by_serial(db, serial_number=serial_number)
        if existing:
            raise ConflictException(f"Audio sensor with serial '{serial_number}' already exists")
            
        if site_id:
            site = monitoring_site_repository.get(db, site_id)
            if not site:
                raise NotFoundException("Associated monitoring site not found")
                
        sensor = AudioSensor(
            model=model,
            serial_number=serial_number,
            status=status,
            site_id=site_id
        )
        db.add(sensor)
        db.commit()
        db.refresh(sensor)
        return sensor

    def get_sensor(self, db: Session, sensor_id: Any) -> AudioSensor:
        sensor = audio_sensor_repository.get(db, sensor_id)
        if not sensor:
            raise NotFoundException("Audio sensor not found")
        return sensor

    def search_sensors(
        self,
        db: Session,
        *,
        site_id: Optional[Any] = None,
        status: Optional[DeviceStatus] = None,
        search_query: Optional[str] = None,
        skip: int = 0,
        limit: int = 10
    ) -> Tuple[List[AudioSensor], int]:
        return audio_sensor_repository.search(
            db, site_id=site_id, status=status, search_query=search_query, skip=skip, limit=limit
        )

    def update_sensor(
        self,
        db: Session,
        *,
        sensor_id: Any,
        model: Optional[str] = None,
        serial_number: Optional[str] = None,
        status: Optional[DeviceStatus] = None,
        site_id: Optional[Any] = None
    ) -> AudioSensor:
        sensor = self.get_sensor(db, sensor_id)
        
        update_data = {}
        if model is not None:
            update_data["model"] = model
            
        if serial_number is not None and serial_number != sensor.serial_number:
            existing = audio_sensor_repository.get_by_serial(db, serial_number=serial_number)
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
            
        return audio_sensor_repository.update(db, db_obj=sensor, obj_in=update_data)

    def delete_sensor(self, db: Session, sensor_id: Any) -> AudioSensor:
        sensor = self.get_sensor(db, sensor_id)
        return audio_sensor_repository.remove(db, id=sensor_id)

audio_sensor_service = AudioSensorService()
