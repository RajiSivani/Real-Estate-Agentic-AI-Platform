"""
Notification-related Pydantic models
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class NotificationCreate(BaseModel):
    """Schema for creating a notification"""
    recipient_user_id: str
    type: str
    title: str
    message: str
    related_listing_id: Optional[str] = None
    related_offer_id: Optional[str] = None


class NotificationResponse(BaseModel):
    """Schema for notification response"""
    id: str
    recipient_user_id: str
    type: str
    title: str
    message: str
    related_listing_id: Optional[str] = None
    related_offer_id: Optional[str] = None
    is_read: bool
    read_at: Optional[datetime] = None
    created_at: datetime


class NotificationUpdate(BaseModel):
    """Schema for updating notification"""
    is_read: Optional[bool] = None
