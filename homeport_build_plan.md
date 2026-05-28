# HOMEPORT - STEP-BY-STEP BUILD PLAN

## **PHASE 0: ENVIRONMENT SETUP (30 minutes)**

### 1. Create Supabase Project
- [ ] Go to supabase.com and create new project
- [ ] Note down:
  - Project URL
  - Anon/Public Key
  - Service Role Key (for backend)
- [ ] Run `homeport_database_schema.sql` in Supabase SQL Editor
- [ ] Run `homeport_seed_comps.sql` in Supabase SQL Editor
- [ ] Enable Realtime for `notifications` and `offers` tables
- [ ] Configure Storage bucket named `property-images` (public read access)

### 2. Get Claude API Key
- [ ] Get API key from console.anthropic.com
- [ ] Note down for backend .env

### 3. Create Test Accounts
In Supabase Auth, create two test users:
- [ ] seller@demo.com / password: demo123 (role: seller)
- [ ] buyer@demo.com / password: demo123 (role: buyer)

After creating users, insert profiles:
```sql
INSERT INTO profiles (id, email, full_name, role, phone)
VALUES 
  ('seller-uuid-from-auth', 'seller@demo.com', 'Sarah Johnson', 'seller', '408-555-0100'),
  ('buyer-uuid-from-auth', 'buyer@demo.com', 'Mike Chen', 'buyer', '408-555-0200');
```

---

## **PHASE 1: BACKEND FOUNDATION (4-6 hours)**

