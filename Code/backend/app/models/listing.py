"""
Listing-related Pydantic models
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from decimal import Decimal


class ListingCreate(BaseModel):
    """Schema for creating a new listing"""
    address: str
    city: str
    state: str
    zip_code: str
    asking_price: Decimal
    bedrooms: int
    bathrooms: Decimal
    square_feet: int
    property_type: str
    year_built: Optional[int] = None
    lot_size: Optional[Decimal] = None
    special_features: Optional[List[str]] = []
    neighborhood_highlights: Optional[str] = None
    agent_name: str
    agent_email: str
    agent_phone: Optional[str] = None


class ListingUpdate(BaseModel):
    """Schema for updating a listing"""
    address: Optional[str] = None
    asking_price: Optional[Decimal] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[Decimal] = None
    square_feet: Optional[int] = None
    property_type: Optional[str] = None
    special_features: Optional[List[str]] = None
    neighborhood_highlights: Optional[str] = None
    status: Optional[str] = None
    social_copy: Optional[str] = None
    mls_description: Optional[str] = None
    brochure_copy: Optional[str] = None
    listing_summary: Optional[str] = None
    vision_suggestions: Optional[dict] = None
    pricing_strategy: Optional[str] = None
    pricing_rationale: Optional[str] = None
    suggested_price_min: Optional[Decimal] = None
    suggested_price_max: Optional[Decimal] = None


class ListingImage(BaseModel):
    """Schema for listing image"""
    id: str
    listing_id: str
    image_url: str
    image_order: int
    caption: Optional[str] = None
    is_primary: bool
    created_at: datetime


class ListingResponse(BaseModel):
    """Schema for listing response"""
    id: str
    seller_user_id: str
    address: str
    city: str
    state: str
    zip_code: str
    asking_price: Decimal
    bedrooms: int
    bathrooms: Decimal
    square_feet: int
    property_type: str
    year_built: Optional[int] = None
    lot_size: Optional[Decimal] = None
    special_features: Optional[List[str]] = []
    neighborhood_highlights: Optional[str] = None
    agent_name: str
    agent_email: str
    agent_phone: Optional[str] = None
    social_copy: Optional[str] = None
    mls_description: Optional[str] = None
    brochure_copy: Optional[str] = None
    listing_summary: Optional[str] = None
    vision_suggestions: Optional[dict] = None
    pricing_strategy: Optional[str] = None
    pricing_rationale: Optional[str] = None
    suggested_price_min: Optional[Decimal] = None
    suggested_price_max: Optional[Decimal] = None
    status: str
    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime] = None
    images: Optional[List[ListingImage]] = []


class MarketingContentResponse(BaseModel):
    """Schema for AI-generated marketing content"""
    social_copy: str
    mls_description: str
    brochure_copy: str
    listing_summary: str


class VisionSuggestion(BaseModel):
    """Schema for room-specific vision suggestions"""
    room: str
    suggestions: List[str]
    priority: str  # high, medium, low


class VisionAnalysisResponse(BaseModel):
    """Schema for vision analysis response"""
    overall_impression: str
    room_by_room: List[VisionSuggestion]
    curb_appeal: List[str]
    staging_tips: List[str]


class ComparableSale(BaseModel):
    """Schema for comparable sale"""
    id: str
    comp_address: str
    comp_city: str
    comp_state: str
    comp_price: Decimal
    bedrooms: int
    bathrooms: Decimal
    square_feet: int
    property_type: str
    sale_date: Optional[str] = None
    days_on_market: Optional[int] = None
    price_per_sqft: Decimal
    distance_miles: Decimal
    relevance_score: Optional[Decimal] = None


class PricingStrategyResponse(BaseModel):
    """Schema for pricing strategy response"""
    pricing_strategy: str
    pricing_rationale: str
    suggested_price_min: Decimal
    suggested_price_max: Decimal
    comparable_sales: List[ComparableSale]
