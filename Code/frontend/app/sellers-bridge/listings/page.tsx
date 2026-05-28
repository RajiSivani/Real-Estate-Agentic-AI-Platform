'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { listingsApi, setAuthToken } from '@/lib/api'
import Link from 'next/link'

export default function ListingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadListings()
  }, [])

  const loadListings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      setAuthToken(user.id)
      const response = await listingsApi.getAll({ user_id: user.id })
      setListings(response.data || [])
    } catch (error) {
      console.error('Error loading listings:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const badges: any = {
      draft: 'bg-gray-200 text-gray-700',
      published: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      sold: 'bg-blue-100 text-blue-700'
    }
    return badges[status] || 'bg-gray-200'
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">My Listings</h1>
          <button 
            onClick={() => router.push('/sellers-bridge')}
            className="text-accent hover:underline"
          >
            ← Back to Dashboard
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-8">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading listings...</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="bg-white p-12 rounded-lg border text-center">
            <div className="text-6xl mb-4">🏠</div>
            <p className="text-muted-foreground mb-6">No listings yet</p>
            <Link
              href="/sellers-bridge/new-listing"
              className="inline-block bg-accent text-white px-6 py-3 rounded-lg hover:bg-accent/90"
            >
              Create Your First Listing
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {listings.map((listing) => (
              <div key={listing.id} className="bg-white p-6 rounded-lg border shadow-sm hover:shadow-md transition">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">{listing.address}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(listing.status)}`}>
                        {listing.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {listing.city}, {listing.state} {listing.zip_code}
                    </p>
                    <div className="flex gap-4 text-sm text-gray-600 mb-3">
                      <span>{listing.bedrooms} bed</span>
                      <span>{listing.bathrooms} bath</span>
                      <span>{listing.square_feet?.toLocaleString()} sqft</span>
                      <span>{listing.property_type}</span>
                    </div>
                    {listing.listing_summary && (
                      <p className="text-sm text-gray-600">{listing.listing_summary}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-accent mb-2">
                      ${listing.asking_price?.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mb-3">
                      Created {new Date(listing.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                {/* Marketing content preview */}
                {listing.social_copy && (
                  <div className="mt-4 pt-4 border-t">
                    <details className="text-sm">
                      <summary className="cursor-pointer text-accent font-medium">
                        View Marketing Content
                      </summary>
                      <div className="mt-2 p-3 bg-gray-50 rounded">
                        <p className="text-xs text-gray-600">
                          <strong>Social:</strong> {listing.social_copy}
                        </p>
                      </div>
                    </details>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
