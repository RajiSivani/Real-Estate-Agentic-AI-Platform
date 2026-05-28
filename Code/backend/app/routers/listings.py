"""
Listings API endpoints
"""
from fastapi import APIRouter, HTTPException, Header
from typing import Optional, List
from decimal import Decimal

from app.models.listing import (
    ListingCreate,
    ListingUpdate,
    ListingResponse,
    MarketingContentResponse,
    VisionAnalysisResponse,
    PricingStrategyResponse
)
from app.services.listing_service import listing_service
from app.services.comp_service import comp_service
from app.services.claude_service import claude_service

router = APIRouter(prefix="/api/v1/listings", tags=["listings"])


@router.post("", response_model=dict)
async def create_listing(
    listing: ListingCreate,
    authorization: Optional[str] = Header(None)
):
    """Create a new listing"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required")

    user_id = authorization.replace("Bearer ", "").strip()

    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid authorization token")

    try:
        result = listing_service.create_listing(listing, user_id)
        return result
    except Exception as e:
        import traceback
        print(f"Error creating listing: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error creating listing: {str(e)}")


@router.get("", response_model=List[dict])
async def get_listings(
    status: Optional[str] = None,
    user_id: Optional[str] = None,
    min_price: Optional[Decimal] = None,
    max_price: Optional[Decimal] = None,
    city: Optional[str] = None
):
    """Get all listings with optional filters"""
    try:
        listings = listing_service.get_listings(
            user_id=user_id,
            status=status,
            min_price=min_price,
            max_price=max_price,
            city=city
        )
        return listings
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{listing_id}", response_model=dict)
async def get_listing(listing_id: str):
    """Get a single listing by ID"""
    listing = listing_service.get_listing(listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    return listing


@router.patch("/{listing_id}", response_model=dict)
async def update_listing(
    listing_id: str,
    listing_update: ListingUpdate
):
    """Update a listing"""
    try:
        result = listing_service.update_listing(listing_id, listing_update)
        if not result:
            raise HTTPException(status_code=404, detail="Listing not found")
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{listing_id}/generate-content", response_model=dict)
async def generate_marketing_content(listing_id: str):
    """Generate AI marketing content for a listing"""
    listing = listing_service.get_listing(listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    try:
        content = claude_service.generate_marketing_content(listing)
        listing_service.update_listing(listing_id, ListingUpdate(**content))
        return content
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error generating content: {str(e)}")


@router.post("/{listing_id}/analyze-images", response_model=dict)
async def analyze_property_images(
    listing_id: str,
    image_urls: List[str]
):
    """Analyze property images and provide improvement suggestions"""
    listing = listing_service.get_listing(listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    try:
        analysis = claude_service.analyze_property_images(image_urls, listing)
        listing_service.update_listing(
            listing_id,
            ListingUpdate(vision_suggestions=analysis)
        )
        return analysis
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error analyzing images: {str(e)}")


@router.post("/{listing_id}/pricing-strategy", response_model=dict)
async def generate_pricing_strategy(listing_id: str):
    """Generate pricing strategy based on comparable sales"""
    listing = listing_service.get_listing(listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    try:
        # Search for comparable sales (falls back to synthetic if DB empty)
        comps = comp_service.search_comps(
            city=listing["city"],
            bedrooms=listing["bedrooms"],
            bathrooms=listing["bathrooms"],
            square_feet=listing["square_feet"],
            limit=5,
            asking_price=float(listing["asking_price"])  # ← pass asking price for proper comp scaling
        )

        # Only assign real (non-synthetic) comps to listing
        real_comp_ids = [c["id"] for c in comps if not str(c.get("id", "")).startswith("synthetic-")]
        if real_comp_ids:
            comp_service.assign_comps_to_listing(listing_id, real_comp_ids)

        # Generate pricing strategy using Claude
        strategy = claude_service.generate_pricing_strategy(listing, comps)

        # Update listing with pricing strategy
        listing_service.update_listing(
            listing_id,
            ListingUpdate(
                pricing_strategy=strategy.get("pricing_strategy"),
                pricing_rationale=strategy.get("pricing_rationale"),
                suggested_price_min=Decimal(str(strategy.get("suggested_price_min", 0))),
                suggested_price_max=Decimal(str(strategy.get("suggested_price_max", 0)))
            )
        )

        return {
            **strategy,
            "comparable_sales": comps
        }

    except Exception as e:
        import traceback
        print(f"Error generating pricing strategy: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error generating pricing strategy: {str(e)}")


@router.post("/{listing_id}/images", response_model=List[dict])
async def upload_listing_images(
    listing_id: str,
    image_urls: List[str]
):
    """Add images to a listing"""
    listing = listing_service.get_listing(listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    try:
        images = listing_service.add_images(listing_id, image_urls)
        return images
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{listing_id}/publish", response_model=dict)
async def publish_listing(listing_id: str):
    """Publish a listing"""
    try:
        result = listing_service.publish_listing(listing_id)
        if not result:
            raise HTTPException(status_code=404, detail="Listing not found")
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
