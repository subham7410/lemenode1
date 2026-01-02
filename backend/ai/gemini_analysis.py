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

load_dotenv()

logger = logging.getLogger("gemini")
logging.basicConfig(level=logging.INFO)

# Initialize Gemini client
try:
    client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
    logger.info("Gemini client initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize Gemini: {e}")
    client = None

def analyze_skin_with_gemini(
    image_bytes: bytes,
    user: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Analyze skin using Gemini AI with comprehensive, personalized analysis
    """
    
    if not client:
        raise Exception("Gemini client not initialized - check API key")

    try:
        # Validate image
        img = Image.open(io.BytesIO(image_bytes))
        img.verify()
        img = Image.open(io.BytesIO(image_bytes))
        
        # Resize if too large (max 4MB for Gemini)
        max_size = (1920, 1920)
        if img.size[0] > max_size[0] or img.size[1] > max_size[1]:
            img.thumbnail(max_size, Image.Resampling.LANCZOS)
            buffer = io.BytesIO()
            img.save(buffer, format='JPEG', quality=85)
            image_bytes = buffer.getvalue()

        # Build comprehensive prompt with specific instructions
        prompt = f"""
You are Dr. Sarah Chen, a board-certified dermatologist with 15 years of experience in skincare analysis and personalized treatment plans. You have expertise in understanding how lifestyle, diet, and environmental factors affect skin health.

ANALYZE THIS PERSON'S FACIAL SKIN IN DETAIL:

PATIENT PROFILE:
• Age: {user.get('age', 'Not specified')} years old
• Gender: {user.get('gender', 'Not specified')}
• Height: {user.get('height', 'Not specified')} cm
• Weight: {user.get('weight', 'Not specified')} kg
• Dietary Preference: {user.get('diet', 'Not specified')}
• Ethnicity: {user.get('ethnicity', 'Not specified')}

CRITICAL ANALYSIS INSTRUCTIONS:
1. CAREFULLY examine the actual image - look at skin texture, tone, pores, any blemishes, oil levels, hydration
2. Consider the person's age, gender, and ethnicity when assessing what's normal vs concerning
3. Be SPECIFIC about what you see - mention exact locations (forehead, cheeks, chin, nose, etc.)
4. Provide ACTIONABLE advice based on their diet preference and lifestyle
5. Make recommendations that are PERSONALIZED to this individual, not generic
6. Be honest but encouraging - focus on achievable improvements

DETAILED OBSERVATION CHECKLIST:
- Skin texture: smooth, rough, bumpy, uneven?
- Pore visibility: enlarged on T-zone, cheeks?
- Oil production: shiny areas, matte areas?
- Hydration level: dry patches, flaky areas?
- Blemishes: location, severity, type (acne, blackheads, whiteheads)?
- Pigmentation: even tone, dark spots, redness?
- Fine lines or wrinkles: where visible?
- Overall complexion: bright, dull, tired-looking?

AGE-SPECIFIC CONSIDERATIONS:
- For teens (13-19): Focus on acne prevention, oil control, building good habits
- For 20s: Preventive care, sun protection, managing stress-related breakouts
- For 30s: Early anti-aging, hydration, addressing sun damage
- For 40s+: Anti-aging, firmness, deeper hydration, spot treatment

RETURN ONLY VALID JSON (NO MARKDOWN, NO EXPLANATION):

{{
  "skin_type": "oily|dry|normal|combination",
  "skin_tone": "fair|medium|olive|tan|deep",
  "overall_condition": "excellent|good|fair|needs attention",
  "score": 50-95,
  
  "visible_issues": [
    "SPECIFIC observation 1 with exact location (e.g., 'Visible enlarged pores on nose and center forehead')",
    "SPECIFIC observation 2 (e.g., 'Mild oiliness on T-zone with some shine on nose')",
    "SPECIFIC observation 3 (e.g., 'Few small whiteheads visible on left cheek area')",
    "SPECIFIC observation 4 if applicable"
  ],
  
  "positive_aspects": [
    "SPECIFIC positive 1 (e.g., 'Even skin tone across forehead and cheeks')",
    "SPECIFIC positive 2 (e.g., 'Good hydration visible around eye area')",
    "SPECIFIC positive 3 (e.g., 'Minimal signs of sun damage for age')"
  ],
  
  "recommendations": [
    "ACTIONABLE recommendation 1 with product type and reason (e.g., 'Use oil-free salicylic acid cleanser twice daily to control T-zone oiliness and prevent clogged pores')",
    "ACTIONABLE recommendation 2 (e.g., 'Apply lightweight hyaluronic acid serum before moisturizer to boost hydration without adding oil')",
    "ACTIONABLE recommendation 3 (e.g., 'Use clay mask once weekly specifically on nose and forehead to minimize pore appearance')",
    "ACTIONABLE recommendation 4 (e.g., 'Switch to gel-based moisturizer instead of cream to avoid excess shine')",
    "ACTIONABLE recommendation 5 with timing (e.g., 'Apply vitamin C serum in morning before sunscreen to brighten and protect')"
  ],
  
  "lifestyle_tips": [
    "SPECIFIC tip 1 related to their age/diet (e.g., 'As a vegetarian, ensure adequate zinc intake through pumpkin seeds and chickpeas for skin healing')",
    "SPECIFIC tip 2 (e.g., 'Change pillowcase every 2-3 days to reduce bacteria transfer to cheek area')",
    "SPECIFIC tip 3 (e.g., 'Drink water immediately after waking to flush toxins before breakfast')",
    "SPECIFIC tip 4 (e.g., 'Avoid touching face, especially T-zone, during day to prevent oil transfer')",
    "SPECIFIC tip 5 (e.g., 'Get 7-8 hours sleep consistently as skin repair happens during deep sleep cycles')"
  ],
  
  "food": {{
    "eat_more": [
      "SPECIFIC food 1 with skin benefit (e.g., 'Blueberries and strawberries - high in antioxidants to fight free radicals and improve skin texture')",
      "SPECIFIC food 2 (e.g., 'Walnuts and flaxseeds - omega-3 fatty acids reduce inflammation and support skin barrier')",
      "SPECIFIC food 3 (e.g., 'Sweet potatoes - beta-carotene acts as natural sunblock and improves skin tone')",
      "SPECIFIC food 4 (e.g., 'Greek yogurt - probiotics balance gut health which directly affects skin clarity')",
      "SPECIFIC food 5 (e.g., 'Bell peppers - vitamin C boosts collagen production for firmer skin')",
      "SPECIFIC food 6 (e.g., 'Green tea - EGCG antioxidants reduce redness and inflammation')",
      "SPECIFIC food 7 related to their diet preference"
    ],
    "limit": [
      "SPECIFIC food 1 with reason (e.g., 'White bread and pastries - high glycemic foods spike insulin causing increased oil production')",
      "SPECIFIC food 2 (e.g., 'Milk and cheese - dairy can trigger hormonal acne in some people')",
      "SPECIFIC food 3 (e.g., 'Chips and fried foods - trans fats cause inflammation and clogged pores')",
      "SPECIFIC food 4 (e.g., 'Soda and energy drinks - sugar causes glycation damaging collagen and elastin')",
      "SPECIFIC food 5 (e.g., 'Excessive coffee - over 2 cups daily can dehydrate skin and increase cortisol')"
    ]
  }},
  
  "health": {{
    "daily_habits": [
      "SPECIFIC habit 1 with time (e.g., 'Cleanse face within 1 hour of waking to remove overnight oil buildup')",
      "SPECIFIC habit 2 (e.g., 'Apply SPF 50 sunscreen every morning, even indoors, reapply every 2 hours if outside')",
      "SPECIFIC habit 3 (e.g., 'Remove makeup with oil-based cleanser before water-based cleanser for complete removal')",
      "SPECIFIC habit 4 (e.g., 'Pat face dry with clean towel - never rub which can irritate and spread bacteria')",
      "SPECIFIC habit 5 (e.g., 'Apply products in order: cleanser → toner → serum → moisturizer → sunscreen')"
    ],
    "routine": [
      "MORNING ROUTINE: Lukewarm water splash → gentle foaming cleanser → hydrating toner → vitamin C serum → lightweight moisturizer → SPF 50 sunscreen",
      "EVENING ROUTINE: Oil-based makeup remover → gentle foaming cleanser → exfoliating toner (3x weekly) → treatment serum → night moisturizer → spot treatment if needed",
      "WEEKLY TREATMENTS: Clay mask on T-zone (Sunday), gentle exfoliation (Wednesday, Saturday), overnight hydrating mask (Friday)",
      "MONTHLY: Evaluate progress, adjust products if needed, take progress photos in same lighting"
    ]
  }},
  
  "style": {{
    "clothing": [
      "SPECIFIC clothing 1 for their skin tone (e.g., 'Warm coral and peach tones complement your medium skin tone and make complexion glow')",
      "SPECIFIC clothing 2 (e.g., 'Soft blues and teals enhance natural skin brightness without washing out')",
      "SPECIFIC clothing 3 (e.g., 'Avoid heavy foundations and opt for breathable cotton fabrics that don't trap oil against skin')",
      "SPECIFIC clothing 4 (e.g., 'Choose scarves and collars that don't directly touch face to prevent breakouts from fabric friction')"
    ],
    "accessories": [
      "SPECIFIC accessory 1 (e.g., 'Oversized UV400 sunglasses to protect delicate eye area from UV damage and squinting lines')",
      "SPECIFIC accessory 2 (e.g., 'Silk or satin hair ties instead of rubber bands to prevent breakage and reduce facial oil transfer')",
      "SPECIFIC accessory 3 (e.g., 'Wide-brim hat for outdoor activities to minimize direct sun exposure on face')"
    ]
  }}
}}

SCORING GUIDE (Be realistic and honest):
- 85-95: Exceptional skin with minimal concerns, mostly preventive care needed
- 75-84: Good skin health with minor issues, targeted improvements recommended  
- 65-74: Fair condition with noticeable concerns, consistent routine needed
- 50-64: Needs attention with multiple issues, comprehensive approach required

REMEMBER: 
- Base your analysis on what you ACTUALLY SEE in the image
- Be specific about locations and observations
- Consider their age, gender, diet when making recommendations
- Provide actionable advice, not generic tips
- Be encouraging but honest
- Every person's skin is unique - avoid cookie-cutter responses
"""

        # Call Gemini API with higher temperature for more varied responses
        logger.info("Sending detailed analysis request to Gemini API...")
        
        response = client.models.generate_content(
            model="gemini-2.0-flash-exp",
            contents=[
                prompt,
                types.Part.from_bytes(
                    data=image_bytes,
                    mime_type="image/jpeg"
                )
            ],
            config=types.GenerateContentConfig(
                temperature=0.9,  # Higher temperature for more creative, varied responses
                top_p=0.95,
                top_k=40,
                max_output_tokens=4096,  # Increased for detailed responses
            )
        )

        raw_text = response.text.strip()
        logger.info(f"Received detailed response from Gemini ({len(raw_text)} chars)")

        # Extract JSON from response
        json_match = re.search(r'\{[\s\S]*\}', raw_text)
        if not json_match:
            logger.error("No JSON found in Gemini response")
            raise ValueError("Invalid response format from AI")

        data = json.loads(json_match.group(0))
        
        # Validate and ensure all required fields
        data = validate_and_fix_response(data, user)
        
        logger.info(f"Analysis successful - Score: {data.get('score')}, Issues: {len(data.get('visible_issues', []))}")
        return data

    except json.JSONDecodeError as e:
        logger.error(f"JSON parse error: {e}")
        raise Exception("Failed to parse AI response")
    except Exception as e:
        logger.error(f"Analysis error: {e}")
        raise


def validate_and_fix_response(data: Dict[str, Any], user: Dict[str, Any]) -> Dict[str, Any]:
    """Ensure response has all required fields with quality content"""
    
    # Ensure score is valid integer
    if not isinstance(data.get("score"), (int, float)):
        condition_scores = {
            "excellent": 88,
            "good": 78,
            "fair": 68,
            "needs attention": 58
        }
        data["score"] = condition_scores.get(
            data.get("overall_condition", "fair").lower(),
            70
        )
    
    data["score"] = max(50, min(95, int(data["score"])))
    
    # Ensure minimum quality of content
    if not data.get("visible_issues") or len(data.get("visible_issues", [])) < 2:
        data["visible_issues"] = [
            "Initial assessment shows areas that could benefit from targeted care",
            "Skin analysis indicates room for improvement with proper routine"
        ]
    
    if not data.get("positive_aspects") or len(data.get("positive_aspects", [])) < 2:
        data["positive_aspects"] = [
            "Overall healthy skin foundation to build upon",
            "Good potential for improvement with consistent care"
        ]
    
    if not data.get("recommendations") or len(data.get("recommendations", [])) < 4:
        data["recommendations"] = [
            "Establish a consistent cleansing routine morning and night",
            "Use appropriate moisturizer for your skin type",
            "Apply broad-spectrum SPF 30+ sunscreen daily",
            "Stay well-hydrated with 8+ glasses of water daily"
        ]
    
    # Ensure all required nested fields exist
    defaults = {
        "skin_type": "combination",
        "skin_tone": "medium",
        "overall_condition": "good",
        "food": {
            "eat_more": [
                "Leafy greens rich in vitamins A and C",
                "Berries packed with antioxidants",
                "Nuts and seeds for healthy fats",
                "Fatty fish or plant-based omega-3 sources",
                "Colorful vegetables for diverse nutrients"
            ],
            "limit": [
                "Processed foods high in sodium",
                "Excessive sugar and refined carbs",
                "Fried and greasy foods"
            ]
        },
        "health": {
            "daily_habits": [
                "Cleanse face twice daily with appropriate cleanser",
                "Apply sunscreen every morning as final step",
                "Remove makeup thoroughly before bed",
                "Moisturize while skin is still slightly damp"
            ],
            "routine": [
                "Morning: Cleanse → Tone → Serum → Moisturize → Sunscreen",
                "Evening: Cleanse → Exfoliate (2-3x weekly) → Treat → Moisturize",
                "Weekly: Deep cleansing mask or treatment"
            ]
        },
        "style": {
            "clothing": [
                "Colors that complement your natural skin tone",
                "Breathable, natural fabrics like cotton",
                "Sun-protective clothing for outdoor activities"
            ],
            "accessories": [
                "Quality UV-blocking sunglasses",
                "Wide-brim hat for sun protection"
            ]
        }
    }
    
    for key, default_value in defaults.items():
        if key not in data or not data[key]:
            data[key] = default_value
        elif isinstance(default_value, dict):
            for subkey, subdefault in default_value.items():
                if subkey not in data[key] or not data[key][subkey]:
                    data[key][subkey] = subdefault
    
    return data