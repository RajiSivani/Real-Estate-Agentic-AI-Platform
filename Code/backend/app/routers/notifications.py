"""
Notifications API endpoints
"""
from fastapi import APIRouter, HTTPException
from typing import Optional, List
from datetime import datetime

from app.database import get_db

router = APIRouter(prefix="/api/v1/notifications", tags=["notifications"])


@router.post("")
async def create_notification(notification: dict):
    """Create a notification (used by buyer Interested button)"""
    db = get_db()
    try:
        result = db.table("notifications").insert(notification).execute()
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to create notification")
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("")
async def get_notifications(
    recipient_user_id: str,
    is_read: Optional[bool] = None,
    type: Optional[str] = None,
    limit: int = 20
):
    """Get user notifications"""
    db = get_db()

    try:
        query = db.table("notifications") \
            .select("*") \
            .eq("recipient_user_id", recipient_user_id)

        if is_read is not None:
            query = query.eq("is_read", is_read)
        if type:
            query = query.eq("type", type)

        result = query.order("created_at", desc=True).limit(limit).execute()
        notifications = result.data if result.data else []

        # Count unread separately
        unread_result = db.table("notifications") \
            .select("id") \
            .eq("recipient_user_id", recipient_user_id) \
            .eq("is_read", False) \
            .execute()

        unread_count = len(unread_result.data) if unread_result.data else 0

        return {
            "notifications": notifications,
            "unread_count": unread_count
        }

    except Exception as e:
        print(f"Error fetching notifications: {str(e)}")
        # Return empty instead of crashing the dashboard
        return {
            "notifications": [],
            "unread_count": 0
        }


@router.patch("/{notification_id}")
async def update_notification(notification_id: str, update: dict):
    """Mark notification as read/unread"""
    db = get_db()

    try:
        update_data = {}
        if "is_read" in update:
            update_data["is_read"] = update["is_read"]
            if update["is_read"]:
                update_data["read_at"] = datetime.now().isoformat()

        result = db.table("notifications") \
            .update(update_data) \
            .eq("id", notification_id) \
            .execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="Notification not found")

        return {"message": "Notification updated"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/mark-all-read")
async def mark_all_read(recipient_user_id: str):
    """Mark all notifications as read for a user"""
    db = get_db()

    try:
        result = db.table("notifications") \
            .update({
                "is_read": True,
                "read_at": datetime.now().isoformat()
            }) \
            .eq("recipient_user_id", recipient_user_id) \
            .eq("is_read", False) \
            .execute()

        count = len(result.data) if result.data else 0
        return {"message": "All notifications marked as read", "count": count}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
