import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { formatAuthError, isAdminEmail } from '../../services/auth'

export function Signup() {
  const navigate = useNavigate()
  const { signup, googleSignIn } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [signupRole, setSignupRole] = useState('customer') // 'customer' | 'agent'
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const [googleBusy, setGoogleBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      const result = await signup(name, email, password, signupRole)
      const role = result?.profile?.role
      const isAdm = isAdminEmail(email) || role === 'admin'
      const isAgnt = role === 'agent' || signupRole === 'agent'
      if (isAdm) {
        navigate('/admin', { replace: true })
      } else if (isAgnt) {
        navigate('/agent', { replace: true })
      } else {
        navigate('/user', { replace: true })
      }
    } catch (err) {
      setError(formatAuthError(err))
    } finally {
      setBusy(false)
    }
  }

  async function handleGoogleLogin() {
    setGoogleBusy(true)
    setError(null)
    try {
      const result = await googleSignIn()
      const effectiveEmail = result?.user?.email || result?.profile?.email
      const role = result?.profile?.role
      const isAdm = role === 'admin' || isAdminEmail(effectiveEmail)
      const isAgnt = role === 'agent'
      if (isAdm) {
        navigate('/admin', { replace: true })
      } else if (isAgnt) {
        navigate('/agent', { replace: true })
      } else {
        navigate('/user', { replace: true })
      }
    } catch (err) {
      setError(formatAuthError(err))
    } finally {
      setGoogleBusy(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-950 via-surface-900 to-indigo-950 px-4 py-12 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
      
      <div className="w-full max-w-md animate-slide-up relative z-10">
        <div className="rounded-3xl bg-white/95 backdrop-blur-xl p-8 shadow-elevated border border-white/20">
          {/* Brand Header */}
          <div className="text-center mb-6">
            <Link to="/" className="inline-flex items-center gap-2.5 font-extrabold text-2xl text-surface-900">
              <span className="rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-3 py-1 text-white font-extrabold shadow-md shadow-primary-600/20">LK</span>
              <span className="font-display">PROPERTIES</span>
            </Link>
            <h1 className="mt-5 text-2xl font-bold text-surface-900 font-display">Create your account</h1>
            <p className="mt-1.5 text-sm text-surface-500">Save your favorite plots and schedule site visits</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-5 rounded-xl bg-red-50 p-3.5 text-sm text-red-700 border border-red-200/60 flex items-start gap-2.5 animate-slide-up">
              <svg className="size-5 shrink-0 text-red-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="leading-snug">{error}</span>
            </div>
          )}

          {/* Google One-Click Sign Up */}
          <button
            type="button"
            disabled={busy || googleBusy}
            onClick={handleGoogleLogin}
            className="flex min-h-11 w-full items-center justify-center gap-3 rounded-xl border border-surface-200 bg-white px-4 py-2.5 font-semibold text-surface-700 shadow-sm hover:bg-surface-50 hover:border-surface-300 hover:shadow-md disabled:opacity-60 transition-all duration-200 active:scale-[0.98]"
          >
            {googleBusy ? (
              <svg className="size-5 animate-spin text-surface-600" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <svg className="size-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
            )}
            <span>{googleBusy ? 'Connecting to Google...' : 'Sign up with Google'}</span>
          </button>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="flex-1 border-t border-surface-200" />
            <span className="text-xs font-semibold text-surface-400 uppercase tracking-wider">or register with email</span>
            <div className="flex-1 border-t border-surface-200" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-surface-700 mb-1.5">Account Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSignupRole('customer')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    signupRole === 'customer'
                      ? 'bg-primary-50 border-primary-500 text-primary-800 ring-1 ring-primary-400'
                      : 'bg-white border-surface-200 text-surface-600 hover:bg-surface-50'
                  }`}
                >
                  Buyer / Client
                </button>
                <button
                  type="button"
                  onClick={() => setSignupRole('agent')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    signupRole === 'agent'
                      ? 'bg-primary-50 border-primary-500 text-primary-800 ring-1 ring-primary-400'
                      : 'bg-white border-surface-200 text-surface-600 hover:bg-surface-50'
                  }`}
                >
                  Property Agent
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-1.5">Full Name</label>
              <input
                type="text"
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Mohan Raj"
                className="input-modern"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-1.5">Email Address</label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="input-modern"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-1.5">Password</label>
              <input
                type="password"
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-modern"
              />
            </div>

            <button
              type="submit"
              disabled={busy || googleBusy}
              className="btn-primary w-full min-h-11"
            >
              {busy ? (
                <span className="flex items-center gap-2">
                  <svg className="size-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Footer Login Link */}
          <p className="mt-6 text-center text-sm text-surface-600">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-primary-600 hover:text-primary-700 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Signup;

