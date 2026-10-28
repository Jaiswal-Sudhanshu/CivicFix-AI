import os
import uuid
import datetime
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.models.schemas import (
    EvidenceVerifyRequest,
    UnifiedEvidenceResult,
    ReviewEvidenceDecisionRequest,
    NearbyComplaint
)
from backend.services.unified_evidence_service import UnifiedEvidenceService
from backend.services.geospatial_service import GeospatialVerificationService
from backend.database import ComplaintRepository, AUDIT_LOG_DB

app = FastAPI(
    title="CivicFix AI - Forensic & Geospatial API",
    description="Multimodal Image Authenticity, Live Geotagging, and Civic Complaint Verification Engine",
    version="2.4.0"
)

# Enable CORS for frontend dev and production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "CivicFix AI Forensics & Geospatial Engine",
        "version": "2.4.0",
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }


@app.post("/api/evidence/verify", response_model=UnifiedEvidenceResult)
def verify_evidence(payload: EvidenceVerifyRequest):
    """
    Unified Evidence Verification Endpoint:
    Processes image quality, EXIF metadata, synthetic AI indicators,
    semantic consistency, and live capture GPS corroboration.
    """
    try:
        existing = ComplaintRepository.get_all()
        result = UnifiedEvidenceService.evaluate_evidence(
            photo_base64=payload.photo_base64,
            description=payload.description,
            category=payload.category,
            reported_lat=payload.reported_latitude,
            reported_lon=payload.reported_longitude,
            reported_address=payload.reported_address,
            gps_accuracy_m=payload.gps_accuracy_meters,
            capture_lat=payload.capture_latitude,
            capture_lon=payload.capture_longitude,
            capture_accuracy_m=payload.capture_accuracy_meters,
            existing_complaints=existing,
            api_key=payload.gemini_api_key
        )
        return result
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Evidence verification failed: {str(e)}")


@app.get("/api/location/reverse-geocode")
def reverse_geocode(
    lat: float = Query(..., ge=-90.0, le=90.0, description="Latitude"),
    lon: float = Query(..., ge=-180.0, le=180.0, description="Longitude")
):
    """
    Free OpenStreetMap Nominatim reverse geocoding with caching and graceful fallback.
    """
    address = GeospatialVerificationService.reverse_geocode(lat, lon)
    return {
        "latitude": lat,
        "longitude": lon,
        "address": address
    }


@app.get("/api/complaints/nearby", response_model=List[NearbyComplaint])
def get_nearby_complaints(
    lat: float = Query(..., ge=-90.0, le=90.0),
    lon: float = Query(..., ge=-180.0, le=180.0),
    radius_m: float = Query(150.0, ge=10.0, le=5000.0),
    category: Optional[str] = Query(None)
):
    """
    Searches for nearby complaints within a radius in meters using Haversine calculation.
    """
    existing = ComplaintRepository.get_all()
    nearby = GeospatialVerificationService.find_nearby_complaints(
        target_lat=lat,
        target_lon=lon,
        existing_complaints=existing,
        radius_meters=radius_m,
        target_category=category
    )
    return nearby


@app.get("/api/complaints")
def list_complaints(
    status_filter: Optional[str] = None,
    category_filter: Optional[str] = None
):
    """
    Retrieves all complaints with evidence records.
    """
    all_complaints = ComplaintRepository.get_all()
    filtered = all_complaints
    if status_filter:
        filtered = [c for c in filtered if c.get("status") == status_filter]
    if category_filter:
        filtered = [c for c in filtered if c.get("category", "").lower() == category_filter.lower()]
    return filtered


@app.get("/api/complaints/{complaint_id}")
def get_complaint(complaint_id: str):
    c = ComplaintRepository.get_by_id(complaint_id)
    if not c:
        raise HTTPException(status_code=404, detail=f"Complaint with ID {complaint_id} not found.")
    return c


@app.post("/api/complaints")
def create_complaint(data: Dict[str, Any]):
    """
    Submits a new citizen grievance with evidence verification record.
    """
    complaint_id = data.get("id") or f"CFA-2026-{str(uuid.uuid4())[:4].upper()}"
    new_record = {
        "id": complaint_id,
        "title": data.get("title") or f"{data.get('category', 'Civic Defect')} Report",
        "category": data.get("category", "Roads & Potholes"),
        "categoryDesc": data.get("categoryDesc", "Civic issue reported by citizen"),
        "priority": data.get("priority", "High"),
        "status": data.get("status", "under_review"),
        "location": data.get("location") or "Lucknow, Uttar Pradesh",
        "latitude": data.get("latitude") or 26.8467,
        "longitude": data.get("longitude") or 80.9462,
        "gps_accuracy_meters": data.get("gps_accuracy_meters"),
        "location_source": data.get("location_source", "browser_gps"),
        "location_confirmed_by_user": data.get("location_confirmed_by_user", True),
        "desc": data.get("desc") or data.get("description", ""),
        "photoUrl": data.get("photoUrl", ""),
        "createdAt": datetime.datetime.now().isoformat(),
        "assignedOfficer": "Unassigned",
        "evidence_record": data.get("evidence_record"),
        "timeline": [
            {
                "step": "Complaint Submitted",
                "time": datetime.datetime.now().strftime("%d %b, %I:%M %p"),
                "desc": "Lodged via CivicFix AI with live geolocation."
            },
            {
                "step": "Awaiting Official Approval",
                "time": datetime.datetime.now().strftime("%d %b, %I:%M %p"),
                "desc": "Queued for LDA municipal officer review."
            }
        ]
    }
    created = ComplaintRepository.add(new_record)
    return created


@app.post("/api/official/complaints/{complaint_id}/review-evidence")
def review_evidence(complaint_id: str, payload: ReviewEvidenceDecisionRequest):
    """
    Official Administrative Action:
    Approve Evidence, Request Additional Evidence, Flag for Inspection, or Mark Inconclusive.
    Records official decision in immutable audit trail.
    """
    valid_decisions = [
        "approve_evidence",
        "request_additional_evidence",
        "flag_for_inspection",
        "mark_inconclusive"
    ]
    if payload.decision not in valid_decisions:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid decision. Allowed decisions: {valid_decisions}"
        )

    updated = ComplaintRepository.record_official_decision(
        complaint_id=complaint_id,
        decision=payload.decision,
        reason=payload.decision_reason,
        officer_name=payload.officer_name,
        badge_id=payload.official_badge_id,
        new_status=payload.new_complaint_status
    )
    if not updated:
        raise HTTPException(status_code=404, detail=f"Complaint with ID {complaint_id} not found.")

    return {
        "status": "success",
        "complaint_id": complaint_id,
        "recorded_decision": payload.decision,
        "officer": f"{payload.officer_name} ({payload.official_badge_id})",
        "updated_complaint": updated
    }


@app.get("/api/official/audit-logs")
def get_audit_logs():
    return AUDIT_LOG_DB


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
