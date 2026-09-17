import React from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail } from 'lucide-react'

export function UserFooter() {
  return (
    <footer className="mt-20 border-t border-surface-200/60 bg-surface-950 text-surface-400">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-4 sm:grid-cols-2">
          {/* Brand Col */}
          <div>
            <Link to="/" className="flex items-center gap-2.5 font-extrabold text-xl text-white">
              <span className="rounded-xl bg-gradient-to-r from-primary-500 to-primary-400 px-2.5 py-1 text-white text-sm">LA</span>
              <span className="font-display">PLOTS</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-surface-400">
              Trusted land investments made transparent, simple, and secure. Explore verified residential and commercial layouts.
            </p>
            <div className="mt-4 flex gap-3">
              <div className="size-8 rounded-lg bg-primary-900/50 text-primary-400 grid place-items-center text-xs font-bold">
                <MapPin size={14} />
              </div>
              <div className="size-8 rounded-lg bg-accent-900/50 text-accent-400 grid place-items-center text-xs font-bold">
                <Phone size={14} />
              </div>
              <div className="size-8 rounded-lg bg-indigo-900/50 text-indigo-400 grid place-items-center text-xs font-bold">
                <Mail size={14} />
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white font-display">Explore</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link to="/plots" className="hover:text-primary-400 transition-colors duration-200">Browse All Plots</Link>
              </li>
              <li>
                <Link to="/enquiry" className="hover:text-primary-400 transition-colors duration-200">Submit an Enquiry</Link>
              </li>
              <li>
                <Link to="/reviews" className="hover:text-primary-400 transition-colors duration-200">Customer Reviews</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-primary-400 transition-colors duration-200">Contact Office</Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white font-display">Account</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link to="/login" className="hover:text-primary-400 transition-colors duration-200">Sign In</Link>
              </li>
              <li>
                <Link to="/signup" className="hover:text-primary-400 transition-colors duration-200">Create Account</Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-primary-400 transition-colors duration-200">Saved Plots</Link>
              </li>
              <li>
                <Link to="/appointments" className="hover:text-primary-400 transition-colors duration-200">My Site Visits</Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white font-display">Office</h3>
            <div className="mt-4 space-y-3 text-sm">
              <p className="flex items-start gap-3">
                <MapPin size={16} className="text-primary-400 shrink-0 mt-0.5" />
                <span>Prime Plaza, Anna Nagar, Chennai, Tamil Nadu - 600040</span>
              </p>
              <p className="flex items-center gap-3">
                <Phone size={16} className="text-primary-400 shrink-0" />
                <span>+91 98765 43210</span>
              </p>
              <p className="flex items-center gap-3">
                <Mail size={16} className="text-primary-400 shrink-0" />
                <span>contact@laplots.in</span>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-14 border-t border-surface-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-surface-500">
          <p>&copy; {new Date().getFullYear()} LA PLOTS. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/contact" className="hover:text-surface-300 transition-colors">Privacy Policy</Link>
            <Link to="/contact" className="hover:text-surface-300 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
