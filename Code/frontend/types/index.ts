export interface Listing {
  id: string
  seller_user_id: string
  address: string
  city: string
  state: string
  zip_code: string
  asking_price: number
  bedrooms: number
  bathrooms: number
  square_feet: number
  property_type: string
  year_built?: number
  lot_size?: number
  special_features?: string[]
  neighborhood_highlights?: string
  agent_name: string
  agent_email: string
  agent_phone?: string
  social_copy?: string
  mls_description?: string
  brochure_copy?: string
  listing_summary?: string
  vision_suggestions?: any
  pricing_strategy?: string
  pricing_rationale?: string
  suggested_price_min?: number
  suggested_price_max?: number
  status: 'draft' | 'published' | 'pending' | 'sold' | 'withdrawn'
  created_at: string
  updated_at: string
  published_at?: string
  images?: ListingImage[]
}

export interface ListingImage {
  id: string
  listing_id: string
  image_url: string
  image_order: number
  caption?: string
  is_primary: boolean
  created_at: string
}

export interface Offer {
  id: string
  listing_id: string
  buyer_user_id: string
  seller_user_id: string
  offer_amount: number
  buyer_message?: string
  earnest_money?: number
  contingencies?: string[]
  closing_timeline_days?: number
  offer_strategy_summary?: string
  ai_recommendation?: string
  counter_amount?: number
  counter_message?: string
  counter_terms?: string
  status: 'pending' | 'accepted' | 'rejected' | 'countered' | 'withdrawn'
  created_at: string
  updated_at: string
  responded_at?: string
}

export interface Notification {
  id: string
  recipient_user_id: string
  type: string
  title: string
  message: string
  related_listing_id?: string
  related_offer_id?: string
  is_read: boolean
  read_at?: string
  created_at: string
}

export interface ComparableSale {
  id: string
  comp_address: string
  comp_city: string
  comp_state: string
  comp_price: number
  bedrooms: number
  bathrooms: number
  square_feet: number
  property_type: string
  sale_date?: string
  days_on_market?: number
  price_per_sqft: number
  distance_miles: number
  relevance_score?: number
}

export interface BuyerPreferences {
  min_price?: number
  max_price?: number
  preferred_cities?: string[]
  min_bedrooms?: number
  min_bathrooms?: number
  min_square_feet?: number
  property_types?: string[]
  must_have_features?: string[]
  nice_to_have_features?: string[]
}

export interface PropertyMatch {
  listing: Listing
  match_score: number
  match_reasons: string[]
  missing_features: string[]
}
