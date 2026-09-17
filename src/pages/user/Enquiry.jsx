import React, { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { CalendarDays, CheckCircle, Clock, MapPin, Send } from 'lucide-react'
import { createEnquiry } from '../../services/enquiries'
import { createAppointment } from '../../services/appointments'
import { useAuth } from '../../context/AuthContext'

const TIME_SLOTS = [
  '10:00 AM',
  '11:30 AM',
  '02:00 PM',
  '04:00 PM',
  '05:30 PM',
]

export function Enquiry() {
  const [searchParams] = useSearchParams()
  const { user, profile } = useAuth()

  const initialIsVisit = searchParams.get('type') === 'visit'
  const [isVisit, setIsVisit] = useState(initialIsVisit)

  const [customerName, setCustomerName] = useState(profile?.name || '')
  const [phone, setPhone] = useState(profile?.phone || '')
  const [email, setEmail] = useState(profile?.email || user?.email || '')
  const [projectId, setProjectId] = useState(searchParams.get('projectId') || '')
  const [plotNumber, setPlotNumber] = useState(searchParams.get('plotNumber') || '')
  const [budget, setBudget] = useState(searchParams.get('budget') || '')
  const [visitDate, setVisitDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return d.toISOString().slice(0, 10)
  })
  const [visitTime, setVisitTime] = useState('10:00 AM')
  const [pickupNeeded, setPickupNeeded] = useState(false)
  const [requirement, setRequirement] = useState(
    searchParams.get('plotNumber')
      ? `Inquiry regarding Plot #${searchParams.get('plotNumber')}`
      : ''
  )
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const enquiryPayload = {
        customerId: user?.uid || '',
        customerName,
        phone,
        email,
        projectId,
        budget: Number(budget) || 0,
        requirement: isVisit
          ? `[Site Visit Request] Date: ${visitDate} at ${visitTime}. Pickup needed: ${pickupNeeded ? 'Yes' : 'No'}. ${requirement}`
          : requirement,
        source: isVisit ? 'Guided Site Visit Booking' : 'Website Enquiry Form',
      }

      await createEnquiry(enquiryPayload)

      if (isVisit && user?.uid) {
        try {
          await createAppointment({
            customerId: user.uid,
            customerName,
            plotId: plotNumber ? `Plot #${plotNumber}` : (projectId || 'Site Visit'),
            type: 'site visit',
            date: visitDate,
            time: visitTime,
            status: 'Upcoming',
            notes: `Booked by customer online. Phone: ${phone}. Pickup: ${pickupNeeded ? 'Yes' : 'No'}. Notes: ${requirement}`,
          })
        } catch (appErr) {
          console.warn('[Enquiry] Appointment auto-creation note:', appErr?.message)
        }
      }

      setSubmitted(true)
    } catch (err) {
      setError(err?.message || 'Failed to submit request. Please try again or call us.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      {/* Gradient Header */}
      <div className="rounded-t-3xl bg-gradient-to-r from-primary-600 to-primary-500 px-6 sm:px-8 pt-8 pb-6 text-center text-white">
        <p className="text-xs font-bold uppercase tracking-widest text-primary-200">
          {isVisit ? 'Free Layout Tour' : 'Get in Touch'}
        </p>
        <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold font-display">
          {isVisit ? 'Schedule a Free Site Inspection' : 'Property Enquiry & Details'}
        </h1>
        <p className="mt-2 text-sm text-primary-100">
          {isVisit
            ? 'Complimentary pickup, layout tour, legal paper scrutiny, and return drop.'
            : 'Tell us your investment preferences and our property consultants will assist you immediately.'}
        </p>
      </div>

      <div className="rounded-b-3xl border border-surface-200 border-t-0 bg-white p-6 sm:p-8 shadow-elevated">
        {/* Type Toggle Tabs */}
        <div className="flex rounded-2xl bg-surface-100 p-1.5 mb-8">
          <button
            type="button"
            onClick={() => setIsVisit(false)}
            className={`flex-1 rounded-xl py-2.5 text-xs sm:text-sm font-bold transition ${
              !isVisit
                ? 'bg-white text-surface-900 shadow-card'
                : 'text-surface-600 hover:text-surface-900'
            }`}
          >
            General Property Enquiry
          </button>
          <button
            type="button"
            onClick={() => setIsVisit(true)}
            className={`flex-1 rounded-xl py-2.5 text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 ${
              isVisit
                ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-card'
                : 'text-surface-600 hover:text-surface-900'
            }`}
          >
            <CalendarDays size={16} />
            Book Guided Site Visit
          </button>
        </div>

        {submitted ? (
          <div className="text-center py-10">
            <div className="mx-auto size-20 rounded-full bg-gradient-to-br from-primary-100 to-primary-50 grid place-items-center animate-bounce">
              <CheckCircle className="text-primary-600 size-10" />
            </div>
            <h2 className="mt-6 text-2xl font-bold text-surface-900 font-display">
              {isVisit ? 'Site Visit Booked!' : 'Enquiry Submitted!'}
            </h2>
            <p className="mt-2 text-sm text-surface-600 max-w-md mx-auto">
              {isVisit
                ? `Thank you, ${customerName}. Your site visit is requested for ${new Date(visitDate).toLocaleDateString('en-IN')} at ${visitTime}. Our tour executive will call you to confirm pickup details.`
                : 'Thank you for your interest. An executive from LA PLOTS will contact you via phone shortly.'}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              {isVisit && user && (
                <Link
                  to="/appointments"
                  className="rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-5 py-2.5 text-sm font-semibold text-white shadow-card hover:shadow-elevated transition"
                >
                  View My Appointments
                </Link>
              )}
              <Link
                to="/plots"
                className="rounded-xl border border-surface-200 bg-white px-5 py-2.5 text-sm font-semibold text-surface-700 hover:bg-surface-50 transition"
              >
                Continue Browsing
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700 border border-red-200">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-surface-700">Full Name *</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Mohan Raj"
                className="input-modern mt-1"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-surface-700">Mobile Number (+91) *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="input-modern mt-1"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-surface-700">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="input-modern mt-1"
                />
              </div>
            </div>

            {/* Site Visit Specific Fields */}
            {isVisit && (
              <div className="rounded-2xl border border-primary-200 bg-primary-50/50 p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-primary-800 uppercase tracking-wider">
                  <Clock size={15} /> Preferred Date & Time Slot
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-surface-600 mb-1">Visit Date</label>
                    <input
                      type="date"
                      required
                      value={visitDate}
                      min={new Date().toISOString().slice(0, 10)}
                      onChange={(e) => setVisitDate(e.target.value)}
                      className="input-modern mt-0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-surface-600 mb-1">Time Slot</label>
                    <select
                      value={visitTime}
                      onChange={(e) => setVisitTime(e.target.value)}
                      className="input-modern mt-0"
                    >
                      {TIME_SLOTS.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <label className="flex items-center gap-2 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pickupNeeded}
                    onChange={(e) => setPickupNeeded(e.target.checked)}
                    className="size-4 rounded accent-primary-600"
                  />
                  <span className="text-xs font-medium text-surface-700">
                    Need complimentary AC cab pickup & drop from my location
                  </span>
                </label>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-surface-700">Project / Area</label>
                <input
                  type="text"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  placeholder="e.g. Lakeview Township"
                  className="input-modern mt-1"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-surface-700">Plot Number (Optional)</label>
                <input
                  type="text"
                  value={plotNumber}
                  onChange={(e) => setPlotNumber(e.target.value)}
                  placeholder="e.g. A-12"
                  className="input-modern mt-1"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-surface-700">Approx Budget (INR)</label>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="e.g. 2500000"
                  className="input-modern mt-1"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-surface-700">
                {isVisit ? 'Special Requirements / Pickup Landmark' : 'Specific Requirements / Notes'}
              </label>
              <textarea
                rows={3}
                value={requirement}
                onChange={(e) => setRequirement(e.target.value)}
                placeholder={
                  isVisit
                    ? 'Near Anna Nagar roundtana, coming with family of 3...'
                    : 'Looking for north-facing 1500 sq.ft plot, need loan guidance...'
                }
                className="input-modern mt-1 min-h-[80px] resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={busy}
              className="btn-primary flex min-h-12 w-full items-center justify-center gap-2 disabled:opacity-60"
            >
              <Send size={16} />
              {busy ? 'Submitting...' : isVisit ? 'Confirm Site Visit Booking' : 'Submit Property Enquiry'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default Enquiry
