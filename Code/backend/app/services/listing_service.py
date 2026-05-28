"""
Listing service - Business logic for listings
"""
from app.database import get_db
from app.models.listing import ListingCreate, ListingUpdate
from typing import List, Optional
from decimal import Decimal


def convert_decimals(data: dict) -> dict:
    """Recursively convert all Decimal values to float in a dict"""
    result = {}
    for k, v in data.items():
        if isinstance(v, Decimal):
            result[k] = float(v)
        elif isinstance(v, dict):
            result[k] = convert_decimals(v)
        elif isinstance(v, list):
            result[k] = [float(i) if isinstance(i, Decimal) else i for i in v]
        else:
            result[k] = v
    return result


class ListingService:
    """Service for listing operations"""

    def __init__(self):
        self.db = get_db()

    def create_listing(self, listing_data: ListingCreate, seller_user_id: str) -> dict:
        """Create a new listing"""
        try:
            data_dict = listing_data.model_dump()
            data_dict = convert_decimals(data_dict)
            data_dict["seller_user_id"] = seller_user_id
            data_dict["status"] = "draft"

            result = self.db.table("listings").insert(data_dict).execute()

            if not result.data:
                raise Exception("Failed to create listing - no data returned")

            return result.data[0]
        except Exception as e:
            print(f"Error in create_listing: {str(e)}")
            import traceback
            traceback.print_exc()
            raise

    def get_listing(self, listing_id: str) -> Optional[dict]:
        """Get a single listing by ID"""
        result = self.db.table("listings").select("*").eq("id", listing_id).execute()

        if not result.data:
            return None

        listing = result.data[0]

        images_result = self.db.table("listing_images") \
            .select("*") \
            .eq("listing_id", listing_id) \
            .order("image_order") \
            .execute()

        listing["images"] = images_result.data if images_result.data else []
        return listing

    def get_listings(
        self,
        user_id: Optional[str] = None,
        status: Optional[str] = None,
        min_price: Optional[Decimal] = None,
        max_price: Optional[Decimal] = None,
        city: Optional[str] = None
    ) -> List[dict]:
        """Get listings with filters"""
        query = self.db.table("listings").select("*")

        if user_id:
            query = query.eq("seller_user_id", user_id)
        if status:
            query = query.eq("status", status)
        if min_price:
            query = query.gte("asking_price", float(min_price))
        if max_price:
            query = query.lte("asking_price", float(max_price))
        if city:
            query = query.ilike("city", f"%{city}%")

        result = query.order("created_at", desc=True).execute()
        return result.data if result.data else []

    def update_listing(self, listing_id: str, listing_data: ListingUpdate) -> Optional[dict]:
        """Update a listing — converts all Decimals to float before sending"""
        raw = {k: v for k, v in listing_data.model_dump().items() if v is not None}

        if not raw:
            return self.get_listing(listing_id)

        # Convert every Decimal to float so httpx can serialize it
        update_data = convert_decimals(raw)

        result = self.db.table("listings") \
            .update(update_data) \
            .eq("id", listing_id) \
            .execute()

        return result.data[0] if result.data else None

    def add_images(self, listing_id: str, image_urls: List[str]) -> List[dict]:
        """Add images to a listing"""
        images_data = [
            {
                "listing_id": listing_id,
                "image_url": url,
                "image_order": idx,
                "is_primary": idx == 0
            }
            for idx, url in enumerate(image_urls)
        ]

        result = self.db.table("listing_images").insert(images_data).execute()
        return result.data if result.data else []

    def publish_listing(self, listing_id: str) -> Optional[dict]:
        """Publish a listing"""
        from datetime import datetime

        result = self.db.table("listings") \
            .update({
                "status": "published",
                "published_at": datetime.now().isoformat()
            }) \
            .eq("id", listing_id) \
            .execute()

        return result.data[0] if result.data else None


# Global instance
listing_service = ListingService()
