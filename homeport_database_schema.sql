-- ============================================
-- HOMEPORT DATABASE SCHEMA
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE (managed by Supabase Auth)
-- ============================================
-- Note: Supabase Auth manages users in auth.users
-- We'll add a profiles table for additional user data

CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL CHECK (role IN ('seller', 'buyer')),
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- LISTINGS TABLE
-- ============================================
CREATE TABLE listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Property Details
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip_code TEXT NOT NULL,
    asking_price DECIMAL(12, 2) NOT NULL,
    bedrooms INTEGER NOT NULL,
    bathrooms DECIMAL(3, 1) NOT NULL,
    square_feet INTEGER NOT NULL,
    property_type TEXT NOT NULL CHECK (property_type IN ('single_family', 'condo', 'townhouse', 'multi_family', 'land')),
    year_built INTEGER,
    lot_size DECIMAL(10, 2),
    
    -- Additional Details
    special_features TEXT[],
    neighborhood_highlights TEXT,
    agent_name TEXT NOT NULL,
    agent_email TEXT NOT NULL,
    agent_phone TEXT,
    
    -- AI-Generated Content
    social_copy TEXT,
    mls_description TEXT,
    brochure_copy TEXT,
    listing_summary TEXT,
    
    -- Vision Analysis
    vision_suggestions JSONB,
    
    -- Pricing Strategy
    pricing_strategy TEXT,
    pricing_rationale TEXT,
    suggested_price_min DECIMAL(12, 2),
    suggested_price_max DECIMAL(12, 2),
    
    -- Status
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'pending', 'sold', 'withdrawn')),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ
);

-- ============================================
-- LISTING IMAGES TABLE
-- ============================================
CREATE TABLE listing_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    image_order INTEGER NOT NULL DEFAULT 0,
    caption TEXT,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- COMPARABLE SALES (COMPS) TABLE
