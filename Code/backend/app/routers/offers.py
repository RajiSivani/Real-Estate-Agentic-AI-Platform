"""
Offers API endpoints
"""
from fastapi import APIRouter, HTTPException, Header
from typing import Optional, List

from app.models.offer import (
    OfferCreate,
    OfferResponse,
    OfferRespondRequest,
    OfferAnalysisResponse
)
from app.services.offer_service import offer_service
from app.services.listing_service import listing_service
from app.services.comp_service import comp_service
from app.services.claude_service import claude_service
from app.models.notification import NotificationCreate
from app.database import get_db

router = APIRouter(prefix="/api/v1/offers", tags=["offers"])


@router.post("", response_model=dict)
async def create_offer(
    offer: OfferCreate,
    authorization: str = Header(...)
):
    """Create a new offer"""
    user_id = authorization.replace("Bearer ", "")
    
    try:
        # Create the offer
        result = offer_service.create_offer(offer, user_id)
        
        # Create notification for seller
        db = get_db()
        notification = {
            "recipient_user_id": result["seller_user_id"],
            "type": "new_offer",
            "title": "New Offer Received",
            "message": f"You received an offer of ${result['offer_amount']:,.2f}",
            "related_listing_id": result["listing_id"],
            "related_offer_id": result["id"]
        }
        db.table("notifications").insert(notification).execute()
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("", response_model=List[dict])
async def get_offers(
    buyer_user_id: Optional[str] = None,
    seller_user_id: Optional[str] = None,
    listing_id: Optional[str] = None,
    status: Optional[str] = None
):
    """Get offers with filters"""
    try:
        offers = offer_service.get_offers(
            buyer_user_id=buyer_user_id,
            seller_user_id=seller_user_id,
            listing_id=listing_id,
            status=status
        )
        return offers
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{offer_id}", response_model=dict)
async def get_offer(offer_id: str):
    """Get a single offer by ID"""
    offer = offer_service.get_offer(offer_id)
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    return offer


@router.post("/{offer_id}/respond", response_model=dict)
async def respond_to_offer(
    offer_id: str,
    response: OfferRespondRequest
):
    """Seller responds to an offer"""
    try:
        # Update offer status
        result = offer_service.respond_to_offer(offer_id, response)
        
        if not result:
            raise HTTPException(status_code=404, detail="Offer not found")
        
        # Create notification for buyer
        db = get_db()
        action_past = {
            "accept": "accepted",
            "reject": "rejected",
            "counter": "countered"
        }
        
        notification = {
            "recipient_user_id": result["buyer_user_id"],
            "type": f"offer_{action_past[response.action]}",
            "title": f"Offer {action_past[response.action].title()}",
            "message": f"Your offer has been {action_past[response.action]}",
            "related_listing_id": result["listing_id"],
            "related_offer_id": result["id"]
        }
        db.table("notifications").insert(notification).execute()
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{offer_id}/analyze", response_model=dict)
async def analyze_offer(offer_id: str):
    """Get AI analysis and recommendation on an offer"""
    offer = offer_service.get_offer(offer_id)
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    
    try:
        # Get listing details
        listing = listing_service.get_listing(offer["listing_id"])
        
        # Get comps for the listing
        comps = comp_service.get_comps_for_listing(offer["listing_id"])
        
        # Generate AI analysis
        analysis = claude_service.analyze_offer(offer, listing, comps)
        
        # Update offer with analysis
        offer_service.update_offer_analysis(offer_id, analysis)
        
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing offer: {str(e)}")
