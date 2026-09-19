import React from 'react';
import PropTypes from 'prop-types';
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingState } from '../components/common/LoadingState';
import { isAdminEmail } from '../services/auth';
import { ShieldAlert, Home, LogIn } from 'lucide-react';

export function ProtectedRoute({ allowedRoles = ['admin'], children }) {
  const { firebaseUser, user, profile, role, isAdmin, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingState message="Verifying administrator credentials..." />
      </div>
    );
  }

  const activeUser = profile || user || firebaseUser;

  // Unauthenticated users are redirected to login
  if (!isAuthenticated || !activeUser) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const userEmail = activeUser?.email || '';
  const isUserAdmin = isAdmin || role === 'admin' || isAdminEmail(userEmail);
  const currentRole = isUserAdmin ? 'admin' : (role || 'customer').toLowerCase();

  const normalizedAllowed = allowedRoles.map((r) => r.toLowerCase());

  // Strict check: only grant access if user matches allowed role or verified admin
  if (normalizedAllowed.includes(currentRole) || (isUserAdmin && normalizedAllowed.includes('admin'))) {
    return children ? children : <Outlet />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 shadow-sm text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-red-100 text-red-600 mb-5">
          <ShieldAlert size={28} />
        </div>
        <h1 className="text-xl font-bold text-slate-900 font-display">Access Restricted</h1>
        <p className="mt-2 text-sm text-slate-600">
          This portal requires verified {allowedRoles.map((r) => r.charAt(0).toUpperCase() + r.slice(1)).join(' or ')} privileges.
        </p>

        <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-500">Signed in as:</span>
            <span className="font-semibold text-slate-800 font-mono">{userEmail || 'User'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Assigned role:</span>
            <span className="font-semibold text-amber-700 capitalize">{currentRole}</span>
          </div>
        </div>

        <p className="mt-3 text-xs text-slate-500">
          Please sign in with an authorized account or return to your designated dashboard.
        </p>

        <div className="mt-6 space-y-3">
          <Link
            to="/login"
            state={{ from: location }}
            className="flex w-full min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 font-semibold text-white shadow-sm hover:bg-slate-800 transition cursor-pointer text-sm"
          >
            <LogIn size={16} />
            <span>Sign In with Different Account</span>
          </Link>

          <Link
            to={currentRole === 'agent' ? '/agent' : (currentRole === 'admin' ? '/admin' : '/user')}
            className="flex w-full min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 font-medium text-slate-700 hover:bg-slate-50 transition text-sm cursor-pointer"
          >
            <Home size={16} />
            <span>Go to My Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

ProtectedRoute.propTypes = {
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
  children: PropTypes.node,
};

export default ProtectedRoute;
