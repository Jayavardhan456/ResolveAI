from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Boolean,
    DateTime,
    Text
)

from sqlalchemy.orm import declarative_base

from datetime import datetime


Base = declarative_base()


# =========================================
# COMPLAINT MODEL
# =========================================

class Complaint(Base):

    __tablename__ = "complaints"


    id = Column(
        Integer,
        primary_key=True,
        index=True
    )


    # USER INFORMATION

    name = Column(
        String(100),
        nullable=False
    )


    role = Column(
        String(30),
        default="Citizen"
    )


    # COMPLAINT

    complaint_text = Column(
        Text,
        nullable=False
    )


    category = Column(
        String(100)
    )


    severity = Column(
        String(50)
    )


    priority_score = Column(
        Integer
    )


    department = Column(
        String(100)
    )


    status = Column(
        String(100),
        default="Submitted"
    )


    # LOCATION

    latitude = Column(
        Float,
        nullable=True
    )


    longitude = Column(
        Float,
        nullable=True
    )


    location_name = Column(
        String(255),
        nullable=True
    )


    # MASTER INCIDENT

    master_incident_id = Column(
        Integer,
        nullable=True
    )


    # TIME

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


    updated_at = Column(
        DateTime,
        default=datetime.utcnow
    )


    # SLA

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


    # =====================================
    # OFFICER ASSIGNMENT & PROGRESS
    # =====================================

    assigned_officer = Column(
        String(100),
        nullable=True
    )


    assigned_at = Column(
        DateTime,
        nullable=True
    )


    officer_progress = Column(
        Integer,
        default=0
    )


    progress_note = Column(
        Text,
        nullable=True
    )


    # =====================================
    # RESOLUTION VERIFICATION
    # =====================================

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


# =========================================
# FARMER PROCUREMENT BOOKING
# =========================================

class ProcurementBooking(Base):

    __tablename__ = "procurement_bookings"


    id = Column(
        Integer,
        primary_key=True,
        index=True
    )


    farmer_name = Column(
        String(100),
        nullable=False
    )


    centre_id = Column(
        Integer,
        nullable=False
    )


    centre_name = Column(
        String(150),
        nullable=False
    )


    location = Column(
        String(255),
        nullable=True
    )


    slot_date = Column(
        String(50),
        nullable=False
    )


    slot_time = Column(
        String(100),
        nullable=False
    )


    crop_type = Column(
        String(100),
        nullable=True
    )


    quantity = Column(
        String(100),
        nullable=True
    )


    status = Column(
        String(50),
        default="Booked"
    )


    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )