import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { formatAuthError } from '../../services/auth'

export function ForgotPassword() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await resetPassword(email)
      setSubmitted(true)
    } catch (err) {
      setError(formatAuthError(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-950 via-surface-900 to-indigo-950 px-4 py-12 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      
      <div className="w-full max-w-md animate-slide-up relative z-10">
        <div className="rounded-3xl bg-white/95 backdrop-blur-xl p-8 shadow-elevated border border-white/20">
          <div className="text-center mb-6">
            <Link to="/" className="inline-flex items-center gap-2.5 font-extrabold text-2xl text-surface-900">
              <span className="rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-3 py-1 text-white font-extrabold shadow-md shadow-primary-600/20">LA</span>
              <span className="font-display">PLOTS</span>
            </Link>
            <h1 className="mt-5 text-2xl font-bold text-surface-900 font-display">Reset password</h1>
            <p className="mt-1.5 text-sm text-surface-500">
              Enter your email to receive a password reset link
            </p>
          </div>

          {submitted ? (
            <div className="rounded-xl bg-primary-50 p-5 text-sm text-primary-800 border border-primary-200/60 text-center animate-scale-in">
              <div className="mx-auto size-12 rounded-2xl bg-primary-100 grid place-items-center mb-3">
                <svg className="size-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="font-bold">Reset link sent!</p>
              <p className="mt-1 text-primary-600">Check your inbox for instructions to reset your password.</p>
              <Link
                to="/login"
                className="mt-4 inline-block font-bold text-primary-700 hover:text-primary-800 transition-colors"
              >
                Return to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700 border border-red-200/60 animate-slide-up">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-surface-700 mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="input-modern"
                />
              </div>
              <button
                type="submit"
                disabled={busy}
                className="btn-primary w-full min-h-11"
              >
                {busy ? 'Sending link...' : 'Send Reset Link'}
              </button>
              <p className="text-center text-sm text-surface-600">
                Remember your password?{' '}
                <Link to="/login" className="font-bold text-primary-600 hover:text-primary-700 transition-colors">
                  Sign in
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
