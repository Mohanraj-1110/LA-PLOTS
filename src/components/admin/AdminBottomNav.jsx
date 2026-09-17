import React from 'react'
import { CalendarDays, Home, LayoutDashboard, Settings, Users } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const mobileNavItems = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard, exact: true },
  { label: 'Plots', to: '/admin/plots', icon: Home },
  { label: 'Customers', to: '/admin/customers', icon: Users },
  { label: 'Visits', to: '/admin/appointments', icon: CalendarDays },
  { label: 'Settings', to: '/admin/settings', icon: Settings },
]

export function AdminBottomNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 flex h-16 items-center justify-around border-t border-surface-200/60 bg-white/90 px-2 backdrop-blur-xl lg:hidden shadow-lg shadow-surface-900/5"
      aria-label="Mobile navigation"
    >
      {mobileNavItems.map((item) => {
        const Icon = item.icon
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            className={({ isActive }) =>
              `flex min-w-14 flex-col items-center gap-1 rounded-xl py-1 text-[11px] font-semibold transition-all duration-200 ${
                isActive ? 'text-primary-600' : 'text-surface-400 hover:text-surface-600'
              }`
            }
          >
            <Icon size={18} aria-hidden="true" />
            {item.label}
          </NavLink>
        )
      })}
    </nav>
  )
}
