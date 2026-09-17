import React from 'react'
import { NavLink, Link } from 'react-router-dom'
import { Home, Compass, Heart, Send, User, CalendarDays } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export function UserBottomNav() {
  const { user } = useAuth()

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 flex h-16 items-center justify-around border-t border-slate-200 bg-white/95 px-2 backdrop-blur md:hidden shadow-lg"
      aria-label="Customer Mobile Navigation"
    >
      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          `flex min-w-12 flex-col items-center gap-1 py-1 text-[11px] font-medium transition ${
            isActive ? 'text-green-700 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`
        }
      >
        <Home size={20} />
        <span>Home</span>
      </NavLink>

      <NavLink
        to="/plots"
        className={({ isActive }) =>
          `flex min-w-12 flex-col items-center gap-1 py-1 text-[11px] font-medium transition ${
            isActive ? 'text-green-700 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`
        }
      >
        <Compass size={20} />
        <span>Browse</span>
      </NavLink>

      {/* Central Action Button: Enquire Now */}
      <Link
        to="/enquiry"
        className="-mt-5 flex size-12 items-center justify-center rounded-full bg-green-600 text-white shadow-lg ring-4 ring-white hover:bg-green-700 transition active:scale-95"
        title="Quick Enquiry"
      >
        <Send size={20} className="ml-0.5" />
      </Link>

      <NavLink
        to="/wishlist"
        className={({ isActive }) =>
          `flex min-w-12 flex-col items-center gap-1 py-1 text-[11px] font-medium transition ${
            isActive ? 'text-green-700 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`
        }
      >
        <Heart size={20} />
        <span>Wishlist</span>
      </NavLink>

      {user ? (
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex min-w-12 flex-col items-center gap-1 py-1 text-[11px] font-medium transition ${
              isActive ? 'text-green-700 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`
          }
        >
          <User size={20} />
          <span>Account</span>
        </NavLink>
      ) : (
        <NavLink
          to="/login"
          className={({ isActive }) =>
            `flex min-w-12 flex-col items-center gap-1 py-1 text-[11px] font-medium transition ${
              isActive ? 'text-green-700 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`
          }
        >
          <User size={20} />
          <span>Sign In</span>
        </NavLink>
      )}
    </nav>
  )
}

export default UserBottomNav
