from fastapi import (
    FastAPI,
    Depends,
    HTTPException
)

from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy.orm import Session

from sqlalchemy import text

from datetime import datetime


from database import (
    engine,
    get_db
)


from models import (
    Base,
    Complaint,
    ProcurementBooking
)


from schemas import (
    ComplaintCreate,
    ComplaintResponse,
    OfficerUpdate,
    VerificationRequest,
    ProcurementBookingCreate,
    ProcurementBookingResponse
)


from ai_engine import (
    analyze_complaint,
    calculate_similarity
)


# =========================================
# FASTAPI APP
# =========================================

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
        "https://resolve-ai-rust.vercel.app",
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"]
)


# =========================================
# DATABASE
# =========================================

Base.metadata.create_all(
    bind=engine
)


# =========================================
# DATABASE MIGRATION
# =========================================

def migrate_database():

    columns = {

        "role":
            "VARCHAR(30) DEFAULT 'Citizen'",

        "location_name":
            "VARCHAR(255)",

        "created_at":
            "DATETIME",

        "updated_at":
            "DATETIME",

        "sla_hours":
            "FLOAT DEFAULT 72",

        "escalated":
            "BOOLEAN DEFAULT 0",

        "escalation_reason":
            "VARCHAR(255)",

        "assigned_officer":
            "VARCHAR(100)",

        "assigned_at":
            "DATETIME",

        "officer_progress":
            "INTEGER DEFAULT 0",

        "progress_note":
            "TEXT",

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

                        f"""
                        ALTER TABLE complaints
                        ADD COLUMN {column_name}
                        {column_type}
                        """

                    )

                )


        connection.commit()


migrate_database()


# =========================================
# PROCUREMENT CENTRES
# Prototype demo data
# =========================================

