from typing import Optional, List, Dict, Any
from enum import Enum
from pydantic import BaseModel, Field


class AuthenticityStatus(str, Enum):
    COMPLETED = "completed"
    INCONCLUSIVE = "inconclusive"
    UNAVAILABLE = "unavailable"
    FAILED = "failed"


class AuthenticityAssessment(str, Enum):
    AUTHENTIC_PHOTOGRAPH = "authentic_photograph"
    POTENTIALLY_SYNTHETIC = "potentially_synthetic"
    DIGITALLY_MANIPULATED = "digitally_manipulated"
    INCONCLUSIVE = "inconclusive"


class EvidenceStatus(str, Enum):
    VERIFIED = "verified"
    REQUIRES_REVIEW = "requires_review"
    INCONCLUSIVE = "inconclusive"
    FLAGGED_SUSPICIOUS = "flagged_suspicious"


class RecommendedAction(str, Enum):
    CONTINUE_WITH_STANDARD_REVIEW = "continue_with_standard_review"
    REQUEST_ADDITIONAL_EVIDENCE = "request_additional_evidence"
    FLAG_FOR_FIELD_INSPECTION = "flag_for_field_inspection"


class LocationCoords(BaseModel):
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    accuracy_meters: Optional[float] = None
    address: Optional[str] = None
    source: Optional[str] = "browser_gps"  # browser_gps | manual_pin | exif_metadata


class QualityMetrics(BaseModel):
    width: int
    height: int
    format: str
    file_size_bytes: int
    blur_score: float = Field(..., description="High frequency variance score; higher means sharper")
    is_sufficient_quality: bool
    quality_warnings: List[str] = []


class ExifMetadata(BaseModel):
    has_exif: bool = False
    camera_make: Optional[str] = None
    camera_model: Optional[str] = None
    date_time_original: Optional[str] = None
    software: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    warnings: List[str] = []


class AuthenticityResult(BaseModel):
    status: AuthenticityStatus
    assessment: AuthenticityAssessment
    score: float = Field(..., ge=0.0, le=1.0, description="Model confidence/authenticity index (0=manipulated/synthetic, 1=authentic)")
    model_name: str
    model_version: str
    quality: QualityMetrics
    exif: ExifMetadata
    limitations: List[str]
    reasons: List[str]


class ConsistencyResult(BaseModel):
    status: str  # "completed" | "inconclusive" | "unavailable"
    is_relevant: bool
    category_match: bool
    confidence: float = Field(..., ge=0.0, le=1.0)
    description_summary: str
    discrepancies: List[str] = []
    recommended_next_step: str


class LocationVerificationResult(BaseModel):
    location_assessment: str  # "consistent" | "discrepancy_detected" | "unverified" | "inconclusive"
    reported_location: LocationCoords
    capture_location: Optional[LocationCoords] = None
    metadata_location: Optional[LocationCoords] = None
    distance_reported_vs_capture_m: Optional[float] = None
    distance_reported_vs_metadata_m: Optional[float] = None
    warnings: List[str] = []
    recommended_action: str


class NearbyComplaint(BaseModel):
    id: str
    category: str
    description: str
    location: str
    latitude: float
    longitude: float
    distance_meters: float
    status: str
    created_at: str


class UnifiedEvidenceResult(BaseModel):
    evidence_status: EvidenceStatus
    evidence_score: Optional[float] = Field(None, ge=0.0, le=100.0, description="Unified Evidence Confidence Score 0-100")
    signals: Dict[str, str] = Field(
        ..., 
        description="Individual signals: authenticity, description_consistency, location_consistency, duplicate_check"
    )
    reasons: List[str]
    recommended_action: RecommendedAction
    authenticity_details: AuthenticityResult
    consistency_details: ConsistencyResult
    location_details: LocationVerificationResult
    nearby_duplicates: List[NearbyComplaint] = []
    audit_timestamp: str


class EvidenceVerifyRequest(BaseModel):
    photo_base64: str
    description: str
    category: str
    reported_latitude: float = Field(..., ge=-90.0, le=90.0)
    reported_longitude: float = Field(..., ge=-180.0, le=180.0)
    reported_address: Optional[str] = None
    gps_accuracy_meters: Optional[float] = None
    capture_latitude: Optional[float] = None
    capture_longitude: Optional[float] = None
    capture_accuracy_meters: Optional[float] = None
    location_confirmed_by_user: bool = True
    gemini_api_key: Optional[str] = None


class ReviewEvidenceDecisionRequest(BaseModel):
    decision: str  # "approve_evidence" | "request_additional_evidence" | "flag_for_inspection" | "mark_inconclusive"
    decision_reason: str
    official_badge_id: str
    officer_name: str
    new_complaint_status: Optional[str] = None
