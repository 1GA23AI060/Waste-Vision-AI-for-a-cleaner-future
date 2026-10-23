from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Text, Boolean, DateTime
from .database import Base


class WasteReport(Base):
    __tablename__ = "waste_reports"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    report_id = Column(String(32), unique=True, index=True, nullable=False)
    category = Column(String(50), nullable=False)  # Wet, Dry, Plastic, E-waste, Hazardous, Other
    description = Column(Text, nullable=False)
    location_address = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    image_url = Column(String(255), nullable=True)
    
    # Severity & AI-Assisted Priority
    reported_severity = Column(String(20), nullable=False, default="Medium")  # Low, Medium, High, Critical
    calculated_priority = Column(String(20), nullable=False, default="Medium")  # Low, Medium, High, Critical
    priority_score = Column(Float, nullable=False, default=50.0)
    priority_reasons = Column(Text, nullable=True)  # JSON-encoded array of reason strings
    
    # Management & Operations
    status = Column(String(30), nullable=False, default="Pending")  # Pending, Assigned, In Progress, Resolved
    assigned_collector = Column(String(100), nullable=True)
    estimated_collection_date = Column(String(50), nullable=True)
    internal_notes = Column(Text, nullable=True)
    
    is_demo = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    resolved_at = Column(DateTime, nullable=True)


class StatusTimelineEvent(Base):
    __tablename__ = "status_timeline_events"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    report_id = Column(String(32), index=True, nullable=False)
    status = Column(String(30), nullable=False)
    actor = Column(String(100), nullable=False, default="System")
    note = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
