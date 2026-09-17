import React from 'react'
import { NavLink, Link } from 'react-router-dom'
import { Home, Compass, Heart, Send, User } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export function UserBottomNav() {
  const { user } = useAuth()

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 flex h-16 items-center justify-around border-t border-surface-200/60 bg-white/90 px-2 backdrop-blur-xl md:hidden shadow-lg shadow-surface-900/5"
      aria-label="Customer Mobile Navigation"
    >
      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          `flex min-w-12 flex-col items-center gap-1 py-1 text-[11px] font-semibold transition-all duration-200 ${
            isActive ? 'text-primary-600' : 'text-surface-400 hover:text-surface-600'
          }`
        }
      >
        <Home size={20} />
        <span>Home</span>
      </NavLink>

      <NavLink
        to="/plots"
        className={({ isActive }) =>
          `flex min-w-12 flex-col items-center gap-1 py-1 text-[11px] font-semibold transition-all duration-200 ${
            isActive ? 'text-primary-600' : 'text-surface-400 hover:text-surface-600'
          }`
        }
      >
        <Compass size={20} />
        <span>Browse</span>
      </NavLink>

      {/* Central Action Button: Enquire Now */}
      <Link
        to="/enquiry"
        className="-mt-5 flex size-12 items-center justify-center rounded-full bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-600/30 ring-4 ring-white hover:from-primary-700 hover:to-primary-600 transition-all duration-200 active:scale-90"
        title="Quick Enquiry"
      >
        <Send size={20} className="ml-0.5" />
      </Link>

      <NavLink
        to="/wishlist"
        className={({ isActive }) =>
          `flex min-w-12 flex-col items-center gap-1 py-1 text-[11px] font-semibold transition-all duration-200 ${
            isActive ? 'text-primary-600' : 'text-surface-400 hover:text-surface-600'
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
            `flex min-w-12 flex-col items-center gap-1 py-1 text-[11px] font-semibold transition-all duration-200 ${
              isActive ? 'text-primary-600' : 'text-surface-400 hover:text-surface-600'
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
            `flex min-w-12 flex-col items-center gap-1 py-1 text-[11px] font-semibold transition-all duration-200 ${
              isActive ? 'text-primary-600' : 'text-surface-400 hover:text-surface-600'
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
