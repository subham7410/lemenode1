from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io
import logging

# ✅ Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"status": "Lemenode1 backend running"}

@app.post("/analyze")
async def analyze(image: UploadFile = File(None)):
    logger.info(f"Received analyze request: {image}")
    
    if image is None:
        logger.warning("No image file provided")
        raise HTTPException(
            status_code=400,
            detail="Image field is missing in request"
        )

    contents = await image.read()
    
    if not contents:
        logger.warning("Empty image file received")
        raise HTTPException(
            status_code=400,
            detail="Uploaded image is empty"
        )

    # ✅ Better validation
    try:
        img = Image.open(io.BytesIO(contents))
        img.verify()
        
        # Reopen for actual processing (verify closes the image)
        img = Image.open(io.BytesIO(contents))
        
        logger.info(f"Valid image received: {img.size}, {img.format}")
        
    except Exception as e:
        logger.error(f"Invalid image: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail=f"Invalid image file: {str(e)}"
        )

    # ✅ Temporary mock response
    return {
        "face_shape": "oval",
        "skin_type": "oily",
        "beard_suitable": True,
        "image_info": {
            "width": img.width,
            "height": img.height,
            "format": img.format
        }
    }