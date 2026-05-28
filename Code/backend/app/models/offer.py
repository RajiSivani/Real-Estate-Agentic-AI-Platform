"""
Offer-related Pydantic models
"""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from decimal import Decimal


class OfferCreate(BaseModel):
    """Schema for creating a new offer"""
    listing_id: str
    offer_amount: Decimal
    buyer_message: Optional[str] = None
    earnest_money: Optional[Decimal] = None
    contingencies: Optional[List[str]] = []
    closing_timeline_days: Optional[int] = 30


class OfferResponse(BaseModel):
    """Schema for offer response"""
    id: str
    listing_id: str
    buyer_user_id: str
    seller_user_id: str
    offer_amount: Decimal
    buyer_message: Optional[str] = None
    earnest_money: Optional[Decimal] = None
    contingencies: Optional[List[str]] = []
    closing_timeline_days: Optional[int] = None
    offer_strategy_summary: Optional[str] = None
    ai_recommendation: Optional[str] = None
    counter_amount: Optional[Decimal] = None
    counter_message: Optional[str] = None
    counter_terms: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime
    responded_at: Optional[datetime] = None


class OfferRespondRequest(BaseModel):
    """Schema for seller responding to offer"""
    action: str  # accept, reject, counter
    counter_amount: Optional[Decimal] = None
    counter_message: Optional[str] = None
    counter_terms: Optional[str] = None


class OfferAnalysisResponse(BaseModel):
    """Schema for AI offer analysis"""
    ai_recommendation: str  # accept, reject, counter
    reasoning: str
    comparison_to_comps: dict
