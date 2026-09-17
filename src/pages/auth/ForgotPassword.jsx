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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 font-extrabold text-2xl text-slate-900">
            <span className="rounded bg-green-600 px-2 py-0.5 text-white">LA</span>
            <span>PLOTS</span>
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">Reset password</h1>
          <p className="mt-1 text-sm text-slate-500">
            Enter your email to receive a password reset link
          </p>
        </div>

        {submitted ? (
          <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800 border border-green-200 text-center">
            <p className="font-semibold">Reset link sent!</p>
            <p className="mt-1">Check your inbox for instructions to reset your password.</p>
            <Link
              to="/login"
              className="mt-4 inline-block font-semibold text-green-700 hover:underline"
            >
              Return to login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-3 text-slate-900 focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="min-h-11 w-full rounded-lg bg-green-600 font-semibold text-white hover:bg-green-700 disabled:opacity-60 transition shadow-sm"
            >
              {busy ? 'Sending link...' : 'Send Reset Link'}
            </button>
            <p className="text-center text-sm text-slate-600">
              Remember your password?{' '}
              <Link to="/login" className="font-semibold text-green-700 hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
