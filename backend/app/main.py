import os
import json
import uuid
import shutil
from datetime import datetime
from typing import Optional, List

from fastapi import FastAPI, Depends, HTTPException, Query, UploadFile, File, Form, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import desc

from .database import engine, Base, get_db
from . import models, schemas
from .priority_engine import calculate_priority_score
from .seed import seed_database

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="WasteVision API – AI for a Cleaner Future",
    description="Smart Waste Collection & Monitoring Backend API",
    version="1.0.0"
)

# CORS configuration: Allow all origins so Vercel can connect from any domain or preview deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Upload directory setup
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOADS_DIR = os.getenv("UPLOADS_DIR", os.path.join(BASE_DIR, "..", "uploads"))
os.makedirs(UPLOADS_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")


@app.get("/", tags=["Health"])
def root():
    return {
        "status": "online",
        "service": "WasteVision API – AI for a Cleaner Future",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy"}


@app.on_event("startup")
def on_startup():
    db = next(get_db())
    try:
        seed_database(db, force_reset=False)
    finally:
        db.close()


def _format_report(report: models.WasteReport, db: Optional[Session] = None) -> dict:
    reasons = []
    if report.priority_reasons:
        try:
            reasons = json.loads(report.priority_reasons)
        except Exception:
            reasons = [report.priority_reasons]

    timeline_data = []
    if db:
        events = db.query(models.StatusTimelineEvent).filter(
            models.StatusTimelineEvent.report_id == report.report_id
        ).order_by(models.StatusTimelineEvent.timestamp.asc()).all()
        for ev in events:
            timeline_data.append({
                "id": ev.id,
                "report_id": ev.report_id,
                "status": ev.status,
                "actor": ev.actor,
                "note": ev.note,
                "timestamp": ev.timestamp
            })

    return {
        "id": report.id,
        "report_id": report.report_id,
        "category": report.category,
        "description": report.description,
        "location_address": report.location_address,
        "latitude": report.latitude,
        "longitude": report.longitude,
        "image_url": report.image_url,
        "reported_severity": report.reported_severity,
        "calculated_priority": report.calculated_priority,
        "priority_score": report.priority_score,
        "priority_reasons": reasons,
        "status": report.status,
        "assigned_collector": report.assigned_collector,
        "estimated_collection_date": report.estimated_collection_date,
        "internal_notes": report.internal_notes,
        "is_demo": report.is_demo,
        "created_at": report.created_at,
        "updated_at": report.updated_at,
        "resolved_at": report.resolved_at,
        "timeline": timeline_data
    }


# ==========================================
# REPORT ENDPOINTS
# ==========================================

@app.post("/api/reports", response_model=schemas.ReportResponse, status_code=status.HTTP_201_CREATED)
async def create_report(
    category: str = Form(...),
    description: str = Form(...),
    location_address: str = Form(...),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    reported_severity: str = Form("Medium"),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    """
    Submit a new citizen waste report with optional photo upload and automatic priority scoring.
    """
    valid_categories = ["Wet", "Dry", "Plastic", "E-waste", "Hazardous", "Other"]
    if category not in valid_categories:
        raise HTTPException(status_code=400, detail=f"Invalid category. Must be one of {valid_categories}")

    valid_severities = ["Low", "Medium", "High", "Critical"]
    if reported_severity not in valid_severities:
        raise HTTPException(status_code=400, detail=f"Invalid severity. Must be one of {valid_severities}")

    image_url = None
    if image and image.filename:
        # Validate file extension
        ext = os.path.splitext(image.filename)[1].lower()
        if ext not in [".jpg", ".jpeg", ".png", ".webp", ".svg"]:
            raise HTTPException(status_code=400, detail="Only JPG, PNG, WEBP, and SVG image formats are permitted.")
        
        filename = f"wv_{uuid.uuid4().hex[:10]}{ext}"
        filepath = os.path.join(UPLOADS_DIR, filename)
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        image_url = f"/uploads/{filename}"

    # Generate unique human-readable report ID
    random_code = str(uuid.uuid4().int)[:4]
    report_id = f"WV-2026-{random_code}"

    # Calculate explainable AI priority score
    priority_res = calculate_priority_score(
        category=category,
        reported_severity=reported_severity,
        description=description,
        location_address=location_address,
        latitude=latitude,
        longitude=longitude,
        created_at=datetime.utcnow(),
        db=db
    )

    now = datetime.utcnow()
    new_report = models.WasteReport(
        report_id=report_id,
        category=category,
        description=description,
        location_address=location_address,
        latitude=latitude,
        longitude=longitude,
        image_url=image_url,
        reported_severity=reported_severity,
        calculated_priority=priority_res["priority"],
        priority_score=priority_res["score"],
        priority_reasons=json.dumps(priority_res["breakdown"]),
        status="Pending",
        assigned_collector=None,
        estimated_collection_date=None,
        internal_notes=None,
        is_demo=False,
        created_at=now,
        updated_at=now
    )
    db.add(new_report)

    # Initial timeline entry
    initial_event = models.StatusTimelineEvent(
        report_id=report_id,
        status="Pending",
        actor="Citizen Reporter",
        note="Report logged into WasteVision dispatch system.",
        timestamp=now
    )
    db.add(initial_event)
    db.commit()
    db.refresh(new_report)

    return _format_report(new_report, db)


@app.get("/api/reports", response_model=List[schemas.ReportResponse])
def get_reports(
    status: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    sort_by: Optional[str] = Query("newest"),  # newest, oldest, priority_high, priority_low
    db: Session = Depends(get_db)
):
    """
    List reports with multi-criteria filtering and searching.
    """
    query = db.query(models.WasteReport)

    if status and status != "All":
        query = query.filter(models.WasteReport.status == status)

    if category and category != "All":
        query = query.filter(models.WasteReport.category == category)

    if priority and priority != "All":
        query = query.filter(models.WasteReport.calculated_priority == priority)

    if search:
        s = f"%{search.strip()}%"
        query = query.filter(
            (models.WasteReport.report_id.ilike(s)) |
            (models.WasteReport.location_address.ilike(s)) |
            (models.WasteReport.description.ilike(s)) |
            (models.WasteReport.assigned_collector.ilike(s))
        )

    # Sorting
    if sort_by == "oldest":
        query = query.order_by(models.WasteReport.created_at.asc())
    elif sort_by == "priority_high":
        query = query.order_by(desc(models.WasteReport.priority_score))
    elif sort_by == "priority_low":
        query = query.order_by(models.WasteReport.priority_score.asc())
    else:  # newest
        query = query.order_by(desc(models.WasteReport.created_at))

    reports = query.all()
    return [_format_report(r, db) for r in reports]


@app.get("/api/reports/{report_id}", response_model=schemas.ReportResponse)
def get_report_by_id(report_id: str, db: Session = Depends(get_db)):
    """
    Get detailed information for a specific report including full audit timeline.
    """
    report = db.query(models.WasteReport).filter(models.WasteReport.report_id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail=f"Report '{report_id}' not found.")
    return _format_report(report, db)


@app.patch("/api/reports/{report_id}", response_model=schemas.ReportResponse)
def update_report(
    report_id: str,
    update_data: schemas.ReportUpdate,
    actor: str = Query("Admin Dispatcher"),
    db: Session = Depends(get_db)
):
    """
    Update collection status, assign a collector, update ETA, add internal notes, or recalculate priority.
    """
    report = db.query(models.WasteReport).filter(models.WasteReport.report_id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail=f"Report '{report_id}' not found.")

    status_changed = False
    old_status = report.status

    if update_data.status and update_data.status != report.status:
        valid_statuses = ["Pending", "Assigned", "In Progress", "Resolved"]
        if update_data.status not in valid_statuses:
            raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {valid_statuses}")
        report.status = update_data.status
        status_changed = True
        if update_data.status == "Resolved":
            report.resolved_at = datetime.utcnow()
        elif old_status == "Resolved" and update_data.status != "Resolved":
            report.resolved_at = None

    if update_data.assigned_collector is not None:
        report.assigned_collector = update_data.assigned_collector

    if update_data.estimated_collection_date is not None:
        report.estimated_collection_date = update_data.estimated_collection_date

    if update_data.internal_notes is not None:
        report.internal_notes = update_data.internal_notes

    report.updated_at = datetime.utcnow()

    # Recalculate AI score if requested
    if update_data.recalculate_priority:
        priority_res = calculate_priority_score(
            category=report.category,
            reported_severity=report.reported_severity,
            description=report.description,
            location_address=report.location_address,
            latitude=report.latitude,
            longitude=report.longitude,
            created_at=report.created_at,
            db=db,
            current_report_id=report.report_id
        )
        report.calculated_priority = priority_res["priority"]
        report.priority_score = priority_res["score"]
        report.priority_reasons = json.dumps(priority_res["breakdown"])

    # Log to audit timeline
    note_text = update_data.internal_notes
    if status_changed:
        if not note_text:
            note_text = f"Status transitioned from '{old_status}' to '{report.status}'."
        else:
            note_text = f"Status transitioned to '{report.status}'. Note: {note_text}"
        
        timeline_entry = models.StatusTimelineEvent(
            report_id=report.report_id,
            status=report.status,
            actor=actor,
            note=note_text,
            timestamp=datetime.utcnow()
        )
        db.add(timeline_entry)
    elif update_data.assigned_collector or update_data.internal_notes:
        timeline_entry = models.StatusTimelineEvent(
            report_id=report.report_id,
            status=report.status,
            actor=actor,
            note=note_text or f"Assigned to {report.assigned_collector}",
            timestamp=datetime.utcnow()
        )
        db.add(timeline_entry)

    db.commit()
    db.refresh(report)

    return _format_report(report, db)


# ==========================================
# DASHBOARD STATS ENDPOINT
# ==========================================

@app.get("/api/stats", response_model=schemas.DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    """
    Get live database statistics for dashboard KPI cards and interactive charts.
    """
    total = db.query(models.WasteReport).count()
    pending = db.query(models.WasteReport).filter(models.WasteReport.status == "Pending").count()
    assigned = db.query(models.WasteReport).filter(models.WasteReport.status == "Assigned").count()
    in_progress = db.query(models.WasteReport).filter(models.WasteReport.status == "In Progress").count()
    resolved = db.query(models.WasteReport).filter(models.WasteReport.status == "Resolved").count()

    critical = db.query(models.WasteReport).filter(models.WasteReport.calculated_priority == "Critical").count()
    high = db.query(models.WasteReport).filter(models.WasteReport.calculated_priority == "High").count()
    medium = db.query(models.WasteReport).filter(models.WasteReport.calculated_priority == "Medium").count()
    low = db.query(models.WasteReport).filter(models.WasteReport.calculated_priority == "Low").count()

    resolution_rate = round((resolved / total * 100.0), 1) if total > 0 else 0.0

    # Category distribution
    categories = ["Wet", "Dry", "Plastic", "E-waste", "Hazardous", "Other"]
    cat_colors = {
        "Wet": "#EAB308",       # Yellow-amber
        "Dry": "#64748B",       # Slate
        "Plastic": "#10B981",   # Emerald
        "E-waste": "#3B82F6",   # Blue
        "Hazardous": "#EF4444", # Red
        "Other": "#8B5CF6"      # Purple
    }
    category_distribution = []
    for cat in categories:
        cnt = db.query(models.WasteReport).filter(models.WasteReport.category == cat).count()
        category_distribution.append({
            "name": cat,
            "value": cnt,
            "color": cat_colors.get(cat, "#10B981")
        })

    # Status distribution
    statuses = [
        ("Pending", "#F59E0B"),     # Amber
        ("Assigned", "#3B82F6"),    # Blue
        ("In Progress", "#8B5CF6"), # Purple
        ("Resolved", "#10B981")     # Emerald
    ]
    status_distribution = []
    for st_name, color in statuses:
        cnt = db.query(models.WasteReport).filter(models.WasteReport.status == st_name).count()
        status_distribution.append({
            "name": st_name,
            "value": cnt,
            "color": color
        })

    # Priority distribution
    priorities = [
        ("Critical", "#DC2626"),
        ("High", "#EA580C"),
        ("Medium", "#CA8A04"),
        ("Low", "#16A34A")
    ]
    priority_distribution = []
    for prio_name, color in priorities:
        cnt = db.query(models.WasteReport).filter(models.WasteReport.calculated_priority == prio_name).count()
        priority_distribution.append({
            "name": prio_name,
            "value": cnt,
            "color": color
        })

    # 5 most recent reports
    recents = db.query(models.WasteReport).order_by(desc(models.WasteReport.created_at)).limit(5).all()

    return {
        "total_reports": total,
        "pending_reports": pending,
        "in_progress_reports": in_progress + assigned,
        "resolved_reports": resolved,
        "high_priority_reports": high,
        "critical_priority_reports": critical,
        "resolution_rate": resolution_rate,
        "category_distribution": category_distribution,
        "status_distribution": status_distribution,
        "priority_distribution": priority_distribution,
        "recent_reports": [_format_report(r, db) for r in recents]
    }


# ==========================================
# PRIORITY CALCULATION PREVIEW ENDPOINT
# ==========================================

@app.post("/api/priority/calculate", response_model=schemas.PriorityPreviewResponse)
def preview_priority(data: schemas.PriorityPreviewRequest, db: Session = Depends(get_db)):
    """
    Instant preview endpoint that allows frontend forms to show real-time explainable priority scores.
    """
    res = calculate_priority_score(
        category=data.category,
        reported_severity=data.reported_severity,
        description=data.description,
        location_address=data.location_address or "",
        latitude=data.latitude,
        longitude=data.longitude,
        created_at=datetime.utcnow(),
        db=db
    )
    return res


# ==========================================
# DEMO RESET ENDPOINT
# ==========================================

@app.post("/api/demo/reset")
def reset_demo_database(db: Session = Depends(get_db)):
    """
    Reset and re-seed sample database records for demonstration purposes.
    """
    res = seed_database(db, force_reset=True)
    return res
