from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, Float, func
from app.database.database import Base

class ConservationRecommendation(Base):
    __tablename__ = "conservation_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    species_id = Column(Integer, nullable=True)
    habitat_id = Column(Integer, nullable=True)
    species = Column(String(255), nullable=True)
    habitat = Column(String(255), nullable=True)
    category = Column(String(100), nullable=True, default="Species Management")
    title = Column(String(255), nullable=True)
    threat_level = Column(String(50), nullable=True)
    main_threat = Column(String(255), nullable=True)
    issue_detected = Column(Text, nullable=True)
    recommended_action = Column(Text, nullable=True)
    recommendation = Column(Text, nullable=False)
    reason = Column(Text, nullable=True)
    expected_impact = Column(Text, nullable=True)
    priority = Column(String(50), nullable=False) # Critical, High, Medium, Low
    urgency = Column(String(50), nullable=True)
    estimated_cost = Column(Float, nullable=True)
    completion_status = Column(String(50), nullable=True, default="In Progress")
    assigned_team = Column(String(255), nullable=True)
    deadline = Column(String(50), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
