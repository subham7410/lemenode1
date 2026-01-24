"""
AI-powered food analysis using Gemini.
Analyzes food photos and provides brutally honest nutritional feedback.
"""

import io
import json
import re
import logging
from typing import Dict, Any

from PIL import Image
from google import genai
from google.genai import types

from config import settings
from ai.gemini_analysis import get_gemini_client, optimize_image, call_gemini_with_retry

logger = logging.getLogger("food_analysis")


def analyze_food_with_gemini(
    image_bytes: bytes,
    user_context: Dict[str, Any] = None
) -> Dict[str, Any]:
    """
    Analyze food from a photo using Gemini AI.
    Returns nutritional data with brutally honest feedback.
    
    Args:
        image_bytes: The food photo
        user_context: Optional user data (age, diet preference, goals)
    
    Returns:
        Structured food analysis with calories, macros, and honest verdict
    """
    
    client = get_gemini_client()
    user_context = user_context or {}
    
    try:
        # Optimize image before analysis
        optimized_image = optimize_image(image_bytes)
        
        # Build the prompt
        diet_pref = user_context.get('diet', 'no restrictions')
        user_goal = user_context.get('goal', 'maintain health')
        
        prompt = f"""
You are a strict nutritionist analyzing a food photo. Be BRUTALLY HONEST. No sugarcoating.

USER CONTEXT:
- Diet preference: {diet_pref}
- Goal: {user_goal}

YOUR TASK:
Look at this food photo and provide a comprehensive, honest analysis.

RULES:
1. BE HARSH but professional - don't encourage bad eating habits
2. Estimate portions realistically - don't underestimate
3. If it's junk food, say so clearly
4. Point out long-term consequences of eating this regularly
5. Always suggest a healthier alternative

RETURN STRICT JSON (no markdown, no commentary):

{{
    "food_name": "What is this food? Be specific (e.g., 'Pepperoni Pizza, 2 large slices' not just 'Pizza')",
    "category": "one of: healthy, moderate, unhealthy",
    "health_score": <1-10, where 1 is terrible and 10 is excellent. Be honest - most processed food is 3-5>,
    
    "portion": "Estimated portion size with measurement",
    "calories": <estimated total calories as integer>,
    
    "macros": {{
        "protein": <grams as integer>,
        "carbs": <grams as integer>,
        "fat": <grams as integer>,
        "fiber": <grams as integer>,
        "sugar": <grams as integer>
    }},
    
    "nutrients": {{
        "good": ["List 2-3 beneficial nutrients if any"],
        "concerning": ["List concerning ingredients - sodium, saturated fat, added sugar, etc."]
    }},
    
    "verdict": "A 1-2 sentence honest assessment. Don't be nice if it's unhealthy.",
    
    "consequences": "What happens if you eat this regularly? Be specific about health impacts.",
    
    "skin_impact": "How does this food affect skin health specifically? (acne, inflammation, aging, etc.)",
    
    "better_alternative": "Suggest a healthier version or substitute that satisfies similar cravings.",
    
    "meal_timing": "Is this appropriate for the time of day? (breakfast, lunch, dinner, snack)",
    
    "portion_advice": "Is the portion size appropriate? Should they eat less?"
}}

SCORING GUIDE:
- 9-10: Whole foods, vegetables, lean proteins, no processing
- 7-8: Mostly healthy with minor concerns
- 5-6: Moderate - not great but not terrible
- 3-4: Unhealthy - processed, high sugar/fat, should be occasional
- 1-2: Very unhealthy - should rarely eat this

IMPORTANT: If you cannot identify the food clearly from the image, still provide your best estimate but note the uncertainty in the verdict.
"""

        # Call Gemini API
        logger.info("Analyzing food image with Gemini...")
        raw_text = call_gemini_with_retry(client, prompt, optimized_image)
        logger.info(f"Received food analysis ({len(raw_text)} chars)")
        
        # Extract JSON from response
        json_match = re.search(r'\{[\s\S]*\}', raw_text)
        if not json_match:
            logger.error("No JSON found in food analysis response")
            raise ValueError("Invalid response format from AI")
        
        data = json.loads(json_match.group(0))
        
        # Validate and ensure required fields
        data = validate_food_response(data)
        
        logger.info(f"Food analysis complete: {data.get('food_name')} - Score: {data.get('health_score')}")
        return data
        
    except json.JSONDecodeError as e:
        logger.error(f"JSON parse error in food analysis: {e}")
        raise Exception("Failed to parse food analysis response")
    except Exception as e:
        logger.error(f"Food analysis error: {e}")
        raise


