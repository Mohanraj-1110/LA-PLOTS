import React from 'react'
import { Bell, LogOut, Menu, Search } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export function AdminHeader({ onMenuToggle }) {
  const { profile, firebaseUser, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  const displayName = profile?.name || firebaseUser?.email || 'Admin'
  const initials = displayName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
      <button
        type="button"
        onClick={onMenuToggle}
        className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
        aria-label="Open navigation"
      >
        <Menu size={20} />
      </button>
      <div className="relative ml-auto flex items-center gap-2 sm:gap-4">
        <label className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-500 sm:flex focus-within:border-green-500">
          <Search size={16} aria-hidden="true" />
          <span className="sr-only">Search workspace</span>
          <input
            className="w-44 bg-transparent outline-none placeholder:text-slate-400 text-slate-900"
            placeholder="Search workspace..."
          />
        </label>
        <button
          type="button"
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          aria-label="Notifications"
        >
          <Bell size={19} />
        </button>
        <div className="flex items-center gap-3 border-l border-slate-200 pl-3">
          <span className="grid size-9 place-items-center rounded-full bg-green-100 text-sm font-semibold text-green-800">
            {initials || 'LP'}
          </span>
          <div className="hidden text-left sm:block">
            <span className="block text-sm font-medium text-slate-700 leading-tight">
              {displayName}
            </span>
            <span className="block text-xs text-slate-400 capitalize">
              {profile?.role || 'Admin'}
            </span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            title="Sign out"
            className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
          >
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </header>
  )
}
