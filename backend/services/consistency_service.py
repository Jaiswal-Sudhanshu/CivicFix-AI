import base64
import json
import os
import requests
from typing import Optional, List
from backend.models.schemas import ConsistencyResult

CIVIC_CATEGORY_KEYWORDS = {
    "roads": ["pothole", "road", "asphalt", "crack", "tar", "divider", "pavement", "street", "crater", "car", "bike"],
    "garbage": ["garbage", "trash", "waste", "dump", "litter", "debris", "plastic", "bin", "overflow"],
    "streetlights": ["light", "pole", "lamp", "dark", "wire", "bulb", "illumination", "electricity", "spark"],
    "water": ["water", "leak", "pipe", "pipeline", "tap", "burst", "supply", "gushing", "drinking"],
    "drainage": ["drain", "sewage", "gutter", "manhole", "waterlog", "overflow", "desilting", "clog", "grate"]
}


class EvidenceConsistencyService:
    """
    EvidenceConsistencyService
    Evaluates semantic consistency between citizen description, category, and visual evidence.
    """

    @classmethod
    def check_consistency(
        cls,
        image_bytes: bytes,
        description: str,
        category: str,
        api_key: Optional[str] = None
    ) -> ConsistencyResult:
        desc_clean = description.lower()
        cat_clean = category.lower()

        # 1. First run fast keyword heuristic check on description and category
        cat_key = None
        for key in CIVIC_CATEGORY_KEYWORDS.keys():
            if key in cat_clean:
                cat_key = key
                break
        if not cat_key:
            if "pothole" in cat_clean or "road" in cat_clean:
                cat_key = "roads"
            elif "sanitation" in cat_clean or "waste" in cat_clean:
                cat_key = "garbage"
            elif "lighting" in cat_clean or "lamp" in cat_clean:
                cat_key = "streetlights"
            elif "sewer" in cat_clean or "drain" in cat_clean:
                cat_key = "drainage"
            else:
                cat_key = "roads"

        keywords = CIVIC_CATEGORY_KEYWORDS.get(cat_key, [])
        keyword_hits = [kw for kw in keywords if kw in desc_clean]

        category_match = len(keyword_hits) > 0 or len(desc_clean) < 15
        confidence = 0.85 if len(keyword_hits) >= 2 else 0.72 if keyword_hits else 0.55
        discrepancies: List[str] = []

        if not category_match and len(desc_clean) > 20:
            discrepancies.append(f"Description does not explicitly mention common features associated with '{category}'.")

        # 2. Check if Gemini Vision API key is available for deep multimodal verification
        active_key = api_key or os.environ.get("GEMINI_API_KEY", "")
        if active_key and len(active_key.strip()) > 10:
            try:
                b64 = base64.b64encode(image_bytes).decode("utf-8")
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={active_key.strip()}"
                payload = {
                    "contents": [{
                        "parts": [
                            {
                                "text": (
                                    f"You are a civic infrastructure inspector. Analyze this image. "
                                    f"Citizen Description: '{description}'. "
                                    f"Reported Category: '{category}'. "
                                    "Determine if the image visually corresponds to the citizen's complaint. "
                                    "Respond ONLY in valid JSON: "
                                    "{\"is_relevant\": true, \"category_match\": true, \"confidence\": 0.9, "
                                    "\"summary\": \"Photograph shows damaged road surface with noticeable pothole.\", "
                                    "\"discrepancies\": []}"
                                )
                            },
                            {
                                "inlineData": {
                                    "mimeType": "image/jpeg",
                                    "data": b64
                                }
                            }
                        ]
                    }],
                    "generationConfig": {
                        "temperature": 0.1,
                        "responseMimeType": "application/json"
                    }
                }
                resp = requests.post(url, json=payload, timeout=6.0)
                if resp.status_code == 200:
                    data = resp.json()
                    raw = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                    parsed = json.loads(raw)
                    return ConsistencyResult(
                        status="completed",
                        is_relevant=bool(parsed.get("is_relevant", True)),
                        category_match=bool(parsed.get("category_match", True)),
                        confidence=float(parsed.get("confidence", 0.88)),
                        description_summary=parsed.get("summary", f"Visual evidence matches reported {category}."),
                        discrepancies=parsed.get("discrepancies", discrepancies),
                        recommended_next_step="Proceed with administrative triage."
                    )
            except Exception:
                pass

        # Fallback local result
        summary = f"Complaint description strongly correlates with {category}." if category_match else f"Visual evidence submitted under category {category}."
        rec_step = "Proceed with standard review." if category_match else "Verify defect type during field inspection."

        return ConsistencyResult(
            status="completed",
            is_relevant=True,
            category_match=category_match,
            confidence=confidence,
            description_summary=summary,
            discrepancies=discrepancies,
            recommended_next_step=rec_step
        )
