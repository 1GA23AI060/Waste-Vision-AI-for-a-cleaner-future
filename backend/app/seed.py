import json
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from . import models
from .database import engine, Base
from .priority_engine import calculate_priority_score


DEMO_REPORTS = [
    {
        "report_id": "WV-2026-1001",
        "category": "Hazardous",
        "description": "Hazardous medical packaging, discarded syringes, and chemical solvent bottles dumped near hospital boundary wall. Urgent risk of contamination.",
        "location_address": "14th Cross, Malleshwaram, Near Metro Clinic",
        "latitude": 12.9982,
        "longitude": 77.5685,
        "image_url": "/uploads/demo-hazardous.svg",
        "reported_severity": "Critical",
        "status": "In Progress",
        "assigned_collector": "Ramesh Kumar (Hazmat Team)",
        "estimated_collection_date": "Today, 4:00 PM",
        "internal_notes": "Hazmat crew deployed with PPE kit and bio-hazard disposal bins.",
        "created_offset_hours": 6,
        "timeline": [
            ("Citizen Reporter", "Pending", "Report submitted via citizen mobile web."),
            ("Dispatcher Smith", "Assigned", "Assigned to Ramesh Kumar (Hazmat Team)."),
            ("Ramesh Kumar", "In Progress", "Hazmat unit en route to Malleshwaram location.")
        ]
    },
    {
        "report_id": "WV-2026-1002",
        "category": "Plastic",
        "description": "Massive overflow of plastic beverage bottles and polythene bags blocking the roadside stormwater drain. Risk of waterlogging during rain.",
        "location_address": "Indiranagar 100ft Road, Opp. Metro Station Gate 2",
        "latitude": 12.9784,
        "longitude": 77.6408,
        "image_url": "/uploads/demo-plastic.svg",
        "reported_severity": "High",
        "status": "Assigned",
        "assigned_collector": "Anita Sen (Rapid Response)",
        "estimated_collection_date": "Today, 6:30 PM",
        "internal_notes": "Drainage team notified to prevent waterlogging.",
        "created_offset_hours": 14,
        "timeline": [
            ("Citizen Reporter", "Pending", "Report filed with photo evidence."),
            ("Operations Desk", "Assigned", "Assigned to Rapid Response vehicle 04.")
        ]
    },
    {
        "report_id": "WV-2026-1003",
        "category": "E-waste",
        "description": "Broken CRT computer monitors, exposed circuit boards, and lead-acid batteries dumped behind commercial complex.",
        "location_address": "SP Road Electronics Market, Lane 3",
        "latitude": 12.9642,
        "longitude": 77.5835,
        "image_url": "/uploads/demo-ewaste.svg",
        "reported_severity": "High",
        "status": "Pending",
        "assigned_collector": None,
        "estimated_collection_date": None,
        "internal_notes": None,
        "created_offset_hours": 28,
        "timeline": [
            ("Citizen Reporter", "Pending", "Citizen report awaiting verification.")
        ]
    },
    {
        "report_id": "WV-2026-1004",
        "category": "Wet",
        "description": "Rotting vegetable residue and organic waste heaps creating severe odor and attracting swarms of flies near school gate.",
        "location_address": "Russell Market Entrance, Near St. Xavier School",
        "latitude": 12.9839,
        "longitude": 77.6012,
        "image_url": "/uploads/demo-wet.svg",
        "reported_severity": "High",
        "status": "Pending",
        "assigned_collector": None,
        "estimated_collection_date": None,
        "internal_notes": "Flagged as high biological nuisance near educational facility.",
        "created_offset_hours": 36,
        "timeline": [
            ("Citizen Reporter", "Pending", "Initial report received from neighborhood association.")
        ]
    },
    {
        "report_id": "WV-2026-1005",
        "category": "Dry",
        "description": "Flattened corrugated cardboard boxes, packaging thermocol, and dry wooden crates piled on the sidewalk.",
        "location_address": "Koramangala 5th Block, 80ft Road",
        "latitude": 12.9352,
        "longitude": 77.6245,
        "image_url": "/uploads/demo-dry.svg",
        "reported_severity": "Medium",
        "status": "Resolved",
        "assigned_collector": "Vikram Patil",
        "estimated_collection_date": "Yesterday, 2:00 PM",
        "internal_notes": "Dry waste collected and transported to recycling sorting hub.",
        "created_offset_hours": 52,
        "timeline": [
            ("Citizen Reporter", "Pending", "Report submitted."),
            ("Dispatcher Smith", "Assigned", "Assigned to Vikram Patil."),
            ("Vikram Patil", "In Progress", "Pickup truck loading recyclables."),
            ("Vikram Patil", "Resolved", "Cleared and transferred to recycling center.")
        ]
    },
    {
        "report_id": "WV-2026-1006",
        "category": "Other",
        "description": "Pruned garden branches and dry leaves accumulated by community park walkway.",
        "location_address": "Jayanagar 4th Block, 9th Main Road Park",
        "latitude": 12.9299,
        "longitude": 77.5834,
        "image_url": "/uploads/demo-other.svg",
        "reported_severity": "Low",
        "status": "Resolved",
        "assigned_collector": "Suresh Gowda",
        "estimated_collection_date": "2 days ago",
        "internal_notes": "Green waste transported to municipal composting yard.",
        "created_offset_hours": 72,
        "timeline": [
            ("Citizen Reporter", "Pending", "Park user complaint."),
            ("Dispatcher Smith", "Assigned", "Assigned to Suresh Gowda."),
            ("Suresh Gowda", "Resolved", "Park path cleared.")
        ]
    },
    {
        "report_id": "WV-2026-1007",
        "category": "Wet",
        "description": "Overflowing community dumpster spilling raw kitchen refuse into the residential street. Strong foul smell and stray animals scattering debris.",
        "location_address": "HSR Layout Sector 2, 27th Main Road",
        "latitude": 12.9116,
        "longitude": 77.6534,
        "image_url": "/uploads/demo-wet.svg",
        "reported_severity": "Critical",
        "status": "In Progress",
        "assigned_collector": "Anita Sen (Rapid Response)",
        "estimated_collection_date": "Today, 5:15 PM",
        "internal_notes": "Compactor truck dispatched for immediate heavy clearing.",
        "created_offset_hours": 8,
        "timeline": [
            ("Citizen Reporter", "Pending", "Urgent alert registered by Residents Welfare Association."),
            ("Operations Desk", "In Progress", "Compactor truck dispatched to location.")
        ]
    },
    {
        "report_id": "WV-2026-1008",
        "category": "Hazardous",
        "description": "Discarded industrial lubricant drums with corrosive chemical residue leaking on roadside dirt patch near residential corner.",
        "location_address": "Peenya Industrial Area Stage 2, Outer Ring Link",
        "latitude": 13.0324,
        "longitude": 77.5146,
        "image_url": "/uploads/demo-hazardous.svg",
        "reported_severity": "High",
        "status": "Assigned",
        "assigned_collector": "Ramesh Kumar (Hazmat Team)",
        "estimated_collection_date": "Tomorrow, 9:00 AM",
        "internal_notes": "Containment booms and neutralizing absorbent powder required.",
        "created_offset_hours": 18,
        "timeline": [
            ("Citizen Reporter", "Pending", "Spill reported by commuter."),
            ("Safety Officer", "Assigned", "Escalated to industrial hazmat division.")
        ]
    },
    {
        "report_id": "WV-2026-1009",
        "category": "Plastic",
        "description": "Scattered single-use plastic cups, snack wrappers, and beverage cartons littering the grass verge.",
        "location_address": "Whitefield Inner Circle Road, Near Jogging Park",
        "latitude": 12.9698,
        "longitude": 77.7499,
        "image_url": "/uploads/demo-plastic.svg",
        "reported_severity": "Low",
        "status": "Pending",
        "assigned_collector": None,
        "estimated_collection_date": None,
        "internal_notes": None,
        "created_offset_hours": 20,
        "timeline": [
            ("Citizen Reporter", "Pending", "Litter reported by park maintenance volunteer.")
        ]
    }
]


