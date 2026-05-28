'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { setAuthToken, buyerApi, offersApi, api } from '@/lib/api'

type Tab = 'search' | 'offers'

// ── Buyer theme: Emerald / Green ─────────────────────────────────

export default function BuyersCompass() {
  const [user, setUser]               = useState<any>(null)
  const [loading, setLoading]         = useState(true)
  const [searching, setSearching]     = useState(false)
  const [activeTab, setActiveTab]     = useState<Tab>('search')
  const [matches, setMatches]         = useState<any[]>([])
  const [myOffers, setMyOffers]       = useState<any[]>([])
  const [sendingInterest, setSendingInterest] = useState<string | null>(null)

  const [minPrice,     setMinPrice]     = useState('400000')
  const [maxPrice,     setMaxPrice]     = useState('500000')
  const [city,         setCity]         = useState('San Jose')
  const [minBedrooms,  setMinBedrooms]  = useState('3')
  const [minBathrooms, setMinBathrooms] = useState('2')

  const router       = useRouter()
  const searchParams = useSearchParams()
  const supabase     = createClient()

  useEffect(() => { checkAuth() }, [])

  useEffect(() => {
    const tab = searchParams.get('tab') as Tab | null
    if (tab && ['search', 'offers'].includes(tab)) setActiveTab(tab)
  }, [searchParams])

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      // ✅ Read role from localStorage — avoids cross-tab session collision
      const storedRole = localStorage.getItem('homeport_role')
      if (storedRole && storedRole !== 'buyer') {
        router.push('/sellers-bridge')
        return
      }

      setUser(user)
      setAuthToken(user.id)
      await loadMyOffers(user.id)
    } catch (e) {
      console.error('Auth error:', e)
    } finally {
      setLoading(false)
    }
  }

  const loadMyOffers = async (uid: string) => {
    try {
      const res = await offersApi.getAll({ buyer_user_id: uid })
      setMyOffers(res.data || [])
    } catch (e) {
      setMyOffers([])
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setSearching(true)
    try {
      const res = await buyerApi.matchProperties({
        min_price:        parseFloat(minPrice),
        max_price:        parseFloat(maxPrice),
        preferred_cities: [city],
        min_bedrooms:     parseInt(minBedrooms),
        min_bathrooms:    parseFloat(minBathrooms),
        property_types:   ['single_family', 'townhouse', 'condo'],
      })
      setMatches(res.data?.matches || [])
    } catch (e) {
      alert('Search failed. Please try again.')
    } finally {
      setSearching(false)
    }
  }

  // ✅ Only shown for "countered" offers — buyer notifies seller they want to proceed
  const handleInterested = async (offer: any) => {
    setSendingInterest(offer.id)
    try {
      await api.post('/api/v1/notifications', {
        recipient_user_id:  offer.seller_user_id,
        type:               'system',
        title:              '🤝 Buyer Is Interested!',
        message:            `Buyer wants to move forward on ${offer.listings?.address || 'your property'} despite the counter offer. Original: $${Number(offer.offer_amount).toLocaleString()} | Counter: $${Number(offer.counter_amount).toLocaleString()}`,
        related_listing_id: offer.listing_id,
        related_offer_id:   offer.id,
      })
      alert('✅ Seller notified — they know you want to proceed!')
    } catch (e) {
      alert('Could not send notification. Please try again.')
    } finally {
      setSendingInterest(null)
    }
  }

  const handleLogout = async () => {
    localStorage.removeItem('homeport_role')
    localStorage.removeItem('homeport_user_id')
    localStorage.removeItem('homeport_email')
    await supabase.auth.signOut()
    router.push('/')
  }

  const statusBadge = (s: string) => {
    const m: any = {
      pending:   'bg-yellow-100 text-yellow-800',
      accepted:  'bg-green-100  text-green-800',
      rejected:  'bg-red-100    text-red-800',
      countered: 'bg-blue-100   text-blue-800',
    }
    return `px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${m[s] || 'bg-gray-100 text-gray-700'}`
  }

  const fmt = (n: any) => n ? `$${Number(n).toLocaleString()}` : '—'
  const pendingCount = myOffers.filter(o => ['pending', 'countered'].includes(o.status)).length

  if (loading) return (
    <div className="min-h-screen bg-emerald-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-3">🧭</div>
        <p className="text-emerald-700">Loading Buyer's Compass…</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-emerald-50">
      {/* ── Header — deep emerald ───────────────────────── */}
      <header className="bg-emerald-800 text-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🧭</span>
            <div>
              <h1 className="text-lg font-bold leading-tight">Buyer's Compass</h1>
              <p className="text-xs text-emerald-300">HomePort Buyer Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <span className="text-sm text-emerald-200">{user?.email}</span>
            <button onClick={handleLogout} className="text-emerald-300 hover:text-white text-sm font-medium">Logout</button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* ── Sidebar — medium emerald ────────────────── */}
        <aside className="w-60 bg-emerald-700 min-h-screen p-4 flex-shrink-0">
          <nav className="space-y-1 mt-2">
            {([
              { id: 'search', icon: '🔍', label: 'Search' },
              { id: 'offers', icon: '📤', label: 'My Offers', badge: myOffers.length },
            ] as const).map(item => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); if (item.id === 'offers' && user) loadMyOffers(user.id) }}
                className={`w-full text-left py-2.5 px-4 rounded-lg font-medium transition flex items-center justify-between ${
                  activeTab === item.id
                    ? 'bg-emerald-900 text-white shadow'
                    : 'text-emerald-100 hover:bg-emerald-600'
                }`}
              >
                <span>{item.icon} {item.label}</span>
                {(item as any).badge > 0 && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    activeTab === item.id ? 'bg-emerald-400 text-emerald-900' : 'bg-emerald-300 text-emerald-900'
                  }`}>{(item as any).badge}</span>
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* ══════════════════════════════════════════════════════ */}
        {/* SEARCH TAB                                           */}
        {/* ══════════════════════════════════════════════════════ */}
        {activeTab === 'search' && (
          <main className="flex-1 p-8 overflow-x-auto">
            <h2 className="text-2xl font-bold mb-1 text-emerald-900">Find Your Perfect Home</h2>
            <p className="text-sm text-emerald-700 mb-6">Enter your preferences and we'll find your best matches.</p>

            <div className="bg-white p-6 rounded-xl border border-emerald-100 shadow-sm mb-8">
              <h3 className="text-base font-semibold mb-4 text-emerald-800">Your Preferences</h3>
              <form onSubmit={handleSearch}>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  {[
                    { label: 'Min Price ($)', val: minPrice, set: setMinPrice, type: 'number' },
                    { label: 'Max Price ($)', val: maxPrice, set: setMaxPrice, type: 'number' },
                    { label: 'City',          val: city,     set: setCity,     type: 'text'   },
                    { label: 'Min Bedrooms',  val: minBedrooms,  set: setMinBedrooms,  type: 'number' },
                    { label: 'Min Bathrooms', val: minBathrooms, set: setMinBathrooms, type: 'number' },
                  ].map(f => (
                    <div key={f.label}>
                      <label className="block text-sm font-medium mb-1 text-slate-600">{f.label}</label>
                      <input
                        type={f.type}
                        value={f.val}
                        onChange={e => f.set(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none text-sm"
                      />
                    </div>
                  ))}
                </div>
                <button type="submit" disabled={searching}
                  className="w-full bg-emerald-700 text-white py-3 rounded-lg hover:bg-emerald-800 disabled:opacity-50 font-semibold">
                  {searching ? 'Searching…' : '🔍 Find Matches'}
                </button>
              </form>
            </div>

            {/* Results */}
            {matches.length > 0 && (
              <div className="bg-white rounded-xl border border-emerald-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b bg-emerald-50">
                  <h3 className="font-semibold text-emerald-800">Property Matches ({matches.length})</h3>
                </div>
                <div className="divide-y">
                  {matches.map((m, i) => (
                    <div key={i} className="p-6 hover:bg-emerald-50 transition">
                      <div className="flex justify-between items-start gap-6">
                        <div className="flex-1">
                          <h4 className="text-base font-bold text-slate-800">{m.listing.address}</h4>
                          <p className="text-sm text-slate-500 mb-2">{m.listing.city}, {m.listing.state} {m.listing.zip_code}</p>
                          <div className="flex gap-4 text-sm text-slate-600 mb-3">
                            <span>🛏 {m.listing.bedrooms} bed</span>
                            <span>🚿 {m.listing.bathrooms} bath</span>
                            <span>📐 {Number(m.listing.square_feet).toLocaleString()} sqft</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {m.match_reasons.slice(0, 3).map((r: string, j: number) => (
                              <span key={j} className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">✓ {r}</span>
                            ))}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-2xl font-bold text-emerald-700">{fmt(m.listing.asking_price)}</div>
                          <div className="text-xs text-slate-500 mb-3">
                            Match: <strong className="text-emerald-600">{(m.match_score * 100).toFixed(0)}%</strong>
                          </div>
                          <button
                            onClick={() => router.push(`/buyers-compass/property/${m.listing.id}`)}
                            className="bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-800 font-medium">
                            View & Make Offer →
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!searching && matches.length === 0 && (
              <div className="bg-white p-12 rounded-xl border border-emerald-100 text-center text-slate-400">
                <div className="text-5xl mb-3">🏡</div>
                <p>Enter your preferences above and click Find Matches</p>
              </div>
            )}
          </main>
        )}

        {/* ══════════════════════════════════════════════════════ */}
        {/* MY OFFERS TAB                                        */}
        {/* ══════════════════════════════════════════════════════ */}
        {activeTab === 'offers' && (
          <main className="flex-1 p-8 overflow-x-auto">
            <h2 className="text-2xl font-bold mb-1 text-emerald-900">My Offers</h2>
            <p className="text-sm text-emerald-700 mb-6">
              All offers you have submitted. Click <strong>🤝 Interested</strong> on a countered offer to let the seller know you want to proceed.
            </p>

            {myOffers.length === 0 ? (
              <div className="bg-white p-12 rounded-xl border border-emerald-100 text-center">
                <div className="text-5xl mb-3">📤</div>
                <p className="text-slate-500 mb-4">You haven't submitted any offers yet.</p>
                <button onClick={() => setActiveTab('search')}
                  className="bg-emerald-700 text-white px-6 py-2 rounded-lg hover:bg-emerald-800 font-medium">
                  Find properties
                </button>
              </div>
            ) : (
              <>
                <div className="bg-white rounded-xl border border-emerald-100 shadow-sm overflow-hidden">
                  <table className="w-full text-sm min-w-[1000px]">
                    <thead className="bg-emerald-700 text-emerald-50">
                      <tr>
                        {['Property', 'Submitted', 'Offer Amount', 'Counter Offer', 'Earnest $', 'Closing', 'Contingencies', 'Status', 'Action'].map(h => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {myOffers.map((offer: any) => (
                        <tr key={offer.id} className="hover:bg-emerald-50 align-top">
                          <td className="px-4 py-4">
                            <div className="font-semibold text-slate-800 max-w-[140px]">{offer.listings?.address || '—'}</div>
                            <div className="text-xs text-slate-400">{offer.listings?.city}, {offer.listings?.state}</div>
                          </td>
                          <td className="px-4 py-4 text-slate-500 whitespace-nowrap text-xs">
                            {new Date(offer.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-4 font-bold text-emerald-700 whitespace-nowrap">
                            {fmt(offer.offer_amount)}
                          </td>
                          <td className="px-4 py-4">
                            {offer.counter_amount ? (
                              <div>
                                <div className="font-bold text-blue-700 whitespace-nowrap">{fmt(offer.counter_amount)}</div>
                                {offer.counter_message && (
                                  <div className="text-xs text-slate-500 mt-0.5 max-w-[120px]">
                                    {offer.counter_message.slice(0, 50)}{offer.counter_message.length > 50 ? '…' : ''}
                                  </div>
                                )}
                              </div>
                            ) : <span className="text-slate-400 text-xs">—</span>}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-slate-600">{fmt(offer.earnest_money)}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-slate-600">
                            {offer.closing_timeline_days ? `${offer.closing_timeline_days}d` : '—'}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex flex-col gap-0.5">
                              {(offer.contingencies || []).length > 0
                                ? offer.contingencies.map((c: string, i: number) => (
                                    <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full w-fit">{c}</span>
                                  ))
                                : <span className="text-slate-400 text-xs">—</span>}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className={statusBadge(offer.status)}>{offer.status.toUpperCase()}</span>
                            {offer.responded_at && (
                              <div className="text-xs text-slate-400 mt-1">{new Date(offer.responded_at).toLocaleDateString()}</div>
                            )}
                          </td>

                          {/* ✅ Interested button ONLY for countered offers */}
                          <td className="px-4 py-4">
                            {offer.status === 'countered' ? (
                              <button
                                onClick={() => handleInterested(offer)}
                                disabled={sendingInterest === offer.id}
                                title="Notify seller you want to proceed despite counter offer"
                                className="bg-purple-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-purple-700 disabled:opacity-50 whitespace-nowrap">
                                {sendingInterest === offer.id ? 'Sending…' : '🤝 Interested'}
                              </button>
                            ) : (
                              <span className="text-slate-300 text-xs">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  * <strong>🤝 Interested</strong> appears only on countered offers — click it to notify the seller you want to move forward.
                </p>
              </>
            )}
          </main>
        )}
      </div>
    </div>
  )
}
