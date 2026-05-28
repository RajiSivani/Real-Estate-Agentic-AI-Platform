"""
Claude AI service for content generation and analysis
"""
from anthropic import Anthropic
from app.config import settings
from typing import List
import json
import re
import base64

try:
    import httpx
    HTTPX_AVAILABLE = True
except ImportError:
    HTTPX_AVAILABLE = False


class ClaudeService:

    def __init__(self):
        self.client = Anthropic(api_key=settings.ANTHROPIC_API_KEY)
        self.model = "claude-sonnet-4-5"

    def _parse_json(self, text: str) -> dict:
        text = text.strip()
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            pass
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group())
            except json.JSONDecodeError:
                pass
        raise ValueError(f"Could not parse JSON: {text[:300]}")

    # ──────────────────────────────────────────────────────────────────────
    # AGENT 1: Listing Intake & Marketing Content
    # ──────────────────────────────────────────────────────────────────────
    def generate_marketing_content(self, listing_data: dict) -> dict:
        """Generate MLS description, social post, brochure copy and summary"""
        prompt = f"""You are a top-producing real estate marketing copywriter in the United States.

Write compelling, specific marketing content for this property. Use ALL the details provided — do NOT write generic text.

Property:
- Address: {listing_data['address']}, {listing_data['city']}, {listing_data['state']} {listing_data.get('zip_code', '')}
- Asking Price: ${float(listing_data['asking_price']):,.0f}
- Bedrooms: {listing_data['bedrooms']} | Bathrooms: {listing_data['bathrooms']} | Sq Ft: {listing_data['square_feet']:,}
- Type: {listing_data['property_type'].replace('_', ' ').title()}
- Key Features: {', '.join(listing_data.get('special_features') or ['N/A'])}
- Neighborhood: {listing_data.get('neighborhood_highlights') or 'Great location'}
- Listing Agent: {listing_data.get('agent_name', 'Listing Agent')}

Return ONLY a valid JSON object:
{{
  "social_copy": "240-280 character social post mentioning the address, price, top 2-3 features, with emojis and 2 hashtags",
  "mls_description": "150-200 word professional MLS description starting with the full address, covering bedrooms/bathrooms/sqft, specific features from the list above, and neighborhood highlights",
  "brochure_copy": "250-300 word lifestyle-focused brochure text covering room highlights, outdoor spaces, community, and call-to-action",
  "listing_summary": "45-word internal summary"
}}"""

        try:
            r = self.client.messages.create(
                model=self.model, max_tokens=2500,
                messages=[{"role": "user", "content": prompt}]
            )
            return self._parse_json(r.content[0].text)
        except Exception as e:
            print(f"Error generating marketing content: {e}")
            raise

    # ──────────────────────────────────────────────────────────────────────
    # AGENT 2: Vision-Based Property Improvement
    # ──────────────────────────────────────────────────────────────────────
    def analyze_property_images(self, image_urls: List[str], listing_data: dict) -> dict:
        """
        Download property images and send to Claude Vision for real analysis.
        Falls back to text-only advice if images cannot be fetched.
        """
        # Try to download real images
        encoded_images = []
        if HTTPX_AVAILABLE:
            for url in image_urls[:4]:
                try:
                    resp = httpx.get(url, timeout=15, follow_redirects=True)
                    if resp.status_code == 200:
                        ct = resp.headers.get("content-type", "image/jpeg").split(";")[0].strip()
                        if ct not in ["image/jpeg", "image/png", "image/gif", "image/webp"]:
                            ct = "image/jpeg"
                        encoded_images.append({
                            "media_type": ct,
                            "data": base64.standard_b64encode(resp.content).decode("utf-8")
                        })
                except Exception as ex:
                    print(f"Could not fetch image {url}: {ex}")

        # Build multimodal content
        content = []

        # Add images first (if any)
        for img in encoded_images:
            content.append({
                "type": "image",
                "source": {"type": "base64", "media_type": img["media_type"], "data": img["data"]}
            })

        # Add text prompt
        has_images = len(encoded_images) > 0
        content.append({
            "type": "text",
            "text": f"""You are a professional home stager and real estate photography consultant.

Property being reviewed:
- Address: {listing_data['address']}, {listing_data['city']}, {listing_data['state']}
- Type: {listing_data['property_type'].replace('_', ' ').title()}
- Size: {listing_data['bedrooms']} bed / {listing_data['bathrooms']} bath / {listing_data['square_feet']:,} sqft
- Features: {', '.join(listing_data.get('special_features') or ['N/A'])}

{"I have provided {num_images} property photo(s) above. Analyze what you actually SEE in the images.".replace("{num_images}", str(len(encoded_images))) if has_images else "No images could be loaded. Provide staging advice based on the property type and size."}

Provide specific, low-cost, high-impact improvement suggestions to maximize buyer appeal.

Return ONLY valid JSON:
{{
  "overall_impression": "2-3 sentences describing what you observe about this property's current presentation and its appeal to buyers",
  "room_by_room": [
    {{
      "room": "Room name (e.g., Living Room, Kitchen, Master Bedroom, Bathroom, Entryway)",
      "suggestions": ["Specific suggestion 1 based on what you see", "Specific suggestion 2", "Specific suggestion 3"],
      "priority": "high or medium or low"
    }}
  ],
  "curb_appeal": ["Specific exterior improvement 1", "Specific exterior improvement 2", "Specific exterior improvement 3"],
  "staging_tips": ["Specific staging tip 1", "Specific staging tip 2", "Specific staging tip 3", "Specific staging tip 4"]
}}

Include at least 4 rooms. Make suggestions SPECIFIC and ACTIONABLE — not generic advice."""
        })

        try:
            r = self.client.messages.create(
                model=self.model, max_tokens=2000,
                messages=[{"role": "user", "content": content}]
            )
            result = self._parse_json(r.content[0].text)
            result["_images_analyzed"] = len(encoded_images)
            return result
        except Exception as e:
            print(f"Error analyzing images: {e}")
            raise

    # ──────────────────────────────────────────────────────────────────────
    # AGENT 3: Pricing Strategy & Comparable Sales
    # ──────────────────────────────────────────────────────────────────────
    def generate_pricing_strategy(self, listing_data: dict, comps: List[dict]) -> dict:
        """Generate data-driven pricing strategy from real comp analysis"""
        asking = float(listing_data['asking_price'])
        sqft   = max(int(listing_data['square_feet']), 1)
        asking_ppsf = asking / sqft

        # Build a rich comps table
        comp_rows = []
        for c in comps:
            cp    = float(c['comp_price'])
            ppsf  = float(c.get('price_per_sqft', cp / max(int(c['square_feet']), 1)))
            dom   = c.get('days_on_market', 'N/A')
            dist  = c.get('distance_miles', '?')
            comp_rows.append(
                f"  • {c['comp_address']}: ${cp:,.0f} | "
                f"{c['bedrooms']}bd/{c['bathrooms']}ba | "
                f"{int(c['square_feet']):,}sqft | "
                f"${ppsf:.0f}/sqft | DOM: {dom} | {dist}mi away"
            )

        comp_block = "\n".join(comp_rows) if comp_rows else "  No comps available"

        avg_price = (sum(float(c['comp_price']) for c in comps) / len(comps)) if comps else asking
        avg_ppsf  = (sum(float(c.get('price_per_sqft', float(c['comp_price']) / max(int(c['square_feet']), 1))) for c in comps) / len(comps)) if comps else asking_ppsf
        avg_dom   = (sum(int(c.get('days_on_market', 15)) for c in comps) / len(comps)) if comps else 15

        # Estimate value based on comp price/sqft × subject sqft
        estimated_value = avg_ppsf * sqft

        prompt = f"""You are a licensed real estate appraiser analyzing a property listing.

SUBJECT PROPERTY:
- Address: {listing_data['address']}, {listing_data['city']}, {listing_data['state']}
- Current Asking Price: ${asking:,.0f}
- Size: {listing_data['bedrooms']}bd/{listing_data['bathrooms']}ba | {sqft:,} sqft
- Asking Price per Sqft: ${asking_ppsf:.0f}/sqft
- Features: {', '.join(listing_data.get('special_features') or ['Standard'])}

COMPARABLE SALES ({len(comps)} comps within area):
{comp_block}

MARKET SUMMARY:
- Average comp sale price: ${avg_price:,.0f}
- Average comp price/sqft: ${avg_ppsf:.0f}/sqft
- Estimated value (comp $/sqft × subject sqft): ${estimated_value:,.0f}
- Average days on market: {avg_dom:.0f} days
- Subject asking vs comp average: {((asking - avg_price) / avg_price * 100):+.1f}%
- Subject $/sqft vs comp average $/sqft: {((asking_ppsf - avg_ppsf) / avg_ppsf * 100):+.1f}%

TASK:
1. Determine if the current asking price (${asking:,.0f}) is aggressive, market-aligned, or premium
2. Recommend a specific price range based on the comp data
3. The price range should be grounded in the comp analysis — NOT just percentages of asking price

Return ONLY valid JSON:
{{
  "pricing_strategy": "aggressive_low or market_aligned or premium",
  "pricing_rationale": "3-4 sentences using SPECIFIC NUMBERS from the comp data. Compare asking $/sqft vs comp $/sqft. Explain whether the price is justified by the features and size. Reference the estimated value and market average.",
  "suggested_price_min": <integer: conservative estimate based on comps>,
  "suggested_price_max": <integer: optimistic estimate based on comps>
}}"""

        try:
            r = self.client.messages.create(
                model=self.model, max_tokens=1500,
                messages=[{"role": "user", "content": prompt}]
            )
            return self._parse_json(r.content[0].text)
        except Exception as e:
            print(f"Error generating pricing strategy: {e}")
            raise

    # ──────────────────────────────────────────────────────────────────────
    # AGENT 4: Offer Analysis (Seller Side)
    # ──────────────────────────────────────────────────────────────────────
    def analyze_offer(self, offer_data: dict, listing_data: dict, comps: List[dict]) -> dict:
        avg_comp = sum(float(c['comp_price']) for c in comps) / len(comps) if comps else float(listing_data['asking_price'])
        offer    = float(offer_data['offer_amount'])
        asking   = float(listing_data['asking_price'])

        prompt = f"""You are a senior real estate negotiation advisor representing the SELLER.

Listing: {listing_data['address']} | Asking: ${asking:,.0f} | Avg Comp: ${avg_comp:,.0f}

Buyer Offer:
- Amount: ${offer:,.0f} ({((offer-asking)/asking*100):+.1f}% vs asking, {((offer-avg_comp)/avg_comp*100):+.1f}% vs comps)
- Earnest: ${float(offer_data.get('earnest_money') or 0):,.0f}
- Closing: {offer_data.get('closing_timeline_days', 30)} days
- Contingencies: {', '.join(offer_data.get('contingencies') or ['None'])}
- Message: "{offer_data.get('buyer_message') or 'None'}"

Return ONLY valid JSON:
{{
  "ai_recommendation": "accept or reject or counter",
  "reasoning": "2-3 sentences with specific dollar amounts explaining the recommendation",
  "comparison_to_comps": {{
    "offer_vs_asking_percent": {round((offer-asking)/asking*100, 1)},
    "offer_vs_comps_avg_percent": {round((offer-avg_comp)/avg_comp*100, 1) if avg_comp > 0 else 0}
  }}
}}"""

        try:
            r = self.client.messages.create(
                model=self.model, max_tokens=800,
                messages=[{"role": "user", "content": prompt}]
            )
            return self._parse_json(r.content[0].text)
        except Exception as e:
            print(f"Error analyzing offer: {e}")
            raise

    # ──────────────────────────────────────────────────────────────────────
    # AGENT 5: Buyer Negotiation Strategy
    # ──────────────────────────────────────────────────────────────────────
    def generate_negotiation_strategy(self, listing_data: dict, comps: List[dict], buyer_budget: float, buyer_priorities: List[str]) -> dict:
        asking  = float(listing_data['asking_price'])
        sqft    = max(int(listing_data['square_feet']), 1)
        avg_dom = sum(int(c.get('days_on_market', 15)) for c in comps) / len(comps) if comps else 15

        # ── Use sqft-adjusted values, NOT raw comp prices ──────────────────
        # Raw comp avg is meaningless when homes differ in size.
        # Correct: avg $/sqft from comps × subject's sqft = fair value estimate.
        if comps:
            ppsf_values = [
                float(c.get('price_per_sqft') or float(c['comp_price']) / max(int(c['square_feet']), 1))
                for c in comps
            ]
            avg_ppsf        = sum(ppsf_values) / len(ppsf_values)
            estimated_value = avg_ppsf * sqft          # sqft-adjusted fair value
        else:
            estimated_value = asking
            avg_ppsf        = asking / sqft

        asking_ppsf   = asking / sqft
        diff_pct      = ((asking_ppsf - avg_ppsf) / avg_ppsf * 100) if avg_ppsf > 0 else 0

        # Offer range based on estimated fair value, capped by buyer budget
        optimal = int(min(estimated_value * 0.97, buyer_budget))
        min_offer = int(estimated_value * 0.93)
        max_offer = int(min(estimated_value * 1.01, buyer_budget))
        # Walk away = never exceed asking price; cap at fair value + small buffer
        walk_away = int(min(asking, estimated_value * 1.03))

        prompt = f"""You are a buyer's agent negotiation strategist.

Property: {listing_data['address']}
- Asking Price: ${asking:,.0f} (${asking_ppsf:.0f}/sqft)
- Sqft: {sqft:,}
- Estimated Fair Value (from comps $/sqft × size): ${estimated_value:,.0f}
- Asking vs Fair Value: {diff_pct:+.1f}%
- Market Avg $/sqft: ${avg_ppsf:.0f} | Avg Days on Market: {avg_dom:.0f}
- Buyer Budget: ${buyer_budget:,.0f}
- Priorities: {', '.join(buyer_priorities) if buyer_priorities else 'Fair price'}

The offer range has been calculated based on sqft-adjusted fair value (not raw comp prices).
Use these values in your JSON response — do NOT change the numbers.

Return ONLY valid JSON:
{{
  "recommended_approach": "One-sentence strategy that references the $/sqft analysis",
  "suggested_offer_range": {{
    "min": {min_offer},
    "max": {max_offer},
    "optimal": {optimal}
  }},
  "negotiation_tips": [
    "Tip 1 — specific to this property's pricing vs market",
    "Tip 2 — leverage point based on DOM or features",
    "Tip 3 — closing/contingency tactic"
  ],
  "walk_away_threshold": {walk_away},
  "leverage_points": [
    "Specific market data point 1",
    "Specific leverage point 2"
  ]
}}"""

        try:
            r = self.client.messages.create(
                model=self.model, max_tokens=1000,
                messages=[{"role": "user", "content": prompt}]
            )
            return self._parse_json(r.content[0].text)
        except Exception as e:
            print(f"Error generating negotiation strategy: {e}")
            raise


# Global singleton
claude_service = ClaudeService()
