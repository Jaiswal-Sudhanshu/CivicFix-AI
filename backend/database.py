import datetime
from typing import Dict, Any, List, Optional

# Initial Seed Complaints with real-world Lucknow geographic coordinates
INITIAL_COMPLAINTS_DB: List[Dict[str, Any]] = [
    {
        "id": "CFA-2026-001",
        "title": "Severe Road Pothole (SMS College Gate)",
        "category": "Roads & Potholes",
        "categoryDesc": "Issues related to damaged roads, potholes, uneven surfaces etc.",
        "priority": "High",
        "status": "under_review",
        "location": "Near SMS College Gate, Sultanpur Road, Lucknow, Uttar Pradesh",
        "latitude": 26.7925,
        "longitude": 81.0189,
        "gps_accuracy_meters": 8.5,
        "location_source": "browser_gps",
        "location_confirmed_by_user": True,
        "desc": "There is a large pothole on the road near the college gate. It is dangerous for two-wheelers and cars, especially during night.",
        "photoUrl": "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80",
        "createdAt": "2026-10-24T10:30:00Z",
        "assignedOfficer": "Unassigned",
        "evidence_record": {
            "evidence_status": "verified",
            "evidence_score": 87.5,
            "signals": {
                "authenticity": "authentic_photograph",
                "description_consistency": "consistent",
                "location_consistency": "consistent",
                "duplicate_check": "no_match_found"
            },
            "reasons": [
                "Capture GPS corroborates reported pin within 12.4m.",
                "Visual features align with authentic physical photograph."
            ],
            "recommended_action": "continue_with_standard_review"
        },
        "timeline": [
            { "step": "Complaint Submitted", "time": "24 Oct, 10:30 AM", "desc": "Grievance lodged via CivicFix AI Camera with GPS Geotag." },
            { "step": "AI Triage & Forensics Complete", "time": "24 Oct, 10:31 AM", "desc": "Evidence verified (Score: 87.5/100). Categorized as Roads & Potholes, Priority High." },
            { "step": "Awaiting Official Approval", "time": "24 Oct, 10:32 AM", "desc": "Pending review by Er. Vikramaditya Singh (LDA Executive Office)." }
        ]
    },
    {
        "id": "CFA-2026-005",
        "title": "Damaged Heritage Streetlight & Wire Sparking",
        "category": "Streetlights & Lighting",
        "categoryDesc": "Dark roads, damaged poles, non-functional streetlights and sparking wires.",
        "priority": "High",
        "status": "in_progress",
        "location": "Hazratganj Main Market, Opposite Cathedral School, Lucknow",
        "latitude": 26.8504,
        "longitude": 80.9452,
        "gps_accuracy_meters": 12.0,
        "location_source": "browser_gps",
        "location_confirmed_by_user": True,
        "desc": "Damaged heritage streetlight pole sparking and dark road hazard after 7 PM.",
        "photoUrl": "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80",
        "createdAt": "2026-10-25T14:15:00Z",
        "assignedOfficer": "LDA Electrical Wing Hydraulic Crane Squad #02",
        "evidence_record": {
            "evidence_status": "verified",
            "evidence_score": 84.0,
            "signals": {
                "authenticity": "authentic_photograph",
                "description_consistency": "consistent",
                "location_consistency": "consistent",
                "duplicate_check": "no_match_found"
            },
            "reasons": ["Authentic camera photograph verified."],
            "recommended_action": "continue_with_standard_review"
        },
        "timeline": [
            { "step": "Complaint Submitted", "time": "25 Oct, 02:15 PM", "desc": "Citizen reported sparking pole with night hazard photo." },
            { "step": "Official Approved & Dispatched", "time": "25 Oct, 03:00 PM", "desc": "Approved by Er. Vikramaditya Singh. Assigned Electrical Wing Squad #02." }
        ]
    },
    {
        "id": "CFA-2026-004",
        "title": "Solid Waste Dump & Street Litter Overflow",
        "category": "Garbage & Sanitation",
        "categoryDesc": "Overflowing garbage dumps, uncollected waste, and sanitary hazards.",
        "priority": "Medium",
        "status": "resolved",
        "location": "Sector A, Hazratganj, Near State Bank ATM, Lucknow",
        "latitude": 26.8488,
        "longitude": 80.9431,
        "gps_accuracy_meters": 9.2,
        "location_source": "browser_gps",
        "location_confirmed_by_user": True,
        "desc": "Community waste bin has been overflowing onto the pedestrian footpath for 3 days.",
        "photoUrl": "https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80",
        "createdAt": "2026-10-22T08:00:00Z",
        "assignedOfficer": "Solid Waste Management Rapid Disposal Squad #07",
        "evidence_record": {
            "evidence_status": "verified",
            "evidence_score": 91.0,
            "signals": {
                "authenticity": "authentic_photograph",
                "description_consistency": "consistent",
                "location_consistency": "consistent",
                "duplicate_check": "no_match_found"
            },
            "reasons": ["High confidence verified evidence."],
            "recommended_action": "continue_with_standard_review"
        },
        "timeline": [
            { "step": "Complaint Submitted", "time": "22 Oct, 08:00 AM", "desc": "Citizen logged overflowing bin." },
            { "step": "Resolved & Cleared", "time": "22 Oct, 04:30 PM", "desc": "Waste evacuated by Rapid Disposal Squad #07. Disinfected." }
        ]
    },
    {
        "id": "CFA-2026-003",
        "title": "Stormwater Drainage Pit Grate Missing",
        "category": "Drainage & Sewerage",
        "categoryDesc": "Open manholes, missing drain grates, waterlogged roads and blockages.",
        "priority": "High",
        "status": "in_progress",
        "location": "Main Road, Near Bus Stand, Alambagh, Lucknow",
        "latitude": 26.8164,
        "longitude": 80.9082,
        "gps_accuracy_meters": 15.0,
        "location_source": "browser_gps",
        "location_confirmed_by_user": True,
        "desc": "Deep stormwater drainage pit missing its cast iron grate right next to the bus shelter.",
        "photoUrl": "https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=800&q=80",
        "createdAt": "2026-10-23T11:45:00Z",
        "assignedOfficer": "Urban Drainage Desilting & Jetting Machine Crew #01",
        "evidence_record": {
            "evidence_status": "verified",
            "evidence_score": 86.0,
            "signals": {
                "authenticity": "authentic_photograph",
                "description_consistency": "consistent",
                "location_consistency": "consistent",
                "duplicate_check": "no_match_found"
            },
            "reasons": ["Grate hazard confirmed."],
            "recommended_action": "continue_with_standard_review"
        },
        "timeline": [
            { "step": "Complaint Submitted", "time": "23 Oct, 11:45 AM", "desc": "High safety risk reported near busy bus station." },
            { "step": "Barricaded & In Repair", "time": "23 Oct, 01:10 PM", "desc": "Temporary warning cones placed. Cast iron replacement scheduled." }
        ]
    }
]

