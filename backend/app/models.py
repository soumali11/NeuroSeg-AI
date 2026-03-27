from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from app.database import Base

class ScanResult(Base):
    __tablename__ = "scan_results"

    id                     = Column(Integer, primary_key=True, index=True)
    patient_name           = Column(String, index=True)
    filename               = Column(String, index=True)
    whole_tumor_volume     = Column(Float)
    tumor_core_volume      = Column(Float)
    enhancing_tumor_volume = Column(Float)
    urgency_score          = Column(String)   # Text label: ROUTINE / PRIORITY / CRITICAL EMERGENCY
    urgency_numeric        = Column(Integer)  # 0–100 computed score, unique per patient
    created_at             = Column(DateTime(timezone=True), server_default=func.now())
