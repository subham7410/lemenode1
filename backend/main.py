from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io
import logging

from ai.gemini_analysis import analyze_face_with_gemini

# ---------------- LOGGING ----------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("main")

# ---------------- APP ----------------
app = FastAPI()

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
    return {"status": "Lemenode1 backend running"}

@app.post("/analyze")
async def analyze(image: UploadFile = File(None)):
    logger.info("📥 Analyze request received")

    # 1️⃣ Validate image presence
    if image is None:
        logger.warning("❌ Image missing")
        raise HTTPException(status_code=400, detail="Image is required")

    contents = await image.read()

    # 2️⃣ Validate empty image
    if not contents:
        logger.warning("❌ Empty image")
        raise HTTPException(status_code=400, detail="Empty image")

    # 3️⃣ Validate image format
    try:
        img = Image.open(io.BytesIO(contents))
        img.verify()
        img = Image.open(io.BytesIO(contents))  # reopen after verify
        logger.info(f"✅ Image OK: {img.width}x{img.height} {img.format}")
    except Exception as e:
        logger.error(f"❌ Invalid image: {e}")
        raise HTTPException(status_code=400, detail="Invalid image")

    # 4️⃣ Gemini analysis (SAFE)
    try:
        result = analyze_face_with_gemini(contents)
        logger.info("🤖 Gemini analysis success")
        return result
    except Exception as e:
        logger.error(f"🔥 Gemini failed: {e}")

        # ✅ NEVER crash the app
        return {
            "face_shape": "unknown",
            "skin_type": "unknown",
            "beard_suitable": False,
            "hairstyle_suggestions": [],
            "glasses_suggestions": [],
            "improvement_tips": [
                "Unable to analyze image clearly.",
                "Try good lighting and a straight front-facing photo."
            ]
        }
