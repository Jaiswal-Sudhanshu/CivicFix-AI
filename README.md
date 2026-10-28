# 🏛️ CivicFix AI — Municipal Civic Defect & Intelligence Platform

[![Python](https://img.shields.io/badge/Python-3.11%20%7C%203.14-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19.3-61DAFB.svg)](https://react.dev)
[![Leaflet](https://img.shields.io/badge/Leaflet-OpenStreetMap-199900.svg)](https://leafletjs.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**CivicFix AI** is an advanced municipal artificial intelligence and civic defect management platform engineered for the **Lucknow Development Authority (LDA)**. It connects citizens and municipal authorities through two dedicated role-specific portals:
1. **Citizen Snapper**: Live camera capture, interactive Leaflet GPS geotagging, multimodal AI defect triage, and evidence confidence tracking.
2. **Official Authority (LDA)**: Municipal command dashboard, AI image forensics & synthetic detection audit, spatial duplicate clustering, and one-click rapid repair fleet dispatch.

---

## 🌟 Core System Capabilities

### 1. 🛡️ AI Image Authenticity & Forensics
- **Image Quality Metrics**: Real-time validation of dimensions, file size, high-frequency edge sharpness, and compression artifacts.
- **Hardware EXIF Geospatial Extraction**: Extracts camera make/model, timestamps, and GPS metadata.
- **Forensic Assessment Engine**: Scans software tags, visual noise variance, and diffusion generation signatures to distinguish authentic physical captures from AI-generated (Midjourney, DALL-E, Stable Diffusion) or digitally edited imagery.
- **Semantic Consistency Check**: Validates whether visual defect characteristics match the reported civic category (Roads, Sanitation, Lighting, Water, Drainage).

### 2. 📍 Live Geotagging & Real-World GPS Verification
- **Interactive Leaflet Map**: Powered by OpenStreetMap with draggable pin markers and sector boundary views.
- **Use My Current Location**: Uses browser `navigator.geolocation` with `enableHighAccuracy: true` and live accuracy readouts (e.g., `±8m accuracy`).
- **Free Reverse Geocoding**: Powered by OpenStreetMap Nominatim with caching and safe offline fallback.
- **Geospatial Corroboration**: Haversine distance cross-examination comparing **Citizen Reported Location** vs. **Camera Capture GPS** vs. **EXIF Metadata Coordinates**.
- **Duplicate Cluster Detection**: Automatic radial search (150m) against the municipal database to identify repeat reports without discarding individual citizen voices.

### 3. 🎯 Unified Evidence Confidence Score
- Combines available evidence signals into an explainable **Evidence Confidence Score** (0–100):
  - **Forensic Authenticity**: 40%
  - **Semantic Consistency**: 25%
  - **Geographic Corroboration**: 25%
  - **Duplicate Incident Sanity**: 10%
- Formulates human-readable reasons and actionable recommendations:
  - `continue_with_standard_review`
  - `request_additional_evidence`
  - `flag_for_field_inspection`

### 4. 🔐 Role-Based Access & Synchronized Auth
- Dedicated role-tailored menu bars for **Citizen Snapper** and **Official Authority (LDA)**.
- Browser URL synchronization for `/signin` and `/signup` with seamless `popstate` back/forward navigation.
- Security-enforced official command center preventing unauthorized citizen access.

---

## 🏗️ System Architecture

```
Citizen / Camera Pinpoint
           │
           ▼
┌──────────────────────────────────────────────┐
│        Frontend React + Leaflet SPA          │
│   - Live Camera Capture (getUserMedia)       │
│   - Real-world Device Geolocation            │
│   - Interactive OpenStreetMap Pin Selector   │
└──────────────────────┬───────────────────────┘
                       │ JSON REST / multipart
                       ▼
┌──────────────────────────────────────────────┐
│        Backend FastAPI Engine (:8000)        │
│ ├─ ImageAuthenticityService (Forensics)      │
│ ├─ EvidenceConsistencyService (Semantics)   │
│ ├─ GeospatialVerificationService (Haversine) │
│ └─ UnifiedEvidenceService (0-100 Score)      │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│         Official Authority Portal            │
│   - Municipal Command Dashboard (KPIs)       │
│   - Forensic Evidence Audit Modal            │
│   - 1-Click Crew Dispatch Station            │
│   - Immutable Decision Audit Registry        │
└──────────────────────────────────────────────┘
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (v18+) & **npm**
- **Python** (v3.11+)

### 1. Clone & Set Up Backend
```bash
git clone https://github.com/Jaiswal-Sudhanshu/CivicFix-AI.git
cd CivicFix-AI

# Create virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install backend dependencies
pip install -r backend/requirements.txt

# Run automated tests
pytest -o pythonpath=. backend/tests/test_evidence_and_location.py -v

# Start FastAPI server
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
Backend API will be live at: `http://127.0.0.1:8000` (Docs: `http://127.0.0.1:8000/docs`).

### 2. Set Up & Run Frontend
```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
Frontend Web Application will be live at: `http://localhost:5173/`.

---

## 🧪 Automated Test Suite (11/11 Passing)

```bash
pytest -o pythonpath=. backend/tests/test_evidence_and_location.py -v
```

### Verified Test Cases:
- `test_valid_image_decoding_and_quality`: Validates dimensions, format, file size, and sharpness index.
- `test_unsupported_image_format_rejection`: Rejects invalid/corrupted headers.
- `test_tiny_image_dimension_rejection`: Enforces minimum visual detail standards (min 80x80px).
- `test_authenticity_assessment_structure`: Validates forensic schema and humble limitation disclosures.
- `test_haversine_distance_accuracy`: Validates geodesic accuracy between Lucknow landmarks.
- `test_location_consistency_with_close_capture`: Verifies device capture proximity within sector.
- `test_location_discrepancy_detection`: Flags coordinate divergence (>500m) between camera and pin.
- `test_nearby_complaints_search`: Tests spatial radial clustering for duplicate detection.
- `test_api_health_check`: Verifies `/api/health` status.
- `test_api_verify_evidence_endpoint`: End-to-end integration test of unified verification pipeline.
- `test_official_review_decision_and_audit`: Verifies administrative decision recording and audit logging.

---

## 📡 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health check |
| `POST` | `/api/evidence/verify` | Unified evidence verification (quality, forensics, consistency, GPS) |
| `GET` | `/api/location/reverse-geocode` | Cached OpenStreetMap Nominatim reverse geocoding |
| `GET` | `/api/complaints/nearby` | Radial proximity search for duplicate detection |
| `GET` | `/api/complaints` | Grievance registry with evidence records |
| `POST` | `/api/complaints` | Citizen complaint submission |
| `POST` | `/api/official/complaints/{id}/review-evidence` | Official administrative decision & audit logging |
| `GET` | `/api/official/audit-logs` | Immutable municipal decision audit trail |

---

## ☁️ Deployment on Render

The repository includes a production-ready `render.yaml` blueprint:
1. Push this repository to GitHub.
2. Link the repository in **Render Dashboard** as a **Blueprint**.
3. Render automatically provisions:
   - **Backend**: Python FastAPI Web Service (`uvicorn backend.main:app`) with `/api/health`.
   - **Frontend**: Static Site hosting the optimized React SPA bundle (`frontend/dist`).

---

## 👥 Hackathon Credentials (Demo Mode)

- **Citizen Snapper**: `priya.sharma@lucknow.in` (Password: `citizen123`)
- **Official Authority (LDA)**: `vikram.singh@lda.up.gov.in` (Password: `official123`)
*(1-Click Demo Login and Autofill buttons are also provided in the UI for effortless evaluator access).*

---

## 📄 License
MIT License. Built with ❤️ for the Lucknow Urban Governance Hackathon.
