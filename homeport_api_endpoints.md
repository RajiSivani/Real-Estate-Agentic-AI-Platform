# HOMEPORT API ENDPOINTS

## Base URL
`http://localhost:8000/api/v1`

---

## **AUTHENTICATION**
Handled by Supabase Auth - Frontend sends JWT token in Authorization header

---

## **1. LISTINGS ENDPOINTS**

### **POST /listings**
Create a new listing
```json
Request:
{
  "address": "123 Main St",
  "city": "San Jose",
  "state": "CA",
  "zip_code": "95123",
  "asking_price": 450000,
  "bedrooms": 3,
  "bathrooms": 2.0,
  "square_feet": 2100,
  "property_type": "single_family",
  "year_built": 1995,
  "lot_size": 5000,
  "special_features": ["updated kitchen", "hardwood floors"],
  "neighborhood_highlights": "Great schools, parks nearby",
  "agent_name": "Sarah Johnson",
  "agent_email": "sarah@homeport.com",
  "agent_phone": "408-555-0100"
}

Response: 201 Created
{
  "id": "uuid",
  "status": "draft",
  ...listing data
}
```

### **POST /listings/{listing_id}/generate-content**
Generate AI marketing content for a listing
```json
Request: (no body needed, pulls from listing data)

Response: 200 OK
{
  "social_copy": "...",
  "mls_description": "...",
  "brochure_copy": "...",
  "listing_summary": "..."
}
```

### **POST /listings/{listing_id}/analyze-images**
Analyze property images and generate improvement suggestions
```json
Request:
{
  "image_urls": [
    "https://storage.supabase.co/...",
    "https://storage.supabase.co/..."
  ]
}

Response: 200 OK
{
  "suggestions": {
    "overall_impression": "...",
    "room_by_room": [
      {
        "room": "Living Room",
        "suggestions": ["...", "..."],
        "priority": "high"
      }
    ],
    "curb_appeal": ["...", "..."],
    "staging_tips": ["...", "..."]
  }
}
```

### **POST /listings/{listing_id}/pricing-strategy**
Generate pricing strategy based on comps
```json
Request: (no body, uses listing data + comps)

Response: 200 OK
{
  "pricing_strategy": "market_aligned",
  "pricing_rationale": "Based on 5 comparable sales...",
  "suggested_price_min": 445000,
  "suggested_price_max": 465000,
  "comparable_sales": [
    {
      "address": "456 Maple Ave",
      "price": 445000,
      "price_per_sqft": 240.54,
      "days_on_market": 12,
      "distance_miles": 0.8
    }
  ]
}
```

### **GET /listings**
Get all listings (with filters)
```
Query params:
- status: draft | published | pending | sold
- user_id: filter by seller
- min_price: number
- max_price: number
- bedrooms: number
- bathrooms: number
- city: string

Response: 200 OK
{
  "listings": [...],
  "total": 10
}
```

### **GET /listings/{listing_id}**
Get single listing details
```json
Response: 200 OK
{
  "id": "uuid",
  "address": "...",
  ...full listing data,
  "images": [...],
  "comps": [...]
}
```

### **PATCH /listings/{listing_id}**
Update listing
```json
Request:
{
  "status": "published",
  "asking_price": 460000,
  ...any fields to update
}

Response: 200 OK
{
  ...updated listing
}
```

### **POST /listings/{listing_id}/images**
Upload listing images
```
Content-Type: multipart/form-data
files: [file1, file2, file3]

Response: 201 Created
{
  "images": [
    {
      "id": "uuid",
      "image_url": "https://...",
      "image_order": 0
    }
  ]
}
```

---

## **2. COMPS ENDPOINTS**

### **GET /comps/search**
Search for comparable homes
```
Query params:
- listing_id: optional, to filter already assigned comps
- city: string
- bedrooms: number
- bathrooms: number
- min_sqft: number
- max_sqft: number
- max_distance: number (miles)
- limit: number (default 5)

Response: 200 OK
{
  "comps": [
    {
      "id": "uuid",
      "comp_address": "456 Maple Ave",
      "comp_price": 445000,
      "price_per_sqft": 240.54,
      "distance_miles": 0.8,
      "relevance_score": 0.95
    }
  ]
}
```

### **POST /comps/assign**
Assign comps to a listing
```json
Request:
{
  "listing_id": "uuid",
  "comp_ids": ["uuid1", "uuid2", "uuid3"]
}

Response: 200 OK
{
  "message": "Comps assigned successfully",
  "count": 3
}
```

---

## **3. OFFERS ENDPOINTS**

### **POST /offers**
Create a new offer
```json
Request:
{
  "listing_id": "uuid",
  "offer_amount": 445000,
  "buyer_message": "We love this home...",
  "earnest_money": 10000,
  "contingencies": ["inspection", "financing"],
  "closing_timeline_days": 30
}

Response: 201 Created
{
  "id": "uuid",
  "listing_id": "uuid",
  "buyer_user_id": "uuid",
  "seller_user_id": "uuid",
  "offer_amount": 445000,
  "status": "pending",
  "offer_strategy_summary": "...",
  "created_at": "2024-03-25T10:00:00Z"
}
```

### **GET /offers**
Get offers (filtered by user role)
```
Query params:
- listing_id: filter by listing
- status: pending | accepted | rejected | countered

Response: 200 OK
{
  "offers": [
    {
      "id": "uuid",
      "listing": {...basic listing info},
      "offer_amount": 445000,
      "status": "pending",
      "created_at": "..."
    }
  ]
}
```

