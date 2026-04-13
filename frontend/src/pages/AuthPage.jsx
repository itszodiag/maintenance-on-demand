import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../state/authStore.js'
import { getPostLoginPath } from '../lib/roleRoutes.js'

export function AuthPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuthStore((state) => state.login)
  const register = useAuthStore((state) => state.register)
  const loading = useAuthStore((state) => state.loading)
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'client',
    phone: '',
    city: 'Casablanca',
  })
  const [error, setError] = useState('')

  const redirect = new URLSearchParams(location.search).get('redirect') || '/'

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    try {
      let session

      if (mode === 'login') {
        session = await login({ email: form.email, password: form.password })
      } else {
        session = await register(form)
      }

      navigate(getPostLoginPath(session?.user?.role, redirect))
    } catch (submissionError) {
      setError(submissionError.message)
    }
  }

  return (
    <div className="container-shell flex min-h-screen items-center justify-center py-10">
      <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="glass-card overflow-hidden bg-gradient-to-br from-blue-900 via-blue-700 to-sky-500 p-8 text-white">
          <p className="text-xs uppercase tracking-[0.32em] text-blue-100">Maintenance On Demand</p>
          <h1 className="mt-4 text-5xl font-black leading-tight">Book technicians, order products, and manage operations in one place.</h1>
          <p className="mt-6 max-w-2xl text-lg text-blue-100">
            Clients get an Airbnb-style booking experience. Technicians, companies, vendors, and admins get focused dashboard workflows with chat, requests, orders, and analytics.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {['Search nearby services', 'Shop verified products', 'Chat in real time'].map((item) => (
              <div key={item} className="rounded-[24px] border border-white/15 bg-white/10 p-4 backdrop-blur">
                <p className="font-semibold">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-8">
          <div className="flex items-center gap-2 rounded-full bg-blue-50 p-1">
            {['login', 'register'].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setMode(item)}
                className={item === mode ? 'flex-1 rounded-full bg-blue-700 px-4 py-3 font-semibold text-white' : 'flex-1 rounded-full px-4 py-3 font-semibold text-slate-600'}
              >
                {item === 'login' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {mode === 'register' && (
              <>
                <input className="field" placeholder="Full name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required />
                <div className="grid gap-4 sm:grid-cols-2">
                  <select className="field" value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}>
                    <option value="client">Client</option>
                    <option value="technician">Technician</option>
                    <option value="company">Company</option>
                    <option value="vendor">Vendor</option>
                  </select>
                  <input className="field" placeholder="Phone" value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} />
                </div>
                <input className="field" placeholder="City" value={form.city} onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))} />
              </>
            )}

            <input className="field" type="email" placeholder="Email address" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} required />
            <input className="field" type="password" placeholder="Password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} required />

            {mode === 'register' && (
              <input
                className="field"
                type="password"
                placeholder="Confirm password"
                value={form.password_confirmation}
                onChange={(event) => setForm((current) => ({ ...current, password_confirmation: event.target.value }))}
                required
              />
            )}

            {error && <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

            <button type="submit" className="button-primary w-full" disabled={loading}>
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign in securely' : 'Create my account'}
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-500">
            Want to explore first? <Link to="/" className="font-semibold text-blue-700">Go back home</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
