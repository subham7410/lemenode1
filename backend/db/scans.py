"""
Scan history database operations using Firestore.
Handles CRUD operations for skin analysis scans.
"""

from datetime import datetime, timedelta
from typing import Optional, List
import logging
import hashlib

from google.cloud.firestore_v1 import FieldFilter, Query
from auth.firebase_admin import get_firestore_client

logger = logging.getLogger("db.scans")

# Collection name
SCANS_COLLECTION = "scans"


class ScanRecord:
    """Represents a stored scan record."""
    def __init__(
        self,
        id: str,
        user_id: str,
        created_at: datetime,
        score: int,
        skin_type: Optional[str] = None,
        skin_tone: Optional[str] = None,
        condition: Optional[str] = None,
        visible_issues: Optional[List[str]] = None,
        recommendations: Optional[List[str]] = None,
        full_analysis: Optional[dict] = None,
        image_hash: Optional[str] = None,
    ):
        self.id = id
        self.user_id = user_id
        self.created_at = created_at
        self.score = score
        self.skin_type = skin_type
        self.skin_tone = skin_tone
        self.condition = condition
        self.visible_issues = visible_issues or []
        self.recommendations = recommendations or []
        self.full_analysis = full_analysis or {}
        self.image_hash = image_hash
    
    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "score": self.score,
            "skin_type": self.skin_type,
            "skin_tone": self.skin_tone,
            "condition": self.condition,
            "visible_issues": self.visible_issues,
            "recommendations": self.recommendations,
        }


def _hash_image(image_bytes: bytes) -> str:
    """Generate hash from image bytes for caching."""
    return hashlib.sha256(image_bytes).hexdigest()[:16]


async def save_scan(
    user_id: str,
    analysis: dict,
    image_bytes: Optional[bytes] = None,
) -> ScanRecord:
    """
    Save a scan analysis to Firestore.
    
    Args:
        user_id: Firebase user ID
        analysis: Full analysis result from Gemini
        image_bytes: Original image (for generating cache key)
        
    Returns:
        Created ScanRecord
    """
    db = get_firestore_client()
    
    # Extract score (handle both formats)
    score = analysis.get("score", 0)
    if isinstance(score, dict):
        score = score.get("total", 0)
    
    # Prepare document
    now = datetime.utcnow()
    scan_data = {
        "user_id": user_id,
        "created_at": now,
        "score": score,
        "skin_type": analysis.get("skin_type"),
        "skin_tone": analysis.get("skin_tone"),
        "condition": analysis.get("overall_condition"),
        "visible_issues": analysis.get("visible_issues", []),
        "recommendations": analysis.get("recommendations", []),
        "full_analysis": analysis,  # Store complete response
        "image_hash": _hash_image(image_bytes) if image_bytes else None,
    }
    
    # Add to collection
    doc_ref = db.collection(SCANS_COLLECTION).document()
    doc_ref.set(scan_data)
    
    logger.info(f"Saved scan {doc_ref.id} for user {user_id}")
    
    return ScanRecord(
        id=doc_ref.id,
        **{k: v for k, v in scan_data.items() if k != "full_analysis"}
    )


async def get_scan(scan_id: str, user_id: str) -> Optional[ScanRecord]:
    """
    Get a specific scan by ID.
    
    Args:
        scan_id: Scan document ID
        user_id: Firebase user ID (for authorization)
        
    Returns:
        ScanRecord if found and belongs to user, None otherwise
    """
    db = get_firestore_client()
    doc = db.collection(SCANS_COLLECTION).document(scan_id).get()
    
    if not doc.exists:
        return None
    
    data = doc.to_dict()
    
    # Authorization check
    if data.get("user_id") != user_id:
        logger.warning(f"User {user_id} tried to access scan {scan_id} belonging to {data.get('user_id')}")
        return None
    
    return ScanRecord(id=doc.id, **data)


async def get_scan_with_full_analysis(scan_id: str, user_id: str) -> Optional[dict]:
    """
    Get a specific scan including full analysis.
    
    Returns:
        Full scan document including analysis, None if not found
    """
    db = get_firestore_client()
    doc = db.collection(SCANS_COLLECTION).document(scan_id).get()
    
    if not doc.exists:
        return None
    
    data = doc.to_dict()
    
    if data.get("user_id") != user_id:
        return None
    
    data["id"] = doc.id
    if data.get("created_at"):
        data["created_at"] = data["created_at"].isoformat()
    
    return data


async def get_user_scans(
    user_id: str,
    limit: int = 30,
    offset: int = 0,
    days: Optional[int] = None,
) -> List[ScanRecord]:
    """
    Get scan history for a user.
    
    Args:
        user_id: Firebase user ID
        limit: Maximum number of scans to return
        offset: Number of scans to skip (for pagination)
        days: Optional limit to scans from last N days
        
    Returns:
        List of ScanRecord, newest first
    """
    db = get_firestore_client()
    
    query = db.collection(SCANS_COLLECTION).where(
        filter=FieldFilter("user_id", "==", user_id)
    )
    
    # Filter by date if specified
    if days:
        cutoff = datetime.utcnow() - timedelta(days=days)
        query = query.where(
            filter=FieldFilter("created_at", ">=", cutoff)
        )
    
    # Order by newest first
    query = query.order_by("created_at", direction=Query.DESCENDING)
    
    # Apply pagination
    if offset > 0:
        query = query.offset(offset)
    query = query.limit(limit)
    
    # Execute query
    docs = query.stream()
    
    scans = []
    for doc in docs:
        data = doc.to_dict()
        # Don't include full_analysis in list view
        data.pop("full_analysis", None)
        scans.append(ScanRecord(id=doc.id, **data))
    
    return scans


async def delete_scan(scan_id: str, user_id: str) -> bool:
    """
    Delete a scan.
    
    Args:
        scan_id: Scan document ID
        user_id: Firebase user ID (for authorization)
        
    Returns:
        True if deleted, False if not found or unauthorized
    """
    db = get_firestore_client()
    doc_ref = db.collection(SCANS_COLLECTION).document(scan_id)
    doc = doc_ref.get()
    
    if not doc.exists:
        return False
    
    # Authorization check
    if doc.to_dict().get("user_id") != user_id:
        logger.warning(f"User {user_id} tried to delete scan {scan_id}")
        return False
    
    doc_ref.delete()
    logger.info(f"Deleted scan {scan_id} for user {user_id}")
    return True


async def delete_all_user_scans(user_id: str) -> int:
    """
    Delete all scans for a user (for account deletion).
    
    Args:
        user_id: Firebase user ID
        
    Returns:
        Number of scans deleted
    """
    db = get_firestore_client()
    
    docs = db.collection(SCANS_COLLECTION).where(
        filter=FieldFilter("user_id", "==", user_id)
    ).stream()
    
    count = 0
    for doc in docs:
        doc.reference.delete()
        count += 1
    
    logger.info(f"Deleted {count} scans for user {user_id}")
    return count


async def get_scan_count(user_id: str) -> int:
    """Get total number of scans for a user."""
    db = get_firestore_client()
    
    docs = db.collection(SCANS_COLLECTION).where(
        filter=FieldFilter("user_id", "==", user_id)
    ).stream()
    
    return sum(1 for _ in docs)
