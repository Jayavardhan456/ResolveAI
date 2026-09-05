from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime
from database import Base
from datetime import datetime


class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)

    master_incident_id = Column(Integer, nullable=True)

    name = Column(String(100))
    complaint_text = Column(Text)

    category = Column(String(100))
    severity = Column(String(50))
    priority_score = Column(Float)

    department = Column(String(100))
    status = Column(String(50), default="Submitted")

    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    # ==============================
    # SLA
    # ==============================

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    sla_hours = Column(
        Float,
        default=72
    )

    escalated = Column(
        Boolean,
        default=False
    )

    escalation_reason = Column(
        String(255),
        nullable=True
    )

    # ==============================
    # RESOLUTION VERIFICATION
    # ==============================

    resolution_comment = Column(
        Text,
        nullable=True
    )

    verification_status = Column(
        String(50),
        default="Pending"
    )

    citizen_verified = Column(
        Boolean,
        default=False
    )

    verified_at = Column(
        DateTime,
        nullable=True
    )