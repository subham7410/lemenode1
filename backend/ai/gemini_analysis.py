import os
import io
import json
import re
import logging
import time
from typing import Dict, Any

from dotenv import load_dotenv
from PIL import Image
from google import genai
from google.genai import types

# Import centralized config
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import settings

load_dotenv()

logger = logging.getLogger("gemini")

# Initialize Gemini client (reused across requests)
_client = None


def get_gemini_client():
    """Get or create Gemini client (singleton pattern for connection reuse)."""
    global _client
    if _client is None:
        api_key = settings.GEMINI_API_KEY
        if not api_key:
            raise Exception("GEMINI_API_KEY not configured")
        _client = genai.Client(api_key=api_key)
        logger.info("Gemini client initialized successfully")
    return _client


def optimize_image(image_bytes: bytes) -> bytes:
    """
    Aggressively optimize image for faster processing and lower API costs.
    - Resize to max 1280x1280 (was 1920x1920)
    - Compress to 70% JPEG quality (was 85%)
    - Convert RGBA to RGB if needed
    """
    img = Image.open(io.BytesIO(image_bytes))
    
    # Convert RGBA to RGB (Gemini doesn't need alpha)
    if img.mode == 'RGBA':
        background = Image.new('RGB', img.size, (255, 255, 255))
        background.paste(img, mask=img.split()[3])
        img = background
    elif img.mode != 'RGB':
        img = img.convert('RGB')
    
    # Resize if too large
    max_size = settings.MAX_IMAGE_SIZE  # (1280, 1280) from config
    if img.size[0] > max_size[0] or img.size[1] > max_size[1]:
        img.thumbnail(max_size, Image.Resampling.LANCZOS)
        logger.info(f"Resized image to {img.size}")
    
    # Compress
    buffer = io.BytesIO()
    img.save(buffer, format='JPEG', quality=settings.IMAGE_QUALITY, optimize=True)
    optimized_bytes = buffer.getvalue()
    
    reduction = (1 - len(optimized_bytes) / len(image_bytes)) * 100
    logger.info(f"Image optimized: {len(image_bytes)} -> {len(optimized_bytes)} bytes ({reduction:.1f}% reduction)")
    
    return optimized_bytes


def call_gemini_with_retry(client, prompt: str, image_bytes: bytes) -> str:
    """
    Call Gemini API with retry logic and exponential backoff.
    """
    max_retries = settings.GEMINI_MAX_RETRIES
    
    for attempt in range(max_retries + 1):
        try:
            response = client.models.generate_content(
                model=settings.GEMINI_MODEL,
                contents=[
                    prompt,
                    types.Part.from_bytes(
                        data=image_bytes,
                        mime_type="image/jpeg"
                    )
                ],
                config=types.GenerateContentConfig(
                    temperature=0.9,
                    top_p=0.95,
                    top_k=40,
                    max_output_tokens=4096,
                )
            )
            return response.text.strip()
            
        except Exception as e:
            if attempt < max_retries:
                wait_time = (2 ** attempt) * 0.5  # 0.5s, 1s, 2s...
                logger.warning(f"Gemini API attempt {attempt + 1} failed: {e}. Retrying in {wait_time}s...")
                time.sleep(wait_time)
            else:
                logger.error(f"Gemini API failed after {max_retries + 1} attempts: {e}")
                raise


