import os
import json
import re
from dotenv import load_dotenv
import google.generativeai as genai

# ---------------- ENV ----------------
load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    raise RuntimeError("GEMINI_API_KEY not set")

genai.configure(api_key=API_KEY)

model = genai.GenerativeModel("gemini-1.5-flash")

# ---------------- ANALYSIS ----------------
def analyze_face_with_gemini(image_bytes: bytes) -> dict:
    prompt = """
You are an AI face analysis system.

Return ONLY valid JSON.
No markdown. No explanation. No text outside JSON.

Schema:
{
  "face_shape": "oval | round | square | heart | diamond",
  "skin_type": "oily | dry | normal | combination",
  "beard_suitable": true,
  "hairstyle_suggestions": ["string"],
  "glasses_suggestions": ["string"],
  "improvement_tips": ["string"]
}
"""

    response = model.generate_content([prompt, image_bytes])

    raw = response.text.strip()

    # 🔒 Extract JSON safely (LLM-proof)
    match = re.search(r"\{.*\}", raw, re.DOTALL)
    if not match:
        raise Exception("Gemini returned no JSON")

    json_text = match.group(0)

    try:
        return json.loads(json_text)
    except json.JSONDecodeError:
        raise Exception("Invalid JSON from Gemini")
