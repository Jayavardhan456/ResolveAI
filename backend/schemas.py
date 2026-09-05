from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ComplaintCreate(BaseModel):

    name: str

    complaint_text: str

    latitude: Optional[float] = None

    longitude: Optional[float] = None


class ComplaintResponse(BaseModel):

    id: int

    name: str

    complaint_text: str

    category: str

    severity: str

    priority_score: float

    department: str

    status: str

    latitude: Optional[float] = None

    longitude: Optional[float] = None

    master_incident_id: Optional[int] = None

    created_at: Optional[datetime] = None

    sla_hours: Optional[float] = None

    escalated: Optional[bool] = False

    escalation_reason: Optional[str] = None

    resolution_comment: Optional[str] = None

    verification_status: Optional[str] = "Pending"

    citizen_verified: Optional[bool] = False

    verified_at: Optional[datetime] = None

    class Config:

        from_attributes = True


class VerificationRequest(BaseModel):

    verified: bool

    comment: Optional[str] = None