PROCUREMENT_CENTRES = [

    {

        "id": 1,

        "name":
            "Vijayawada Agricultural Procurement Centre",

        "location":
            "Vijayawada, Andhra Pradesh",

        "contact":
            "0866-2456789",

        "crops":
            [
                "Paddy",
                "Maize",
                "Cotton"
            ],

        "slots": [

            {
                "date":
                    "2026-09-07",

                "time":
                    "09:00 AM - 11:00 AM",

                "capacity":
                    20
            },

            {
                "date":
                    "2026-09-07",

                "time":
                    "11:00 AM - 01:00 PM",

                "capacity":
                    20
            },

            {
                "date":
                    "2026-09-08",

                "time":
                    "09:00 AM - 11:00 AM",

                "capacity":
                    20
            }

        ]

    },


    {

        "id": 2,

        "name":
            "Guntur Farmer Procurement Centre",

        "location":
            "Guntur, Andhra Pradesh",

        "contact":
            "0863-2234567",

        "crops":
            [
                "Paddy",
                "Chilli",
                "Cotton"
            ],

        "slots": [

            {
                "date":
                    "2026-09-07",

                "time":
                    "09:00 AM - 11:00 AM",

                "capacity":
                    25
            },

            {
                "date":
                    "2026-09-07",

                "time":
                    "02:00 PM - 04:00 PM",

                "capacity":
                    25
            },

            {
                "date":
                    "2026-09-08",

                "time":
                    "10:00 AM - 12:00 PM",

                "capacity":
                    25
            }

        ]

    },


    {

        "id": 3,

        "name":
            "Krishna District Procurement Centre",

        "location":
            "Machilipatnam, Andhra Pradesh",

        "contact":
            "08672-234567",

        "crops":
            [
                "Paddy",
                "Maize"
            ],

        "slots": [

            {
                "date":
                    "2026-09-07",

                "time":
                    "08:00 AM - 10:00 AM",

                "capacity":
                    15
            },

            {
                "date":
                    "2026-09-08",

                "time":
                    "10:00 AM - 12:00 PM",

                "capacity":
                    15
            }

        ]

    }

]


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

            now -
            complaint.created_at

        ).total_seconds()


        elapsed_hours = (

            elapsed_seconds /
            3600

        )


        sla_hours = (

            complaint.sla_hours
            or
            72

        )


        if (

            elapsed_hours >= sla_hours

            and

            not complaint.escalated

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
            "3.0",

        "features": [

            "AI Classification",

            "Priority Scoring",

            "Duplicate Detection",

            "Master Incident Clustering",

            "Officer Assignment",

            "Live Progress Tracking",

            "Farmer Procurement Centres",

            "Procurement Slot Booking",

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
    # DUPLICATE DETECTION
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
    # CREATE COMPLAINT
    # =====================================

    new_complaint = Complaint(

        name=
            complaint.name,

        role=
            complaint.role,

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

        status=
            "Submitted",

        latitude=
            complaint.latitude,

        longitude=
            complaint.longitude,

        location_name=
            complaint.location_name,

        master_incident_id=
            master_incident_id,

        created_at=
            datetime.utcnow(),

        updated_at=
            datetime.utcnow(),

        sla_hours=
            sla_hours,

        escalated=
            False,

        officer_progress=
            0,

        verification_status=
            "Pending",

        citizen_verified=
            False

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

@app.get("/complaints")
def get_complaints(

    name: str = None,

    db: Session = Depends(get_db)

):

    check_escalation(
        db
    )


    query = db.query(
        Complaint
    )


    if name:

        query = query.filter(

            Complaint.name == name

        )


    complaints = query.order_by(

        Complaint.created_at.desc()

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

    check_escalation(
        db
    )


    complaint = db.query(

        Complaint

    ).filter(

        Complaint.id ==
        complaint_id

    ).first()


    if complaint is None:

        raise HTTPException(

            status_code=404,

            detail="Complaint not found"

        )


    return complaint


# =========================================
# ASSIGN OFFICER / UPDATE PROGRESS
# =========================================

@app.put(
    "/complaints/{complaint_id}/officer"
)

def update_officer(

    complaint_id: int,

    update: OfficerUpdate,

    db: Session = Depends(get_db)

):


    complaint = db.query(

        Complaint

    ).filter(

        Complaint.id ==
        complaint_id

    ).first()


    if complaint is None:

        raise HTTPException(

            status_code=404,

            detail="Complaint not found"

        )


    # =====================================
    # ASSIGN OFFICER
    # =====================================

    if update.assigned_officer:

        complaint.assigned_officer = (

            update.assigned_officer

        )


        complaint.assigned_at = (

            datetime.utcnow()

        )


        if complaint.status == "Submitted":

            complaint.status = "Assigned"


    # =====================================
    # UPDATE PROGRESS
    # =====================================

    if update.officer_progress is not None:


        if (

            update.officer_progress < 0

            or

            update.officer_progress > 100

        ):

            raise HTTPException(

                status_code=400,

                detail="Progress must be between 0 and 100"

            )


        complaint.officer_progress = (

            update.officer_progress

        )


        if (

            update.officer_progress > 0

            and

            complaint.status in [

                "Submitted",

                "Assigned"

            ]

        ):

            complaint.status = "In Progress"


    # =====================================
    # PROGRESS NOTE
    # =====================================

    if update.progress_note:

        complaint.progress_note = (

            update.progress_note

        )


    # =====================================
    # STATUS
    # =====================================

    if update.status:

        complaint.status = (

            update.status

        )


        if update.status == "Resolved":

            complaint.officer_progress = 100

            complaint.verification_status = (

                "Pending"

            )


    complaint.updated_at = (

        datetime.utcnow()

    )


    db.commit()


    db.refresh(
        complaint
    )


    return {

        "message":
            "Officer assignment and progress updated",

        "complaint":
            complaint

    }


# =========================================
# SIMPLE STATUS UPDATE
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

        raise HTTPException(

            status_code=404,

            detail="Complaint not found"

        )


    complaint.status = status


    if status == "Resolved":

        complaint.officer_progress = 100

        complaint.verification_status = (

            "Pending"

        )


    complaint.updated_at = (

        datetime.utcnow()

    )


    db.commit()


    db.refresh(
        complaint
    )


    return {

        "message":
            "Complaint status updated",

        "complaint":
            complaint

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

        (

            Complaint.id ==
            incident_id

        )

        |

        (

            Complaint.master_incident_id ==
            incident_id

        )

    ).all()


    if not complaints:

        raise HTTPException(

            status_code=404,

            detail="Incident not found"

        )


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


    check_escalation(
        db
    )


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

        raise HTTPException(

            status_code=404,

            detail="Complaint not found"

        )


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


        complaint.status = (

            "Resolved"

        )


    else:


        complaint.citizen_verified = False


        complaint.verification_status = (

            "Rejected"

        )


        complaint.status = (

            "Reopened"

        )


        complaint.officer_progress = (

            max(

                0,

                complaint.officer_progress - 10

            )

        )


    complaint.updated_at = (

        datetime.utcnow()

    )


    db.commit()


    db.refresh(
        complaint
    )


    return {

        "message":
            "Resolution verification recorded",

        "complaint":
            complaint

    }


# =========================================
# PROCUREMENT CENTRES
# =========================================

@app.get(
    "/procurement/centres"
)

def get_procurement_centres(

    db: Session = Depends(get_db)

):


    centres_response = []


    for centre in PROCUREMENT_CENTRES:


        centre_data = {

            "id":
                centre["id"],

            "name":
                centre["name"],

            "location":
                centre["location"],

            "contact":
                centre["contact"],

            "crops":
                centre["crops"],

            "slots":
                []

        }


        for slot in centre["slots"]:


            booked = db.query(

                ProcurementBooking

            ).filter(

                ProcurementBooking.centre_id ==
                centre["id"],

                ProcurementBooking.slot_date ==
                slot["date"],

                ProcurementBooking.slot_time ==
                slot["time"]

            ).count()


            available = (

                slot["capacity"] -
                booked

            )


            centre_data["slots"].append({

                "date":
                    slot["date"],

                "time":
                    slot["time"],

                "total_capacity":
                    slot["capacity"],

                "booked":
                    booked,

                "available":
                    max(
                        available,
                        0
                    )

            })


        centres_response.append(
            centre_data
        )


    return centres_response


# =========================================
# BOOK PROCUREMENT SLOT
# =========================================

@app.post(

    "/procurement/bookings",

    response_model=
        ProcurementBookingResponse

)

def book_procurement_slot(

    booking:
        ProcurementBookingCreate,

    db:
        Session = Depends(get_db)

):


    selected_centre = None


    for centre in PROCUREMENT_CENTRES:

        if centre["id"] == booking.centre_id:

            selected_centre = centre

            break


    if selected_centre is None:

        raise HTTPException(

            status_code=404,

            detail="Procurement centre not found"

        )


    selected_slot = None


    for slot in selected_centre["slots"]:

        if (

            slot["date"] ==
            booking.slot_date

            and

            slot["time"] ==
            booking.slot_time

        ):

            selected_slot = slot

            break


    if selected_slot is None:

        raise HTTPException(

            status_code=404,

            detail="Procurement slot not found"

        )


    existing_booking = db.query(

        ProcurementBooking

    ).filter(

        ProcurementBooking.farmer_name ==
        booking.farmer_name,

        ProcurementBooking.centre_id ==
        booking.centre_id,

        ProcurementBooking.slot_date ==
        booking.slot_date

    ).first()


    if existing_booking:

        raise HTTPException(

            status_code=400,

            detail="You already have a booking for this centre and date"

        )


    booked_count = db.query(

        ProcurementBooking

    ).filter(

        ProcurementBooking.centre_id ==
        booking.centre_id,

        ProcurementBooking.slot_date ==
        booking.slot_date,

        ProcurementBooking.slot_time ==
        booking.slot_time

    ).count()


    if (

        booked_count >=
        selected_slot["capacity"]

    ):

        raise HTTPException(

            status_code=400,

            detail="This slot is full"

        )


    new_booking = ProcurementBooking(

        farmer_name=
            booking.farmer_name,

        centre_id=
            selected_centre["id"],

        centre_name=
            selected_centre["name"],

        location=
            selected_centre["location"],

        slot_date=
            booking.slot_date,

        slot_time=
            booking.slot_time,

        crop_type=
            booking.crop_type,

        quantity=
            booking.quantity,

        status=
            "Booked"

    )


    db.add(
        new_booking
    )


    db.commit()


    db.refresh(
        new_booking
    )


    return new_booking


# =========================================
# GET FARMER BOOKINGS
# =========================================

@app.get(
    "/procurement/bookings/{farmer_name}"
)

def get_farmer_bookings(

    farmer_name: str,

    db: Session = Depends(get_db)

):


    bookings = db.query(

        ProcurementBooking

    ).filter(

        ProcurementBooking.farmer_name ==
        farmer_name

    ).order_by(

        ProcurementBooking.created_at.desc()

    ).all()


    return bookings