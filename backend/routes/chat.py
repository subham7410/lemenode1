"""
Chat routes for AI-powered skin analysis follow-up questions.
Users can ask questions about their analysis results.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import logging

from auth.dependencies import get_current_user
from auth.models import CurrentUser
from db.scans import get_user_scans
from config import settings

# Gemini imports
from google import genai
from google.genai import types

logger = logging.getLogger("routes.chat")

router = APIRouter(prefix="/chat", tags=["Chat"])

# Gemini client singleton
_chat_client = None


def get_chat_client():
    """Get or create Gemini client for chat."""
    global _chat_client
    if _chat_client is None:
        api_key = settings.GEMINI_API_KEY
        if not api_key:
            raise Exception("GEMINI_API_KEY not configured")
        _chat_client = genai.Client(api_key=api_key)
    return _chat_client


class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str
    scan_context: Optional[Dict[str, Any]] = None  # Latest scan data for context
    history: Optional[List[ChatMessage]] = None  # Conversation history (None by default, not [])


class ChatResponse(BaseModel):
    reply: str
    suggestions: List[str]  # Follow-up question suggestions


# Pre-defined suggestion templates based on context
SUGGESTION_TEMPLATES = {
    "general": [
        "What products should I use?",
        "How long until I see improvement?",
        "Is this concern serious?",
    ],
    "acne": [
        "What causes my acne?",
        "Should I see a dermatologist?",
        "What ingredients help with acne?",
    ],
    "dryness": [
        "How can I hydrate my skin more?",
        "What's the best moisturizer type for me?",
        "Does diet affect skin hydration?",
    ],
    "aging": [
        "When should I start anti-aging products?",
        "What's the best retinol routine?",
        "Are there natural anti-aging options?",
    ],
}


def build_chat_prompt(message: str, scan_context: Optional[Dict], history: List[ChatMessage]) -> str:
    """Build a context-aware prompt for the chat."""
    
    # Build context from scan data
    context_parts = []
    
    if scan_context:
        context_parts.append("USER'S LATEST SKIN ANALYSIS:")
        if scan_context.get("skin_type"):
            context_parts.append(f"- Skin Type: {scan_context['skin_type']}")
        if scan_context.get("skin_tone"):
            context_parts.append(f"- Skin Tone: {scan_context['skin_tone']}")
        if scan_context.get("overall_condition"):
            context_parts.append(f"- Condition: {scan_context['overall_condition']}")
        if scan_context.get("score"):
            score = scan_context["score"]
            if isinstance(score, dict):
                context_parts.append(f"- Score: {score.get('total', 'N/A')}/100")
            else:
                context_parts.append(f"- Score: {score}/100")
        
        # Add issues
        if scan_context.get("visible_issues"):
            context_parts.append("- Issues Found:")
            for issue in scan_context["visible_issues"][:3]:
                context_parts.append(f"  • {issue}")
        
        # Add positive aspects
        if scan_context.get("positive_aspects"):
            context_parts.append("- Positive Aspects:")
            for pos in scan_context["positive_aspects"][:2]:
                context_parts.append(f"  • {pos}")
    
    context_str = "\n".join(context_parts) if context_parts else "No scan data available."
    
    # Build conversation history
    history_parts = []
    for msg in history[-5:]:  # Last 5 messages for context
        role = "User" if msg.role == "user" else "Assistant"
        history_parts.append(f"{role}: {msg.content}")
    
    history_str = "\n".join(history_parts) if history_parts else "This is the start of the conversation."
    
    prompt = f"""You are SkinGlow AI Assistant, a friendly and knowledgeable skincare expert chatbot. 
You help users understand their skin analysis results and provide practical advice.

{context_str}

CONVERSATION HISTORY:
{history_str}

USER'S QUESTION:
{message}

INSTRUCTIONS:
1. Be friendly, helpful, and encouraging
2. Reference their specific scan results when relevant
3. Give practical, actionable advice
4. Keep responses concise (2-3 paragraphs max)
5. If they need professional help, recommend seeing a dermatologist
6. Don't diagnose serious conditions

Respond naturally as a helpful skincare assistant:"""

    return prompt


def get_suggestions(message: str, scan_context: Optional[Dict]) -> List[str]:
    """Generate relevant follow-up suggestions based on context."""
    message_lower = message.lower()
    
    # Check for specific topics
    if any(word in message_lower for word in ["acne", "pimple", "breakout", "blemish"]):
        return SUGGESTION_TEMPLATES["acne"]
    elif any(word in message_lower for word in ["dry", "flaky", "hydrat", "moisture"]):
        return SUGGESTION_TEMPLATES["dryness"]
    elif any(word in message_lower for word in ["aging", "wrinkle", "line", "retinol"]):
        return SUGGESTION_TEMPLATES["aging"]
    
    # Check scan context for issues
    if scan_context and scan_context.get("visible_issues"):
        issues_text = " ".join(scan_context["visible_issues"]).lower()
        if "acne" in issues_text or "blemish" in issues_text:
            return SUGGESTION_TEMPLATES["acne"]
        elif "dry" in issues_text:
            return SUGGESTION_TEMPLATES["dryness"]
    
    return SUGGESTION_TEMPLATES["general"]


@router.post("", response_model=ChatResponse)
async def chat_with_assistant(
    request: ChatRequest,
    user: CurrentUser = Depends(get_current_user),
):
    """
    Chat with the AI skin assistant about analysis results.
    
    The assistant has context about the user's latest scan and can
    answer follow-up questions about their skin health.
    """
    
    if not request.message or len(request.message.strip()) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message cannot be empty"
        )
    
    if len(request.message) > 1000:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message too long (max 1000 characters)"
        )
    
    try:
        client = get_chat_client()
        
        # Build context-aware prompt
        prompt = build_chat_prompt(
            message=request.message,
            scan_context=request.scan_context,
            history=request.history or []
        )
        
        # Call Gemini
        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=[prompt],
            config=types.GenerateContentConfig(
                temperature=0.7,  # Slightly creative but focused
                top_p=0.9,
                max_output_tokens=500,  # Keep responses concise
            )
        )
        
        reply = response.text.strip()
        
        # Generate follow-up suggestions
        suggestions = get_suggestions(request.message, request.scan_context)
        
        logger.info(f"Chat response generated for user {user.uid[:8]}...")
        
        return ChatResponse(
            reply=reply,
            suggestions=suggestions
        )
        
    except Exception as e:
        logger.error(f"Chat error: {e}")
        return ChatResponse(
            reply="I'm having trouble responding right now. Please try again in a moment!",
            suggestions=SUGGESTION_TEMPLATES["general"]
        )


@router.get("/suggestions")
async def get_initial_suggestions(
    user: CurrentUser = Depends(get_current_user),
):
    """
    Get initial chat suggestions based on user's latest scan.
    Called when opening the chat screen.
    """
    try:
        # Get user's latest scan
        scans = await get_user_scans(user.uid, limit=1)
        
        if not scans:
            return {
                "suggestions": [
                    "How do I take a good skin photo?",
                    "What does each score mean?",
                    "How often should I scan my skin?",
                ]
            }
        
        latest_scan = scans[0].to_dict()
        analysis = latest_scan.get("analysis", {})
        
        # Generate context-aware suggestions
        suggestions = get_suggestions("", analysis)
        
        return {"suggestions": suggestions}
        
    except Exception as e:
        logger.error(f"Error getting suggestions: {e}")
        return {"suggestions": SUGGESTION_TEMPLATES["general"]}
