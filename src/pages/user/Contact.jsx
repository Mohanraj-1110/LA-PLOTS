import React from 'react'
import { Clock, Mail, MapPin, Phone } from 'lucide-react'

export function Contact() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="text-center max-w-xl mx-auto">
        <p className="text-xs font-bold uppercase tracking-widest text-green-700">Contact Us</p>
        <h1 className="mt-1 text-3xl font-extrabold text-slate-900">Visit Our Head Office</h1>
        <p className="mt-2 text-sm text-slate-500">
          Have questions about plot registration, legal vetting, or site visits? We are here to help.
        </p>
      </div>

      <div className="mt-12 grid gap-8 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-center">
          <div className="size-12 rounded-xl bg-green-50 text-green-700 grid place-items-center mx-auto mb-4">
            <MapPin size={24} />
          </div>
          <h3 className="font-bold text-slate-900">Corporate Address</h3>
          <p className="mt-2 text-sm text-slate-600">
            LA PLOTS Corporate Headquarters<br />
            Prime Plaza, Anna Nagar 2nd Avenue<br />
            Chennai, Tamil Nadu - 600040
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-center">
          <div className="size-12 rounded-xl bg-green-50 text-green-700 grid place-items-center mx-auto mb-4">
            <Phone size={24} />
          </div>
          <h3 className="font-bold text-slate-900">Phone & WhatsApp</h3>
          <p className="mt-2 text-sm text-slate-600">
            Office: +91 44 2621 0000<br />
            Mobile / WhatsApp: +91 98765 43210<br />
            Support: +91 98765 43211
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-center">
          <div className="size-12 rounded-xl bg-green-50 text-green-700 grid place-items-center mx-auto mb-4">
            <Clock size={24} />
          </div>
          <h3 className="font-bold text-slate-900">Working Hours</h3>
          <p className="mt-2 text-sm text-slate-600">
            Monday – Saturday: 9:30 AM – 7:00 PM<br />
            Sunday: 10:00 AM – 4:00 PM (Site Visits Only)<br />
            Email: contact@laplots.in
          </p>
        </div>
      </div>
    </div>
  )
}
