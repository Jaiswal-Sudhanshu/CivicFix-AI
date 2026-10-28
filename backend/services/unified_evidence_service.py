import datetime
from typing import List, Dict, Any, Optional

from backend.models.schemas import (
    EvidenceStatus,
    RecommendedAction,
    UnifiedEvidenceResult,
    AuthenticityResult,
    ConsistencyResult,
    LocationVerificationResult,
    NearbyComplaint,
    AuthenticityAssessment,
)
from backend.services.authenticity_service import ImageAuthenticityService
from backend.services.consistency_service import EvidenceConsistencyService
from backend.services.geospatial_service import GeospatialVerificationService


class UnifiedEvidenceService:
    """
    UnifiedEvidenceService
    Integrates image forensics, semantic consistency, geographic corroboration,
    and duplicate detection into an explainable Evidence Confidence Assessment.
    """

    @classmethod
    def evaluate_evidence(
        cls,
        photo_base64: str,
        description: str,
        category: str,
        reported_lat: float,
        reported_lon: float,
        reported_address: Optional[str] = None,
        gps_accuracy_m: Optional[float] = None,
        capture_lat: Optional[float] = None,
        capture_lon: Optional[float] = None,
        capture_accuracy_m: Optional[float] = None,
        existing_complaints: Optional[List[Dict[str, Any]]] = None,
        api_key: Optional[str] = None
    ) -> UnifiedEvidenceResult:
        reasons: List[str] = []

        # 1. Image validation, quality metrics, and authenticity evaluation
        image_bytes, pil_img, quality = ImageAuthenticityService.decode_and_validate_image(photo_base64)
        exif = ImageAuthenticityService.extract_exif_metadata(pil_img)
        auth_result = ImageAuthenticityService.assess_authenticity(
            image_bytes=image_bytes,
            pil_img=pil_img,
            quality=quality,
            exif=exif,
            api_key=api_key
        )

        # 2. Consistency evaluation between image description and category
        consistency_result = EvidenceConsistencyService.check_consistency(
            image_bytes=image_bytes,
            description=description,
            category=category,
            api_key=api_key
        )

        # 3. Location corroboration
        # If reported address is empty, reverse geocode it
        if not reported_address or len(reported_address.strip()) < 5:
            reported_address = GeospatialVerificationService.reverse_geocode(reported_lat, reported_lon)

        meta_lat = exif.latitude
        meta_lon = exif.longitude

        location_result = GeospatialVerificationService.verify_location_consistency(
            reported_lat=reported_lat,
            reported_lon=reported_lon,
            reported_address=reported_address,
            gps_accuracy_m=gps_accuracy_m,
            capture_lat=capture_lat,
            capture_lon=capture_lon,
            capture_accuracy_m=capture_accuracy_m,
            metadata_lat=meta_lat,
            metadata_lon=meta_lon
        )

        # 4. Nearby and Duplicate Search
        nearby_complaints = []
        if existing_complaints:
            nearby_complaints = GeospatialVerificationService.find_nearby_complaints(
                target_lat=reported_lat,
                target_lon=reported_lon,
                existing_complaints=existing_complaints,
                radius_meters=150.0,
                target_category=category
            )

        # 5. Composite Evidence Confidence Scoring (0 - 100)
        # Weights:
        # - Authenticity: 40%
        # - Description Consistency: 25%
        # - Location Corroboration: 25%
        # - Duplicate Incident Sanity: 10%
        auth_points = auth_result.score * 40.0
        consistency_points = consistency_result.confidence * 25.0

        if location_result.location_assessment == "consistent":
            location_points = 25.0
            reasons.append("Capture GPS precisely corroborates the reported pin location.")
        elif location_result.location_assessment == "acceptable_proximity":
            location_points = 20.0
            reasons.append("Capture GPS is in close sector proximity to the complaint address.")
        elif location_result.location_assessment == "discrepancy_detected":
            location_points = 8.0
            reasons.append("Geographic discrepancy flagged between reported pin and capture/metadata coordinates.")
        else:
            location_points = 16.0  # Unverified / manual selection gets neutral score, not penalised to zero!
            reasons.append("Complaint location relies on citizen manual pin selection without hardware device capture GPS.")

        # Duplicate check signal
        duplicate_check_signal = "no_match_found"
        duplicate_points = 10.0
        if nearby_complaints:
            # Check if there is an identical category nearby
            same_cat = [n for n in nearby_complaints if n.category.lower() == category.lower()]
            if same_cat:
                duplicate_check_signal = f"potential_duplicate_cluster ({len(same_cat)} nearby)"
                duplicate_points = 7.0
                reasons.append(
                    f"Notice: {len(same_cat)} existing complaint(s) found within 150m for {category}. Suggest linking to existing cluster."
                )

        composite_score = round(auth_points + consistency_points + location_points + duplicate_points, 1)
        composite_score = max(5.0, min(99.0, composite_score))

        # 6. Determine Unified Evidence Status & Recommendation
        # Critical Principle: Missing metadata does not mean fraudulent!
        signals = {
            "authenticity": auth_result.assessment.value,
            "description_consistency": "consistent" if consistency_result.is_relevant else "inconsistent",
            "location_consistency": location_result.location_assessment,
            "duplicate_check": duplicate_check_signal
        }

        # Aggregate reasons from individual services
        reasons.extend(auth_result.reasons[:2])
        if consistency_result.discrepancies:
            reasons.extend(consistency_result.discrepancies)

        if auth_result.assessment == AuthenticityAssessment.POTENTIALLY_SYNTHETIC:
            evidence_status = EvidenceStatus.FLAGGED_SUSPICIOUS
            recommended_action = RecommendedAction.FLAG_FOR_FIELD_INSPECTION
            reasons.append("Evidence flagged for municipal officer manual review due to synthetic indicators.")
        elif location_result.location_assessment == "discrepancy_detected":
            evidence_status = EvidenceStatus.REQUIRES_REVIEW
            recommended_action = RecommendedAction.REQUEST_ADDITIONAL_EVIDENCE
            reasons.append("Requesting additional photo or officer location check due to coordinate mismatch.")
        elif composite_score >= 80.0 and auth_result.assessment == AuthenticityAssessment.AUTHENTIC_PHOTOGRAPH:
            evidence_status = EvidenceStatus.VERIFIED
            recommended_action = RecommendedAction.CONTINUE_WITH_STANDARD_REVIEW
            reasons.append("High evidence confidence. Ready for standard engineering triage and dispatch.")
        elif composite_score >= 60.0:
            evidence_status = EvidenceStatus.REQUIRES_REVIEW
            recommended_action = RecommendedAction.CONTINUE_WITH_STANDARD_REVIEW
            reasons.append("Evidence confidence acceptable for municipal review.")
        else:
            evidence_status = EvidenceStatus.INCONCLUSIVE
            recommended_action = RecommendedAction.REQUEST_ADDITIONAL_EVIDENCE
            reasons.append("Evidence inconclusive due to image quality or unverified location.")

        return UnifiedEvidenceResult(
            evidence_status=evidence_status,
            evidence_score=composite_score,
            signals=signals,
            reasons=reasons,
            recommended_action=recommended_action,
            authenticity_details=auth_result,
            consistency_details=consistency_result,
            location_details=location_result,
            nearby_duplicates=nearby_complaints,
            audit_timestamp=datetime.datetime.now(datetime.timezone.utc).isoformat()
        )
