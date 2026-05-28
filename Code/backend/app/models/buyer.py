"""
Buyer-related Pydantic models
"""
from pydantic import BaseModel
from typing import Optional, List
from decimal import Decimal


class BuyerPreferences(BaseModel):
    """Schema for buyer search preferences"""
    min_price: Optional[Decimal] = None
    max_price: Optional[Decimal] = None
    preferred_cities: Optional[List[str]] = []
    preferred_states: Optional[List[str]] = []
    min_bedrooms: Optional[int] = None
    min_bathrooms: Optional[Decimal] = None
    min_square_feet: Optional[int] = None
    property_types: Optional[List[str]] = []
    must_have_features: Optional[List[str]] = []
    nice_to_have_features: Optional[List[str]] = []


class PropertyMatch(BaseModel):
    """Schema for property match result"""
    listing: dict
    match_score: float
    match_reasons: List[str]
    missing_features: List[str]


class PropertyMatchResponse(BaseModel):
    """Schema for property matching response"""
    matches: List[PropertyMatch]
    total_matches: int


class PropertyValuation(BaseModel):
    """Schema for property value evaluation"""
    asking_price: Decimal
    estimated_value: Decimal
    comparable_average: Decimal
    price_assessment: str  # underpriced, fair, overpriced
    price_per_sqft_vs_comps: Decimal
    market_position: str


class PropertyEvaluationResponse(BaseModel):
    """Schema for buyer-side property evaluation"""
    valuation: PropertyValuation
    comps_analysis: List[dict]


class NegotiationStrategy(BaseModel):
    """Schema for negotiation strategy"""
    recommended_approach: str
    suggested_offer_range: dict
    negotiation_tips: List[str]
    walk_away_threshold: Decimal
    leverage_points: List[str]


class NegotiationStrategyRequest(BaseModel):
    """Schema for negotiation strategy request"""
    listing_id: str
    buyer_budget: Decimal
    buyer_priorities: Optional[List[str]] = []


class NegotiationStrategyResponse(BaseModel):
    """Schema for negotiation strategy response"""
    strategy: NegotiationStrategy
