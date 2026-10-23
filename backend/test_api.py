import os
import sys
from fastapi.testclient import TestClient

# Ensure current directory is in path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.main import app

client = TestClient(app)

def run_tests():
    print("========================================")
    print("RUNNING WASTEVISION COMPREHENSIVE TESTS")
    print("========================================")

    # 1. Test Reset Demo DB
    print("\n[1] Testing POST /api/demo/reset...")
    r = client.post("/api/demo/reset")
    assert r.status_code == 200, f"Expected 200, got {r.status_code}"
    data = r.json()
    assert data["status"] == "seeded"
    assert data["count"] == 9
    print("  -> Passed! Database reset and seeded with 9 records.")

    # 2. Test Dashboard Stats
    print("\n[2] Testing GET /api/stats...")
    r = client.get("/api/stats")
    assert r.status_code == 200
    stats = r.json()
    assert stats["total_reports"] == 9
    assert stats["pending_reports"] == 3
    assert stats["resolved_reports"] == 2
    assert len(stats["category_distribution"]) == 6
    assert len(stats["status_distribution"]) == 4
    print(f"  -> Passed! Stats: Total={stats['total_reports']}, Pending={stats['pending_reports']}, Resolved={stats['resolved_reports']}, Resolution Rate={stats['resolution_rate']}%")

    # 3. Test Filtered Reports Listing
    print("\n[3] Testing GET /api/reports with filters...")
    r = client.get("/api/reports?category=Hazardous")
    assert r.status_code == 200
    haz_reports = r.json()
    assert len(haz_reports) == 2
    for rep in haz_reports:
        assert rep["category"] == "Hazardous"
    print(f"  -> Passed! Found {len(haz_reports)} hazardous reports.")

    r_search = client.get("/api/reports?search=Malleshwaram")
    assert r_search.status_code == 200
    assert len(r_search.json()) >= 1
    print(f"  -> Passed! Search for 'Malleshwaram' returned {len(r_search.json())} match.")

    # 4. Test Create New Report
    print("\n[4] Testing POST /api/reports (Citizen submission)...")
    new_report_payload = {
        "category": "Hazardous",
        "description": "Corrosive chemical barrel leaking fluid near residential kindergarten and blocking storm drain",
        "location_address": "8th Main, Sadashivanagar, Bangalore",
        "latitude": 13.0068,
        "longitude": 77.5813,
        "reported_severity": "Critical"
    }
    r_create = client.post("/api/reports", data=new_report_payload)
    assert r_create.status_code == 201, f"Failed create: {r_create.text}"
    created = r_create.json()
    report_id = created["report_id"]
    assert report_id.startswith("WV-2026-")
    assert created["calculated_priority"] == "Critical"
    assert created["priority_score"] >= 80.0
    assert len(created["priority_reasons"]) >= 4
    print(f"  -> Passed! Created {report_id} with AI Priority: {created['calculated_priority']} ({created['priority_score']}/100)")
    print(f"     Reasons: {created['priority_reasons']}")

    # 5. Test Inspect Report by ID & Timeline
    print(f"\n[5] Testing GET /api/reports/{report_id}...")
    r_get = client.get(f"/api/reports/{report_id}")
    assert r_get.status_code == 200
    details = r_get.json()
    assert details["report_id"] == report_id
    assert len(details["timeline"]) >= 1
    print(f"  -> Passed! Retrieved report with {len(details['timeline'])} timeline audit event.")

    # 6. Test Update Report (Dispatcher Assignment & Status Transition)
    print(f"\n[6] Testing PATCH /api/reports/{report_id} (Dispatch & Assignment)...")
    update_payload = {
        "status": "Assigned",
        "assigned_collector": "Ramesh Kumar (Hazmat Team)",
        "estimated_collection_date": "Today, 3:30 PM",
        "internal_notes": "Hazmat vehicle 01 dispatched with neutralization kit."
    }
    r_update = client.patch(f"/api/reports/{report_id}?actor=Chief Dispatcher", json=update_payload)
    assert r_update.status_code == 200
    updated = r_update.json()
    assert updated["status"] == "Assigned"
    assert updated["assigned_collector"] == "Ramesh Kumar (Hazmat Team)"
    assert len(updated["timeline"]) >= 2
    print(f"  -> Passed! Status updated to 'Assigned', collector set, timeline has {len(updated['timeline'])} entries.")

    # 7. Test Transition to Resolved
    print(f"\n[7] Testing PATCH /api/reports/{report_id} -> Resolved...")
    r_resolve = client.patch(f"/api/reports/{report_id}?actor=Ramesh Kumar", json={
        "status": "Resolved",
        "internal_notes": "Chemical container safely barreled and transferred to hazardous disposal facility."
    })
    assert r_resolve.status_code == 200
    resolved = r_resolve.json()
    assert resolved["status"] == "Resolved"
    assert resolved["resolved_at"] is not None
    print("  -> Passed! Report marked Resolved with timestamp.")

    # 8. Test Stats reflects the new report & resolution
    print("\n[8] Testing GET /api/stats to verify live database reflects update...")
    r_stats2 = client.get("/api/stats")
    stats2 = r_stats2.json()
    assert stats2["total_reports"] == 10
    assert stats2["resolved_reports"] == 3
    print(f"  -> Passed! Live stats updated: Total={stats2['total_reports']}, Resolved={stats2['resolved_reports']}")

    # 9. Test Priority Engine Preview Endpoint
    print("\n[9] Testing POST /api/priority/calculate (Explainable AI preview)...")
    r_prio = client.post("/api/priority/calculate", json={
        "category": "Plastic",
        "reported_severity": "High",
        "description": "Plastic bottles overflowing onto road and blocking sidewalk",
        "location_address": "Indiranagar 100ft Road"
    })
    assert r_prio.status_code == 200
    prio_data = r_prio.json()
    assert prio_data["priority"] in ["High", "Critical"]
    assert prio_data["score"] > 50.0
    assert len(prio_data["breakdown"]) >= 3
    print(f"  -> Passed! AI Score={prio_data['score']}, Priority={prio_data['priority']}")
    print(f"     Breakdown: {prio_data['breakdown']}")

    # 10. Test Input Validation Errors
    print("\n[10] Testing input validations (bad category, bad severity)...")
    r_bad_cat = client.post("/api/reports", data={
        "category": "NuclearRadioactiveTrash",
        "description": "Some description",
        "location_address": "Test location",
        "reported_severity": "Medium"
    })
    assert r_bad_cat.status_code == 400
    print("  -> Passed! Invalid category rejected with 400.")

    r_bad_sev = client.post("/api/reports", data={
        "category": "Plastic",
        "description": "Some description",
        "location_address": "Test location",
        "reported_severity": "UltraSuperUrgent"
    })
    assert r_bad_sev.status_code == 400
    print("  -> Passed! Invalid severity rejected with 400.")

    print("\n========================================")
    print("ALL 10 TEST SUITES PASSED FLAWLESSLY! ✓")
    print("========================================")

if __name__ == "__main__":
    run_tests()
