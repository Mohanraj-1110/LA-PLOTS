import React, { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { CheckCircle, Send } from 'lucide-react'
import { createEnquiry } from '../../services/enquiries'
import { useAuth } from '../../context/AuthContext'

export function Enquiry() {
  const [searchParams] = useSearchParams()
  const { profile } = useAuth()

  const [customerName, setCustomerName] = useState(profile?.name || '')
  const [phone, setPhone] = useState(profile?.phone || '')
  const [projectId, setProjectId] = useState(searchParams.get('projectId') || '')
  const [budget, setBudget] = useState(searchParams.get('budget') || '')
  const [requirement, setRequirement] = useState(
    searchParams.get('plotNumber') ? `Inquiry regarding Plot #${searchParams.get('plotNumber')}` : ''
  )
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await createEnquiry({
        customerName,
        phone,
        projectId,
        budget: Number(budget) || 0,
        requirement,
        source: 'Website Enquiry Form',
      })
      setSubmitted(true)
    } catch (err) {
      setError(err?.message || 'Failed to submit enquiry. Please try again or call us.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="text-center mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-green-700">Get in Touch</p>
          <h1 className="mt-1 text-3xl font-extrabold text-slate-900">Property Enquiry & Site Visit</h1>
          <p className="mt-2 text-sm text-slate-500">
            Tell us your investment preferences and our property consultants will assist you immediately.
          </p>
        </div>

        {submitted ? (
          <div className="text-center py-10">
            <CheckCircle className="mx-auto text-green-600 size-16" />
            <h2 className="mt-4 text-2xl font-bold text-slate-900">Enquiry Submitted!</h2>
            <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto">
              Thank you for your interest. An executive from LA PLOTS will contact you via phone shortly.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Link
                to="/plots"
                className="rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
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
              <label className="block text-sm font-medium text-slate-700">Your Full Name</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Mohan Raj"
                className="mt-1 min-h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm text-slate-900 outline-none focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Mobile Number (+91)</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="mt-1 min-h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm text-slate-900 outline-none focus:border-green-500"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">Project / Preferred Area</label>
                <input
                  type="text"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  placeholder="e.g. Green Meadows"
                  className="mt-1 min-h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm text-slate-900 outline-none focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Approx Budget (INR)</label>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="e.g. 2500000"
                  className="mt-1 min-h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm text-slate-900 outline-none focus:border-green-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Specific Requirements / Notes</label>
              <textarea
                rows={3}
                value={requirement}
                onChange={(e) => setRequirement(e.target.value)}
                placeholder="Looking for north-facing 1500 sq.ft plot, need free site visit on Saturday..."
                className="mt-1 w-full rounded-xl border border-slate-200 p-3.5 text-sm text-slate-900 outline-none focus:border-green-500"
              />
            </div>

            <button
              type="submit"
              disabled={busy}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-green-600 font-bold text-white hover:bg-green-700 disabled:opacity-60 transition shadow-sm"
            >
              <Send size={16} />
              {busy ? 'Submitting Enquiry...' : 'Submit Property Enquiry'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
