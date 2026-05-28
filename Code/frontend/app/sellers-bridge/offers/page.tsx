'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { offersApi, notificationsApi, setAuthToken } from '@/lib/api'

export default function SellerOffersPage() {
  const router   = useRouter()
  const supabase = createClient()

  const [offers, setOffers]           = useState<any[]>([])
  const [loading, setLoading]         = useState(true)
  const [responding, setResponding]   = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [interestedIds, setInterestedIds] = useState<Set<string>>(new Set())

  // Counter modal
  const [counterOffer, setCounterOffer]     = useState<any>(null)
  const [counterAmount, setCounterAmount]   = useState('')
  const [counterMessage, setCounterMessage] = useState('')

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setAuthToken(user.id)

      const [offerRes, notifRes] = await Promise.all([
        offersApi.getAll({ seller_user_id: user.id }),
        notificationsApi.getAll(user.id, { limit: 100 }),
      ])

      setOffers(offerRes.data || [])

      const ids = new Set<string>()
      const notifs: any[] = notifRes.data?.notifications || []
      notifs.forEach(n => {
        if (n.title?.includes('Interested') && n.related_offer_id) ids.add(n.related_offer_id)
      })
      setInterestedIds(ids)
    } catch (e) {
      console.error('Error loading:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async (offerId: string) => {
    if (!confirm('Accept this offer?')) return
    setResponding(offerId)
    try {
      await offersApi.respond(offerId, { action: 'accept' })
      await loadData()
    } catch { alert('Failed to accept. Try again.') }
    finally { setResponding(null) }
  }

  const handleReject = async (offerId: string) => {
    if (!confirm('Reject this offer?')) return
    setResponding(offerId)
    try {
      await offersApi.respond(offerId, { action: 'reject' })
      await loadData()
    } catch { alert('Failed to reject. Try again.') }
    finally { setResponding(null) }
  }

  const openCounter = (offer: any) => {
    setCounterOffer(offer)
    setCounterAmount(String(Math.round(Number(offer.offer_amount) * 1.03)))
    setCounterMessage('')
  }

  const handleCounter = async () => {
    if (!counterOffer || !counterAmount) return
    setResponding(counterOffer.id)
    try {
      await offersApi.respond(counterOffer.id, {
        action:          'counter',
        counter_amount:  parseFloat(counterAmount),
        counter_message: counterMessage || 'Counter offer based on market analysis',
      })
      setCounterOffer(null)
      await loadData()
    } catch { alert('Failed to counter. Try again.') }
    finally { setResponding(null) }
  }

  const handleLogout = async () => {
    localStorage.removeItem('homeport_role')
    await supabase.auth.signOut()
    router.push('/')
  }

  const fmt     = (n: any) => n != null ? `$${Number(n).toLocaleString()}` : '—'
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  const statusBadge = (s: string) => {
    const m: any = {
      pending:   'bg-yellow-100 text-yellow-800',
      accepted:  'bg-green-100  text-green-800',
      rejected:  'bg-red-100    text-red-800',
      countered: 'bg-blue-100   text-blue-800',
    }
    return `px-2.5 py-1 rounded-full text-xs font-bold ${m[s] || 'bg-gray-100 text-gray-700'}`
  }

  const filtered = filterStatus === 'all' ? offers : offers.filter(o => o.status === filterStatus)
  const counts   = {
    all:       offers.length,
    pending:   offers.filter(o => o.status === 'pending').length,
    countered: offers.filter(o => o.status === 'countered').length,
    accepted:  offers.filter(o => o.status === 'accepted').length,
    rejected:  offers.filter(o => o.status === 'rejected').length,
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">
      <div className="text-center"><div className="text-4xl mb-3">📬</div><p className="text-slate-500">Loading…</p></div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-100">

      {/* ── Navy Header ─────────────────────────────── */}
      <header className="bg-slate-800 text-white shadow-lg">
        <div className="max-w-full mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-xl">🏛️</span>
            <div>
              <h1 className="text-lg font-bold">Incoming Offers</h1>
              <p className="text-xs text-slate-400">{offers.length} offer{offers.length !== 1 ? 's' : ''} received</p>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <a href="/sellers-bridge" className="text-amber-400 hover:text-amber-300 text-sm font-medium">← Dashboard</a>
            <button onClick={handleLogout} className="text-slate-400 hover:text-white text-sm">Logout</button>
          </div>
        </div>
      </header>

      <div className="px-6 py-6 max-w-full">

        {/* Filter tabs */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {[
            { key: 'all',       label: 'All',       count: counts.all },
            { key: 'pending',   label: 'Pending',   count: counts.pending },
            { key: 'countered', label: 'Countered', count: counts.countered },
            { key: 'accepted',  label: 'Accepted',  count: counts.accepted },
            { key: 'rejected',  label: 'Rejected',  count: counts.rejected },
          ].map(f => (
            <button key={f.key} onClick={() => setFilterStatus(f.key)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                filterStatus === f.key
                  ? 'bg-slate-800 text-white'
                  : 'bg-white text-slate-600 border hover:bg-slate-50'
              }`}>
              {f.label}
              {f.count > 0 && (
                <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                  filterStatus === f.key ? 'bg-amber-400 text-slate-900' : 'bg-gray-100 text-gray-600'
                }`}>{f.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="bg-white p-14 rounded-xl border text-center text-slate-400">
            <div className="text-5xl mb-3">📭</div>
            <p className="font-medium">No {filterStatus === 'all' ? '' : filterStatus} offers yet</p>
          </div>
        )}

        {/* ── Offer Cards ─────────────────────────────────────────────
            Using CARDS instead of a wide table so nothing gets cut off
        ──────────────────────────────────────────────────────────── */}
        {filtered.length > 0 && (
          <div className="space-y-4">
            {filtered.map((offer: any) => {
              const isPending    = offer.status === 'pending'
              const isResponding = responding === offer.id
              const isInterested = interestedIds.has(offer.id)
              const diff = offer.listings?.asking_price
                ? ((Number(offer.offer_amount) - Number(offer.listings.asking_price)) / Number(offer.listings.asking_price) * 100).toFixed(1)
                : null

              return (
                <div key={offer.id}
                  className={`bg-white rounded-xl border shadow-sm overflow-hidden ${isInterested ? 'border-l-4 border-l-purple-400' : ''}`}>

                  {/* Card Top Bar */}
                  <div className="bg-slate-50 border-b px-5 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div>
                        <span className="font-bold text-slate-800">{offer.listings?.address || 'Unknown Property'}</span>
                        <span className="text-slate-400 text-sm ml-2">{offer.listings?.city}, {offer.listings?.state}</span>
                      </div>
                      {offer.listings?.asking_price && (
                        <span className="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded">
                          Listed: {fmt(offer.listings.asking_price)}
                        </span>
                      )}
                      {isInterested && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full font-semibold">
                          🤝 Buyer Interested
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400">{fmtDate(offer.created_at)}</span>
                      <span className={statusBadge(offer.status)}>{offer.status.toUpperCase()}</span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="px-5 py-4">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">

                      {/* Offer Amount */}
                      <div>
                        <p className="text-xs text-slate-400 mb-0.5">Offer Amount</p>
                        <p className="text-xl font-bold text-slate-800">{fmt(offer.offer_amount)}</p>
                        {diff !== null && (
                          <p className={`text-xs font-semibold ${Number(diff) >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                            {Number(diff) >= 0 ? '+' : ''}{diff}% vs asking
                          </p>
                        )}
                      </div>

                      {/* Earnest */}
                      <div>
                        <p className="text-xs text-slate-400 mb-0.5">Earnest Money</p>
                        <p className="font-semibold text-slate-700">{fmt(offer.earnest_money)}</p>
                      </div>

                      {/* Closing */}
                      <div>
                        <p className="text-xs text-slate-400 mb-0.5">Closing Timeline</p>
                        <p className="font-semibold text-slate-700">
                          {offer.closing_timeline_days ? `${offer.closing_timeline_days} days` : '—'}
                        </p>
                      </div>

                      {/* Contingencies */}
                      <div>
                        <p className="text-xs text-slate-400 mb-0.5">Contingencies</p>
                        <div className="flex flex-wrap gap-1">
                          {(offer.contingencies || []).length > 0
                            ? offer.contingencies.map((c: string, i: number) => (
                                <span key={i} className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">{c}</span>
                              ))
                            : <span className="text-slate-400 text-xs">None</span>}
                        </div>
                      </div>

                      {/* AI Rec */}
                      <div>
                        <p className="text-xs text-slate-400 mb-0.5">AI Recommendation</p>
                        {offer.ai_recommendation ? (
                          <span className={`text-xs px-2 py-1 rounded font-bold ${
                            offer.ai_recommendation === 'accept' ? 'bg-green-100 text-green-700' :
                            offer.ai_recommendation === 'reject' ? 'bg-red-100   text-red-700'   :
                            'bg-blue-100 text-blue-700'
                          }`}>{offer.ai_recommendation.toUpperCase()}</span>
                        ) : <span className="text-slate-400 text-xs">—</span>}
                      </div>
                    </div>

                    {/* Buyer message */}
                    {offer.buyer_message && (
                      <div className="mb-4 p-3 bg-slate-50 rounded-lg border text-sm text-slate-600 italic">
                        💬 "{offer.buyer_message}"
                      </div>
                    )}

                    {/* Counter offer info */}
                    {offer.counter_amount && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200 flex items-center gap-4">
                        <div>
                          <p className="text-xs text-blue-500 font-semibold">Your Counter Offer</p>
                          <p className="text-lg font-bold text-blue-700">{fmt(offer.counter_amount)}</p>
                        </div>
                        {offer.counter_message && (
                          <p className="text-xs text-slate-500 italic flex-1">"{offer.counter_message}"</p>
                        )}
                      </div>
                    )}

                    {/* ── ACTION BUTTONS — always visible at bottom ── */}
                    {isPending ? (
                      <div className="flex gap-3 pt-2 border-t mt-2">
                        <button
                          onClick={() => handleAccept(offer.id)}
                          disabled={isResponding}
                          className="flex-1 bg-green-600 text-white py-2.5 rounded-lg font-bold hover:bg-green-700 disabled:opacity-50 text-sm"
                        >
                          {isResponding ? '…' : '✅ Accept Offer'}
                        </button>
                        <button
                          onClick={() => openCounter(offer)}
                          disabled={isResponding}
                          className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 text-sm"
                        >
                          💬 Counter Offer
                        </button>
                        <button
                          onClick={() => handleReject(offer.id)}
                          disabled={isResponding}
                          className="flex-1 bg-red-500 text-white py-2.5 rounded-lg font-bold hover:bg-red-600 disabled:opacity-50 text-sm"
                        >
                          {isResponding ? '…' : '❌ Reject Offer'}
                        </button>
                      </div>
                    ) : (
                      <div className="pt-2 border-t mt-2 text-sm text-slate-400 italic">
                        Responded on {offer.responded_at ? fmtDate(offer.responded_at) : '—'}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Counter Offer Modal ────────────────────── */}
      {counterOffer && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-7">
            <h3 className="text-xl font-bold text-slate-800 mb-4">💬 Send Counter Offer</h3>

            <div className="p-3 bg-slate-50 rounded-lg text-sm mb-5 space-y-1">
              <div><span className="text-slate-400">Property:</span> <strong>{counterOffer.listings?.address}</strong></div>
              <div><span className="text-slate-400">Buyer offered:</span> <strong className="text-red-600">{fmt(counterOffer.offer_amount)}</strong></div>
              <div><span className="text-slate-400">Your asking price:</span> <strong>{fmt(counterOffer.listings?.asking_price)}</strong></div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1 text-slate-700">
                  Counter Amount ($) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={counterAmount}
                  onChange={e => setCounterAmount(e.target.value)}
                  className="w-full px-4 py-3 border-2 rounded-lg text-lg font-bold focus:border-blue-400 outline-none"
                  placeholder="e.g. 465000"
                  autoFocus
                />
                {counterAmount && !isNaN(parseFloat(counterAmount)) && (
                  <p className="text-xs text-slate-500 mt-1">
                    {((parseFloat(counterAmount) - Number(counterOffer.offer_amount)) / Number(counterOffer.offer_amount) * 100).toFixed(1)}% above buyer's offer
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold mb-1 text-slate-700">Message to Buyer (Optional)</label>
                <textarea
                  value={counterMessage}
                  onChange={e => setCounterMessage(e.target.value)}
                  rows={3}
                  placeholder="e.g. Thank you for your offer. We'd like to meet in the middle at this price."
                  className="w-full px-4 py-2 border-2 rounded-lg focus:border-blue-400 outline-none text-sm"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={handleCounter}
                disabled={responding === counterOffer.id || !counterAmount}
                className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50"
              >
                {responding === counterOffer.id ? 'Sending…' : 'Send Counter'}
              </button>
              <button
                onClick={() => setCounterOffer(null)}
                className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
