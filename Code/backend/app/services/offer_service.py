"""
Offer service - Business logic for offers
"""
from app.database import get_db
from app.models.offer import OfferCreate, OfferRespondRequest
from typing import List, Optional
from datetime import datetime
from decimal import Decimal


def to_float(val):
    """Safely convert Decimal or None to float"""
    if val is None:
        return None
    return float(val)


class OfferService:
    """Service for offer operations"""

    def __init__(self):
        self.db = get_db()

    def create_offer(self, offer_data: OfferCreate, buyer_user_id: str) -> dict:
        """Create a new offer"""
        # Get listing to find seller
        listing_result = self.db.table("listings") \
            .select("seller_user_id") \
            .eq("id", offer_data.listing_id) \
            .execute()

        if not listing_result.data:
            raise ValueError("Listing not found")

        seller_user_id = listing_result.data[0]["seller_user_id"]

        raw = offer_data.model_dump()

        # Convert all Decimal fields to float for JSON serialization
        data = {
            "listing_id": raw["listing_id"],
            "offer_amount": to_float(raw["offer_amount"]),
            "buyer_message": raw.get("buyer_message"),
            "earnest_money": to_float(raw.get("earnest_money")),
            "contingencies": raw.get("contingencies") or [],
            "closing_timeline_days": raw.get("closing_timeline_days"),
            "buyer_user_id": buyer_user_id,
            "seller_user_id": seller_user_id,
            "status": "pending"
        }

        result = self.db.table("offers").insert(data).execute()

        if not result.data:
            raise Exception("Failed to create offer - no data returned")

        return result.data[0]

    def get_offer(self, offer_id: str) -> Optional[dict]:
        """Get a single offer by ID"""
        result = self.db.table("offers").select("*").eq("id", offer_id).execute()
        return result.data[0] if result.data else None

    def get_offers(
        self,
        buyer_user_id: Optional[str] = None,
        seller_user_id: Optional[str] = None,
        listing_id: Optional[str] = None,
        status: Optional[str] = None
    ) -> List[dict]:
        """Get offers with filters"""
        query = self.db.table("offers").select("*, listings(*)")

        if buyer_user_id:
            query = query.eq("buyer_user_id", buyer_user_id)
        if seller_user_id:
            query = query.eq("seller_user_id", seller_user_id)
        if listing_id:
            query = query.eq("listing_id", listing_id)
        if status:
            query = query.eq("status", status)

        result = query.order("created_at", desc=True).execute()
        return result.data if result.data else []

    def respond_to_offer(self, offer_id: str, response_data: OfferRespondRequest) -> dict:
        """Seller responds to an offer"""
        # Map action → status value
        status_map = {
            "accept": "accepted",
            "reject": "rejected",
            "counter": "countered"
        }
        update_data = {
            "status": status_map.get(response_data.action, response_data.action + "ed"),
            "responded_at": datetime.now().isoformat()
        }

        if response_data.action == "counter":
            update_data.update({
                "counter_amount": to_float(response_data.counter_amount),
                "counter_message": response_data.counter_message,
                "counter_terms": response_data.counter_terms
            })

        result = self.db.table("offers") \
            .update(update_data) \
            .eq("id", offer_id) \
            .execute()

        return result.data[0] if result.data else None

    def update_offer_analysis(self, offer_id: str, analysis: dict) -> dict:
        """Update offer with AI analysis"""
        update_data = {
            "offer_strategy_summary": analysis.get("reasoning"),
            "ai_recommendation": analysis.get("ai_recommendation")
        }

        result = self.db.table("offers") \
            .update(update_data) \
            .eq("id", offer_id) \
            .execute()

        return result.data[0] if result.data else None


# Global instance
offer_service = OfferService()
