import io
import base64
import pytest
from PIL import Image
from fastapi.testclient import TestClient

from backend.main import app
from backend.services.authenticity_service import ImageAuthenticityService
from backend.services.geospatial_service import GeospatialVerificationService
from backend.services.unified_evidence_service import UnifiedEvidenceService
from backend.models.schemas import AuthenticityStatus, AuthenticityAssessment

client = TestClient(app)


def create_test_image_b64(width=320, height=240, color="gray", fmt="JPEG"):
    """Helper to generate in-memory valid base64 test images."""
    img = Image.new("RGB", (width, height), color=color)
    buf = io.BytesIO()
    img.save(buf, format=fmt)
    b64_str = base64.b64encode(buf.getvalue()).decode("utf-8")
    return f"data:image/{fmt.lower()};base64,{b64_str}"


# =========================================================================
# 1. IMAGE AUTHENTICITY & QUALITY TESTS
# =========================================================================

def test_valid_image_decoding_and_quality():
    b64 = create_test_image_b64(400, 300, color="red")
    raw_bytes, pil_img, quality = ImageAuthenticityService.decode_and_validate_image(b64)
    assert len(raw_bytes) > 0
    assert pil_img.size == (400, 300)
    assert quality.width == 400
    assert quality.height == 300
    assert quality.format == "image/jpeg"
    assert quality.file_size_bytes > 0


def test_unsupported_image_format_rejection():
    # Attempting to pass invalid text or corrupted magic bytes (>100 bytes)
    fake_b64 = base64.b64encode(b"THIS_IS_NOT_AN_IMAGE_HEADER_DATA_PADDING_EXCEEDING_MINIMUM_LIMIT" * 4).decode("utf-8")
    with pytest.raises(ValueError) as excinfo:
        ImageAuthenticityService.decode_and_validate_image(fake_b64)
    assert "Unsupported or corrupted file format" in str(excinfo.value)


def test_tiny_image_dimension_rejection():
    # Less than 80x80 pixels
    b64 = create_test_image_b64(50, 50)
    with pytest.raises(ValueError) as excinfo:
        ImageAuthenticityService.decode_and_validate_image(b64)
    assert "too small" in str(excinfo.value)


def test_authenticity_assessment_structure():
    b64 = create_test_image_b64(640, 480)
    raw_bytes, pil_img, quality = ImageAuthenticityService.decode_and_validate_image(b64)
    exif = ImageAuthenticityService.extract_exif_metadata(pil_img)
    result = ImageAuthenticityService.assess_authenticity(raw_bytes, pil_img, quality, exif)

    assert result.status == AuthenticityStatus.COMPLETED
    assert result.score >= 0.0 and result.score <= 1.0
    assert len(result.limitations) >= 1
    assert "cannot conclusively establish" in result.limitations[0]


# =========================================================================
# 2. GEOSPATIAL & HAVERSINE TESTS
# =========================================================================

def test_haversine_distance_accuracy():
    # Known Lucknow landmarks:
    # Hazratganj (26.8504, 80.9452) to Gomti Nagar (26.8520, 80.9980) ~ 5.2 km
    dist = GeospatialVerificationService.haversine_distance(26.8504, 80.9452, 26.8520, 80.9980)
    assert dist > 4500 and dist < 6000

    # Same point distance must be 0
    assert GeospatialVerificationService.haversine_distance(26.8504, 80.9452, 26.8504, 80.9452) == 0.0


def test_location_consistency_with_close_capture():
    # Reported at Hazratganj, capture at Hazratganj (30m away)
    loc_res = GeospatialVerificationService.verify_location_consistency(
        reported_lat=26.8504,
        reported_lon=80.9452,
        capture_lat=26.8506,
        capture_lon=80.9454
    )
    assert loc_res.location_assessment in ["consistent", "acceptable_proximity"]
    assert loc_res.distance_reported_vs_capture_m < 100.0


def test_location_discrepancy_detection():
    # Reported at Hazratganj, capture at Alambagh (~5 km away)
    loc_res = GeospatialVerificationService.verify_location_consistency(
        reported_lat=26.8504,
        reported_lon=80.9452,
        capture_lat=26.8164,
        capture_lon=80.9082
    )
    assert loc_res.location_assessment == "discrepancy_detected"
    assert loc_res.distance_reported_vs_capture_m > 2000.0
    assert "Noticeable geographic discrepancy" in loc_res.warnings[0]


def test_nearby_complaints_search():
    # Target near Hazratganj
    fake_complaints = [
        {"id": "TEST-1", "category": "Roads & Potholes", "desc": "Pothole", "location": "Hazratganj", "latitude": 26.8504, "longitude": 80.9452, "status": "under_review", "createdAt": "2026-10-28"},
        {"id": "TEST-2", "category": "Water", "desc": "Pipe leak", "location": "Delhi", "latitude": 28.6139, "longitude": 77.2090, "status": "under_review", "createdAt": "2026-10-28"}
    ]
    nearby = GeospatialVerificationService.find_nearby_complaints(
        target_lat=26.8505,
        target_lon=80.9453,
        existing_complaints=fake_complaints,
        radius_meters=100.0
    )
    assert len(nearby) == 1
    assert nearby[0].id == "TEST-1"
    assert nearby[0].distance_meters < 50.0


# =========================================================================
# 3. UNIFIED EVIDENCE API INTEGRATION TESTS
# =========================================================================

def test_api_health_check():
    resp = client.get("/api/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "healthy"
    assert "CivicFix AI" in data["service"]


def test_api_verify_evidence_endpoint():
    b64 = create_test_image_b64(400, 300, color="orange")
    payload = {
        "photo_base64": b64,
        "description": "Large deep pothole on road causing vehicle congestion and accident hazard.",
        "category": "Roads & Potholes",
        "reported_latitude": 26.8504,
        "reported_longitude": 80.9452,
        "reported_address": "Hazratganj Main Market, Lucknow",
        "gps_accuracy_meters": 10.0,
        "capture_latitude": 26.8505,
        "capture_longitude": 80.9453,
        "location_confirmed_by_user": True
    }
    resp = client.post("/api/evidence/verify", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert "evidence_status" in data
    assert "evidence_score" in data
    assert data["evidence_score"] >= 0.0 and data["evidence_score"] <= 100.0
    assert "authenticity" in data["signals"]
    assert "description_consistency" in data["signals"]
    assert "location_consistency" in data["signals"]
    assert "recommended_action" in data


def test_official_review_decision_and_audit():
    decision_payload = {
        "decision": "approve_evidence",
        "decision_reason": "Verified defect photo and GPS pin in Sector 4; approved for asphalt dispatch.",
        "official_badge_id": "LDA-EMP-8492",
        "officer_name": "Er. Vikramaditya Singh",
        "new_complaint_status": "in_progress"
    }
    resp = client.post("/api/official/complaints/CFA-2026-001/review-evidence", json=decision_payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "success"
    assert data["recorded_decision"] == "approve_evidence"

    # Verify audit log updated
    audit_resp = client.get("/api/official/audit-logs")
    assert audit_resp.status_code == 200
    audit_logs = audit_resp.json()
    assert len(audit_logs) >= 1
    assert audit_logs[-1]["badge_id"] == "LDA-EMP-8492"
