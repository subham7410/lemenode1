"""
Multi-factor skin scoring algorithm.
Provides granular, meaningful scores based on 5 skin factors.
"""

import logging
from typing import Dict, Any

logger = logging.getLogger("skin_scorer")


# Scoring weights (total 50 points)
SCORE_WEIGHTS = {
    "texture": 12,      # Smoothness, pore visibility
    "hydration": 12,    # Moisture level, dryness
    "clarity": 12,      # Blemishes, acne, blackheads
    "tone": 8,          # Even pigmentation, dark spots
    "aging": 6,         # Fine lines (age-adjusted)
}

BASE_SCORE = 50  # Everyone starts with 50


def calculate_skin_score(
    gemini_factors: Dict[str, Any],
    user_age: int
) -> Dict[str, Any]:
    """
    Calculate multi-factor skin score from Gemini's factor ratings.
    
    Args:
        gemini_factors: Dict with texture, hydration, clarity, tone, aging ratings
        user_age: User's age for age-adjusted aging score
        
    Returns:
        {
            "total": 78,
            "label": "good",
            "breakdown": {
                "texture": {"score": 10, "max": 12, "percentage": 83},
                ...
            }
        }
    """
    breakdown = {}
    total_earned = 0
    
    for factor, max_points in SCORE_WEIGHTS.items():
        # Get raw score from Gemini (0-100 scale)
        raw_score = gemini_factors.get(factor, 50)
        
        # Normalize to factor's max points
        earned = round((raw_score / 100) * max_points)
        earned = max(0, min(max_points, earned))  # Clamp to valid range
        
        total_earned += earned
        
        breakdown[factor] = {
            "score": earned,
            "max": max_points,
            "percentage": round((earned / max_points) * 100)
        }
    
    # Calculate total score
    total_score = BASE_SCORE + total_earned
    total_score = max(50, min(100, total_score))
    
    # Determine label
    label = get_score_label(total_score)
    
    logger.info(f"Calculated score: {total_score} ({label}) - Breakdown: {breakdown}")
    
    return {
        "total": total_score,
        "label": label,
        "breakdown": breakdown
    }


def get_score_label(score: int) -> str:
    """Convert numeric score to human-readable label."""
    if score >= 90:
        return "excellent"
    elif score >= 75:
        return "good"
    elif score >= 60:
        return "fair"
    else:
        return "needs attention"


def parse_gemini_factors(analysis_text: str, visible_issues: list) -> Dict[str, int]:
    """
    Estimate factor scores if Gemini doesn't provide explicit ratings.
    Uses heuristics based on detected issues.
    """
    factors = {
        "texture": 70,
        "hydration": 70,
        "clarity": 70,
        "tone": 70,
        "aging": 70,
    }
    
    text_lower = analysis_text.lower() if analysis_text else ""
    issues_lower = " ".join(visible_issues).lower() if visible_issues else ""
    combined = text_lower + " " + issues_lower
    
    # Texture adjustments
    if any(word in combined for word in ["smooth", "soft", "refined"]):
        factors["texture"] += 15
    if any(word in combined for word in ["rough", "bumpy", "uneven texture", "large pores"]):
        factors["texture"] -= 20
    if any(word in combined for word in ["visible pores", "enlarged pores"]):
        factors["texture"] -= 10
    
    # Hydration adjustments
    if any(word in combined for word in ["hydrated", "moisturized", "plump"]):
        factors["hydration"] += 15
    if any(word in combined for word in ["dry", "flaky", "dehydrated"]):
        factors["hydration"] -= 20
    if any(word in combined for word in ["oily", "greasy", "shiny"]):
        factors["hydration"] -= 10  # Over-oily is also a hydration imbalance
    
    # Clarity adjustments
    if any(word in combined for word in ["clear", "blemish-free", "no acne"]):
        factors["clarity"] += 20
    if any(word in combined for word in ["acne", "pimple", "breakout"]):
        factors["clarity"] -= 25
    if any(word in combined for word in ["blackhead", "whitehead", "comedone"]):
        factors["clarity"] -= 15
    if any(word in combined for word in ["mild", "few", "minor"]):
        factors["clarity"] += 10  # Mitigates severity
    
    # Tone adjustments
    if any(word in combined for word in ["even tone", "uniform", "balanced"]):
        factors["tone"] += 15
    if any(word in combined for word in ["dark spot", "hyperpigmentation", "discoloration"]):
        factors["tone"] -= 20
    if any(word in combined for word in ["redness", "red patches", "inflammation"]):
        factors["tone"] -= 15
    
    # Aging adjustments
    if any(word in combined for word in ["youthful", "no lines", "firm"]):
        factors["aging"] += 15
    if any(word in combined for word in ["fine lines", "wrinkles", "crow"]):
        factors["aging"] -= 15
    if any(word in combined for word in ["sagging", "loose skin"]):
        factors["aging"] -= 20
    
    # Clamp all values to 0-100
    for factor in factors:
        factors[factor] = max(0, min(100, factors[factor]))
    
    return factors


def score_from_analysis(
    gemini_response: Dict[str, Any],
    user_age: int = 25
) -> Dict[str, Any]:
    """
    Main entry point: Calculate score from Gemini analysis response.
    
    If Gemini provides explicit factor ratings, use them.
    Otherwise, estimate from visible_issues and text analysis.
    """
    
    # Check if Gemini provided explicit factor ratings
    if "factor_ratings" in gemini_response:
        factors = gemini_response["factor_ratings"]
    else:
        # Estimate from visible issues and overall analysis
        visible_issues = gemini_response.get("visible_issues", [])
        positive_aspects = gemini_response.get("positive_aspects", [])
        all_text = " ".join(visible_issues + positive_aspects)
        factors = parse_gemini_factors(all_text, visible_issues)
    
    return calculate_skin_score(factors, user_age)
