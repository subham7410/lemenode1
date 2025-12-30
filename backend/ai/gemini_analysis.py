import os
import json
import re
import io
import logging
from dotenv import load_dotenv
from PIL import Image
from google import genai
from google.genai import types

logger = logging.getLogger("gemini")

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def analyze_skin_with_gemini(image_bytes: bytes) -> dict:
    try:
        # Validate image
        img = Image.open(io.BytesIO(image_bytes))
        img.verify()
        img = Image.open(io.BytesIO(image_bytes))

        prompt = """
You are an expert dermatologist.

Analyze the person's facial skin from the image and return ONLY valid JSON.
If the image is unclear or face is not visible, still return valid JSON
and explain the issue inside "visible_issues".

JSON FORMAT:
{
  "skin_type": "oily | dry | normal | combination",
  "skin_tone": "fair | medium | olive | tan | deep",
  "overall_condition": "excellent | good | fair | needs attention",
  "visible_issues": [],
  "positive_aspects": [],
  "recommendations": [],
  "product_suggestions": [],
  "lifestyle_tips": []
}
"""

        response = client.models.generate_content(
            model="models/gemini-2.0-flash",
            contents=[
                prompt,
                types.Part.from_bytes(
                    data=image_bytes,
                    mime_type="image/jpeg"
                )
            ]
        )

        raw = response.text.strip()
        logger.info(f"Gemini raw response: {raw[:200]}")

        match = re.search(r"\{[\s\S]*\}", raw)
        if not match:
            raise ValueError("No JSON returned by Gemini")

        return json.loads(match.group(0))

    except Exception as e:
        logger.error(f"Gemini analysis failed: {e}")
        raise