### Step 1: Initialize FastAPI Project
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install fastapi uvicorn supabase anthropic python-dotenv pydantic pillow
pip freeze > requirements.txt
```

### Step 2: Create Core Files
- [ ] `app/config.py` - Environment variables and settings
- [ ] `app/database.py` - Supabase client initialization
- [ ] `app/main.py` - FastAPI app with CORS

### Step 3: Build Models (Pydantic schemas)
- [ ] `app/models/listing.py`
- [ ] `app/models/offer.py`
- [ ] `app/models/comp.py`
- [ ] `app/models/notification.py`

### Step 4: Build Claude Service
- [ ] `app/services/claude_service.py`
  - Marketing content generation
  - Vision-based image analysis
  - Offer analysis

### Step 5: Build Business Logic Services
- [ ] `app/services/listing_service.py`
- [ ] `app/services/comp_service.py`
- [ ] `app/services/offer_service.py`

### Step 6: Build API Routers
- [ ] `app/routers/listings.py` - CRUD + AI generation endpoints
- [ ] `app/routers/offers.py` - Offer management + AI analysis
- [ ] `app/routers/comps.py` - Comp search and assignment
- [ ] `app/routers/notifications.py` - Notification management
- [ ] `app/routers/buyer.py` - Matching, evaluation, negotiation

### Step 7: Test Backend
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
Test each endpoint with curl or Postman

---

## **PHASE 2: FRONTEND FOUNDATION (3-4 hours)**

### Step 1: Initialize Next.js Project
```bash
npx create-next-app@latest frontend --typescript --tailwind --app
cd frontend
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install lucide-react class-variance-authority clsx tailwind-merge
```

### Step 2: Install shadcn/ui
```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add card button input label textarea badge alert separator tabs table
```

### Step 3: Configure Tailwind Theme
Update `tailwind.config.ts` with HomePort colors:
```typescript
colors: {
  primary: { DEFAULT: '#334155', foreground: '#fefdfb' },
  accent: { DEFAULT: '#0d9488', foreground: '#ffffff' },
  background: '#fefdfb',
  card: '#ffffff',
  // ... rest of colors
}
```

### Step 4: Set Up Supabase Client
- [ ] Create `lib/supabase/client.ts` (client-side)
- [ ] Create `lib/supabase/server.ts` (server-side)
- [ ] Create `lib/supabase/middleware.ts` (auth middleware)

### Step 5: Create Type Definitions
- [ ] `types/index.ts` - All TypeScript interfaces matching backend models

### Step 6: Create API Client
- [ ] `lib/api.ts` - Axios/fetch wrapper for backend calls

---

## **PHASE 3: AUTHENTICATION & LANDING PAGE (2-3 hours)**

### Step 1: Build Landing Page
- [ ] `app/page.tsx` - Hero, How It Works, Testimonials, Footer
- [ ] Components:
  - `components/layout/Header.tsx`
  - `components/layout/Footer.tsx`
  - `components/landing/Hero.tsx`
  - `components/landing/HowItWorks.tsx`
  - `components/landing/Testimonials.tsx`

### Step 2: Build Auth Pages
- [ ] `app/auth/login/page.tsx` - Login form with role-based redirect
- [ ] `app/auth/callback/route.ts` - Supabase auth callback handler

### Step 3: Add Middleware
- [ ] `middleware.ts` - Protect dashboard routes

---

## **PHASE 4: SELLER'S BRIDGE DASHBOARD (6-8 hours)**

### Step 1: Dashboard Layout
- [ ] `app/sellers-bridge/layout.tsx` - Sidebar + Header
- [ ] `components/layout/Sidebar.tsx` - Navigation menu
- [ ] `components/layout/NotificationBadge.tsx` - Real-time badge

### Step 2: Overview Page
- [ ] `app/sellers-bridge/page.tsx`
- [ ] Show stats cards (active listings, pending offers)
- [ ] Recent activity feed

### Step 3: New Listing Page
- [ ] `app/sellers-bridge/new-listing/page.tsx`
- [ ] Multi-step form:
  1. Property details
  2. Image upload
  3. AI content generation
  4. Vision analysis
  5. Pricing strategy
  6. Review & publish
- [ ] Components:
  - `components/seller/ListingForm.tsx`
  - `components/seller/ImageUpload.tsx`
  - `components/seller/MarketingContent.tsx`
  - `components/seller/VisionSuggestions.tsx`
  - `components/seller/PricingStrategy.tsx`

### Step 4: My Listings Page
- [ ] `app/sellers-bridge/listings/page.tsx`
- [ ] List view with filters
- [ ] Detail modal/page per listing

### Step 5: Offers Page
- [ ] `app/sellers-bridge/offers/page.tsx`
- [ ] Real-time offer cards
- [ ] Accept/Reject/Counter actions
- [ ] Components:
  - `components/seller/OfferCard.tsx`
  - `components/seller/OfferDecisionModal.tsx`

### Step 6: Comps Page (Optional)
- [ ] `app/sellers-bridge/comps/page.tsx`
- [ ] View all assigned comps across listings

---

## **PHASE 5: BUYER'S COMPASS DASHBOARD (6-8 hours)**

### Step 1: Dashboard Layout
- [ ] `app/buyers-compass/layout.tsx` - Sidebar + Header

### Step 2: Search/Match Page
- [ ] `app/buyers-compass/page.tsx`
- [ ] Preference form
- [ ] Matched properties list
- [ ] Components:
  - `components/buyer/PreferenceForm.tsx`
  - `components/buyer/PropertyCard.tsx`

### Step 3: Property Detail View
- [ ] `app/buyers-compass/property/[id]/page.tsx` or modal
- [ ] Show listing details
- [ ] Value evaluation panel
- [ ] Negotiation strategy panel
- [ ] Send offer button
- [ ] Components:
  - `components/buyer/PropertyDetails.tsx`
  - `components/buyer/ValueEvaluation.tsx`
  - `components/buyer/NegotiationStrategy.tsx`
  - `components/buyer/SendOfferModal.tsx`

### Step 4: Saved Properties Page
- [ ] `app/buyers-compass/saved/page.tsx`
- [ ] List of saved properties
- [ ] Quick actions

### Step 5: My Offers Page
- [ ] `app/buyers-compass/offers/page.tsx`
- [ ] View submitted offers
- [ ] Track status (pending/accepted/rejected/countered)

---

## **PHASE 6: REAL-TIME FEATURES (2-3 hours)**

### Step 1: Notification System
- [ ] Set up Supabase Realtime subscription in seller dashboard
- [ ] Toast/alert when new offer arrives
- [ ] Update notification badge in real-time

### Step 2: Offer Updates
- [ ] Real-time offer status updates on buyer side
- [ ] Notification when seller responds

### Step 3: Testing Real-time Flow
- [ ] Open buyer dashboard in one browser
- [ ] Open seller dashboard in another
- [ ] Submit offer from buyer → verify seller receives it instantly

---

## **PHASE 7: POLISH & DEMO PREP (3-4 hours)**

### Step 1: Copy/Print Features
- [ ] Add copy-to-clipboard for marketing content
- [ ] Add print-friendly CSS for reports
- [ ] Export buttons where needed

### Step 2: Error Handling
- [ ] Add loading states
- [ ] Add error boundaries
- [ ] Add user-friendly error messages

### Step 3: Demo Data Seeding
- [ ] Create 2-3 sample listings via seller dashboard
- [ ] Upload sample images (use placeholder/stock photos)
- [ ] Generate marketing content for each
- [ ] Save buyer preferences that will match these listings

### Step 4: Demo Script
Write a 5-minute demo walkthrough:
1. Start at landing page
2. Login as seller
3. Create new listing
4. Show AI features
5. Login as buyer
6. Search properties
7. Send offer
8. Switch to seller
9. Show notification
10. Accept offer

### Step 5: README & Documentation
- [ ] Update main README.md with setup instructions
- [ ] Add screenshots
- [ ] Add demo credentials
- [ ] List all features

---

## **TESTING CHECKLIST**

### Backend Tests
- [ ] All endpoints return correct status codes
- [ ] Authentication works properly
- [ ] Claude API integration generates content
- [ ] Image analysis works
- [ ] Comp matching algorithm works
- [ ] Offer workflow (create → respond) works

### Frontend Tests
- [ ] All pages render without errors
- [ ] Forms validate input
- [ ] Image upload works
- [ ] Real-time notifications work
- [ ] Role-based routing works (seller can't access buyer routes)
- [ ] Logout works
- [ ] Mobile responsive (bonus)

### Integration Tests
- [ ] End-to-end demo flow works smoothly
- [ ] No console errors
- [ ] All AI features functional
- [ ] Database updates correctly

---

## **TIME ESTIMATE**

| Phase | Hours |
|-------|-------|
| Phase 0: Setup | 0.5 |
| Phase 1: Backend | 5 |
| Phase 2: Frontend Foundation | 3.5 |
| Phase 3: Auth & Landing | 2.5 |
| Phase 4: Seller's Bridge | 7 |
| Phase 5: Buyer's Compass | 7 |
| Phase 6: Real-time | 2.5 |
| Phase 7: Polish | 3.5 |
| **Total** | **31.5 hours** |

With focused work: **3-4 full days** or **1-2 weeks part-time**

---

## **DEPLOYMENT NOTES (Optional)**

If deploying for live demo:

### Frontend (Vercel)
```bash
vercel --prod
```

### Backend (Railway or Render)
- Push to GitHub
- Connect Railway/Render to repo
- Set environment variables
- Deploy

### Environment Variables
Frontend (.env.local):
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Backend (.env):
```
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
ANTHROPIC_API_KEY=
CORS_ORIGINS=http://localhost:3000
```

---

## **PRIORITY ORDER**

If time is limited, build in this order:

### **MVP Core (Must Have)**
1. ✅ Database + Backend API
2. ✅ Seller: Create listing + upload images
3. ✅ Seller: Generate marketing content (Claude API)
4. ✅ Buyer: Search properties
5. ✅ Buyer: Send offer
6. ✅ Seller: Receive & accept offer
7. ✅ Real-time notification

### **Enhanced (Should Have)**
8. Vision-based suggestions
9. Pricing strategy
10. Buyer value evaluation
11. Negotiation strategy
12. Counter-offer flow

### **Polish (Nice to Have)**
13. Copy/print features
14. Saved properties
15. Detailed analytics
16. Email notifications

---

## **NEXT STEPS**

Once you confirm this plan looks good, I'll start generating:
1. Backend code (config, models, services, routers)
2. Frontend code (pages, components, utilities)
3. Integration code (API client, Supabase setup)

Let me know if you want to proceed!
