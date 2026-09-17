import React from 'react'
import { Bell, LogOut, Menu, Search } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export function AdminHeader({ onMenuToggle }) {
  const { profile, firebaseUser, role, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  const displayName = profile?.name || firebaseUser?.displayName || firebaseUser?.email || 'Admin'
  const initials = displayName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const currentRole = role || profile?.role || 'Admin'

  return (
    <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between border-b border-surface-200/60 bg-white/90 backdrop-blur-xl px-4 sm:px-6">
      <button
        type="button"
        onClick={onMenuToggle}
        className="rounded-xl p-2 text-surface-600 hover:bg-surface-100 lg:hidden transition-all duration-200 active:scale-95"
        aria-label="Open navigation"
      >
        <Menu size={20} />
      </button>
      <div className="relative ml-auto flex items-center gap-2 sm:gap-4">
        <label className="hidden items-center gap-2 rounded-xl border border-surface-200 bg-surface-50 px-3 py-1.5 text-sm text-surface-500 sm:flex focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20 transition-all duration-200">
          <Search size={16} aria-hidden="true" />
          <span className="sr-only">Search workspace</span>
          <input
            className="w-44 bg-transparent outline-none placeholder:text-surface-400 text-surface-900"
            placeholder="Search workspace..."
          />
        </label>
        <button
          type="button"
          className="rounded-xl p-2 text-surface-500 hover:bg-surface-100 hover:text-surface-700 transition-all duration-200 relative"
          aria-label="Notifications"
        >
          <Bell size={19} />
          <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-primary-500 ring-2 ring-white" />
        </button>
        <div className="flex items-center gap-3 border-l border-surface-200 pl-3">
          <span className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-sm font-bold text-white shadow-sm shadow-primary-600/20">
            {initials || 'LP'}
          </span>
          <div className="hidden text-left sm:block">
            <span className="block text-sm font-semibold text-surface-700 leading-tight">
              {displayName}
            </span>
            <span className="block text-xs font-bold text-primary-600 capitalize">
              {currentRole}
            </span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            title="Sign out"
            className="rounded-xl p-2 text-surface-400 hover:bg-red-50 hover:text-red-500 transition-all duration-200"
          >
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </header>
  )
}