### **GET /offers/{offer_id}**
Get single offer details
```json
Response: 200 OK
{
  "id": "uuid",
  "listing": {...},
  "buyer_info": {...},
  "offer_amount": 445000,
  "buyer_message": "...",
  "offer_strategy_summary": "...",
  "ai_recommendation": "accept | reject | counter",
  "status": "pending"
}
```

### **POST /offers/{offer_id}/respond**
Seller responds to an offer
```json
Request:
{
  "action": "accept | reject | counter",
  "counter_amount": 455000, // if countering
  "counter_message": "...", // if countering
  "counter_terms": "..." // if countering
}

Response: 200 OK
{
  "offer": {...updated offer},
  "notification_sent": true
}
```

### **POST /offers/{offer_id}/analyze**
Get AI analysis and recommendation on an offer
```json
Request: (no body, analyzes existing offer)

Response: 200 OK
{
  "ai_recommendation": "accept",
  "reasoning": "The offer is above comps average and includes favorable terms...",
  "comparison_to_comps": {
    "offer_vs_asking": -1.1,
    "offer_vs_comps_avg": 2.3
  }
}
```

---

## **4. BUYER MATCHING ENDPOINTS**

### **POST /buyer/match**
Find properties matching buyer preferences
```json
Request:
{
  "min_price": 400000,
  "max_price": 500000,
  "preferred_cities": ["San Jose", "Campbell"],
  "min_bedrooms": 3,
  "min_bathrooms": 2.0,
  "min_square_feet": 1800,
  "property_types": ["single_family", "townhouse"],
  "must_have_features": ["updated kitchen", "garage"],
  "nice_to_have_features": ["pool", "view"]
}

Response: 200 OK
{
  "matches": [
    {
      "listing": {...},
      "match_score": 0.95,
      "match_reasons": [
        "Price within budget",
        "Has updated kitchen (must-have)",
        "3 bedrooms meets requirement"
      ],
      "missing_features": ["pool"]
    }
  ],
  "total_matches": 3
}
```

### **POST /buyer/evaluate-property**
Get buyer-side value evaluation for a property
```json
Request:
{
  "listing_id": "uuid"
}

Response: 200 OK
{
  "valuation": {
    "asking_price": 450000,
    "estimated_value": 455000,
    "comparable_average": 448000,
    "price_assessment": "fair", // underpriced | fair | overpriced
    "price_per_sqft_vs_comps": 240.54,
    "market_position": "Asking price is 0.4% above market average"
  },
  "comps_analysis": [...]
}
```

### **POST /buyer/negotiation-strategy**
Get negotiation strategy for a property
```json
Request:
{
  "listing_id": "uuid",
  "buyer_budget": 460000,
  "buyer_priorities": ["quick closing", "as-is condition"]
}

Response: 200 OK
{
  "strategy": {
    "recommended_approach": "Strong initial offer",
    "suggested_offer_range": {
      "min": 440000,
      "max": 450000,
      "optimal": 445000
    },
    "negotiation_tips": [
      "Offer is listed at $450K, comps suggest $448K average",
      "Consider offering $445K (1.1% below asking)",
      "Emphasize quick closing and minimal contingencies"
    ],
    "walk_away_threshold": 465000,
    "leverage_points": [
      "Market has 18 days average DOM",
      "You can close quickly"
    ]
  }
}
```

---

## **5. NOTIFICATIONS ENDPOINTS**

### **GET /notifications**
Get user notifications
```
Query params:
- is_read: true | false
- type: new_offer | offer_accepted | etc.
- limit: number

Response: 200 OK
{
  "notifications": [
    {
      "id": "uuid",
      "type": "new_offer",
      "title": "New Offer Received",
      "message": "You received an offer of $445,000 on 123 Main St",
      "related_listing_id": "uuid",
      "related_offer_id": "uuid",
      "is_read": false,
      "created_at": "2024-03-25T10:00:00Z"
    }
  ],
  "unread_count": 2
}
```

### **PATCH /notifications/{notification_id}**
Mark notification as read
```json
Request:
{
  "is_read": true
}

Response: 200 OK
{
  "message": "Notification updated"
}
```

### **POST /notifications/mark-all-read**
Mark all notifications as read
```json
Response: 200 OK
{
  "message": "All notifications marked as read",
  "count": 5
}
```

---

## **6. USER ENDPOINTS**

### **GET /users/me**
Get current user profile
```json
Response: 200 OK
{
  "id": "uuid",
  "email": "seller@demo.com",
  "full_name": "Sarah Johnson",
  "role": "seller",
  "phone": "408-555-0100"
}
```

### **PATCH /users/me**
Update user profile
```json
Request:
{
  "full_name": "Sarah J. Johnson",
  "phone": "408-555-0101"
}

Response: 200 OK
{
  ...updated profile
}
```

---

## **ERROR RESPONSES**

All endpoints follow this error format:

```json
400 Bad Request:
{
  "detail": "Validation error message"
}

401 Unauthorized:
{
  "detail": "Invalid or missing authentication token"
}

403 Forbidden:
{
  "detail": "You don't have permission to access this resource"
}

404 Not Found:
{
  "detail": "Resource not found"
}

500 Internal Server Error:
{
  "detail": "Internal server error",
  "error_id": "uuid" // for tracking
}
```

---

## **REALTIME SUBSCRIPTIONS**

Frontend can subscribe to Supabase Realtime channels:

### Notifications Channel
```javascript
const channel = supabase
  .channel('notifications')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `recipient_user_id=eq.${userId}`
    },
    (payload) => {
      // Handle new notification
    }
  )
  .subscribe()
```

### Offers Channel
```javascript
const channel = supabase
  .channel('offers')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'offers',
      filter: `seller_user_id=eq.${userId}`
    },
    (payload) => {
      // Handle offer changes
    }
  )
  .subscribe()
```