# Audit Log of Official Administrative Decisions
AUDIT_LOG_DB: List[Dict[str, Any]] = []


class ComplaintRepository:
    """
    In-memory persistent repository for hackathon demonstration.
    Provides thread-safe access and state transitions.
    """

    _complaints: List[Dict[str, Any]] = list(INITIAL_COMPLAINTS_DB)

    @classmethod
    def get_all(cls) -> List[Dict[str, Any]]:
        return cls._complaints

    @classmethod
    def get_by_id(cls, complaint_id: str) -> Optional[Dict[str, Any]]:
        for c in cls._complaints:
            if c["id"].lower() == complaint_id.lower():
                return c
        return None

    @classmethod
    def add(cls, complaint_data: Dict[str, Any]) -> Dict[str, Any]:
        cls._complaints.insert(0, complaint_data)
        return complaint_data

    @classmethod
    def update_status(cls, complaint_id: str, new_status: str, assigned_officer: Optional[str] = None) -> Optional[Dict[str, Any]]:
        c = cls.get_by_id(complaint_id)
        if not c:
            return None
        c["status"] = new_status
        if assigned_officer:
            c["assignedOfficer"] = assigned_officer

        time_now = datetime.datetime.now().strftime("%d %b, %I:%M %p")
        c["timeline"].append({
            "step": f"Status updated to {new_status.replace('_', ' ').capitalize()}",
            "time": time_now,
            "desc": f"Updated by Lucknow Development Authority. Assigned: {assigned_officer or c.get('assignedOfficer')}."
        })
        return c

    @classmethod
    def record_official_decision(
        cls,
        complaint_id: str,
        decision: str,
        reason: str,
        officer_name: str,
        badge_id: str,
        new_status: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        c = cls.get_by_id(complaint_id)
        if not c:
            return None

        audit_entry = {
            "complaint_id": complaint_id,
            "decision": decision,
            "decision_reason": reason,
            "officer_name": officer_name,
            "badge_id": badge_id,
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }
        AUDIT_LOG_DB.append(audit_entry)

        if not c.get("official_reviews"):
            c["official_reviews"] = []
        c["official_reviews"].append(audit_entry)

        # Update evidence record with official review status
        if c.get("evidence_record"):
            c["evidence_record"]["official_decision"] = decision
            c["evidence_record"]["official_decision_reason"] = reason
            c["evidence_record"]["reviewed_by"] = f"{officer_name} ({badge_id})"

        # Apply new complaint status if specified
        if new_status:
            c["status"] = new_status

        time_now = datetime.datetime.now().strftime("%d %b, %I:%M %p")
        c["timeline"].append({
            "step": f"Official Decision: {decision.replace('_', ' ').title()}",
            "time": time_now,
            "desc": f"Official {officer_name} ({badge_id}): '{reason}'."
        })

        return c
