from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io
import json
import logging
import os

from ai.gemini_analysis import analyze_skin_with_gemini

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("main")

app = FastAPI(title="Skin Analysis API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"status": "running", "version": "3.1.0"}

@app.post("/analyze")
async def analyze(
    image: UploadFile = File(...),
    user: str = Form(...)
):
    if not image:
        raise HTTPException(status_code=400, detail="Image required")

    image_bytes = await image.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Empty image")

    # Validate image
    try:
        img = Image.open(io.BytesIO(image_bytes))
        img.verify()
        img = Image.open(io.BytesIO(image_bytes))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image file")

    # Parse user JSON
    try:
        user_data = json.loads(user)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user data JSON")

    required_fields = ["age", "gender", "height", "weight", "diet"]
    missing = [f for f in required_fields if not user_data.get(f)]
    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"Missing fields: {', '.join(missing)}"
        )

    try:
        analysis = analyze_skin_with_gemini(
            image_bytes=image_bytes,
            user_data=user_data
        )

        # Ensure required frontend fields
        analysis["status"] = "success"
        analysis.setdefault("score", 70)

        analysis["image_info"] = {
            "width": img.width,
            "height": img.height,
            "format": img.format
        }

        return analysis

    except Exception as e:
        logger.error(f"Gemini failed: {e}")

        # SAFE fallback (frontend NEVER breaks)
        return {
            "status": "fallback",
            "score": 65,
            "skin_type": "combination",
            "skin_tone": "medium",
            "overall_condition": "good",
            "visible_issues": ["Temporary analysis issue"],
            "positive_aspects": ["Image received correctly"],
            "recommendations": [
                "Use a gentle cleanser twice daily",
                "Apply SPF 30+ sunscreen every morning",
                "Keep skin moisturized"
            ],
            "food": {
                "eat_more": [
                    "Leafy greens",
                    "Fruits rich in vitamin C",
                    "Nuts and seeds",
                    "Plenty of water"
                ],
                "limit": [
                    "Sugar",
                    "Fried foods",
                    "Alcohol"
                ]
            },
            "health": {
                "daily_habits": [
                    "Wash face before bed",
                    "Change pillow covers weekly",
                    "Stay hydrated"
                ],
                "routine": [
                    "AM: Cleanse → Moisturize → Sunscreen",
                    "PM: Cleanse → Moisturize"
                ]
            },
            "style": {
                "clothing": [
                    "Breathable cotton fabrics",
                    "Light colors for heat reduction"
                ],
                "accessories": [
                    "UV-protection sunglasses",
                    "Wide-brim hat"
                ]
            },
            "error_note": str(e)
        }

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "gemini_configured": bool(os.getenv("GEMINI_API_KEY"))
    }
