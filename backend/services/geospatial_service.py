import math
import time
import requests
from typing import Optional, Tuple, List, Dict, Any
from backend.models.schemas import LocationCoords, LocationVerificationResult, NearbyComplaint

# In-memory reverse-geocoding cache to respect Nominatim usage policy
GEOCODE_CACHE: Dict[str, Tuple[str, float]] = {}
CACHE_TTL_SECONDS = 3600 * 24  # 24 hour cache


class GeospatialVerificationService:
    """
    GeospatialVerificationService
    Handles Haversine distance computations, geographic corroboration,
    Nominatim reverse-geocoding, and duplicate spatial cluster detection.
    """

    EARTH_RADIUS_METERS = 6371000.0

    @classmethod
    def haversine_distance(cls, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """
        Calculates great-circle distance between two GPS coordinates in meters.
        """
        phi1 = math.radians(lat1)
        phi2 = math.radians(lat2)
        delta_phi = math.radians(lat2 - lat1)
        delta_lambda = math.radians(lon2 - lon1)

        a = (
            math.sin(delta_phi / 2.0) ** 2
            + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
        )
        c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
        return round(cls.EARTH_RADIUS_METERS * c, 1)

    @classmethod
    def verify_location_consistency(
        cls,
        reported_lat: float,
        reported_lon: float,
        reported_address: Optional[str] = None,
        gps_accuracy_m: Optional[float] = None,
        capture_lat: Optional[float] = None,
        capture_lon: Optional[float] = None,
        capture_accuracy_m: Optional[float] = None,
        metadata_lat: Optional[float] = None,
        metadata_lon: Optional[float] = None,
    ) -> LocationVerificationResult:
        """
        Cross-examines citizen-reported location, capture-time device GPS,
        and EXIF metadata coordinates.
        """
        warnings: List[str] = []
        rep_loc = LocationCoords(
            latitude=reported_lat,
            longitude=reported_lon,
            accuracy_meters=gps_accuracy_m,
            address=reported_address or "Lucknow, Uttar Pradesh",
            source="user_selected_pin"
        )

        cap_loc = None
        dist_rep_vs_cap = None
        if capture_lat is not None and capture_lon is not None:
            cap_loc = LocationCoords(
                latitude=capture_lat,
                longitude=capture_lon,
                accuracy_meters=capture_accuracy_m,
                source="device_camera_gps"
            )
            dist_rep_vs_cap = cls.haversine_distance(reported_lat, reported_lon, capture_lat, capture_lon)

        meta_loc = None
        dist_rep_vs_meta = None
        if metadata_lat is not None and metadata_lon is not None:
            meta_loc = LocationCoords(
                latitude=metadata_lat,
                longitude=metadata_lon,
                source="exif_image_metadata"
            )
            dist_rep_vs_meta = cls.haversine_distance(reported_lat, reported_lon, metadata_lat, metadata_lon)

        # Evaluation logic
        location_assessment = "unverified"
        rec_action = "continue_with_standard_review"

        if dist_rep_vs_cap is not None:
            if dist_rep_vs_cap <= 150.0:
                location_assessment = "consistent"
                warnings.append(f"Device capture GPS matches reported pin within {dist_rep_vs_cap:.1f} meters.")
            elif dist_rep_vs_cap > 500.0:
                location_assessment = "discrepancy_detected"
                warnings.append(
                    f"Noticeable geographic discrepancy: Image capture location is {dist_rep_vs_cap:.0f}m away from the reported pin."
                )
                rec_action = "flag_for_field_inspection"
            else:
                location_assessment = "acceptable_proximity"
                warnings.append(f"Image was captured {dist_rep_vs_cap:.0f}m from the reported complaint pin (within sector tolerance).")

        if dist_rep_vs_meta is not None:
            if dist_rep_vs_meta > 800.0:
                location_assessment = "discrepancy_detected"
                warnings.append(
                    f"Image EXIF GPS coordinates differ by {dist_rep_vs_meta:.0f}m from the selected address."
                )
                rec_action = "flag_for_field_inspection"

        if cap_loc is None and meta_loc is None:
            location_assessment = "unverified"
            warnings.append(
                "Independent capture-time GPS not available. Complaint location relies on citizen manual confirmation."
            )

        return LocationVerificationResult(
            location_assessment=location_assessment,
            reported_location=rep_loc,
            capture_location=cap_loc,
            metadata_location=meta_loc,
            distance_reported_vs_capture_m=dist_rep_vs_cap,
            distance_reported_vs_metadata_m=dist_rep_vs_meta,
            warnings=warnings,
            recommended_action=rec_action
        )

    @classmethod
    def reverse_geocode(cls, lat: float, lon: float) -> str:
        """
        Reverse geocodes coordinates to a human-readable street/locality name
        using OpenStreetMap Nominatim with memory caching.
        """
        cache_key = f"{round(lat, 4)},{round(lon, 4)}"
        now = time.time()
        if cache_key in GEOCODE_CACHE:
            cached_addr, ts = GEOCODE_CACHE[cache_key]
            if now - ts < CACHE_TTL_SECONDS:
                return cached_addr

        url = f"https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lon}&zoom=18&addressdetails=1"
        headers = {
            "User-Agent": "CivicFix-AI-Lucknow-Urban-Governance/1.0 (contact: civicfix@lda.up.gov.in)"
        }

        try:
            resp = requests.get(url, headers=headers, timeout=3.5)
            if resp.status_code == 200:
                data = resp.json()
                display_name = data.get("display_name")
                if display_name:
                    # Simplify verbose OSM address
                    parts = [p.strip() for p in display_name.split(",")]
                    short_addr = ", ".join(parts[:4])
                    GEOCODE_CACHE[cache_key] = (short_addr, now)
                    return short_addr
        except Exception:
            pass

        # Graceful fallback without hardcoded fake addresses
        fallback = f"Coordinates: {lat:.5f}°N, {lon:.5f}°E, Lucknow Urban Area"
        return fallback

    @classmethod
    def find_nearby_complaints(
        cls,
        target_lat: float,
        target_lon: float,
        existing_complaints: List[Dict[str, Any]],
        radius_meters: float = 150.0,
        target_category: Optional[str] = None
    ) -> List[NearbyComplaint]:
        """
        Searches existing complaints within a radius (default 150m)
        and detects potential duplicate incidents.
        """
        nearby: List[NearbyComplaint] = []
        for c in existing_complaints:
            c_lat = c.get("latitude")
            c_lon = c.get("longitude")
            if c_lat is None or c_lon is None:
                continue

            dist = cls.haversine_distance(target_lat, target_lon, float(c_lat), float(c_lon))
            if dist <= radius_meters:
                nearby.append(
                    NearbyComplaint(
                        id=c.get("id", "CFA-UNKNOWN"),
                        category=c.get("category", "General"),
                        description=c.get("desc") or c.get("description") or "",
                        location=c.get("location", ""),
                        latitude=float(c_lat),
                        longitude=float(c_lon),
                        distance_meters=round(dist, 1),
                        status=c.get("status", "under_review"),
                        created_at=c.get("createdAt", "2026-10-28")
                    )
                )

        # Sort by closest first
        nearby.sort(key=lambda x: x.distance_meters)
        return nearby