-- ============================================
CREATE TABLE comps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
    
    -- Comp Property Details
    comp_address TEXT NOT NULL,
    comp_city TEXT NOT NULL,
    comp_state TEXT NOT NULL,
    comp_price DECIMAL(12, 2) NOT NULL,
    bedrooms INTEGER NOT NULL,
    bathrooms DECIMAL(3, 1) NOT NULL,
    square_feet INTEGER NOT NULL,
    property_type TEXT NOT NULL,
    
    -- Sale Details
    sale_date DATE,
    days_on_market INTEGER,
    price_per_sqft DECIMAL(10, 2),
    
    -- Proximity
    distance_miles DECIMAL(5, 2),
    
    -- Source/Context
    source TEXT DEFAULT 'staged', -- 'staged', 'api', 'manual'
    relevance_score DECIMAL(3, 2), -- 0.00 to 1.00
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- OFFERS TABLE
-- ============================================
CREATE TABLE offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    buyer_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    seller_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Offer Details
    offer_amount DECIMAL(12, 2) NOT NULL,
    buyer_message TEXT,
    earnest_money DECIMAL(12, 2),
    contingencies TEXT[],
    closing_timeline_days INTEGER,
    
    -- AI-Generated Analysis
    offer_strategy_summary TEXT,
    ai_recommendation TEXT,
    
    -- Counter Offer (if applicable)
    counter_amount DECIMAL(12, 2),
    counter_message TEXT,
    counter_terms TEXT,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'countered', 'withdrawn')),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    responded_at TIMESTAMPTZ
);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Notification Details
    type TEXT NOT NULL CHECK (type IN ('new_offer', 'offer_accepted', 'offer_rejected', 'offer_countered', 'listing_published', 'system')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    
    -- Related Entities
    related_listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
    related_offer_id UUID REFERENCES offers(id) ON DELETE CASCADE,
    
    -- Read Status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- BUYER PREFERENCES TABLE
-- ============================================
CREATE TABLE buyer_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Search Criteria
    min_price DECIMAL(12, 2),
    max_price DECIMAL(12, 2),
    preferred_cities TEXT[],
    preferred_states TEXT[],
    min_bedrooms INTEGER,
    min_bathrooms DECIMAL(3, 1),
    min_square_feet INTEGER,
    property_types TEXT[],
    
    -- Must-Have Features
    must_have_features TEXT[],
    nice_to_have_features TEXT[],
    
    -- Additional
    max_commute_distance DECIMAL(5, 2),
    school_district_importance INTEGER, -- 1-5 scale
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SAVED PROPERTIES TABLE
-- ============================================
CREATE TABLE saved_properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(buyer_user_id, listing_id)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Listings
CREATE INDEX idx_listings_seller ON listings(seller_user_id);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_price ON listings(asking_price);
CREATE INDEX idx_listings_city ON listings(city);
CREATE INDEX idx_listings_created ON listings(created_at DESC);

-- Listing Images
CREATE INDEX idx_listing_images_listing ON listing_images(listing_id);

-- Comps
CREATE INDEX idx_comps_listing ON comps(listing_id);
CREATE INDEX idx_comps_relevance ON comps(relevance_score DESC);

-- Offers
CREATE INDEX idx_offers_listing ON offers(listing_id);
CREATE INDEX idx_offers_buyer ON offers(buyer_user_id);
CREATE INDEX idx_offers_seller ON offers(seller_user_id);
CREATE INDEX idx_offers_status ON offers(status);
CREATE INDEX idx_offers_created ON offers(created_at DESC);

-- Notifications
CREATE INDEX idx_notifications_recipient ON notifications(recipient_user_id);
CREATE INDEX idx_notifications_unread ON notifications(recipient_user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- Buyer Preferences
CREATE INDEX idx_buyer_preferences_user ON buyer_preferences(buyer_user_id);

-- Saved Properties
CREATE INDEX idx_saved_properties_buyer ON saved_properties(buyer_user_id);
CREATE INDEX idx_saved_properties_listing ON saved_properties(listing_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE comps ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyer_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_properties ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Listings: Sellers can CRUD their own, buyers can read published
CREATE POLICY "Sellers can view own listings" ON listings
    FOR SELECT USING (auth.uid() = seller_user_id);

CREATE POLICY "Buyers can view published listings" ON listings
    FOR SELECT USING (status = 'published');

CREATE POLICY "Sellers can create listings" ON listings
    FOR INSERT WITH CHECK (auth.uid() = seller_user_id);

CREATE POLICY "Sellers can update own listings" ON listings
    FOR UPDATE USING (auth.uid() = seller_user_id);

-- Listing Images: Follow listing permissions
CREATE POLICY "View images of viewable listings" ON listing_images
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM listings 
            WHERE listings.id = listing_images.listing_id 
            AND (listings.seller_user_id = auth.uid() OR listings.status = 'published')
        )
    );

-- Comps: Viewable by listing owner and buyers viewing published listings
CREATE POLICY "View comps for accessible listings" ON comps
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM listings 
            WHERE listings.id = comps.listing_id 
            AND (listings.seller_user_id = auth.uid() OR listings.status = 'published')
        )
    );

-- Offers: Buyers see their own, sellers see offers on their listings
CREATE POLICY "Buyers can view own offers" ON offers
    FOR SELECT USING (auth.uid() = buyer_user_id);

CREATE POLICY "Sellers can view offers on their listings" ON offers
    FOR SELECT USING (auth.uid() = seller_user_id);

CREATE POLICY "Buyers can create offers" ON offers
    FOR INSERT WITH CHECK (auth.uid() = buyer_user_id);

CREATE POLICY "Sellers can update offers on their listings" ON offers
    FOR UPDATE USING (auth.uid() = seller_user_id);

-- Notifications: Users can view their own
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = recipient_user_id);

CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = recipient_user_id);

-- Buyer Preferences: Users can CRUD their own
CREATE POLICY "Buyers can view own preferences" ON buyer_preferences
    FOR SELECT USING (auth.uid() = buyer_user_id);

CREATE POLICY "Buyers can manage own preferences" ON buyer_preferences
    FOR ALL USING (auth.uid() = buyer_user_id);

-- Saved Properties: Buyers can CRUD their own
CREATE POLICY "Buyers can manage saved properties" ON saved_properties
    FOR ALL USING (auth.uid() = buyer_user_id);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON listings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_offers_updated_at BEFORE UPDATE ON offers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_buyer_preferences_updated_at BEFORE UPDATE ON buyer_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- REALTIME PUBLICATION
-- ============================================

-- Enable realtime for notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE offers;