def seed_database(db: Session, force_reset: bool = False):
    """
    Seeds initial realistic demo waste reports if database is empty or force_reset=True.
    """
    Base.metadata.create_all(bind=engine)
    existing_count = db.query(models.WasteReport).count()
    if existing_count > 0 and not force_reset:
        return {"status": "skipped", "message": f"Database already contains {existing_count} reports."}

    if force_reset:
        db.query(models.StatusTimelineEvent).delete()
        db.query(models.WasteReport).delete()
        db.commit()

    now = datetime.utcnow()

    for item in DEMO_REPORTS:
        created_time = now - timedelta(hours=item["created_offset_hours"])
        
        # Calculate AI priority
        priority_res = calculate_priority_score(
            category=item["category"],
            reported_severity=item["reported_severity"],
            description=item["description"],
            location_address=item["location_address"],
            latitude=item["latitude"],
            longitude=item["longitude"],
            created_at=created_time,
            db=None
        )

        resolved_time = now - timedelta(hours=4) if item["status"] == "Resolved" else None

        report = models.WasteReport(
            report_id=item["report_id"],
            category=item["category"],
            description=item["description"],
            location_address=item["location_address"],
            latitude=item["latitude"],
            longitude=item["longitude"],
            image_url=item["image_url"],
            reported_severity=item["reported_severity"],
            calculated_priority=priority_res["priority"],
            priority_score=priority_res["score"],
            priority_reasons=json.dumps(priority_res["breakdown"]),
            status=item["status"],
            assigned_collector=item["assigned_collector"],
            estimated_collection_date=item["estimated_collection_date"],
            internal_notes=item["internal_notes"],
            is_demo=True,
            created_at=created_time,
            updated_at=now,
            resolved_at=resolved_time
        )
        db.add(report)

        # Timeline events
        for actor, st, note in item["timeline"]:
            t_event = models.StatusTimelineEvent(
                report_id=item["report_id"],
                status=st,
                actor=actor,
                note=note,
                timestamp=created_time + timedelta(hours=2)
            )
            db.add(t_event)

    db.commit()
    return {"status": "seeded", "count": len(DEMO_REPORTS)}
