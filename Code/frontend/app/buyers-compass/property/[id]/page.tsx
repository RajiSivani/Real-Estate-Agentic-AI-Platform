'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { listingsApi, buyerApi, offersApi, setAuthToken, api } from '@/lib/api'

export default function PropertyDetailPage() {
  const router      = useRouter()
  const params      = useParams()
  const supabase    = createClient()
  const propertyId  = params?.id as string

  const [listing, setListing]           = useState<any>(null)
  const [evaluation, setEvaluation]     = useState<any>(null)
  const [strategy, setStrategy]         = useState<any>(null)
  const [loading, setLoading]           = useState(true)
  const [loadingEval, setLoadingEval]   = useState(false)
  const [loadingStrat, setLoadingStrat] = useState(false)
  const [submitting, setSubmitting]     = useState(false)

  // Track which offers the buyer has already clicked Interested on
  const [sentInterestOfferIds, setSentInterestOfferIds] = useState<Set<string>>(new Set())
  const [sendingInterest, setSendingInterest]           = useState<string | null>(null)
  const [currentUser, setCurrentUser]                   = useState<any>(null)

  // Offer form
  const [offerAmount, setOfferAmount]   = useState('')
  const [buyerMessage, setBuyerMessage] = useState('')
  const [earnestMoney, setEarnestMoney] = useState('10000')
  const [closingDays, setClosingDays]   = useState('30')

  useEffect(() => { loadPage() }, [propertyId])

  const loadPage = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      setCurrentUser(user)
      setAuthToken(user.id)

      // Load listing + existing offers in parallel
      const [listingRes, offerRes] = await Promise.all([
        listingsApi.getOne(propertyId),
        offersApi.getAll({ buyer_user_id: user.id, listing_id: propertyId }),
      ])

      setListing(listingRes.data)
      setOfferAmount(listingRes.data.asking_price.toString())

      // Track which offers this buyer already sent "Interested" for
      // We store in sessionStorage so it persists across re-renders but resets on new session
      const key = `interested_${user.id}_${propertyId}`
      const stored = sessionStorage.getItem(key)
      if (stored) {
        setSentInterestOfferIds(new Set(JSON.parse(stored)))
      }
    } catch (e) {
      console.error('Error loading:', e)
      alert('Property not found')
      router.push('/buyers-compass')
    } finally {
      setLoading(false)
    }
  }

  // ── Agent 1: Property Value Evaluator ────────────────────────
  const handleEvaluate = async () => {
    setLoadingEval(true)
    try {
      const res = await buyerApi.evaluateProperty(propertyId)
      setEvaluation(res.data)
    } catch {
      alert('Error evaluating property. Make sure backend is running.')
    } finally {
      setLoadingEval(false)
    }
  }

  // ── Agent 2: Negotiation Strategy Advisor ────────────────────
  const handleGetStrategy = async () => {
    if (!listing) return
    setLoadingStrat(true)
    try {
      const res = await buyerApi.negotiationStrategy({
        listing_id:       propertyId,
        buyer_budget:     listing.asking_price * 1.1,
        buyer_priorities: ['quick closing', 'fair price'],
      })
      setStrategy(res.data.strategy)
    } catch {
      alert('Error getting negotiation strategy.')
    } finally {
      setLoadingStrat(false)
    }
  }

  // ── Submit Offer ─────────────────────────────────────────────
  const handleSubmitOffer = async () => {
    if (!offerAmount) { alert('Please enter an offer amount'); return }
    setSubmitting(true)
    try {
      await offersApi.create({
        listing_id:           propertyId,
        offer_amount:         parseFloat(offerAmount),
        buyer_message:        buyerMessage,
        earnest_money:        parseFloat(earnestMoney),
        contingencies:        ['inspection', 'financing'],
        closing_timeline_days: parseInt(closingDays),
      })
      alert('🎉 Offer submitted! Track it under "My Offers".')
      router.push('/buyers-compass?tab=offers')
    } catch {
      alert('Error submitting offer.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Interested button — tracks sent state, disables after click ──
  const handleInterested = async (offerId: string, sellerUserId: string) => {
    setSendingInterest(offerId)
    try {
      await api.post('/api/v1/notifications', {
        recipient_user_id:  sellerUserId,
        type:               'system',
        title:              '🤝 Buyer Is Interested!',
        message:            `Buyer wants to move forward on ${listing?.address} despite the counter offer.`,
        related_listing_id: propertyId,
        related_offer_id:   offerId,
      })

      // Persist sent state in sessionStorage so button stays disabled
      const key = `interested_${currentUser?.id}_${propertyId}`
      const updated = new Set(sentInterestOfferIds)
      updated.add(offerId)
      setSentInterestOfferIds(updated)
      sessionStorage.setItem(key, JSON.stringify([...updated]))

      alert('✅ Seller notified you want to proceed!')
    } catch {
      alert('Could not send notification. Please try again.')
    } finally {
      setSendingInterest(null)
    }
  }

  const fmt = (n: any) => n != null ? `$${Number(n).toLocaleString()}` : '—'

  if (loading) return (
    <div className="min-h-screen bg-emerald-50 flex items-center justify-center">
      <div className="text-center"><div className="text-4xl mb-3">🧭</div><p className="text-emerald-700">Loading property…</p></div>
    </div>
  )

  if (!listing) return null

  return (
    <div className="min-h-screen bg-emerald-50">
      {/* Header */}
      <header className="bg-emerald-800 text-white shadow">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span>🧭</span>
            <span className="font-bold">Property Details</span>
          </div>
          <button onClick={() => router.push('/buyers-compass')}
            className="text-emerald-300 hover:text-white text-sm font-medium">
            ← Back to Search
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto p-8 space-y-6">

        {/* ── Property Info Card ─────────────────────────────── */}
        <div className="bg-white p-8 rounded-xl border shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold text-slate-800">{listing.address}</h2>
              <p className="text-slate-500 mt-1 mb-4">{listing.city}, {listing.state} {listing.zip_code}</p>
              <div className="flex gap-6 text-slate-600 text-sm">
                <span>🛏 {listing.bedrooms} bed</span>
                <span>🚿 {listing.bathrooms} bath</span>
                <span>📐 {Number(listing.square_feet).toLocaleString()} sqft</span>
                <span>🏠 {listing.property_type}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold text-emerald-700">{fmt(listing.asking_price)}</p>
              <p className="text-sm text-slate-400 mt-1">
                ${(listing.asking_price / listing.square_feet).toFixed(0)}/sqft
              </p>
            </div>
          </div>

          {listing.special_features?.length > 0 && (
            <div className="mt-5 pt-5 border-t">
              <p className="text-sm font-semibold text-slate-600 mb-2">Features:</p>
              <div className="flex flex-wrap gap-2">
                {listing.special_features.map((f: string, i: number) => (
                  <span key={i} className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm">{f}</span>
                ))}
              </div>
            </div>
          )}

          {listing.mls_description && (
            <div className="mt-5 pt-5 border-t">
              <p className="text-sm font-semibold text-slate-600 mb-2">Description:</p>
              <p className="text-slate-700 text-sm leading-relaxed">{listing.mls_description}</p>
            </div>
          )}
        </div>

        {/* ── Agent 1: Property Value Evaluator ──────────────── */}
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">📊</span>
            <h3 className="text-lg font-bold text-slate-800">Property Value Evaluator</h3>
          </div>
          <p className="text-sm text-slate-500 mb-4">
            Compares this listing's price against recent comparable sales to assess fair value
          </p>

          <button
            onClick={handleEvaluate}
            disabled={loadingEval || !!evaluation}
            className={`px-6 py-2 rounded-lg text-sm font-semibold mb-4 ${
              evaluation
                ? 'bg-green-600 text-white'
                : 'bg-emerald-700 text-white hover:bg-emerald-800 disabled:opacity-50'
            }`}
          >
            {evaluation ? '✅ Evaluated' : loadingEval ? 'Evaluating…' : 'Evaluate Property Value'}
          </button>

          {evaluation && (
            <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Asking Price</p>
                  <p className="text-lg font-bold text-slate-800">{fmt(evaluation.valuation.asking_price)}</p>
                  <p className="text-xs text-slate-400">${evaluation.valuation.asking_price_per_sqft?.toFixed(0)}/sqft</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Estimated Fair Value</p>
                  <p className="text-lg font-bold text-slate-800">
                    {fmt(Math.round(evaluation.valuation.estimated_value))}
                  </p>
                  <p className="text-xs text-slate-400">${evaluation.valuation.price_per_sqft_vs_comps?.toFixed(0)}/sqft avg</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">$/sqft vs Market</p>
                  <p className={`text-lg font-bold ${
                    evaluation.valuation.diff_percent > 5 ? 'text-red-600' :
                    evaluation.valuation.diff_percent < -5 ? 'text-blue-600' :
                    'text-green-600'
                  }`}>
                    {evaluation.valuation.diff_percent > 0 ? '+' : ''}{evaluation.valuation.diff_percent?.toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Assessment</p>
                  <p className={`text-lg font-bold ${
                    evaluation.valuation.price_assessment === 'fair'        ? 'text-green-600' :
                    evaluation.valuation.price_assessment === 'underpriced' ? 'text-blue-600' :
                    'text-red-600'
                  }`}>
                    {evaluation.valuation.price_assessment.toUpperCase()}
                  </p>
                </div>
              </div>
              <p className="text-sm text-slate-600 bg-white p-3 rounded-lg">{evaluation.valuation.market_position}</p>
            </div>
          )}
        </div>

        {/* ── Agent 2: Negotiation Strategy Advisor ──────────── */}
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">🧠</span>
            <h3 className="text-lg font-bold text-slate-800">Negotiation Strategy Advisor</h3>
          </div>
          <p className="text-sm text-slate-500 mb-4">
            Analyzes market data to recommend the best offer price and negotiation tactics
          </p>

          <button
            onClick={handleGetStrategy}
            disabled={loadingStrat || !!strategy}
            className={`px-6 py-2 rounded-lg text-sm font-semibold mb-4 ${
              strategy
                ? 'bg-green-600 text-white'
                : 'bg-emerald-700 text-white hover:bg-emerald-800 disabled:opacity-50'
            }`}
          >
            {strategy ? '✅ Strategy Ready' : loadingStrat ? 'Generating…' : 'Get Negotiation Strategy'}
          </button>

          {strategy && (
            <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-100">
              <p className="font-semibold text-slate-800 mb-4">{strategy.recommended_approach}</p>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Optimal Offer</p>
                  <p className="text-xl font-bold text-emerald-700">
                    {fmt(strategy.suggested_offer_range?.optimal)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Range</p>
                  <p className="text-sm text-slate-700 font-medium">
                    {fmt(strategy.suggested_offer_range?.min)} – {fmt(strategy.suggested_offer_range?.max)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Walk Away</p>
                  <p className="text-sm font-semibold text-red-600">{fmt(strategy.walk_away_threshold)}</p>
                </div>
              </div>

              {strategy.negotiation_tips?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Tips:</p>
                  <ul className="space-y-1">
                    {strategy.negotiation_tips.map((tip: string, i: number) => (
                      <li key={i} className="text-sm text-slate-700 flex gap-2">
                        <span className="text-emerald-600 flex-shrink-0">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Submit Offer ────────────────────────────────────── */}
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-1">📤 Submit Your Offer</h3>
          <p className="text-sm text-slate-500 mb-5">Fill in your offer details below and submit to the seller</p>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-600">Offer Amount ($)</label>
                <input type="number" value={offerAmount}
                  onChange={e => setOfferAmount(e.target.value)}
                  className="w-full px-4 py-2 border-2 rounded-lg focus:border-emerald-400 outline-none font-semibold text-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-600">Earnest Money ($)</label>
                <input type="number" value={earnestMoney}
                  onChange={e => setEarnestMoney(e.target.value)}
                  className="w-full px-4 py-2 border-2 rounded-lg focus:border-emerald-400 outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-slate-600">Closing Timeline (days)</label>
              <input type="number" value={closingDays}
                onChange={e => setClosingDays(e.target.value)}
                className="w-full px-4 py-2 border-2 rounded-lg focus:border-emerald-400 outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-slate-600">Message to Seller (Optional)</label>
              <textarea value={buyerMessage} onChange={e => setBuyerMessage(e.target.value)}
                rows={3} placeholder="We love this home and can close quickly…"
                className="w-full px-4 py-2 border-2 rounded-lg focus:border-emerald-400 outline-none text-sm" />
            </div>

            <button onClick={handleSubmitOffer} disabled={submitting || !offerAmount}
              className="w-full bg-emerald-700 text-white py-3 rounded-xl hover:bg-emerald-800 disabled:opacity-50 font-bold text-lg">
              {submitting ? 'Submitting…' : '🚀 Submit Offer'}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
