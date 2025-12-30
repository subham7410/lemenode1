import os
import json
import re
from dotenv import load_dotenv
from google import genai
from google.genai import types
from PIL import Image
import io
import logging

logger = logging.getLogger("gemini")

# ---------------- ENV ----------------
load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    raise RuntimeError("⚠️ GEMINI_API_KEY not set in .env file")

client = genai.Client(api_key=API_KEY)

# ---------------- ANALYSIS ----------------
def analyze_skin_with_gemini(image_bytes: bytes) -> dict:
    """
    Analyze skin using Gemini Vision API
    Returns detailed skin analysis and recommendations
    """
    try:
        # ✅ Load and validate image
        img = Image.open(io.BytesIO(image_bytes))
        logger.info(f"📷 Processing image: {img.size} {img.format}")
        
        prompt = """
You are an expert dermatologist and skincare consultant.

Analyze this person's skin carefully and provide a comprehensive analysis.

Look for:
1. Skin type (oily, dry, normal, combination)
2. Skin tone and complexion
3. Any visible issues (acne, dark circles, uneven tone, wrinkles, dryness, etc.)
4. Skin texture and health
5. Specific recommendations to improve their skin

Return ONLY valid JSON with this exact structure:
{
  "skin_type": "oily | dry | normal | combination",
  "skin_tone": "fair | medium | olive | tan | deep",
  "overall_condition": "excellent | good | fair | needs attention",
  "visible_issues": [
    "issue 1 description",
    "issue 2 description"
  ],
  "positive_aspects": [
    "what looks good about their skin",
    "healthy features noticed"
  ],
  "recommendations": [
    "specific actionable recommendation 1",
    "specific actionable recommendation 2",
    "specific actionable recommendation 3"
  ],
  "product_suggestions": [
    "specific product type 1 (e.g., gentle cleanser for sensitive skin)",
    "specific product type 2",
    "specific product type 3"
  ],
  "lifestyle_tips": [
    "lifestyle tip 1",
    "lifestyle tip 2"
  ]
}

Be honest, helpful, and constructive. If the image quality is poor or no face is visible, mention it in visible_issues.
"""

        # ✅ FIXED: Correct API call format
        response = client.models.generate_content(
            model='gemini-1.5-flash',
            contents=[
                prompt,  # ✅ Just pass the prompt string
                types.Part.from_bytes(  # ✅ Then the image part
                    data=image_bytes,
                    mime_type="image/jpeg"
                )
            ]
        )
        
        raw = response.text.strip()
        logger.info(f"📝 Raw response: {raw[:200]}...")

        # 🔒 Extract JSON safely
        match = re.search(r"\{.*\}", raw, re.DOTALL)
        if not match:
            logger.error("❌ No JSON found in response")
            raise Exception("Gemini returned no valid JSON")

        json_text = match.group(0)

        # ✅ Parse and validate
        result = json.loads(json_text)
        
        # Ensure required fields exist
        required_fields = ["skin_type", "recommendations"]
        for field in required_fields:
            if field not in result:
                raise ValueError(f"Missing required field: {field}")
        
        logger.info("✅ Successfully parsed Gemini response")
        return result
        
    except json.JSONDecodeError as e:
        logger.error(f"❌ JSON parsing error: {e}")
        raise Exception("Invalid JSON from Gemini")
    except Exception as e:
        logger.error(f"❌ Gemini analysis error: {e}")
        raise Exception(f"AI analysis failed: {str(e)}")