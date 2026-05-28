# 🏠 HomePort - Demo Cases for Presentation

---

## DEMO CASE 1: "The Well-Priced Family Home"
**Story: Seller lists a fairly priced home → Buyer finds it a great deal → Offer accepted**

---

### 🏛️ SELLER SIDE — Listing Details (enter these in Create New Listing)

| Field | Value |
|-------|-------|
| **Street Address** | 234 Maple Grove Drive |
| **City** | San Jose |
| **State** | CA |
| **ZIP Code** | 95129 |
| **Asking Price** | $448,000 |
| **Bedrooms** | 3 |
| **Bathrooms** | 2 |
| **Square Feet** | 1,920 |
| **Property Type** | Single Family |
| **Key Features** | updated kitchen, hardwood floors, attached garage, new roof, energy-efficient windows |
| **Neighborhood** | Top-rated Moreland School District, walking distance to Westgate Mall, quiet family street, 10 min to downtown San Jose |
| **Agent Name** | Sarah Johnson |
| **Agent Email** | seller@demo.com |

**Image URLs to paste:**
```
https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800
https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800
https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800
```

**Expected AI Outcomes:**
- ✅ Marketing: Highlights school district, garage, updated kitchen
- ✅ Vision: Will suggest decluttering, professional staging, better curb appeal
- ✅ Pricing: Should show as "market_aligned" — $448K for 1,920 sqft = $233/sqft which aligns with comps

---

### 🧭 BUYER SIDE — Search Preferences (enter these in Find Matches)

| Field | Value |
|-------|-------|
| **Min Price** | 400,000 |
| **Max Price** | 470,000 |
| **City** | San Jose |
| **Min Bedrooms** | 3 |
| **Min Bathrooms** | 2 |

**Expected Outcomes:**
- ✅ Match Score: ~85-90% (price fits, 3bd/2ba, right city)
- ✅ Value Eval: Will show "fair" or "underpriced" — good buy signal
- ✅ Negotiation: AI suggests $440,000–$445,000 optimal offer

**Offer to Submit:**
- Offer Amount: $443,000
- Earnest Money: $10,000
- Closing: 30 days
- Buyer Message: "We love this neighborhood and are pre-approved. We can close quickly with minimal contingencies."

**Expected Seller Response:** Accept (offer is close to asking, good earnest money)

---

## DEMO CASE 2: "The Premium Listing with Counter Negotiation"
**Story: Seller lists premium home → Buyer offers lower → Seller counters → Buyer clicks Interested**

---

### 🏛️ SELLER SIDE — Listing Details

| Field | Value |
|-------|-------|
| **Street Address** | 891 Silicon Valley Boulevard |
| **City** | San Jose |
| **State** | CA |
| **ZIP Code** | 95134 |
| **Asking Price** | $495,000 |
| **Bedrooms** | 4 |
| **Bathrooms** | 2.5 |
| **Square Feet** | 2,200 |
| **Property Type** | Single Family |
| **Key Features** | smart home system, solar panels, pool, renovated master suite, 3-car garage, EV charging station, chef's kitchen |
| **Neighborhood** | North San Jose tech corridor, near Alviso Marina, top Berryessa schools, 5 min to BART, gated community |
| **Agent Name** | Sarah Johnson |
| **Agent Email** | seller@demo.com |

**Image URLs to paste:**
```
https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800
https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800
https://images.unsplash.com/photo-1560184897-ae75f418493e?w=800
```

**Expected AI Outcomes:**
- ✅ Marketing: Highlights smart home, solar, pool, tech location — premium language
- ✅ Vision: Will suggest pool area staging, EV charging signage, high-end staging touches
- ✅ Pricing: Should show as "market_aligned" or "premium" — 4bd/2.5ba with pool & solar justify $495K

---

### 🧭 BUYER SIDE — Search Preferences

