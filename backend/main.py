from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text

from database import engine, get_db
from models import Base, Complaint
from schemas import (
    ComplaintCreate,
    ComplaintResponse,
    VerificationRequest
)

from ai_engine import (
    analyze_complaint,
    calculate_similarity
)

from datetime import datetime


app = FastAPI(
    title="ResolveAI",
    description="AI-Powered Intelligent Grievance & Resolution System"
)


# =========================================
# CORS
# =========================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# =========================================
# DATABASE
# =========================================

Base.metadata.create_all(
    bind=engine
)


# =========================================
# SQLITE MIGRATION
# Adds new columns to existing database
# =========================================

def migrate_database():

    columns = {

        "created_at":
            "DATETIME",

        "sla_hours":
            "FLOAT DEFAULT 72",

        "escalated":
            "BOOLEAN DEFAULT 0",

        "escalation_reason":
            "VARCHAR(255)",

        "resolution_comment":
            "TEXT",

        "verification_status":
            "VARCHAR(50) DEFAULT 'Pending'",

        "citizen_verified":
            "BOOLEAN DEFAULT 0",

        "verified_at":
            "DATETIME"
    }


    with engine.connect() as connection:

        result = connection.execute(
            text(
                "PRAGMA table_info(complaints)"
            )
        )

        existing_columns = [
            row[1]
            for row in result
        ]


        for column_name, column_type in columns.items():

            if column_name not in existing_columns:

                connection.execute(
                    text(
                        f"ALTER TABLE complaints "
                        f"ADD COLUMN {column_name} "
                        f"{column_type}"
                    )
                )


        connection.commit()


migrate_database()


# =========================================
# SLA HOURS
# =========================================

def get_sla_hours(priority):

    if priority == "CRITICAL":

        return 4

    if priority == "HIGH":

        return 12

    if priority == "MEDIUM":

        return 24

    return 72


# =========================================
# AUTOMATIC ESCALATION
# =========================================

def check_escalation(db):

    complaints = db.query(
        Complaint
    ).all()


    now = datetime.utcnow()


    changed = False


    for complaint in complaints:

        if not complaint.created_at:

            complaint.created_at = now

            changed = True

            continue


        if complaint.status == "Resolved":

            continue


        if complaint.citizen_verified:

            continue


        elapsed_seconds = (
            now - complaint.created_at
        ).total_seconds()


        elapsed_hours = (
            elapsed_seconds / 3600
        )


        sla_hours = (
            complaint.sla_hours
            or 72
        )


        if (
            elapsed_hours >= sla_hours
            and not complaint.escalated
        ):

            complaint.escalated = True

            complaint.escalation_reason = (
                f"SLA breached after "
                f"{round(elapsed_hours, 1)} hours"
            )

            complaint.status = "Escalated"

            changed = True


    if changed:

        db.commit()


# =========================================
# HOME
# =========================================

@app.get("/")
def home():

    return {

        "message":
            "ResolveAI Backend is Running!",

        "version":
            "2.0",

        "features": [

            "AI Classification",

            "Priority Scoring",

            "Duplicate Detection",

            "Master Incident Clustering",

            "Location Intelligence",

            "SLA Monitoring",

            "Automatic Escalation",

            "Resolution Verification"

        ]
    }


# =========================================
# CREATE COMPLAINT
# =========================================

@app.post(
    "/complaints",
    response_model=ComplaintResponse
)
def create_complaint(

    complaint: ComplaintCreate,

    db: Session = Depends(get_db)

):

    ai_result = analyze_complaint(
        complaint.complaint_text
    )


    # =====================================
    # DUPLICATE / INCIDENT DETECTION
    # =====================================

    existing_complaints = db.query(
        Complaint
    ).all()


    master_incident_id = None


    for existing in existing_complaints:

        similarity = calculate_similarity(

            complaint.complaint_text,

            existing.complaint_text

        )


        # 30% threshold for prototype

        if similarity >= 30:

            if existing.master_incident_id:

                master_incident_id = (
                    existing.master_incident_id
                )

            else:

                master_incident_id = (
                    existing.id
                )

            break


    # =====================================
    # SLA
    # =====================================

    priority = ai_result[
        "severity"
    ]


    sla_hours = get_sla_hours(
        priority
    )


    # =====================================
    # CREATE
    # =====================================

    new_complaint = Complaint(

        name=complaint.name,

        complaint_text=
            complaint.complaint_text,

        category=
            ai_result["category"],

        severity=
            ai_result["severity"],

        priority_score=
            ai_result["priority_score"],

        department=
            ai_result["department"],

        status="Submitted",

        latitude=
            complaint.latitude,

        longitude=
            complaint.longitude,

        master_incident_id=
            master_incident_id,

        created_at=
            datetime.utcnow(),

        sla_hours=
            sla_hours,

        escalated=False,

        verification_status=
            "Pending",

        citizen_verified=False

    )


    db.add(
        new_complaint
    )

    db.commit()

    db.refresh(
        new_complaint
    )


    return new_complaint


