import React, { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Heart, LayoutDashboard, LogOut, Menu, User, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Browse Plots', to: '/plots' },
  { label: 'EMI Calculator', to: '/emi' },
  { label: 'Enquiries', to: '/enquiry' },
  { label: 'Reviews', to: '/reviews' },
  { label: 'FAQ', to: '/faq' },
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


  return (
    <header className="sticky top-0 z-40 glass border-b border-surface-200/60">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5 font-extrabold text-surface-900">
          <span className="rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-2.5 py-1 text-white font-extrabold text-sm shadow-md shadow-primary-600/20">LK</span>
          <span className="font-display text-lg tracking-tight">PROPERTIES</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'text-primary-700 bg-primary-50 font-semibold'
                    : 'text-surface-600 hover:text-primary-700 hover:bg-primary-50/50'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}

          {user && role === 'admin' && (
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 rounded-xl bg-surface-900 px-3 py-2 text-xs font-bold text-white hover:bg-surface-800 transition-all duration-200 shadow-sm hover:shadow-md ml-2"
            >
              <LayoutDashboard size={14} />
              Admin Portal
            </Link>
          )}

          {user && role === 'agent' && (
            <Link
              to="/agent"
              className="inline-flex items-center gap-1.5 rounded-xl bg-teal-700 px-3 py-2 text-xs font-bold text-white hover:bg-teal-800 transition-all duration-200 shadow-sm hover:shadow-md ml-2"
            >
              <LayoutDashboard size={14} />
              Agent Portal
            </Link>
          )}

          {user && role !== 'admin' && role !== 'agent' && (
            <Link
              to="/user"
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary-600 px-3 py-2 text-xs font-bold text-white hover:bg-primary-700 transition-all duration-200 shadow-sm hover:shadow-md ml-2"
            >
              <LayoutDashboard size={14} />
              My Dashboard
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-2 border-l border-surface-200 pl-3 ml-2">
              <Link
                to="/wishlist"
                className="rounded-xl p-2 text-surface-500 hover:bg-primary-50 hover:text-primary-600 transition-all duration-200"
                title="My Wishlist"
              >
                <Heart size={18} />
              </Link>
              <Link
                to="/appointments"
                className="rounded-xl p-2 text-surface-500 hover:bg-primary-50 hover:text-primary-600 transition-all duration-200"
                title="My Appointments & Site Visits"
              >
                <svg className="size-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </Link>
              <Link
                to="/profile"
                className="inline-flex items-center gap-2 text-sm font-bold text-primary-700 hover:text-primary-800 transition-colors"
              >
                <div className="size-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-white grid place-items-center text-xs font-bold shadow-sm">
                  {profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="hidden lg:inline">{profile?.name ? profile.name.split(' ')[0] : 'Account'}</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl p-2 text-surface-400 hover:bg-red-50 hover:text-red-500 transition-all duration-200"
                title="Sign out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 border-l border-surface-200 pl-3 ml-2">
              <Link
                to="/login"
                className="rounded-xl px-3 py-2 text-sm font-semibold text-surface-700 hover:text-primary-700 hover:bg-primary-50/50 transition-all duration-200"
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                className="btn-primary text-sm !px-4 !py-2 !min-h-0"
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
          className="rounded-xl p-2 text-surface-600 md:hidden hover:bg-surface-100 transition-all duration-200 active:scale-95"
          aria-label="Toggle navigation"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <nav className="border-t border-surface-100 bg-white/95 backdrop-blur-xl p-4 md:hidden space-y-1 animate-slide-down shadow-lg">
          {navLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-surface-700 hover:bg-surface-50'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}

          {user && role === 'admin' && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 rounded-xl bg-surface-900 px-4 py-2.5 text-sm font-bold text-white mt-2"
            >
              <LayoutDashboard size={16} />
              Admin Portal
            </Link>
          )}

          {user && role === 'agent' && (
            <Link
              to="/agent"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-bold text-white mt-2"
            >
              <LayoutDashboard size={16} />
              Agent Portal
            </Link>
          )}

          {user && role !== 'admin' && role !== 'agent' && (
            <Link
              to="/user"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-bold text-white mt-2"
            >
              <LayoutDashboard size={16} />
              My Dashboard
            </Link>
          )}

          <div className="border-t border-surface-100 pt-3 mt-3">
            {user ? (
              <div className="space-y-1">
                <Link
                  to="/wishlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-surface-700 hover:bg-surface-50"
                >
                  <Heart size={16} />
                  My Wishlist
                </Link>
                <Link
                  to="/appointments"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-surface-700 hover:bg-surface-50"
                >
                  My Appointments
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-bold text-primary-700 hover:bg-primary-50"
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
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
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
                  className="flex-1 rounded-xl border border-surface-200 py-2.5 text-center text-sm font-bold text-surface-700 hover:bg-surface-50 transition-all"
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 btn-primary text-center text-sm !py-2.5"
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
