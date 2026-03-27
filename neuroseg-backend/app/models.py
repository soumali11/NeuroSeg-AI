from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime
from .database import Base

class ScanResult(Base):
    __tablename__ = "scan_results"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String, index=True)
    core_volume_cm3 = Column(Float)
    edema_volume_cm3 = Column(Float)
    urgency_score = Column(String)
    scan_date = Column(DateTime, default=datetime.utcnow)