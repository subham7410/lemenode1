import os
import io
import json
import re
import logging
from typing import Dict, Any

from dotenv import load_dotenv
from PIL import Image
from google import genai
from google.genai import types

# -----------------------
# Setup
# -----------------------

load_dotenv()

logger = logging.getLogger("gemini")
logging.basicConfig(level=logging.INFO)

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

# -----------------------
# MAIN ANALYSIS FUNCTION
# -----------------------

def analyze_skin_with_gemini(
    image_bytes: bytes,
    user: Dict[str, Any]
) -> Dict[str, Any]:
    """
    image_bytes : uploaded image bytes
    user        : {
        age, gender, height, weight, diet, ethnicity
    }
    """

    try:
        # -----------------------
        # Image validation
        # -----------------------
        img = Image.open(io.BytesIO(image_bytes))
        img.verify()
        img = Image.open(io.BytesIO(image_bytes))

        # -----------------------
        # Gemini Prompt
        # -----------------------
        prompt = f"""
You are a professional dermatologist, nutrition advisor, and personal grooming expert.

Analyze the person's facial skin from the image and the provided user information.

USER INFORMATION:
- Age: {user.get("age")}
- Gender: {user.get("gender")}
- Height (cm): {user.get("height")}
- Weight (kg): {user.get("weight")}
- Diet: {user.get("diet")}
- Ethnicity: {user.get("ethnicity")}

RULES (VERY IMPORTANT):
- Return ONLY valid JSON
- Do NOT add explanations or markdown
- Always return ALL fields
- If unsure, make a best realistic guess
- Avoid medical claims
- Keep advice practical and achievable

RETURN JSON IN THIS EXACT FORMAT:

{{
  "skin_type": "oily | dry | normal | combination",
  "skin_tone": "fair | medium | olive | tan | deep",
  "overall_condition": "excellent | good | fair | needs attention",
  "score": 0-100,

  "visible_issues": [
    "example: mild acne on cheeks",
    "example: oily T-zone"
  ],

  "positive_aspects": [
    "example: clear forehead",
    "example: even skin texture"
  ],

  "recommendations": [
    "example: use gentle foaming cleanser twice daily",
    "example: avoid harsh scrubs"
  ],

  "lifestyle_tips": [
    "example: sleep 7–8 hours consistently",
    "example: drink 2–3L water daily"
  ],

  "food": {{
    "eat_more": [
      "example: leafy greens",
      "example: nuts and seeds",
      "example: fruits rich in vitamin C"
    ],
    "limit": [
      "example: fried food",
      "example: sugary drinks"
    ]
  }},

  "health": {{
    "daily_habits": [
      "example: use sunscreen every morning",
      "example: avoid touching face frequently"
    ],
    "routine": [
      "example: cleanse morning and night",
      "example: moisturize after washing"
    ]
  }},

  "style": {{
    "clothing": [
      "example: pastel solid shirts",
      "example: breathable cotton fabrics"
    ],
    "accessories": [
      "example: UV protection sunglasses",
      "example: minimal wristwatch"
    ]
  }}
}}
"""

        # -----------------------
        # Gemini Call
        # -----------------------
        response = client.models.generate_content(
            model="models/gemini-2.0-flash",
            contents=[
                prompt,
                types.Part.from_bytes(
                    data=image_bytes,
                    mime_type="image/jpeg"
                )
            ],
        )

        raw = response.text.strip()
        logger.info("Gemini raw response received")

        # -----------------------
        # Extract JSON safely
        # -----------------------
        match = re.search(r"\{[\s\S]*\}", raw)
        if not match:
            raise ValueError("Gemini did not return valid JSON")

        data = json.loads(match.group(0))

        # -----------------------
        # SAFETY FALLBACKS
        # -----------------------

        # Score fallback
        if not isinstance(data.get("score"), int):
            condition_map = {
                "excellent": 90,
                "good": 80,
                "fair": 65,
                "needs attention": 50
            }
            data["score"] = condition_map.get(
                data.get("overall_condition", "fair"),
                65
            )

        # Ensure food structure
        data.setdefault("food", {"eat_more": [], "limit": []})
        data.setdefault("health", {"daily_habits": [], "routine": []})
        data.setdefault("style", {"clothing": [], "accessories": []})

        return data

    except Exception as e:
        logger.error(f"Gemini analysis failed: {e}")

        # -----------------------
        # HARD FAIL SAFE RESPONSE
        # -----------------------
        return {
            "skin_type": "unknown",
            "skin_tone": "unknown",
            "overall_condition": "needs attention",
            "score": 60,

            "visible_issues": [
                "Image unclear or face not fully visible"
            ],
            "positive_aspects": [],
            "recommendations": [],
            "lifestyle_tips": [],

            "food": {
                "eat_more": [],
                "limit": []
            },
            "health": {
                "daily_habits": [],
                "routine": []
            },
            "style": {
                "clothing": [],
                "accessories": []
            }
        }
