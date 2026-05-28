"""
Buyer-specific API endpoints
"""
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from decimal import Decimal

from app.models.buyer import (
    BuyerPreferences,
    NegotiationStrategyRequest,
)
from app.services.listing_service import listing_service
from app.services.comp_service import comp_service
from app.services.claude_service import claude_service

router = APIRouter(prefix="/api/v1/buyer", tags=["buyer"])


@router.post("/match", response_model=dict)
async def match_properties(preferences: BuyerPreferences):
    """Find published listings matching buyer preferences"""
    try:
        listings = listing_service.get_listings(status="published")
        matches = []

        for listing in listings:
            score   = 0
            reasons = []
            missing = []
            asking  = float(listing["asking_price"])

            # Price
            if preferences.min_price and preferences.max_price:
                if float(preferences.min_price) <= asking <= float(preferences.max_price):
                    score += 30
                    reasons.append("Price within budget")
                else:
                    continue

            # City
            if preferences.preferred_cities:
                if listing["city"] in preferences.preferred_cities:
                    score += 20
                    reasons.append(f"Located in {listing['city']}")

            # Bedrooms
            if preferences.min_bedrooms:
                if listing["bedrooms"] >= preferences.min_bedrooms:
                    score += 15
                    reasons.append(f"{listing['bedrooms']} bedrooms meets requirement")
                else:
                    continue

            # Bathrooms
            if preferences.min_bathrooms:
                if float(listing["bathrooms"]) >= float(preferences.min_bathrooms):
                    score += 10
                    reasons.append(f"{listing['bathrooms']} bathrooms meets requirement")

            # Sqft
            if preferences.min_square_feet:
                if listing["square_feet"] >= preferences.min_square_feet:
                    score += 10
                    reasons.append(f"{listing['square_feet']:,} sqft meets requirement")

            # Property type
            if preferences.property_types:
                if listing["property_type"] in preferences.property_types:
                    score += 10
                    reasons.append(f"Property type: {listing['property_type']}")

            # Must-have features
            lf = [f.lower() for f in (listing.get("special_features") or [])]
            if preferences.must_have_features:
                for feat in preferences.must_have_features:
                    if any(feat.lower() in x for x in lf):
                        score += 5
                        reasons.append(f"Has {feat}")
                    else:
                        missing.append(feat)

            match_score = min(score / 100, 1.0)
            if match_score > 0.2:
                matches.append({
                    "listing":          listing,
                    "match_score":      round(match_score, 2),
                    "match_reasons":    reasons,
                    "missing_features": missing,
                })

        matches.sort(key=lambda x: x["match_score"], reverse=True)
        return {"matches": matches, "total_matches": len(matches)}

    except Exception as e:
        import traceback; traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/evaluate-property", response_model=dict)
