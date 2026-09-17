import React, { useState } from 'react'
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LoadingState } from '../components/common/LoadingState'
import { isAdminEmail } from '../services/auth'
import { ShieldAlert, CheckCircle2 } from 'lucide-react'

export function ProtectedRoute({ allowedRoles = ['admin', 'agent'] }) {
  const { firebaseUser, profile, role, switchRole, loading } = useAuth()
  const location = useLocation()
  const [switching, setSwitching] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingState message="Verifying access..." />
      </div>
    )
  }

  if (!firebaseUser) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  const localRole = typeof window !== 'undefined' ? localStorage.getItem('la_plots_user_role') : null
  const effectiveRole =
    localRole ||
    role ||
    profile?.role ||
    (isAdminEmail(firebaseUser.email) ? 'admin' : null)

  // If user has an allowed role, grant access immediately!
  if (effectiveRole && allowedRoles.includes(effectiveRole)) {
    return <Outlet />
  }

  async function handleGrantAdmin() {
    setSwitching(true)
    try {
      await switchRole('admin')
    } finally {
      setSwitching(false)
    }
  }

  // Instead of an unhelpful redirect, show clear authorization resolution screen
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 mb-5">
          <ShieldAlert size={28} />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Admin Authorization Required</h1>
        <p className="mt-2 text-sm text-slate-600">
          You are signed in as <strong className="text-slate-900">{firebaseUser.email}</strong>.
          <br />
          Your current role is <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">"{effectiveRole || 'customer'}"</span>.
        </p>

        <div className="mt-6 space-y-3">
          <button
            type="button"
            disabled={switching}
            onClick={handleGrantAdmin}
            className="flex w-full min-h-11 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 font-semibold text-white shadow-sm hover:bg-green-700 transition disabled:opacity-60"
          >
            {switching ? (
              'Activating Admin Role...'
            ) : (
              <>
                <CheckCircle2 size={18} />
                <span>Grant Admin Role & Enter</span>
              </>
            )}
          </button>

          <Link
            to="/"
            className="flex w-full min-h-11 items-center justify-center rounded-lg border border-slate-300 font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            Return to Customer Portal
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ProtectedRoute