def validate_food_response(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Validate and ensure all required fields exist in the food analysis.
    """
    
    # Required string fields
    required_strings = {
        "food_name": "Unknown food",
        "category": "moderate",
        "portion": "Unknown portion",
        "verdict": "Unable to provide assessment",
        "consequences": "Unknown",
        "skin_impact": "Unknown",
        "better_alternative": "No suggestion",
        "meal_timing": "Any time",
        "portion_advice": "Standard portion"
    }
    
    for key, default in required_strings.items():
        if key not in data or not data[key]:
            data[key] = default
    
    # Validate health_score
    if "health_score" not in data or not isinstance(data.get("health_score"), (int, float)):
        data["health_score"] = 5
    else:
        data["health_score"] = max(1, min(10, int(data["health_score"])))
    
    # Validate calories
    if "calories" not in data or not isinstance(data.get("calories"), (int, float)):
        data["calories"] = 200  # Default estimate
    else:
        data["calories"] = max(0, int(data["calories"]))
    
    # Validate macros
    if "macros" not in data or not isinstance(data.get("macros"), dict):
        data["macros"] = {"protein": 0, "carbs": 0, "fat": 0, "fiber": 0, "sugar": 0}
    else:
        for macro in ["protein", "carbs", "fat", "fiber", "sugar"]:
            if macro not in data["macros"] or not isinstance(data["macros"].get(macro), (int, float)):
                data["macros"][macro] = 0
            else:
                data["macros"][macro] = max(0, int(data["macros"][macro]))
    
    # Validate nutrients
    if "nutrients" not in data or not isinstance(data.get("nutrients"), dict):
        data["nutrients"] = {"good": [], "concerning": []}
    else:
        for key in ["good", "concerning"]:
            if key not in data["nutrients"] or not isinstance(data["nutrients"].get(key), list):
                data["nutrients"][key] = []
    
    # Validate category
    valid_categories = ["healthy", "moderate", "unhealthy"]
    if data.get("category") not in valid_categories:
        # Infer from health_score
        score = data.get("health_score", 5)
        if score >= 7:
            data["category"] = "healthy"
        elif score >= 4:
            data["category"] = "moderate"
        else:
            data["category"] = "unhealthy"
    
    return data


def generate_daily_summary_verdict(
    meals: list,
    total_calories: int,
    avg_health_score: float,
    user_context: Dict[str, Any] = None
) -> Dict[str, Any]:
    """
    Generate an AI verdict for the entire day's eating.
    Called at night to provide honest daily summary.
    
    Args:
        meals: List of food logs from the day
        total_calories: Total calories consumed
        avg_health_score: Average health score of meals
        user_context: User data for personalization
    
    Returns:
        Summary verdict with consequences and tomorrow's advice
    """
    
    client = get_gemini_client()
    user_context = user_context or {}
    
    # Build meal summary for the prompt
    meal_summary = []
    for meal in meals:
        meal_summary.append({
            "food": meal.get("food_name"),
            "calories": meal.get("calories"),
            "health_score": meal.get("health_score"),
            "category": meal.get("category"),
            "time": meal.get("logged_at", "unknown time")
        })
    
    prompt = f"""
You are a strict nutritionist reviewing someone's ENTIRE day of eating. Be BRUTALLY HONEST.

TODAY'S MEALS:
{json.dumps(meal_summary, indent=2)}

TOTALS:
- Total calories: {total_calories}
- Average health score: {avg_health_score:.1f}/10
- Meals logged: {len(meals)}

USER INFO:
- Diet preference: {user_context.get('diet', 'unknown')}
- Goal: {user_context.get('goal', 'general health')}

YOUR TASK:
Give an honest, professional assessment of today's eating. Don't sugarcoat.

RETURN STRICT JSON:

{{
    "overall_grade": "A/B/C/D/F - be honest",
    "verdict": "2-3 sentence honest summary of today's eating. Be direct.",
    "best_choice": "What was their best food choice today?",
    "worst_choice": "What was their worst food choice today?",
    "pattern_warning": "Any concerning patterns you notice? (late eating, too much sugar, etc.)",
    "consequences": "What are the specific health consequences of eating like this? (weight, skin, energy, etc.)",
    "tomorrow_advice": "3 specific actionable tips for tomorrow. Be practical.",
    "motivation": "One line of tough love motivation - not fake positivity, real talk."
}}
"""

    try:
        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=[prompt],
            config=types.GenerateContentConfig(
                temperature=0.7,
                max_output_tokens=1024,
            )
        )
        
        raw_text = response.text.strip()
        json_match = re.search(r'\{[\s\S]*\}', raw_text)
        
        if json_match:
            return json.loads(json_match.group(0))
        else:
            return {
                "overall_grade": "C",
                "verdict": "Could not generate detailed summary",
                "best_choice": meals[0].get("food_name") if meals else "None logged",
                "worst_choice": "Unable to determine",
                "consequences": "Track more meals for accurate assessment",
                "tomorrow_advice": "Log all your meals for better insights",
                "motivation": "Every day is a chance to do better."
            }
            
    except Exception as e:
        logger.error(f"Failed to generate daily summary: {e}")
        return {
            "overall_grade": "?",
            "verdict": "Unable to generate summary",
            "consequences": "Please try again later",
            "tomorrow_advice": "Keep tracking your meals",
            "motivation": "Consistency is key."
        }
