import React from 'react'
import {
  BarChart3,
  CalendarDays,
  FileText,
  Home,
  LayoutDashboard,
  MessageSquare,
  Settings,
  TrendingUp,
  UserCog,
  Users,
  X,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'

const navItems = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard, exact: true },
  { label: 'Plots', to: '/admin/plots', icon: Home },
  { label: 'Customers', to: '/admin/customers', icon: Users },
  { label: 'Appointments', to: '/admin/appointments', icon: CalendarDays },
  { label: 'Sales & Profit', to: '/admin/sales', icon: TrendingUp },
  { label: 'Documents', to: '/admin/documents', icon: FileText },
  { label: 'Reports', to: '/admin/reports', icon: BarChart3 },
  { label: 'Enquiries', to: '/admin/enquiries', icon: Users },
  { label: 'Messages', to: '/admin/messages', icon: MessageSquare },
  { label: 'Users & Roles', to: '/admin/users', icon: UserCog },
]

export function AdminSidebar({ onItemClick, onClose, isMobileDrawer = false }) {
  return (
    <aside
      className={`bg-white min-h-screen flex flex-col ${
        isMobileDrawer
          ? 'w-72 max-w-[85vw] shadow-2xl border-r border-slate-200'
          : 'hidden w-64 shrink-0 border-r border-slate-200 lg:flex'
      }`}
    >
      <div className="border-b border-slate-100 px-6 py-5 flex items-center justify-between">
        <NavLink to="/admin" onClick={onItemClick} className="block">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-green-700">LA PLOTS</p>
          <p className="mt-1 text-sm font-medium text-slate-500">Admin Workspace</p>
        </NavLink>
        {isMobileDrawer && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1 p-4 overflow-y-auto" aria-label="Primary navigation">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              onClick={onItemClick}
              className={({ isActive }) =>
                `flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition ${
                  isActive
                    ? 'bg-green-50 text-green-800 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <Icon size={18} aria-hidden="true" />
              {item.label}
            </NavLink>
          )
        })}
      </nav>

      <div className="border-t border-slate-100 p-4 space-y-2">
        <NavLink
          to="/admin/settings"
          onClick={onItemClick}
          className={({ isActive }) =>
            `flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition ${
              isActive
                ? 'bg-green-50 text-green-800 font-semibold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`
          }
        >
          <Settings size={18} aria-hidden="true" />
          Settings
        </NavLink>
        <NavLink
          to="/"
          onClick={onItemClick}
          className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700"
        >
          <Home size={18} aria-hidden="true" />
          View Public Site
        </NavLink>
      </div>
    </aside>
  )
}

export default AdminSidebar
