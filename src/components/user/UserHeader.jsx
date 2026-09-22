import React, { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Heart, LayoutDashboard, LogOut, Menu, User, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { ThemeToggle } from '../common/ThemeToggle'

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
    <header className="sticky top-0 z-40 glass border-b border-surface-200/70 dark:border-slate-800/80 transition-colors duration-200">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5 font-extrabold text-surface-900 dark:text-white group">
          <span className="rounded-xl bg-gradient-to-r from-primary-600 via-teal-500 to-indigo-600 px-2.5 py-1 text-white font-extrabold text-sm shadow-md shadow-primary-600/25 group-hover:scale-105 transition-transform duration-200">
            LK
          </span>
          <div className="flex flex-col">
            <span className="font-display text-lg tracking-tight font-black leading-none">
              PROPERTIES
            </span>
            <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 tracking-wider uppercase">
              Premium Land & Plots
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 font-bold shadow-xs'
                    : 'text-surface-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/60 dark:hover:bg-slate-800/70'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}

          {user && role === 'admin' && (
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-slate-900 to-indigo-950 dark:from-indigo-900 dark:to-purple-900 px-3 py-2 text-xs font-bold text-white hover:opacity-95 transition-all duration-200 shadow-sm hover:shadow-md ml-1"
            >
              <LayoutDashboard size={14} />
              Admin Portal
            </Link>
          )}

          {user && role === 'agent' && (
            <Link
              to="/agent"
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-teal-700 to-cyan-700 px-3 py-2 text-xs font-bold text-white hover:opacity-95 transition-all duration-200 shadow-sm hover:shadow-md ml-1"
            >
              <LayoutDashboard size={14} />
              Agent Portal
            </Link>
          )}

          {user && role !== 'admin' && role !== 'agent' && (
            <Link
              to="/user"
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary-600 px-3 py-2 text-xs font-bold text-white hover:bg-primary-700 transition-all duration-200 shadow-sm hover:shadow-md ml-1"
            >
              <LayoutDashboard size={14} />
              My Dashboard
            </Link>
          )}

          {/* Theme Toggle Button */}
          <div className="ml-1 pl-1">
            <ThemeToggle />
          </div>

          {user ? (
            <div className="flex items-center gap-2 border-l border-surface-200 dark:border-slate-800 pl-3 ml-1">
              <Link
                to="/wishlist"
                className="rounded-xl p-2 text-surface-500 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-500 transition-all duration-200"
                title="My Wishlist"
              >
                <Heart size={18} />
              </Link>
              <Link
                to="/appointments"
                className="rounded-xl p-2 text-surface-500 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200"
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
                className="inline-flex items-center gap-2 text-sm font-bold text-surface-800 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                <div className="size-8 rounded-full bg-gradient-to-br from-emerald-500 to-indigo-600 text-white grid place-items-center text-xs font-bold shadow-sm">
                  {profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="hidden lg:inline">{profile?.name ? profile.name.split(' ')[0] : 'Account'}</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl p-2 text-surface-400 dark:text-slate-500 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-500 transition-all duration-200 cursor-pointer"
                title="Sign out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 border-l border-surface-200 dark:border-slate-800 pl-3 ml-1">
              <Link
                to="/login"
                className="rounded-xl px-3 py-2 text-sm font-semibold text-surface-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-slate-800/60 transition-all duration-200"
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

        {/* Mobile Controls (Theme Toggle + Hamburger) */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-xl p-2 text-surface-600 dark:text-slate-300 hover:bg-surface-100 dark:hover:bg-slate-800 transition-all duration-200 active:scale-95 cursor-pointer"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <nav className="border-t border-surface-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-4 md:hidden space-y-1 animate-slide-down shadow-xl">
          {navLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold'
                    : 'text-surface-700 dark:text-slate-200 hover:bg-surface-50 dark:hover:bg-slate-800'
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
              className="flex items-center gap-2 rounded-xl bg-slate-900 dark:bg-indigo-900 px-4 py-2.5 text-sm font-bold text-white mt-2"
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

          <div className="border-t border-surface-100 dark:border-slate-800 pt-3 mt-3">
            {user ? (
              <div className="space-y-1">
                <Link
                  to="/wishlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-surface-700 dark:text-slate-200 hover:bg-surface-50 dark:hover:bg-slate-800"
                >
                  <Heart size={16} className="text-rose-500" />
                  My Wishlist
                </Link>
                <Link
                  to="/appointments"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-surface-700 dark:text-slate-200 hover:bg-surface-50 dark:hover:bg-slate-800"
                >
                  My Appointments
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-800"
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
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
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
                  className="flex-1 rounded-xl border border-surface-200 dark:border-slate-700 py-2.5 text-center text-sm font-bold text-surface-700 dark:text-slate-200 hover:bg-surface-50 dark:hover:bg-slate-800 transition-all"
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
