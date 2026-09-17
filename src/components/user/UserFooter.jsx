import React from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail } from 'lucide-react'

export function UserFooter() {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-slate-950 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-4 sm:grid-cols-2">
          {/* Brand Col */}
          <div>
            <Link to="/" className="flex items-center gap-2 font-bold text-xl text-white">
              <span className="rounded bg-green-600 px-2 py-0.5 text-white">LA</span>
              <span>PLOTS</span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              Trusted land investments made transparent, simple, and secure. Explore verified residential and commercial layouts.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Explore</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link to="/plots" className="hover:text-white transition">Browse All Plots</Link>
              </li>
              <li>
                <Link to="/enquiry" className="hover:text-white transition">Submit an Enquiry</Link>
              </li>
              <li>
                <Link to="/reviews" className="hover:text-white transition">Customer Reviews</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition">Contact Office</Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Account</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link to="/login" className="hover:text-white transition">Sign In</Link>
              </li>
              <li>
                <Link to="/signup" className="hover:text-white transition">Create Account</Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-white transition">Saved Plots</Link>
              </li>
              <li>
                <Link to="/appointments" className="hover:text-white transition">My Site Visits</Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Office</h3>
            <div className="mt-4 space-y-2 text-sm">
              <p className="flex items-start gap-2">
                <MapPin size={16} className="text-green-500 shrink-0 mt-0.5" />
                <span>Prime Plaza, Anna Nagar, Chennai, Tamil Nadu - 600040</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone size={16} className="text-green-500 shrink-0" />
                <span>+91 98765 43210</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail size={16} className="text-green-500 shrink-0" />
                <span>contact@laplots.in</span>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} LA PLOTS. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/contact" className="hover:text-slate-400">Privacy Policy</Link>
            <Link to="/contact" className="hover:text-slate-400">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
