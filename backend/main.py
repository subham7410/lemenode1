from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io
import logging
import os

from ai.gemini_analysis import analyze_skin_with_gemini

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("main")

app = FastAPI(title="Lemenode1 Skin Analysis API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"status": "running", "version": "2.1.0"}

@app.post("/analyze")
async def analyze(image: UploadFile = File(...)):
    if not image:
        raise HTTPException(400, "Image required")

    contents = await image.read()
    if not contents:
        raise HTTPException(400, "Empty image")

    try:
        img = Image.open(io.BytesIO(contents))
        img.verify()
        img = Image.open(io.BytesIO(contents))
    except Exception:
        raise HTTPException(400, "Invalid image file")

    try:
        result = analyze_skin_with_gemini(contents)

        result["status"] = "success"
        result["image_info"] = {
            "width": img.width,
            "height": img.height,
            "format": img.format
        }

        return result

    except Exception as e:
        logger.error(f"AI failed: {e}")

        # Fallback response
        return {
            "status": "partial_success",
            "skin_type": "combination",
            "skin_tone": "medium",
            "overall_condition": "good",
            "visible_issues": ["AI temporarily unavailable"],
            "positive_aspects": ["Image received successfully"],
            "recommendations": [
                "Cleanse twice daily",
                "Use SPF 30+ sunscreen",
                "Stay hydrated"
            ],
            "product_suggestions": [
                "Gentle cleanser",
                "Lightweight moisturizer",
                "Broad-spectrum sunscreen"
            ],
            "lifestyle_tips": [
                "Sleep 7–8 hours",
                "Eat antioxidant-rich foods"
            ],
            "error_note": str(e)
        }

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "gemini_key_present": bool(os.getenv("GEMINI_API_KEY"))
    }