# =========================================
# GET ALL COMPLAINTS
# =========================================

@app.get(
    "/complaints"
)
def get_complaints(

    db: Session = Depends(get_db)

):

    check_escalation(db)


    complaints = db.query(
        Complaint
    ).all()


    return complaints


# =========================================
# GET SINGLE COMPLAINT
# =========================================

@app.get(
    "/complaints/{complaint_id}"
)
def get_complaint(

    complaint_id: int,

    db: Session = Depends(get_db)

):

    check_escalation(db)


    complaint = db.query(
        Complaint
    ).filter(
        Complaint.id ==
        complaint_id
    ).first()


    if complaint is None:

        return {
            "error":
                "Complaint not found"
        }


    return complaint


# =========================================
# UPDATE STATUS
# =========================================

@app.put(
    "/complaints/{complaint_id}/status"
)
def update_status(

    complaint_id: int,

    status: str,

    db: Session = Depends(get_db)

):

    complaint = db.query(
        Complaint
    ).filter(
        Complaint.id ==
        complaint_id
    ).first()


    if complaint is None:

        return {
            "error":
                "Complaint not found"
        }


    complaint.status = status


    if status == "Resolved":

        complaint.verification_status = (
            "Pending"
        )


    db.commit()

    db.refresh(
        complaint
    )


    return {

        "message":
            "Complaint status updated",

        "complaint_id":
            complaint.id,

        "status":
            complaint.status

    }


# =========================================
# MASTER INCIDENT DETAILS
# =========================================

@app.get(
    "/incidents/{incident_id}"
)
def get_incident_complaints(

    incident_id: int,

    db: Session = Depends(get_db)

):

    complaints = db.query(
        Complaint
    ).filter(

        (Complaint.id == incident_id)

        |

        (
            Complaint.master_incident_id
            == incident_id
        )

    ).all()


    if not complaints:

        return {

            "error":
                "Incident not found"

        }


    return {

        "master_incident_id":
            incident_id,

        "total_related_complaints":
            len(complaints),

        "complaints":
            complaints

    }


# =========================================
# MANUAL SLA CHECK
# =========================================

@app.post(
    "/sla/check"
)
def manual_sla_check(

    db: Session = Depends(get_db)

):

    before = db.query(
        Complaint
    ).filter(
        Complaint.escalated == True
    ).count()


    check_escalation(db)


    after = db.query(
        Complaint
    ).filter(
        Complaint.escalated == True
    ).count()


    return {

        "message":
            "SLA check completed",

        "new_escalations":
            after - before,

        "total_escalated":
            after

    }


# =========================================
# RESOLUTION VERIFICATION
# =========================================

@app.put(
    "/complaints/{complaint_id}/verify"
)
def verify_resolution(

    complaint_id: int,

    verification: VerificationRequest,

    db: Session = Depends(get_db)

):

    complaint = db.query(
        Complaint
    ).filter(
        Complaint.id ==
        complaint_id
    ).first()


    if complaint is None:

        return {

            "error":
                "Complaint not found"

        }


    complaint.resolution_comment = (
        verification.comment
    )


    complaint.verified_at = (
        datetime.utcnow()
    )


    if verification.verified:

        complaint.citizen_verified = True

        complaint.verification_status = (
            "Verified"
        )

        complaint.status = "Resolved"


    else:

        complaint.citizen_verified = False

        complaint.verification_status = (
            "Rejected"
        )

        complaint.status = "Reopened"


    db.commit()

    db.refresh(
        complaint
    )


    return {

        "message":
            "Resolution verification recorded",

        "complaint_id":
            complaint.id,

        "verified":
            complaint.citizen_verified,

        "status":
            complaint.status,

        "verification_status":
            complaint.verification_status

    }