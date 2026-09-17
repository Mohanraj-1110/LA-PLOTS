import React from 'react'
import { Clock, Mail, MapPin, Phone } from 'lucide-react'

export function Contact() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="text-center max-w-xl mx-auto">
        <span className="inline-block rounded-full bg-primary-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary-700 border border-primary-200">Contact Us</span>
        <h1 className="mt-3 font-display text-3xl font-extrabold text-surface-900">Visit Our Head Office</h1>
        <p className="mt-2 text-sm text-surface-500">
          Have questions about plot registration, legal vetting, or site visits? We are here to help.
        </p>
      </div>

      <div className="mt-12 grid gap-8 md:grid-cols-3">
        <div className="card-modern p-8 text-center group hover:shadow-elevated transition-all duration-300">
          <div className="size-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 text-white grid place-items-center mx-auto mb-5 shadow-card group-hover:shadow-glow transition-shadow">
            <MapPin size={24} />
          </div>
          <h3 className="font-display font-bold text-surface-900 text-lg">Corporate Address</h3>
          <p className="mt-3 text-sm text-surface-600 leading-relaxed">
            LA PLOTS Corporate Headquarters<br />
            Prime Plaza, Anna Nagar 2nd Avenue<br />
            Chennai, Tamil Nadu - 600040
          </p>
          <div className="mt-5 h-px bg-gradient-to-r from-transparent via-primary-200 to-transparent" />
        </div>

        <div className="card-modern p-8 text-center group hover:shadow-elevated transition-all duration-300">
          <div className="size-14 rounded-2xl bg-gradient-to-br from-accent-500 to-accent-600 text-white grid place-items-center mx-auto mb-5 shadow-card group-hover:shadow-glow transition-shadow">
            <Phone size={24} />
          </div>
          <h3 className="font-display font-bold text-surface-900 text-lg">Phone & WhatsApp</h3>
          <p className="mt-3 text-sm text-surface-600 leading-relaxed">
            Office: +91 44 2621 0000<br />
            Mobile / WhatsApp: +91 98765 43210<br />
            Support: +91 98765 43211
          </p>
          <div className="mt-5 h-px bg-gradient-to-r from-transparent via-accent-200 to-transparent" />
        </div>

        <div className="card-modern p-8 text-center group hover:shadow-elevated transition-all duration-300">
          <div className="size-14 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 text-white grid place-items-center mx-auto mb-5 shadow-card group-hover:shadow-glow transition-shadow">
            <Clock size={24} />
          </div>
          <h3 className="font-display font-bold text-surface-900 text-lg">Working Hours</h3>
          <p className="mt-3 text-sm text-surface-600 leading-relaxed">
            Monday – Saturday: 9:30 AM – 7:00 PM<br />
            Sunday: 10:00 AM – 4:00 PM (Site Visits Only)<br />
            Email: contact@laplots.in
          </p>
          <div className="mt-5 h-px bg-gradient-to-r from-transparent via-primary-200 to-transparent" />
        </div>
      </div>
    </div>
  )
}
