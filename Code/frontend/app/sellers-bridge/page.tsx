'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { setAuthToken, listingsApi, offersApi, notificationsApi } from '@/lib/api'
import Link from 'next/link'

export default function SellersBridge() {
  const [user, setUser]               = useState<any>(null)
  const [listings, setListings]       = useState<any[]>([])
  const [offers, setOffers]           = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading]         = useState(true)
  const router  = useRouter()
  const supabase = createClient()

  useEffect(() => { checkAuth() }, [])

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      // Read role from localStorage to avoid cross-tab collision
      const storedRole = localStorage.getItem('homeport_role')
      if (storedRole && storedRole !== 'seller') {
        router.push('/buyers-compass')
        return
      }

      setUser(user)
      setAuthToken(user.id)
      await loadData(user.id)
    } catch (e) {
      router.push('/auth/login')
    } finally {
      setLoading(false)
    }
  }

  const loadData = async (userId: string) => {
    try {
      const [listRes, offerRes, notifRes] = await Promise.all([
        listingsApi.getAll({ user_id: userId }),
        offersApi.getAll({ seller_user_id: userId }),
        notificationsApi.getAll(userId, { limit: 10 }),
      ])
      setListings(listRes.data || [])
      setOffers(offerRes.data || [])
      setNotifications(notifRes.data?.notifications || [])
    } catch (e) {
      console.error('Error loading data:', e)
    }
  }

  const handleLogout = async () => {
    localStorage.removeItem('homeport_role')
    localStorage.removeItem('homeport_user_id')
    localStorage.removeItem('homeport_email')
    await supabase.auth.signOut()
    router.push('/')
  }

  const unreadCount    = notifications.filter(n => !n.is_read).length
  const activeListings = listings.filter(l => l.status === 'published').length
  const pendingOffers  = offers.filter(o => o.status === 'pending').length

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center text-white">
        <div className="text-4xl mb-3">🏛️</div>
        <p className="text-slate-300">Loading Seller's Bridge…</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-100">
      {/* ── Navy Header ─────────────────────────────── */}
      <header className="bg-slate-800 text-white sticky top-0 z-10 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏛️</span>
            <div>
              <h1 className="text-lg font-bold leading-tight">Seller's Bridge</h1>
              <p className="text-xs text-slate-400">HomePort Listing Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <Link href="/sellers-bridge/offers" className="relative">
              <span className="text-xl">🔔</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-900 text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </Link>
            <span className="text-sm text-slate-300">{user?.email}</span>
            <button onClick={handleLogout} className="text-amber-400 hover:text-amber-300 text-sm font-medium">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* ── Navy Sidebar ─────────────────────────── */}
        <aside className="w-60 bg-slate-700 min-h-screen p-4 flex-shrink-0 shadow-xl">
          <nav className="space-y-1 mt-2">
            {[
              { href: '/sellers-bridge',             icon: '📊', label: 'Overview',      active: true },
              { href: '/sellers-bridge/new-listing', icon: '➕', label: 'New Listing' },
              { href: '/sellers-bridge/listings',    icon: '🏘️', label: 'My Listings' },
              { href: '/sellers-bridge/offers',      icon: '📬', label: 'Offers', badge: pendingOffers },
            ].map(item => (
              <Link key={item.href} href={item.href}
                className={`flex items-center justify-between py-2.5 px-4 rounded-lg font-medium transition ${
                  item.active
                    ? 'bg-slate-900 text-amber-400'
                    : 'text-slate-200 hover:bg-slate-600 hover:text-white'
                }`}>
                <span>{item.icon} {item.label}</span>
                {(item as any).badge > 0 && (
                  <span className="bg-amber-400 text-slate-900 text-xs px-2 py-0.5 rounded-full font-bold">
                    {(item as any).badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>
        </aside>

        {/* ── Main Content ──────────────────────────── */}
        <main className="flex-1 p-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-1">Welcome back!</h2>
          <p className="text-slate-500 text-sm mb-8">Here's your listing activity at a glance.</p>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl border-l-4 border-amber-400 shadow-sm">
              <p className="text-slate-500 text-sm">Active Listings</p>
              <p className="text-4xl font-bold mt-1 text-slate-800">{activeListings}</p>
              <p className="text-xs text-slate-400 mt-1">Published properties</p>
            </div>
            <div className="bg-white p-6 rounded-xl border-l-4 border-red-400 shadow-sm">
              <p className="text-slate-500 text-sm">Pending Offers</p>
              <p className="text-4xl font-bold mt-1 text-slate-800">{pendingOffers}</p>
              <p className="text-xs text-slate-400 mt-1">Awaiting your response</p>
            </div>
            <div className="bg-white p-6 rounded-xl border-l-4 border-slate-400 shadow-sm">
              <p className="text-slate-500 text-sm">Total Offers</p>
              <p className="text-4xl font-bold mt-1 text-slate-800">{offers.length}</p>
              <p className="text-xs text-slate-400 mt-1">All time</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-xl border shadow-sm mb-8">
            <h3 className="text-base font-semibold text-slate-700 mb-4">Quick Actions</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <Link href="/sellers-bridge/new-listing"
                className="p-4 border-2 border-dashed border-amber-300 rounded-xl hover:bg-amber-50 transition text-center">
                <div className="text-3xl mb-2">➕</div>
                <p className="font-semibold text-slate-700">Create New Listing</p>
              </Link>
              <Link href="/sellers-bridge/offers"
                className="p-4 border-2 border-dashed border-slate-300 rounded-xl hover:bg-slate-50 transition text-center">
                <div className="text-3xl mb-2">📬</div>
                <p className="font-semibold text-slate-700">View Incoming Offers</p>
              </Link>
            </div>
          </div>

          {/* Recent Activity — max 4 */}
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="text-base font-semibold text-slate-700 mb-4">Recent Activity</h3>
            {notifications.length > 0 ? (
              <div className="space-y-3">
                {notifications.slice(0, 4).map(notif => (
                  <div key={notif.id}
                    className={`py-3 px-4 border-l-4 rounded-lg ${
                      notif.is_read
                        ? 'border-slate-200 bg-slate-50'
                        : 'border-amber-400 bg-amber-50'
                    }`}>
                    <p className="font-semibold text-sm text-slate-800">{notif.title}</p>
                    <p className="text-sm text-slate-500 mt-0.5">{notif.message}</p>
                    <p className="text-xs text-slate-400 mt-1">{new Date(notif.created_at).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <div className="text-4xl mb-2">📭</div>
                <p>No activity yet. Create your first listing to get started!</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