| Field | Value |
|-------|-------|
| **Min Price** | 450,000 |
| **Max Price** | 520,000 |
| **City** | San Jose |
| **Min Bedrooms** | 4 |
| **Min Bathrooms** | 2 |

**Expected Outcomes:**
- ✅ Match Score: ~90-95% (4bd meets requirement, price fits)
- ✅ Value Eval: May show "fair" — $495K for 2,200 sqft = $225/sqft, slightly below some comps
- ✅ Negotiation: AI suggests $475,000–$488,000 optimal (3-5% below asking)

**Offer to Submit:**
- Offer Amount: $472,000
- Earnest Money: $15,000
- Closing: 25 days
- Buyer Message: "We are serious buyers and love the solar and EV setup. We can close in 25 days. Hope to find a fair middle ground."

**Expected Seller Response:** Counter at $485,000
**Counter Message:** "Thank you for your offer. Given the premium features including solar system (valued at $25K), pool, and smart home setup, we'd like to meet in the middle at $485,000."

**Buyer then clicks "🤝 Interested"** → Seller sees purple "Interested" signal in offers table

---

## DEMO FLOW SUMMARY

### 5-Minute Demo Script

| Time | Action | Who |
|------|--------|-----|
| 0:00 | Open homepage → Click "Get Started as Seller" | — |
| 0:15 | Login as seller@demo.com / demo123 | Seller |
| 0:20 | Click "New Listing" → Enter Case 1 or Case 2 details | Seller |
| 0:50 | Click "Generate Marketing Content" → Show AI output | Seller |
| 1:20 | Click "Analyze Property Images" → Show improvement tips | Seller |
| 1:50 | Click "Generate Pricing Strategy" → Show comps table | Seller |
| 2:20 | Click "Publish Listing" | Seller |
| 2:30 | Switch browser/tab → Login as buyer@demo.com / demo123 | Buyer |
| 2:40 | Enter search preferences → Click "Find Matches" | Buyer |
| 2:55 | Click "View & Make Offer" → Run AI Evaluation | Buyer |
| 3:10 | Get Negotiation Strategy → Note optimal offer | Buyer |
| 3:25 | Submit offer with amount + message | Buyer |
| 3:35 | Switch back to Seller → See 🔔 notification badge | Seller |
| 3:45 | Go to Offers → See offer in table with AI rec | Seller |
| 3:55 | Click "Counter" → Enter counter amount + message | Seller |
| 4:10 | Switch to Buyer → See "COUNTERED" status in My Offers | Buyer |
| 4:20 | Click "🤝 Interested" button on countered offer | Buyer |
| 4:30 | Switch to Seller → See purple "🤝 Interested" badge in offers table | Seller |
| 4:45 | Click "Accept" to close the deal | Seller |
| 4:55 | Done! 🎉 | — |

---

## QUICK REFERENCE — Demo Credentials

| Role | Email | Password | Portal |
|------|-------|----------|--------|
| Seller | seller@demo.com | demo123 | /sellers-bridge |
| Buyer | buyer@demo.com | demo123 | /buyers-compass |

**Pro tip for demo:** Use **Chrome** for Seller and **Edge** or **Firefox** for Buyer to avoid cross-session issues.

---

## WHAT EACH AI AGENT SHOWS

| Agent | Located In | What It Demonstrates |
|-------|-----------|---------------------|
| Listing & Marketing Content Generator | New Listing → Step 2 | AI writes MLS copy, social posts, brochure |
| Property Improvement Advisor | New Listing → Step 2 | Vision AI reviews photos for staging tips |
| Pricing Strategy Analyst | New Listing → Step 2 | Comp analysis → recommends price range |
| Offer Intelligence | Seller → Incoming Offers | AI recommends accept/reject/counter |
| Property Value Evaluation | Buyer → View & Make Offer | Checks if price is fair vs comps |
| Negotiation Strategy | Buyer → View & Make Offer | Optimal offer range + tips |
