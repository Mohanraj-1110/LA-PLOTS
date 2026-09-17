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
          ? 'w-72 max-w-[85vw] shadow-elevated border-r border-surface-100'
          : 'hidden w-64 shrink-0 border-r border-surface-200/60 lg:flex'
      }`}
    >
      <div className="border-b border-surface-100 px-6 py-5 flex items-center justify-between">
        <NavLink to="/admin" onClick={onItemClick} className="block">
          <div className="flex items-center gap-2.5">
            <span className="rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-2.5 py-1 text-white font-extrabold text-sm shadow-md shadow-primary-600/20">LA</span>
            <div>
              <p className="text-sm font-bold text-surface-900 font-display tracking-tight">PLOTS</p>
              <p className="text-[10px] font-semibold text-primary-600 uppercase tracking-wider">Admin Workspace</p>
            </div>
          </div>
        </NavLink>
        {isMobileDrawer && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-surface-400 hover:bg-surface-100 hover:text-surface-700 transition-all duration-200"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1 p-3 overflow-y-auto" aria-label="Primary navigation">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              onClick={onItemClick}
              className={({ isActive }) =>
                `flex min-h-11 items-center gap-3 rounded-xl px-3.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-primary-50 to-primary-50/50 text-primary-700 font-semibold shadow-sm shadow-primary-500/5'
                    : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900'
                }`
              }
            >
              <Icon size={18} aria-hidden="true" />
              {item.label}
            </NavLink>
          )
        })}
      </nav>

      <div className="border-t border-surface-100 p-3 space-y-1">
        <NavLink
          to="/admin/settings"
          onClick={onItemClick}
          className={({ isActive }) =>
            `flex min-h-11 items-center gap-3 rounded-xl px-3.5 text-sm font-medium transition-all duration-200 ${
              isActive
                ? 'bg-gradient-to-r from-primary-50 to-primary-50/50 text-primary-700 font-semibold'
                : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900'
            }`
          }
        >
          <Settings size={18} aria-hidden="true" />
          Settings
        </NavLink>
        <NavLink
          to="/"
          onClick={onItemClick}
          className="flex min-h-11 items-center gap-3 rounded-xl px-3.5 text-sm font-medium text-surface-500 hover:bg-surface-50 hover:text-surface-700 transition-all duration-200"
        >
          <Home size={18} aria-hidden="true" />
          View Public Site
        </NavLink>
      </div>
    </aside>
  )
}

export default AdminSidebar
