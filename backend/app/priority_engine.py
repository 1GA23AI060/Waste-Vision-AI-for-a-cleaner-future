import re
from datetime import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from . import models

# Keyword pattern dictionaries for transparent explainable AI
SAFETY_KEYWORDS = {
    "overflow": [
        "overflow", "overflowing", "spill", "spilling", "heaping",
        "piled high", "scattered", "bursting", "dumped", "clogged bin"
    ],
    "sanitation": [
        "smell", "odor", "stink", "stinking", "flies", "rats", "rodent", "rodents",
        "maggots", "disease", "rotting", "foul", "decay", "biohazard", "pest"
    ],
    "obstruction_hazard": [
        "block", "blocking", "blocked", "road", "street", "traffic", "sidewalk",
        "drain", "drainage", "waterlogging", "flood", "fire", "smoke", "flammable",
        "toxic", "chemical", "glass", "sharp", "needle", "needles", "acid"
    ],
    "sensitive_zone": [
        "school", "hospital", "clinic", "market", "kindergarten", "daycare",
        "park", "playground", "elderly", "temple", "church", "mosque", "bus stop"
    ]
}

SEVERITY_WEIGHTS = {
    "Critical": 45.0,
    "High": 30.0,
    "Medium": 18.0,
    "Low": 8.0,
}

CATEGORY_WEIGHTS = {
    "Hazardous": 25.0,
    "E-waste": 15.0,
    "Wet": 12.0,
    "Plastic": 8.0,
    "Dry": 5.0,
    "Other": 5.0,
}


def calculate_priority_score(
    category: str,
    reported_severity: str,
    description: str,
    location_address: str = "",
    latitude: Optional[float] = None,
    longitude: Optional[float] = None,
    created_at: Optional[datetime] = None,
    db: Optional[Session] = None,
    current_report_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Explainable AI-assisted rule-based priority scoring engine.
    Calculates a score between 0 and 100 with full audit breakdown reasons.
    """
    score = 0.0
    breakdown: List[str] = []

    # 1. Base Severity Weight
    severity_clean = (reported_severity or "Medium").capitalize()
    base_sev = SEVERITY_WEIGHTS.get(severity_clean, 18.0)
    score += base_sev
    breakdown.append(f"Reported Severity [{severity_clean}]: +{int(base_sev)} pts base urgency")

    # 2. Waste Category Weight
    cat_clean = (category or "Other").capitalize()
    cat_weight = CATEGORY_WEIGHTS.get(cat_clean, 5.0)
    score += cat_weight
    cat_reasons = {
        "Hazardous": "Hazardous waste poses immediate toxicity/chemical threat (+25)",
        "E-waste": "E-waste contains heavy metals and lithium battery risks (+15)",
        "Wet": "Wet organic waste prone to rapid decomposition & pest breeding (+12)",
        "Plastic": "Plastic debris causes storm-drain clogging & microplastic dispersal (+8)",
        "Dry": "Dry recyclable/general solid waste (+5)",
        "Other": "General unclassified waste category (+5)"
    }
    breakdown.append(f"Category [{cat_clean}]: +{int(cat_weight)} pts ({cat_reasons.get(cat_clean, 'Standard category score')})")

    # 3. Public Safety & Environmental Threat Keywords in Description
    desc_lower = (description or "").lower()
    
    # 3a. Overflow / Spillage
    matched_overflow = [w for w in SAFETY_KEYWORDS["overflow"] if re.search(r'\b' + re.escape(w), desc_lower)]
    if matched_overflow:
        score += 15.0
        breakdown.append(f"Overflow Alert: detected '{matched_overflow[0]}' (+15 pts)")

    # 3b. Sanitation & Health
    matched_sanitation = [w for w in SAFETY_KEYWORDS["sanitation"] if re.search(r'\b' + re.escape(w), desc_lower)]
    if matched_sanitation:
        score += 12.0
        breakdown.append(f"Sanitation & Pest Risk: detected '{matched_sanitation[0]}' (+12 pts)")

    # 3c. Public Obstruction / Hazard / Drain Block
    matched_hazard = [w for w in SAFETY_KEYWORDS["obstruction_hazard"] if re.search(r'\b' + re.escape(w), desc_lower)]
    if matched_hazard:
        score += 18.0
        breakdown.append(f"Physical Safety / Obstruction: detected '{matched_hazard[0]}' (+18 pts)")

    # 3d. Sensitive Zone Proximity
    matched_zone = [w for w in SAFETY_KEYWORDS["sensitive_zone"] if re.search(r'\b' + re.escape(w), desc_lower)]
    if matched_zone:
        score += 12.0
        breakdown.append(f"High-Vulnerability Proximity: detected near '{matched_zone[0]}' (+12 pts)")

    # 4. Aging / Waiting Time (if report exists and has created_at)
    if created_at:
        hours_elapsed = (datetime.utcnow() - created_at).total_seconds() / 3600.0
        if hours_elapsed >= 48.0:
            score += 15.0
            breakdown.append(f"Waiting Time [{int(hours_elapsed)}h]: SLA critical delay exceeding 48h (+15 pts)")
        elif hours_elapsed >= 24.0:
            score += 10.0
            breakdown.append(f"Waiting Time [{int(hours_elapsed)}h]: SLA overdue exceeding 24h (+10 pts)")
        elif hours_elapsed >= 12.0:
            score += 5.0
            breakdown.append(f"Waiting Time [{int(hours_elapsed)}h]: Awaiting collection for 12h+ (+5 pts)")

    # 5. Location Density & Repeated Reports Clustering
    if db:
        cluster_count = 0
        try:
            # Query active reports (not resolved) nearby or with similar address
            query = db.query(models.WasteReport).filter(
                models.WasteReport.status.in_(["Pending", "Assigned", "In Progress"])
            )
            if current_report_id:
                query = query.filter(models.WasteReport.report_id != current_report_id)
            
            open_reports = query.all()
            for r in open_reports:
                if latitude is not None and longitude is not None and r.latitude is not None and r.longitude is not None:
                    # Rough coordinate distance check (~0.005 deg is ~500m)
                    dlat = abs(latitude - r.latitude)
                    dlng = abs(longitude - r.longitude)
                    if dlat <= 0.005 and dlng <= 0.005:
                        cluster_count += 1
                elif location_address and r.location_address:
                    addr_words = set(location_address.lower().split())
                    r_words = set(r.location_address.lower().split())
                    common = addr_words.intersection(r_words) - {"street", "road", "st", "rd", "ave", "lane", "city", "near"}
                    if len(common) >= 2:
                        cluster_count += 1

            if cluster_count >= 2:
                score += 15.0
                breakdown.append(f"Location Hotspot: {cluster_count} active reports clustered in this vicinity (+15 pts)")
            elif cluster_count == 1:
                score += 8.0
                breakdown.append("Repeated Location: 1 previous unresolved complaint registered nearby (+8 pts)")
        except Exception:
            pass

    # Normalize score between 5.0 and 100.0
    final_score = max(5.0, min(100.0, score))
    final_score = round(final_score, 1)

    # Determine Priority Classification Tier
    if final_score >= 80.0:
        priority_label = "Critical"
    elif final_score >= 55.0:
        priority_label = "High"
    elif final_score >= 30.0:
        priority_label = "Medium"
    else:
        priority_label = "Low"

    return {
        "score": final_score,
        "priority": priority_label,
        "breakdown": breakdown,
        "factors_count": len(breakdown)
    }
