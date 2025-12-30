from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io
import logging

from ai.gemini_analysis import analyze_skin_with_gemini

# ---------------- LOGGING ----------------
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("main")

# ---------------- APP ----------------
app = FastAPI(title="Lemenode1 Skin Analysis API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- ROUTES ----------------
@app.get("/")
def root():
    """Health check endpoint"""
    return {
        "status": "Lemenode1 Skin Analysis API running",
        "version": "2.0.0",
        "endpoints": {
            "analyze": "/analyze (POST) - Upload image for skin analysis"
        }
    }

@app.post("/analyze")
async def analyze(image: UploadFile = File(None)):
    """
    Analyze skin using Gemini AI
    Returns: detailed skin analysis and recommendations
    """
    logger.info("📥 Skin analysis request received")
    logger.info(f"📎 Image filename: {image.filename if image else 'None'}")

    if image is None:
        logger.warning("❌ Image missing")
        raise HTTPException(status_code=400, detail="Image field is required")

    try:
        contents = await image.read()
        logger.info(f"📦 Image size: {len(contents)} bytes ({len(contents)/1024:.2f} KB)")
    except Exception as e:
        logger.error(f"❌ Failed to read image: {e}")
        raise HTTPException(status_code=400, detail="Failed to read image file")

    if not contents or len(contents) == 0:
        logger.warning("❌ Empty image")
        raise HTTPException(status_code=400, detail="Uploaded image is empty")

    try:
        img = Image.open(io.BytesIO(contents))
        img.verify()
        img = Image.open(io.BytesIO(contents))
        logger.info(f"✅ Image validated: {img.width}x{img.height} {img.format}")
    except Exception as e:
        logger.error(f"❌ Invalid image format: {e}")
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid or corrupted image file: {str(e)}"
        )

    try:
        logger.info("🤖 Starting Gemini skin analysis...")
        result = analyze_skin_with_gemini(contents)
        logger.info("✅ Gemini analysis completed successfully")
        
        result["status"] = "success"
        result["image_info"] = {
            "width": img.width,
            "height": img.height,
            "format": img.format
        }
        
        return result
        
    except Exception as e:
        logger.error(f"🔥 Gemini analysis failed: {e}")
        
        # Return mock data as fallback
        logger.info("⚠️ Returning fallback mock data")
        return {
            "status": "partial_success",
            "skin_type": "combination",
            "skin_tone": "medium",
            "overall_condition": "good",
            "visible_issues": [
                "AI analysis temporarily unavailable",
                "Please try again later"
            ],
            "positive_aspects": [
                "Image uploaded successfully",
                "Your photo quality is good"
            ],
            "recommendations": [
                "Use a gentle cleanser twice daily",
                "Apply sunscreen with SPF 30+ every day",
                "Stay hydrated - drink 8 glasses of water daily",
                "Get 7-8 hours of sleep"
            ],
            "product_suggestions": [
                "Gentle face cleanser for combination skin",
                "Lightweight moisturizer with hyaluronic acid",
                "Broad spectrum sunscreen SPF 30+",
                "Vitamin C serum for brightening"
            ],
            "lifestyle_tips": [
                "Maintain consistent skincare routine",
                "Avoid touching your face frequently",
                "Change pillowcase weekly",
                "Eat foods rich in antioxidants"
            ],
            "image_info": {
                "width": img.width,
                "height": img.height,
                "format": img.format
            },
            "error_note": f"AI temporarily unavailable: {str(e)}"
        }

@app.get("/health")
def health_check():
    """Detailed health check"""
    import os
    return {
        "status": "healthy",
        "gemini_api_configured": bool(os.getenv("GEMINI_API_KEY"))
    }