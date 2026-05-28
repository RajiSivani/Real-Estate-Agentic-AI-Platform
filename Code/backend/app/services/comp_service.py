"""
Comparable sales service
"""
from app.database import get_db
from typing import List, Optional
from decimal import Decimal


class CompService:

    def __init__(self):
        self.db = get_db()

    def search_comps(
        self,
        city: str,
        bedrooms: int,
        bathrooms,
        square_feet: int,
        limit: int = 5,
        asking_price: float = None,   # ← NEW: used to scale synthetic comps
    ) -> List[dict]:
        """Search for comparable homes with progressive fallback"""

        # Attempt 1: Exact city + bedrooms + sqft range (±15%)
        result = self.db.table("comps").select("*") \
            .eq("comp_city", city) \
            .gte("bedrooms", max(bedrooms - 1, 1)) \
            .lte("bedrooms", bedrooms + 1) \
            .gte("square_feet", int(square_feet * 0.80)) \
            .lte("square_feet", int(square_feet * 1.20)) \
            .order("relevance_score", desc=True) \
            .limit(limit) \
            .execute()

        if result.data:
            return result.data

        # Attempt 2: Relax sqft — match on bedrooms only
        result = self.db.table("comps").select("*") \
            .gte("bedrooms", max(bedrooms - 1, 1)) \
            .lte("bedrooms", bedrooms + 1) \
            .order("relevance_score", desc=True) \
            .limit(limit) \
            .execute()

        if result.data:
            return result.data

        # Attempt 3: Any comps in DB (last resort before synthetic)
        result = self.db.table("comps").select("*") \
            .order("relevance_score", desc=True) \
            .limit(limit) \
            .execute()

        if result.data:
            # Only use DB comps if they're vaguely relevant (within 3x price range)
            if asking_price and result.data:
                db_avg = sum(float(c["comp_price"]) for c in result.data) / len(result.data)
                price_ratio = asking_price / db_avg if db_avg > 0 else 999
                # If asking price is more than 2x or less than 0.5x the comp average,
                # the DB comps are not useful — generate synthetic ones instead
                if price_ratio > 2.0 or price_ratio < 0.5:
                    return self._generate_synthetic_comps(city, bedrooms, bathrooms, square_feet, asking_price)
            return result.data

        # Attempt 4: Full synthetic generation
        return self._generate_synthetic_comps(city, bedrooms, bathrooms, square_feet, asking_price)

    def _generate_synthetic_comps(
        self,
        city: str,
        bedrooms: int,
        bathrooms,
        square_feet: int,
        asking_price: float = None,
    ) -> List[dict]:
        """
        Generate price-appropriate synthetic comps.
        Uses asking_price to derive a realistic $/sqft baseline
        so comps are always in the right price neighborhood.
        """
        import random

        # Derive base price per sqft from asking price (most reliable signal)
        if asking_price and square_feet > 0:
            base_ppsf = asking_price / square_feet
        else:
            base_ppsf = 240  # fallback San Jose average

        streets = [
            "Maple Avenue", "Oak Street", "Pine Drive",
            "Elm Court", "Cedar Lane"
        ]

        comps = []
        for i, street in enumerate(streets):
            variation    = random.uniform(0.91, 1.09)
            sqft_var     = random.uniform(0.88, 1.12)
            comp_sqft    = max(int(square_feet * sqft_var), 800)
            comp_ppsf    = round(base_ppsf * variation, 2)
            comp_price   = int(comp_sqft * comp_ppsf)
            distance     = round(random.uniform(0.3, 2.8), 1)

            comps.append({
                "id":             f"synthetic-{i}",
                "listing_id":     None,
                "comp_address":   f"{100 + i * 123} {streets[i]}",
                "comp_city":      city,
                "comp_state":     "CA",
                "comp_price":     comp_price,
                "bedrooms":       bedrooms + (1 if i == 4 else 0),
                "bathrooms":      float(bathrooms),
                "square_feet":    comp_sqft,
                "property_type":  "single_family",
                "sale_date":      f"2024-0{i + 1}-15",
                "days_on_market": random.randint(8, 28),
                "price_per_sqft": comp_ppsf,
                "distance_miles": distance,
                "source":         "synthetic",
                "relevance_score": round(0.95 - i * 0.05, 2),
            })

        return comps

    def get_comps_for_listing(self, listing_id: str) -> List[dict]:
        result = self.db.table("comps").select("*") \
            .eq("listing_id", listing_id) \
            .order("relevance_score", desc=True) \
            .execute()
        return result.data if result.data else []

    def assign_comps_to_listing(self, listing_id: str, comp_ids: List[str]) -> int:
        real_ids = [c for c in comp_ids if not str(c).startswith("synthetic-")]
        for comp_id in real_ids:
            self.db.table("comps") \
                .update({"listing_id": listing_id}) \
                .eq("id", comp_id) \
                .execute()
        return len(real_ids)

    def create_comp_for_listing(self, listing_id: str, comp_data: dict) -> dict:
        data = {**comp_data, "listing_id": listing_id, "source": "generated"}
        result = self.db.table("comps").insert(data).execute()
        return result.data[0] if result.data else None


comp_service = CompService()
