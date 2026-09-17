import React from 'react'
import {
  CalendarDays,
  FileText,
  Home,
  LayoutDashboard,
  MessageSquare,
  Settings,
  TrendingUp,
  Users,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'

const navItems = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard, exact: true },
  { label: 'Plots', to: '/admin/plots', icon: Home },
  { label: 'Customers', to: '/admin/customers', icon: Users },
  { label: 'Appointments', to: '/admin/appointments', icon: CalendarDays },
  { label: 'Sales & Profit', to: '/admin/sales', icon: TrendingUp },
  { label: 'Documents', to: '/admin/documents', icon: FileText },
  { label: 'Reports', to: '/admin/reports', icon: FileText },
  { label: 'Enquiries', to: '/admin/enquiries', icon: Users },
  { label: 'Messages', to: '/admin/messages', icon: MessageSquare },
]

export function AdminSidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col min-h-screen">
      <div className="border-b border-slate-100 px-6 py-5">
        <NavLink to="/admin" className="block">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-green-700">LA PLOTS</p>
          <p className="mt-1 text-sm font-medium text-slate-500">Admin Workspace</p>
        </NavLink>
      </div>
      <nav className="flex-1 space-y-1 p-4" aria-label="Primary navigation">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
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
          className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700"
        >
          <Home size={18} aria-hidden="true" />
          View Public Site
        </NavLink>
      </div>
    </aside>
  )
}
