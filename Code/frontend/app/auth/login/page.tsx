'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const router  = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      if (!profile?.role) throw new Error('User profile not found. Please contact admin.')

      // ✅ Store role in localStorage so dashboards don't need to re-check
      // This prevents cross-tab session collision
      localStorage.setItem('homeport_role', profile.role)
      localStorage.setItem('homeport_user_id', data.user.id)
      localStorage.setItem('homeport_email', data.user.email || email)

      if (profile.role === 'seller') {
        router.push('/sellers-bridge')
      } else {
        router.push('/buyers-compass')
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const quickLogin = (e: string, p: string) => {
    setEmail(e)
    setPassword(p)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🏠⚓</div>
          <h1 className="text-3xl font-bold text-slate-800">HomePort</h1>
          <p className="text-slate-500 mt-1">Your safe harbor in real estate</p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border">
          <h2 className="text-xl font-bold text-slate-700 mb-6 text-center">Sign In</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-600">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-teal-400 outline-none text-sm"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-600">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-teal-400 outline-none text-sm"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-700 text-white py-2.5 rounded-lg hover:bg-slate-800 disabled:opacity-50 font-semibold"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-6 p-4 bg-gray-50 rounded-xl border">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Demo Accounts</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => quickLogin('seller@demo.com', 'demo123')}
                className="p-3 border-2 border-slate-200 rounded-lg hover:border-slate-400 hover:bg-slate-50 transition text-left"
              >
                <div className="text-xl mb-1">🏛️</div>
                <div className="text-xs font-bold text-slate-700">Seller's Bridge</div>
                <div className="text-xs text-slate-400">seller@demo.com</div>
              </button>
              <button
                onClick={() => quickLogin('buyer@demo.com', 'demo123')}
                className="p-3 border-2 border-emerald-200 rounded-lg hover:border-emerald-400 hover:bg-emerald-50 transition text-left"
              >
                <div className="text-xl mb-1">🧭</div>
                <div className="text-xs font-bold text-emerald-700">Buyer's Compass</div>
                <div className="text-xs text-emerald-400">buyer@demo.com</div>
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-2 text-center">Password: <strong>demo123</strong> — click to auto-fill</p>
          </div>
        </div>

        <div className="text-center mt-4">
          <a href="/" className="text-sm text-slate-500 hover:underline">← Back to Home</a>
        </div>
      </div>
    </div>
  )
}
