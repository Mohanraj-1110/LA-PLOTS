import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LoadingState } from '../components/common/LoadingState'

export function ProtectedRoute({ allowedRoles = ['admin', 'agent'] }) {
  const { firebaseUser, profile, loading } = useAuth()
  const location = useLocation()

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

  const userRole = profile?.role || 'customer'
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/login?error=unauthorized" replace />
  }

  return <Outlet />
}

export default ProtectedRoute