async def evaluate_property(listing_id: str = Query(...)):
    """
    Buyer-side property value evaluation.
    Compares asking price against comparable sales — always uses
    price-appropriate comps so the assessment is meaningful.
    """
    listing = listing_service.get_listing(listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    try:
        asking_price = float(listing["asking_price"])
        square_feet  = max(int(listing["square_feet"]), 1)

        # ── Fetch any cached comps ───────────────────────────────────────────
        cached_comps = comp_service.get_comps_for_listing(listing_id)

        # Validate cached comps are price-appropriate.
        # If the cached comp average is more than 2× away from asking price,
        # they are wrong comps (e.g. small home comps used for a luxury property).
        # In that case ignore them and generate fresh price-appropriate ones.
        comps = None
        if cached_comps:
            cached_avg = sum(float(c["comp_price"]) for c in cached_comps) / len(cached_comps)
            ratio = asking_price / cached_avg if cached_avg > 0 else 999
            if 0.5 <= ratio <= 2.0:
                comps = cached_comps  # comps are valid — use them
            # else: fall through to fresh search

        if not comps:
            comps = comp_service.search_comps(
                city=listing["city"],
                bedrooms=listing["bedrooms"],
                bathrooms=listing["bathrooms"],
                square_feet=square_feet,
                limit=5,
                asking_price=asking_price,
            )

        if not comps:
            raise HTTPException(status_code=404, detail="No comparable sales found")

        # ── SQFT-ADJUSTED VALUATION (the correct way) ───────────────────────
        #
        # Raw comp price average is MEANINGLESS when comps differ in size.
        # A 1,900 sqft home at $453K and a 3,800 sqft home at $950K can both
        # be "fair" — they're the same $238/sqft.
        #
        # Correct approach:
        #   1. Calculate avg $/sqft from comps
        #   2. Multiply by subject property's sqft → estimated value
        #   3. Compare asking price vs estimated value (both sqft-adjusted)

        # Step 1: avg price per sqft from comps
        ppsf_list = []
        for c in comps:
            comp_sqft = max(int(c.get("square_feet", 1)), 1)
            comp_price = float(c["comp_price"])
            stored_ppsf = c.get("price_per_sqft")
            if stored_ppsf:
                ppsf_list.append(float(stored_ppsf))
            else:
                ppsf_list.append(comp_price / comp_sqft)

        avg_ppsf = sum(ppsf_list) / len(ppsf_list) if ppsf_list else 0

        # Step 2: estimated fair value = avg $/sqft × subject sqft
        estimated_value = avg_ppsf * square_feet

        # Step 3: asking price per sqft
        asking_ppsf = asking_price / square_feet

        # Step 4: compare on a per-sqft basis
        diff_pct = ((asking_ppsf - avg_ppsf) / avg_ppsf * 100) if avg_ppsf > 0 else 0

        # Assessment based on $/sqft comparison
        if diff_pct < -5:
            price_assessment = "underpriced"
        elif diff_pct > 5:
            price_assessment = "overpriced"
        else:
            price_assessment = "fair"

        # Market position — clear, human-readable
        abs_diff = abs(diff_pct)
        direction = "above" if diff_pct > 0 else "below"

        market_position = (
            f"At ${asking_ppsf:.0f}/sqft, the asking price is "
            f"{abs_diff:.1f}% {direction} the market average of ${avg_ppsf:.0f}/sqft "
            f"for comparable properties. "
            f"Estimated fair value based on size and market rate: ${estimated_value:,.0f}."
        )

        return {
            "valuation": {
                "asking_price":            asking_price,
                "estimated_value":         round(estimated_value, 0),
                "comparable_average":      round(estimated_value, 0),  # show sqft-adjusted, not raw comp avg
                "price_assessment":        price_assessment,
                "price_per_sqft_vs_comps": round(avg_ppsf, 2),
                "asking_price_per_sqft":   round(asking_ppsf, 2),
                "market_position":         market_position,
                "diff_percent":            round(diff_pct, 1),
            },
            "comps_analysis": comps,
        }

    except HTTPException:
        raise
    except Exception as e:
        import traceback; traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/negotiation-strategy", response_model=dict)
async def get_negotiation_strategy(request: NegotiationStrategyRequest):
    """AI-powered negotiation strategy for a specific property"""
    listing = listing_service.get_listing(request.listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    try:
        asking_price = float(listing["asking_price"])

        cached_comps = comp_service.get_comps_for_listing(request.listing_id)
        comps = None
        if cached_comps:
            cached_avg = sum(float(c["comp_price"]) for c in cached_comps) / len(cached_comps)
            ratio = asking_price / cached_avg if cached_avg > 0 else 999
            if 0.5 <= ratio <= 2.0:
                comps = cached_comps

        if not comps:
            comps = comp_service.search_comps(
                city=listing["city"],
                bedrooms=listing["bedrooms"],
                bathrooms=listing["bathrooms"],
                square_feet=listing["square_feet"],
                limit=5,
                asking_price=asking_price,
            )

        if not comps:
            raise HTTPException(status_code=404, detail="No comparable sales found")

        strategy = claude_service.generate_negotiation_strategy(
            listing,
            comps,
            float(request.buyer_budget),
            request.buyer_priorities or [],
        )

        return {"strategy": strategy}

    except HTTPException:
        raise
    except Exception as e:
        import traceback; traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error generating strategy: {str(e)}")
