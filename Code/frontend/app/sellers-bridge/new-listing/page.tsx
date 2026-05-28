'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { listingsApi, setAuthToken } from '@/lib/api'

export default function NewListingPage() {
  const router   = useRouter()
  const supabase = createClient()
  const [loading, setLoading]   = useState(false)
  const [listingId, setListingId] = useState<string | null>(null)

  // Step 1 fields
  const [address, setAddress]         = useState('')
  const [city, setCity]               = useState('San Jose')
  const [state, setState]             = useState('CA')
  const [zipCode, setZipCode]         = useState('95123')
  const [askingPrice, setAskingPrice] = useState('450000')
  const [bedrooms, setBedrooms]       = useState('3')
  const [bathrooms, setBathrooms]     = useState('2')
  const [squareFeet, setSquareFeet]   = useState('2100')
  const [propertyType, setPropertyType] = useState('single_family')
  const [features, setFeatures]       = useState('updated kitchen, hardwood floors, garage')
  const [neighborhood, setNeighborhood] = useState('')
  const [agentName, setAgentName]     = useState('Sarah Johnson')
  const [agentEmail, setAgentEmail]   = useState('seller@demo.com')

  // Step 2 images
  const [imageUrls, setImageUrls]   = useState<string[]>([
    'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
  ])
  const [newImageUrl, setNewImageUrl] = useState('')

  // Step 2 AI results
  const [marketingContent, setMarketingContent] = useState<any>(null)
  const [visionAnalysis, setVisionAnalysis]     = useState<any>(null)
  const [pricingStrategy, setPricingStrategy]   = useState<any>(null)

  const [step, setStep]   = useState(1)
  const [copied, setCopied] = useState<string | null>(null)

  // ── Auth helper ──────────────────────────────────────────────
  const ensureAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    setAuthToken(user.id)
    return user
  }

  // ── Copy to clipboard ────────────────────────────────────────
  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(null), 2000)
  }

  // ── Step 1: Create listing ───────────────────────────────────
  const handleCreateListing = async () => {
    if (!address.trim()) { alert('Please enter an address'); return }
    setLoading(true)
    try {
      await ensureAuth()
      const data = {
        address, city, state,
        zip_code:   zipCode,
        asking_price:  parseFloat(askingPrice),
        bedrooms:      parseInt(bedrooms),
        bathrooms:     parseFloat(bathrooms),
        square_feet:   parseInt(squareFeet),
        property_type: propertyType,
        special_features:      features.split(',').map(f => f.trim()).filter(Boolean),
        neighborhood_highlights: neighborhood,
        agent_name:  agentName,
        agent_email: agentEmail,
      }
      const res = await listingsApi.create(data)
      setListingId(res.data.id)
      if (imageUrls.length > 0) {
        await listingsApi.addImages(res.data.id, imageUrls)
      }
      setStep(2)
    } catch (e: any) {
      alert(e.message || 'Error creating listing. Make sure backend is running.')
    } finally {
      setLoading(false)
    }
  }

  // ── Agent 1: Marketing Content ───────────────────────────────
  const handleGenerateContent = async () => {
    if (!listingId) return
    setLoading(true)
    try {
      const res = await listingsApi.generateContent(listingId)
      setMarketingContent(res.data)
    } catch {
      alert('Error generating marketing content. Check backend.')
    } finally {
      setLoading(false)
    }
  }

  // ── Agent 2: Vision Analysis ─────────────────────────────────
  const handleAnalyzeImages = async () => {
    if (!listingId || imageUrls.length === 0) return
    setLoading(true)
    try {
      const res = await listingsApi.analyzeImages(listingId, imageUrls)
      setVisionAnalysis(res.data)
    } catch {
      alert('Error analyzing images. Check backend.')
    } finally {
      setLoading(false)
    }
  }

  // ── Agent 3: Pricing Strategy ────────────────────────────────
  const handlePricingStrategy = async () => {
    if (!listingId) return
    setLoading(true)
    try {
      const res = await listingsApi.pricingStrategy(listingId)
      setPricingStrategy(res.data)
    } catch {
      alert('Error getting pricing strategy. Check backend.')
    } finally {
      setLoading(false)
    }
  }

  // ── Publish ──────────────────────────────────────────────────
  const handlePublish = async () => {
    if (!listingId) return
    setLoading(true)
    try {
      await listingsApi.publish(listingId)
      alert('🎉 Listing published successfully!')
      router.push('/sellers-bridge/listings')
    } catch {
      alert('Error publishing listing.')
    } finally {
      setLoading(false)
    }
  }

  const strategyLabel = (s: string) => {
    const m: any = {
      aggressive_low: { label: 'Aggressive / Below Market', color: 'text-red-600' },
      market_aligned: { label: 'Market-Aligned', color: 'text-green-600' },
      premium:        { label: 'Premium Pricing', color: 'text-blue-600' },
    }
    return m[s] || { label: s, color: 'text-slate-700' }
  }

  // ── Shared styles ─────────────────────────────────────────────
  const stepCircle = (n: number) =>
    step >= n ? 'bg-slate-700 text-white' : 'bg-gray-200 text-gray-400'

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-slate-800 text-white">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏛️</span>
            <h1 className="text-lg font-bold">Create New Listing</h1>
          </div>
          <button onClick={() => router.push('/sellers-bridge')}
            className="text-amber-400 hover:text-amber-300 text-sm font-medium">
            ← Back to Dashboard
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-10">
          {[
            { n: 1, label: 'Property Details' },
            { n: 2, label: 'AI Workflow' },
            { n: 3, label: 'Publish' },
          ].map((s, i) => (
            <div key={s.n} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${stepCircle(s.n)}`}>
                  {s.n}
                </div>
                <p className={`text-xs mt-1 font-medium ${step >= s.n ? 'text-slate-700' : 'text-gray-400'}`}>{s.label}</p>
              </div>
              {i < 2 && (
                <div className={`flex-1 h-0.5 mx-2 ${step > s.n ? 'bg-slate-700' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* ── STEP 1: Property Details ────────────────────────────── */}
        {step === 1 && (
          <div className="bg-white p-8 rounded-xl border shadow-sm">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Property Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-600">Street Address *</label>
                <input type="text" value={address} onChange={e => setAddress(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-slate-400 outline-none"
                  placeholder="123 Main Street" />
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'City', val: city, set: setCity, ph: 'San Jose' },
                  { label: 'State', val: state, set: setState, ph: 'CA' },
                  { label: 'ZIP Code', val: zipCode, set: setZipCode, ph: '95123' },
                ].map(f => (
                  <div key={f.label}>
                    <label className="block text-sm font-medium mb-1 text-slate-600">{f.label}</label>
                    <input type="text" value={f.val} onChange={e => f.set(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-slate-400 outline-none"
                      placeholder={f.ph} />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-600">Asking Price ($)</label>
                  <input type="number" value={askingPrice} onChange={e => setAskingPrice(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-slate-400 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-600">Square Feet</label>
                  <input type="number" value={squareFeet} onChange={e => setSquareFeet(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-slate-400 outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-600">Bedrooms</label>
                  <input type="number" value={bedrooms} onChange={e => setBedrooms(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-slate-400 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-600">Bathrooms</label>
                  <input type="number" step="0.5" value={bathrooms} onChange={e => setBathrooms(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-slate-400 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-600">Property Type</label>
                  <select value={propertyType} onChange={e => setPropertyType(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-slate-400 outline-none">
                    <option value="single_family">Single Family</option>
                    <option value="condo">Condo</option>
                    <option value="townhouse">Townhouse</option>
                    <option value="multi_family">Multi-Family</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-slate-600">Key Features (comma-separated)</label>
                <input type="text" value={features} onChange={e => setFeatures(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-slate-400 outline-none"
                  placeholder="updated kitchen, hardwood floors, garage, pool" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-slate-600">Neighborhood Highlights</label>
                <textarea value={neighborhood} onChange={e => setNeighborhood(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-slate-400 outline-none" rows={2}
                  placeholder="Top-rated schools, community pool, near tech corridor, quiet cul-de-sac..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-600">Listing Agent Name</label>
                  <input type="text" value={agentName} onChange={e => setAgentName(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-slate-400 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-600">Agent Email</label>
                  <input type="email" value={agentEmail} onChange={e => setAgentEmail(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-slate-400 outline-none" />
                </div>
              </div>

              {/* Property Images */}
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-600">Property Images</label>
                <div className="space-y-2">
                  {imageUrls.map((url, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input type="text" value={url} readOnly
                        className="flex-1 px-3 py-2 border rounded-lg bg-gray-50 text-sm text-gray-500" />
                      <button onClick={() => setImageUrls(imageUrls.filter((_, i) => i !== idx))}
                        className="px-3 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600">
                        Remove
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <input type="url" value={newImageUrl} onChange={e => setNewImageUrl(e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-slate-400 outline-none"
                      placeholder="https://images.unsplash.com/photo-..." />
                    <button onClick={() => { if (newImageUrl && !imageUrls.includes(newImageUrl)) { setImageUrls([...imageUrls, newImageUrl]); setNewImageUrl('') } }}
                      className="px-4 py-2 bg-slate-600 text-white rounded-lg text-sm hover:bg-slate-700">
                      Add
                    </button>
                  </div>
                  <p className="text-xs text-gray-400">Paste Unsplash or any direct image URL</p>
                </div>
              </div>

              <button onClick={handleCreateListing} disabled={loading || !address.trim()}
                className="w-full bg-slate-700 text-white py-3 rounded-lg hover:bg-slate-800 disabled:opacity-50 font-semibold">
                {loading ? 'Creating…' : 'Save Listing & Continue →'}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: AI Workflow ─────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-6">

            {/* Agent 1: Listing & Marketing Content Generator */}
            <div className="bg-white p-6 rounded-xl border shadow-sm">
              <div className="flex items-start gap-3 mb-1">
                <span className="text-2xl">✍️</span>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Listing & Marketing Content Generator</h3>
                  <p className="text-sm text-slate-500">Generates MLS description, social media post, and brochure copy using your property details</p>
                </div>
              </div>

              <div className="mt-4">
                <button onClick={handleGenerateContent} disabled={loading || !!marketingContent}
                  className={`px-6 py-2 rounded-lg text-sm font-semibold ${
                    marketingContent ? 'bg-green-600 text-white' : 'bg-slate-700 text-white hover:bg-slate-800'
                  } disabled:opacity-60`}>
                  {marketingContent ? '✅ Content Generated' : loading ? 'Generating…' : 'Generate Marketing Content'}
                </button>
              </div>

              {marketingContent && (
                <div className="mt-5 space-y-4">
                  {/* Social Media */}
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">📱 Social Media Post</p>
                      <button onClick={() => copyText(marketingContent.social_copy, 'social')}
                        className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200">
                        {copied === 'social' ? '✅ Copied' : '📋 Copy'}
                      </button>
                    </div>
                    <p className="text-sm text-slate-700">{marketingContent.social_copy}</p>
                  </div>

                  {/* MLS Description */}
                  <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">🏠 MLS Description</p>
                      <button onClick={() => copyText(marketingContent.mls_description, 'mls')}
                        className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200">
                        {copied === 'mls' ? '✅ Copied' : '📋 Copy'}
                      </button>
                    </div>
                    <p className="text-sm text-slate-700">{marketingContent.mls_description}</p>
                  </div>

                  {/* Brochure Copy */}
                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">📄 Brochure Copy</p>
                      <button onClick={() => copyText(marketingContent.brochure_copy, 'brochure')}
                        className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded hover:bg-amber-200">
                        {copied === 'brochure' ? '✅ Copied' : '📋 Copy'}
                      </button>
                    </div>
                    <p className="text-sm text-slate-700">{marketingContent.brochure_copy}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Agent 2: Property Improvement Advisor */}
            <div className="bg-white p-6 rounded-xl border shadow-sm">
              <div className="flex items-start gap-3 mb-1">
                <span className="text-2xl">🔍</span>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Property Improvement Advisor</h3>
                  <p className="text-sm text-slate-500">Analyzes your property images to suggest low-cost, high-impact improvements before going live</p>
                </div>
              </div>

              <div className="mt-4">
                <button onClick={handleAnalyzeImages} disabled={loading || !!visionAnalysis || imageUrls.length === 0}
                  className={`px-6 py-2 rounded-lg text-sm font-semibold ${
                    visionAnalysis ? 'bg-green-600 text-white' : 'bg-slate-700 text-white hover:bg-slate-800'
                  } disabled:opacity-60`}>
                  {visionAnalysis ? '✅ Analysis Complete' : loading ? 'Analyzing…' : 'Analyze Property Images'}
                </button>
                {imageUrls.length === 0 && <p className="text-xs text-red-500 mt-1">Add at least one image URL above</p>}
              </div>

              {visionAnalysis && (
                <div className="mt-5">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 mb-4">
                    <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">Overall Assessment</p>
                    <p className="text-sm text-slate-700">{visionAnalysis.overall_impression}</p>
                    {visionAnalysis._images_analyzed !== undefined && (
                      <p className="text-xs text-blue-500 mt-1">{visionAnalysis._images_analyzed} image(s) analyzed</p>
                    )}
                  </div>

                  {/* Room-by-room */}
                  <div className="space-y-3 mb-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Room-by-Room Suggestions</p>
                    {(visionAnalysis.room_by_room || []).map((room: any, i: number) => (
                      <div key={i} className={`p-3 rounded-lg border ${
                        room.priority === 'high' ? 'bg-red-50 border-red-100' :
                        room.priority === 'medium' ? 'bg-yellow-50 border-yellow-100' :
                        'bg-gray-50 border-gray-100'
                      }`}>
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-sm font-semibold text-slate-700">{room.room}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            room.priority === 'high' ? 'bg-red-100 text-red-600' :
                            room.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>{room.priority}</span>
                        </div>
                        <ul className="text-xs text-slate-600 space-y-1">
                          {(room.suggestions || []).map((s: string, j: number) => (
                            <li key={j} className="flex items-start gap-1"><span>•</span><span>{s}</span></li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  {/* Curb appeal */}
                  {(visionAnalysis.curb_appeal || []).length > 0 && (
                    <div className="p-3 bg-green-50 rounded-lg border border-green-100 mb-3">
                      <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2">🌿 Curb Appeal</p>
                      <ul className="text-xs text-slate-600 space-y-1">
                        {visionAnalysis.curb_appeal.map((s: string, i: number) => (
                          <li key={i} className="flex items-start gap-1"><span>•</span><span>{s}</span></li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Print button */}
                  <button onClick={() => window.print()}
                    className="text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded hover:bg-slate-200">
                    🖨️ Print Improvement Report
                  </button>
                </div>
              )}
            </div>

            {/* Agent 3: Pricing Strategy Analyst */}
            <div className="bg-white p-6 rounded-xl border shadow-sm">
              <div className="flex items-start gap-3 mb-1">
                <span className="text-2xl">💰</span>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Pricing Strategy Analyst</h3>
                  <p className="text-sm text-slate-500">Compares your listing to recent comparable sales and recommends an optimal price strategy</p>
                </div>
              </div>

              <div className="mt-4">
                <button onClick={handlePricingStrategy} disabled={loading || !!pricingStrategy}
                  className={`px-6 py-2 rounded-lg text-sm font-semibold ${
                    pricingStrategy ? 'bg-green-600 text-white' : 'bg-slate-700 text-white hover:bg-slate-800'
                  } disabled:opacity-60`}>
                  {pricingStrategy ? '✅ Strategy Generated' : loading ? 'Analyzing…' : 'Generate Pricing Strategy'}
                </button>
              </div>

              {pricingStrategy && (() => {
                const { label, color } = strategyLabel(pricingStrategy.pricing_strategy)
                return (
                  <div className="mt-5">
                    <div className="p-4 bg-amber-50 rounded-lg border border-amber-100 mb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">Pricing Recommendation</p>
                          <p className={`text-lg font-bold ${color}`}>{label}</p>
                          <p className="text-sm text-slate-700 mt-2">{pricingStrategy.pricing_rationale}</p>
                        </div>
                        <button onClick={() => copyText(
                          `Strategy: ${label}\n${pricingStrategy.pricing_rationale}\nRange: $${pricingStrategy.suggested_price_min?.toLocaleString()} – $${pricingStrategy.suggested_price_max?.toLocaleString()}`,
                          'pricing'
                        )} className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded hover:bg-amber-200 flex-shrink-0 ml-3">
                          {copied === 'pricing' ? '✅ Copied' : '📋 Copy'}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 rounded-lg border text-center">
                        <p className="text-xs text-slate-500 mb-1">Suggested Min</p>
                        <p className="text-2xl font-bold text-slate-800">
                          ${pricingStrategy.suggested_price_min?.toLocaleString()}
                        </p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-lg border text-center">
                        <p className="text-xs text-slate-500 mb-1">Suggested Max</p>
                        <p className="text-2xl font-bold text-slate-800">
                          ${pricingStrategy.suggested_price_max?.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Comparable sales table */}
                    {pricingStrategy.comparable_sales && pricingStrategy.comparable_sales.length > 0 && (
                      <div className="mt-4">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Comparable Sales Used</p>
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead className="bg-slate-100">
                              <tr>
                                {['Address', 'Price', '$/sqft', 'Beds', 'Sqft', 'DOM', 'Distance'].map(h => (
                                  <th key={h} className="text-left px-3 py-2 text-slate-500">{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {pricingStrategy.comparable_sales.slice(0, 5).map((c: any, i: number) => (
                                <tr key={i} className="hover:bg-slate-50">
                                  <td className="px-3 py-2">{c.comp_address}</td>
                                  <td className="px-3 py-2 font-medium">${Number(c.comp_price).toLocaleString()}</td>
                                  <td className="px-3 py-2">${Number(c.price_per_sqft).toFixed(0)}</td>
                                  <td className="px-3 py-2">{c.bedrooms}</td>
                                  <td className="px-3 py-2">{Number(c.square_feet).toLocaleString()}</td>
                                  <td className="px-3 py-2">{c.days_on_market ?? '—'}</td>
                                  <td className="px-3 py-2">{c.distance_miles}mi</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <button onClick={() => window.print()}
                          className="mt-2 text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded hover:bg-slate-200">
                          🖨️ Print Pricing Report
                        </button>
                      </div>
                    )}

                    {/* ✅ Price Override — update asking price based on AI recommendation */}
                    <div className="mt-5 p-4 bg-slate-800 rounded-xl">
                      <p className="text-sm font-bold text-amber-400 mb-1">💡 Update Your Listing Price</p>
                      <p className="text-xs text-slate-300 mb-3">
                        Based on the analysis above, adjust your final asking price before publishing. The AI suggests{' '}
                        <strong className="text-white">
                          ${pricingStrategy.suggested_price_min?.toLocaleString()} – ${pricingStrategy.suggested_price_max?.toLocaleString()}
                        </strong>.
                      </p>
                      <div className="flex gap-3 items-center">
                        <div className="flex-1">
                          <label className="block text-xs text-slate-400 mb-1">New Asking Price ($)</label>
                          <input
                            type="number"
                            value={askingPrice}
                            onChange={e => setAskingPrice(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg bg-slate-700 text-white border border-slate-500 focus:border-amber-400 outline-none font-semibold text-lg"
                          />
                        </div>
                        <button
                          onClick={async () => {
                            if (!listingId) return
                            try {
                              await listingsApi.update(listingId, { asking_price: parseFloat(askingPrice) })
                              alert(`✅ Listing price updated to $${parseFloat(askingPrice).toLocaleString()}`)
                            } catch {
                              alert('Error updating price. Please try again.')
                            }
                          }}
                          className="mt-5 px-5 py-2.5 bg-amber-400 text-slate-900 rounded-lg font-bold hover:bg-amber-300 text-sm whitespace-nowrap"
                        >
                          Save Price
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })()}
            </div>

            <button onClick={() => setStep(3)}
              className="w-full bg-slate-700 text-white py-3 rounded-lg hover:bg-slate-800 font-semibold">
              Review & Publish →
            </button>
          </div>
        )}

        {/* ── STEP 3: Publish ─────────────────────────────────────── */}
        {step === 3 && (
          <div className="bg-white p-10 rounded-xl border shadow-sm text-center">
            <div className="text-5xl mb-4">🚀</div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">Ready to Publish!</h2>
            <p className="text-slate-500 mb-2">
              Your listing has been set up with AI-generated marketing content,
              improvement suggestions, and a pricing strategy.
            </p>
            <p className="text-sm text-slate-400 mb-8">
              Once published, buyers will be able to find and make offers on your property.
            </p>
            <button onClick={handlePublish} disabled={loading}
              className="bg-amber-500 text-white px-10 py-3 rounded-lg hover:bg-amber-600 disabled:opacity-50 text-lg font-bold">
              {loading ? 'Publishing…' : '🏠 Publish Listing'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
