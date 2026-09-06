from pydantic import (
    BaseModel,
    ConfigDict
)

from typing import Optional

from datetime import datetime


# =========================================
# COMPLAINT CREATE
# =========================================

class ComplaintCreate(BaseModel):

    name: str

    role: str = "Citizen"

    complaint_text: str

    latitude: Optional[float] = None

    longitude: Optional[float] = None

    location_name: Optional[str] = None


# =========================================
# COMPLAINT RESPONSE
# =========================================

class ComplaintResponse(BaseModel):

    id: int

    name: str

    role: Optional[str] = None

    complaint_text: str

    category: Optional[str] = None

    severity: Optional[str] = None

    priority_score: Optional[int] = None

    department: Optional[str] = None

    status: Optional[str] = None

    latitude: Optional[float] = None

    longitude: Optional[float] = None

    location_name: Optional[str] = None

    master_incident_id: Optional[int] = None

    created_at: Optional[datetime] = None

    sla_hours: Optional[float] = None

    escalated: Optional[bool] = None

    escalation_reason: Optional[str] = None

    assigned_officer: Optional[str] = None

    assigned_at: Optional[datetime] = None

    officer_progress: Optional[int] = 0

    progress_note: Optional[str] = None

    verification_status: Optional[str] = None

    citizen_verified: Optional[bool] = None


    model_config = ConfigDict(
        from_attributes=True
    )


# =========================================
# OFFICER UPDATE
# =========================================

class OfficerUpdate(BaseModel):

    assigned_officer: Optional[str] = None

    officer_progress: Optional[int] = None

    progress_note: Optional[str] = None

    status: Optional[str] = None


# =========================================
# VERIFICATION
# =========================================

class VerificationRequest(BaseModel):

    verified: bool

    comment: Optional[str] = None


# =========================================
# PROCUREMENT BOOKING
# =========================================

class ProcurementBookingCreate(BaseModel):

    farmer_name: str

    centre_id: int

    slot_date: str

    slot_time: str

    crop_type: Optional[str] = None

    quantity: Optional[str] = None


# =========================================
# PROCUREMENT RESPONSE
# =========================================

class ProcurementBookingResponse(BaseModel):

    id: int

    farmer_name: str

    centre_id: int

    centre_name: str

    location: Optional[str] = None

    slot_date: str

    slot_time: str

    crop_type: Optional[str] = None

    quantity: Optional[str] = None

    status: str

    created_at: Optional[datetime] = None


    model_config = ConfigDict(
        from_attributes=True
    )