def analyze_skin_with_gemini(
    image_bytes: bytes,
    user: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Analyze skin using Gemini AI with comprehensive, personalized analysis.
    Includes image optimization and retry logic.
    """
    
    client = get_gemini_client()

    try:
        # Optimize image before sending to Gemini
        optimized_image = optimize_image(image_bytes)


        # Calculate BMI for health context
        try:
            height_m = float(user.get('height', 170)) / 100
            weight_kg = float(user.get('weight', 70))
            bmi = round(weight_kg / (height_m ** 2), 1)
            if bmi < 18.5:
                bmi_category = "underweight"
            elif bmi < 25:
                bmi_category = "healthy weight"
            elif bmi < 30:
                bmi_category = "overweight"
            else:
                bmi_category = "obese"
        except:
            bmi = None
            bmi_category = "unknown"
        
        # Get age for context
        age = int(user.get('age', 25))
        if age < 20:
            age_group = "teenager"
        elif age < 30:
            age_group = "young adult in their 20s"
        elif age < 40:
            age_group = "adult in their 30s"
        elif age < 50:
            age_group = "adult in their 40s"
        else:
            age_group = "mature adult over 50"
        
        # Build FREE-FORM prompt - no examples, let AI be creative and honest
        prompt = f"""
You are analyzing this person's skin as an expert dermatologist. Be BRUTALLY HONEST and HIGHLY SPECIFIC about what you observe.

PATIENT INFORMATION:
- Age: {user.get('age', 'Unknown')} years old ({age_group})
- Gender: {user.get('gender', 'Unknown')}  
- Height: {user.get('height', 'Unknown')} cm
- Weight: {user.get('weight', 'Unknown')} kg
- BMI: {bmi} ({bmi_category})
- Diet: {user.get('diet', 'Unknown')}
- Ethnicity: {user.get('ethnicity', 'Unknown')}

YOUR MISSION:
Look at this face image and tell me EXACTLY what you see. Don't sugarcoat. Don't give generic advice. Tell this person what THEY specifically need to know about THEIR skin.

OBSERVE AND DESCRIBE:
1. What's the first thing you notice about their skin? (good or bad)
2. Examine each zone: forehead, T-zone, nose, cheeks, chin, jawline, under-eyes
3. Rate the skin honestly - if it's average, say average. If it needs work, say so.
4. What are the TOP 3 things this person should focus on RIGHT NOW?
5. What products/ingredients would actually help THIS person?
6. What foods should THIS person eat based on their diet preference ({user.get('diet', 'standard')}) and skin issues?
7. What lifestyle changes would make the biggest difference for them?
8. What colors/styles would flatter their specific skin tone?

BE CREATIVE with your recommendations. Think outside the box. Don't just say "drink water" - give specific, actionable advice unique to this person.

RETURN STRICT JSON FORMAT (no markdown, no commentary):

{{
  "skin_type": "one of: oily, dry, normal, combination, sensitive",
  "skin_tone": "one of: fair, light, medium, olive, tan, deep, dark",
  "overall_condition": "one of: excellent, good, fair, poor, needs_attention",
  
  "first_impression": "What's the first thing that stands out about this skin? Be honest.",
  
  "factor_ratings": {{
    "texture": <0-100 honest score>,
    "hydration": <0-100 honest score>,
    "clarity": <0-100 honest score>,
    "tone": <0-100 honest score>,
    "aging": <0-100 age-appropriate score>
  }},
  
  "factor_notes": {{
    "texture": "Describe what you see - smooth, rough, pores, bumps? Where exactly?",
    "hydration": "Is the skin thirsty? Oily? Well-balanced? Which areas?",
    "clarity": "Any blemishes, spots, acne, blackheads? Be specific about location and severity",
    "tone": "Is the color even? Redness? Dark spots? Dullness? Where?",
    "aging": "Any lines, wrinkles, sagging? Appropriate for their age?"
  }},
  
  "visible_issues": [
    "List each issue you observe - be specific about what and where. Include 3-6 items.",
    "Use your own words, describe what you actually see in THIS face."
  ],
  
  "positive_aspects": [
    "What's working well? Every skin has good points - find them.",
    "Be genuine, not just generic compliments."
  ],
  
  "priority_fixes": [
    "The #1 thing this person should address first",
    "Second priority",
    "Third priority"
  ],
  
  "recommendations": [
    "5-7 specific product/ingredient recommendations with reasoning",
    "Tailor to their age, skin type, and concerns",
    "Include morning and evening suggestions",
    "Be specific about ingredient names (niacinamide, retinol, etc.)"
  ],
  
  "lifestyle_tips": [
    "4-6 lifestyle changes specific to their profile",
    "Consider their diet preference, BMI, and age",
    "Be practical and actionable"
  ],
  
  "food": {{
    "eat_more": [
      "5-7 foods that would specifically help THIS person's skin issues",
      "Must respect their diet preference: {user.get('diet', 'no restrictions')}",
      "Explain WHY each food helps their specific concerns"
    ],
    "avoid": [
      "3-5 foods to limit and why - relate to their specific skin issues"
    ]
  }},
  
  "health": {{
    "daily_habits": [
      "5 daily habits tailored to their skin type and concerns"
    ],
    "morning_routine": "A complete morning routine with specific product types",
    "evening_routine": "A complete evening routine with specific product types",
    "weekly_treatments": "1-2 weekly treatments for their needs"
  }},
  
  "style": {{
    "best_colors": [
      "3-4 specific colors that would complement their skin tone"
    ],
    "avoid_colors": [
      "2-3 colors that might wash them out or clash"
    ],
    "clothing_tips": [
      "2-3 clothing fabric or style tips related to skin health"
    ],
    "accessories": [
      "2-3 accessory recommendations"
    ]
  }},
  
  "honest_assessment": "Give a straight-talk summary. What's the real situation? What should they prioritize? Don't be mean, but be real."
}}

SCORING HONESTLY:
- 90-100: Exceptional skin, rarely give this score
- 75-89: Good skin with minor issues
- 60-74: Average skin with noticeable concerns
- 45-59: Below average, needs consistent work
- Below 45: Significant concerns, may need professional help

CRITICAL RULES:
1. DO NOT copy any example text - write everything fresh based on what you SEE
2. Be SPECIFIC - if you see an issue on the left cheek, say "left cheek"
3. Be HONEST - false positivity doesn't help anyone
4. Be USEFUL - every recommendation should be actionable TODAY
5. Be CREATIVE - don't repeat the same advice everyone gives
6. PERSONALIZE - use their age, diet, BMI in your recommendations
7. NO PLACEHOLDERS - every field must have real, specific content
"""

        # Call Gemini API with retry logic
        logger.info("Sending analysis request to Gemini API...")
        
        raw_text = call_gemini_with_retry(client, prompt, optimized_image)
        logger.info(f"Received response from Gemini ({len(raw_text)} chars)")

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
    """
    Validate response structure and ensure backwards compatibility with frontend.
    Maps new field names to old ones that frontend expects.
    """
    
    # Import skin scorer
    from ai.skin_scorer import score_from_analysis
    
    # Calculate multi-factor score
    user_age = int(user.get('age', 25))
    score_result = score_from_analysis(data, user_age)
    
    # Set score as object with breakdown
    data["score"] = score_result
    
    # Ensure required string fields have at least empty defaults (but don't override AI content)
    required_strings = {
        "skin_type": "unknown",
        "skin_tone": "unknown", 
        "overall_condition": "unknown",
        "first_impression": "",
        "honest_assessment": ""
    }
    
    for key, default in required_strings.items():
        if key not in data or data[key] is None:
            data[key] = default
    
    # Ensure required arrays exist (but don't override AI content with generic text)
    required_arrays = [
        "visible_issues", "positive_aspects", "recommendations", 
        "lifestyle_tips", "priority_fixes"
    ]
    
    for key in required_arrays:
        if key not in data or not isinstance(data.get(key), list):
            data[key] = []
    
    # Ensure nested objects exist with proper structure
    if "factor_ratings" not in data or not isinstance(data.get("factor_ratings"), dict):
        data["factor_ratings"] = {
            "texture": 50,
            "hydration": 50,
            "clarity": 50,
            "tone": 50,
            "aging": 50
        }
    
    if "factor_notes" not in data or not isinstance(data.get("factor_notes"), dict):
        data["factor_notes"] = {}
    
    # ============================================================
    # FOOD SECTION - Ensure both old and new field names work
    # ============================================================
    if "food" not in data or not isinstance(data.get("food"), dict):
        data["food"] = {"eat_more": [], "avoid": [], "limit": []}
    else:
        if "eat_more" not in data["food"]:
            data["food"]["eat_more"] = []
        
        # Handle avoid/limit - populate both for compatibility
        avoid_items = data["food"].get("avoid", []) or []
        limit_items = data["food"].get("limit", []) or []
        
        # Merge and set both fields
        all_avoid = avoid_items if avoid_items else limit_items
        data["food"]["avoid"] = all_avoid
        data["food"]["limit"] = all_avoid  # Frontend expects "limit"
    
    # ============================================================
    # HEALTH SECTION - Ensure routine array exists for frontend
    # ============================================================
    if "health" not in data or not isinstance(data.get("health"), dict):
        data["health"] = {
            "daily_habits": [],
            "morning_routine": "",
            "evening_routine": "",
            "weekly_treatments": "",
            "routine": []
        }
    else:
        if "daily_habits" not in data["health"]:
            data["health"]["daily_habits"] = []
        
        # Build routine array from new fields for frontend compatibility
        routine = []
        if data["health"].get("morning_routine"):
            routine.append(f"MORNING: {data['health']['morning_routine']}")
        if data["health"].get("evening_routine"):
            routine.append(f"EVENING: {data['health']['evening_routine']}")
        if data["health"].get("weekly_treatments"):
            routine.append(f"WEEKLY: {data['health']['weekly_treatments']}")
        
        # If AI returned old format, use it; otherwise use built routine
        if "routine" not in data["health"] or not data["health"]["routine"]:
            data["health"]["routine"] = routine if routine else [
                "Morning: Cleanse → Moisturize → Sunscreen",
                "Evening: Cleanse → Treat → Moisturize"
            ]
    
    # ============================================================
    # STYLE SECTION - Ensure clothing array exists for frontend
    # ============================================================
    if "style" not in data or not isinstance(data.get("style"), dict):
        data["style"] = {
            "best_colors": [],
            "avoid_colors": [],
            "clothing_tips": [],
            "clothing": [],
            "accessories": []
        }
    else:
        # Ensure all fields exist
        for field in ["best_colors", "avoid_colors", "clothing_tips", "accessories"]:
            if field not in data["style"]:
                data["style"][field] = []
        
        # Build clothing array for frontend compatibility
        clothing = []
        if data["style"].get("best_colors"):
            clothing.append(f"Best colors: {', '.join(data['style']['best_colors'][:3])}")
        if data["style"].get("avoid_colors"):
            clothing.append(f"Avoid colors: {', '.join(data['style']['avoid_colors'][:2])}")
        if data["style"].get("clothing_tips"):
            clothing.extend(data["style"]["clothing_tips"])
        
        # If AI returned old format, use it; otherwise use built clothing
        if "clothing" not in data["style"] or not data["style"]["clothing"]:
            data["style"]["clothing"] = clothing if clothing else data["style"].get("clothing_tips", [])
    
    logger.info(f"Validated response - Score: {score_result.get('total', 'N/A')}")
    return data