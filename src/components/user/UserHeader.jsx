import React, { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Heart, LayoutDashboard, LogOut, Menu, User, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Browse Plots', to: '/plots' },
  { label: 'Enquiries', to: '/enquiry' },
  { label: 'Reviews', to: '/reviews' },
  { label: 'Contact', to: '/contact' },
]

export function UserHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, profile, role, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  const localRole = typeof window !== 'undefined' ? localStorage.getItem('la_plots_user_role') : null
  const isAdminOrAgent = role === 'admin' || role === 'agent' || localRole === 'admin' || Boolean(user)

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-bold tracking-tight text-slate-900">
          <span className="rounded bg-green-600 px-2 py-0.5 text-white font-extrabold">LA</span>
          <span className="text-slate-900">PLOTS</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `text-sm font-medium transition ${
                  isActive ? 'text-green-700 font-semibold' : 'text-slate-600 hover:text-green-700'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}

          {user && (
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition"
            >
              <LayoutDashboard size={14} />
              Admin Portal
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
              <Link
                to="/wishlist"
                className="rounded-full p-1.5 text-slate-600 hover:bg-slate-100 hover:text-green-700 transition"
                title="My Wishlist"
              >
                <Heart size={18} />
              </Link>
              <Link
                to="/profile"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-700 hover:text-green-800"
              >
                <User size={16} />
                {profile?.name ? profile.name.split(' ')[0] : 'My Account'}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                title="Sign out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
              <Link
                to="/login"
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:text-green-700"
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition shadow-sm"
              >
                Sign up
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-lg p-2 text-slate-600 md:hidden hover:bg-slate-100"
          aria-label="Toggle navigation"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <nav className="border-t border-slate-100 bg-white p-4 md:hidden space-y-1">
          {navLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2 text-sm font-medium ${
                  isActive ? 'bg-green-50 text-green-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}

          {isAdminOrAgent && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white"
            >
              <LayoutDashboard size={16} />
              Admin Portal
            </Link>
          )}

          <div className="border-t border-slate-100 pt-3 mt-3">
            {user ? (
              <div className="space-y-1">
                <Link
                  to="/wishlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <Heart size={16} />
                  My Wishlist
                </Link>
                <Link
                  to="/appointments"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  My Appointments
                </Link>
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  <LayoutDashboard size={16} />
                  Admin Portal
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-50"
                >
                  <User size={16} />
                  My Profile ({profile?.name || user.email})
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false)
                    handleLogout()
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut size={16} />
                  Sign out
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 rounded-lg border border-slate-200 py-2 text-center text-sm font-semibold text-slate-700"
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 rounded-lg bg-green-600 py-2 text-center text-sm font-semibold text-white"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}
