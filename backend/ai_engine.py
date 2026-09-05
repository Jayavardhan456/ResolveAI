from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


def analyze_complaint(text):

    text = text.lower()

    category = "General"

    department = "General Administration"

    severity = 1

    urgency = 1

    impact = 1

    location_criticality = 1


    # =========================================
    # CATEGORY
    # =========================================

    if any(word in text for word in [
        "water",
        "leakage",
        "drinking water",
        "pipeline",
        "pipe"
    ]):

        category = "Water Supply"

        department = "Water Department"


    elif any(word in text for word in [
        "road",
        "pothole",
        "street",
        "bridge"
    ]):

        category = "Roads & Infrastructure"

        department = "Public Works Department"


    elif any(word in text for word in [
        "electricity",
        "power",
        "transformer",
        "current"
    ]):

        category = "Electricity"

        department = "Electricity Department"


    elif any(word in text for word in [
        "farmer",
        "crop",
        "paddy",
        "cotton",
        "procurement",
        "payment",
        "mandi",
        "grain",
        "harvest"
    ]):

        category = "Agriculture & Procurement"

        department = "Agriculture Department"


    elif any(word in text for word in [
        "hospital",
        "doctor",
        "medicine",
        "ambulance"
    ]):

        category = "Healthcare"

        department = "Health Department"


    elif any(word in text for word in [
        "school",
        "teacher",
        "college",
        "education"
    ]):

        category = "Education"

        department = "Education Department"


    # =========================================
    # SEVERITY
    # =========================================

    if any(word in text for word in [
        "death",
        "dead",
        "fire",
        "accident",
        "life threatening",
        "critical"
    ]):

        severity = 5


    elif any(word in text for word in [
        "danger",
        "emergency",
        "flood",
        "unsafe",
        "serious"
    ]):

        severity = 4


    elif any(word in text for word in [
        "damaged",
        "problem",
        "issue",
        "delay"
    ]):

        severity = 3


    else:

        severity = 2


    # =========================================
    # URGENCY
    # =========================================

    if any(word in text for word in [
        "immediately",
        "urgent",
        "emergency",
        "now",
        "critical"
    ]):

        urgency = 5


    elif any(word in text for word in [
        "soon",
        "quickly",
        "today"
    ]):

        urgency = 4


    elif "delay" in text:

        urgency = 3


    else:

        urgency = 2


    # =========================================
    # COMMUNITY IMPACT
    # =========================================

    if any(word in text for word in [
        "entire village",
        "whole village",
        "hundreds",
        "thousands",
        "many people",
        "community"
    ]):

        impact = 5


    elif any(word in text for word in [
        "village",
        "many farmers",
        "public"
    ]):

        impact = 4


    elif any(word in text for word in [
        "family",
        "several"
    ]):

        impact = 3


    else:

        impact = 2


    # =========================================
    # LOCATION CRITICALITY
    # =========================================

    if any(word in text for word in [
        "hospital",
        "school",
        "highway",
        "main road",
        "market"
    ]):

        location_criticality = 5


    elif any(word in text for word in [
        "village",
        "public place"
    ]):

        location_criticality = 4


    else:

        location_criticality = 2


    # =========================================
    # NORMALIZE
    # =========================================

    severity_score = severity * 20

    urgency_score = urgency * 20

    impact_score = impact * 20

    location_score = location_criticality * 20


    # Waiting time initially zero.
    # SLA system will handle time-based escalation.

    waiting_score = 0


    # =========================================
    # PRIORITY FORMULA
    # =========================================

    priority_score = (

        0.30 * severity_score

        + 0.25 * impact_score

        + 0.20 * urgency_score

        + 0.15 * waiting_score

        + 0.10 * location_score

    )


    priority_score = round(
        priority_score,
        2
    )


    # =========================================
    # PRIORITY LEVEL
    # =========================================

    if priority_score >= 80:

        priority_level = "CRITICAL"

    elif priority_score >= 60:

        priority_level = "HIGH"

    elif priority_score >= 40:

        priority_level = "MEDIUM"

    else:

        priority_level = "LOW"


    return {

        "category": category,

        "severity": priority_level,

        "priority_score": priority_score,

        "department": department
    }


# =========================================
# DUPLICATE DETECTION
# =========================================

def calculate_similarity(text1, text2):

    documents = [
        text1.lower(),
        text2.lower()
    ]

    vectorizer = TfidfVectorizer()

    vectors = vectorizer.fit_transform(
        documents
    )

    similarity = cosine_similarity(
        vectors[0:1],
        vectors[1:2]
    )[0][0]

    return round(
        similarity * 100,
        2
    )