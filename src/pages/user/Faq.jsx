import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, HelpCircle, Phone, Search, ShieldCheck } from 'lucide-react'

const FAQ_CATEGORIES = [
  {
    category: 'Legal & Approvals',
    items: [
      {
        q: 'Are all LK PROPERTIES layouts DTCP and RERA approved?',
        a: 'Yes, 100% of our residential and commercial layouts have sanctioned DTCP (Directorate of Town and Country Planning) approval orders and registered RERA registration numbers. All sanction numbers are displayed on plot detail pages.',
      },
      {
        q: 'Can I inspect the original legal title documents before booking?',
        a: 'Absolutely. We practice 100% title transparency. You can download sanitized layout blueprints and sanction copies directly from the plot details page, and our legal team can provide 30-year parent deeds, Nil Encumbrance Certificates (EC), and legal scrutiny reports.',
      },
      {
        q: 'Is Patta transfer guaranteed after registration?',
        a: 'Yes. Our documentation executives assist with individual subdivision Patta application and online verification directly through the Tamil Nadu e-Services land portal upon sale deed registration.',
      },
    ],
  },
  {
    category: 'Financing & Payment',
    items: [
      {
        q: 'Can I avail a bank loan for buying a plot?',
        a: 'Yes! Because our layouts are legally vetted and approved, nationalized and private banks (SBI, HDFC, ICICI, Axis Bank, Canara Bank) offer up to 75% - 80% plot loans. You can estimate your monthly installments on our EMI Calculator page.',
      },
      {
        q: 'What is the standard payment schedule?',
        a: 'Standard bookings require an initial token advance (₹50,000 - ₹1,00,000) to hold the plot. The balance payment is completed via self-funding or bank loan disbursement at the time of Sub-Registrar deed execution.',
      },
      {
        q: 'Are there any hidden brokerage or commission charges?',
        a: 'Zero brokerage. You deal directly with LK PROPERTIES development authorities. The rate quoted per sq.ft is direct developer pricing.',
      },
    ],
  },
  {
    category: 'Site Visits & Amenities',
    items: [
      {
        q: 'How do I book a guided site visit?',
        a: 'You can book a complimentary weekend or weekday site visit online via the "Book Guided Site Visit" button on any plot page, or from the Appointments tab. We provide complimentary pickup and drop services from major city hubs.',
      },
      {
        q: 'What infrastructure is delivered in the township layouts?',
        a: 'Standard layout specifications include wide blacktop tar roads (30ft to 40ft), solar street lighting, avenue tree plantations, underground drainage conduit provisions, individual plot water connections, and perimeter compound security.',
      },
      {
        q: 'Can I start house construction immediately after registration?',
        a: 'Yes. Since all plots are freehold with immediate ground development completed, you can apply for local building plan approval and commence construction right away.',
      },
    ],
  },
]

export function Faq() {
  const [search, setSearch] = useState('')
  const [openIndexes, setOpenIndexes] = useState({ '0-0': true, '1-0': true })

  function toggleItem(catIdx, itemIdx) {
    const key = `${catIdx}-${itemIdx}`
    setOpenIndexes((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const filteredCategories = FAQ_CATEGORIES.map((cat) => {
    const matchingItems = cat.items.filter(
      (item) =>
        item.q.toLowerCase().includes(search.toLowerCase()) ||
        item.a.toLowerCase().includes(search.toLowerCase())
    )
    return { ...cat, items: matchingItems }
  }).filter((cat) => cat.items.length > 0)

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary-100 px-3.5 py-1 text-xs font-semibold text-primary-800 mb-3">
          <HelpCircle size={14} />
          Buyer Knowledge Base
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-surface-900 font-display">
          Frequently Asked Questions
        </h1>
        <p className="mt-2 text-sm text-surface-600">
          Everything you need to know about layout approvals, documentation, bank loans, and site visits.
        </p>

        {/* Search */}
        <div className="mt-6 relative max-w-md mx-auto">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions (approvals, loans, patta...)"
            className="input-modern pl-10"
          />
        </div>
      </div>

      {/* Accordions */}
      <div className="mt-12 space-y-8">
        {filteredCategories.length > 0 ? (
          filteredCategories.map((category, catIdx) => (
            <div key={category.category}>
              <h2 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-3">
                <div className="size-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white grid place-items-center shadow-card">
                  <ShieldCheck size={18} />
                </div>
                <span className="font-display">{category.category}</span>
              </h2>
              <div className="space-y-3">
                {category.items.map((item, itemIdx) => {
                  const key = `${catIdx}-${itemIdx}`
                  const isOpen = Boolean(openIndexes[key])
                  return (
                    <div
                      key={itemIdx}
                      className={`rounded-2xl border overflow-hidden transition-all duration-300 ${
                        isOpen
                          ? 'border-primary-200 bg-white shadow-card'
                          : 'border-surface-200 bg-white shadow-sm hover:shadow-card'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleItem(catIdx, itemIdx)}
                        className="flex w-full items-center justify-between p-5 text-left font-semibold text-surface-900 hover:text-primary-700 transition-colors"
                      >
                        <span className="text-base leading-snug pr-4">{item.q}</span>
                        <ChevronDown
                          size={18}
                          className={`text-surface-400 shrink-0 transition-transform duration-300 ${
                            isOpen ? 'rotate-180 text-primary-600' : ''
                          }`}
                        />
                      </button>
                      <div
                        className={`transition-all duration-300 ease-in-out ${
                          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                        } overflow-hidden`}
                      >
                        <div className="border-t border-surface-100 px-5 pb-5 pt-3 text-sm leading-relaxed text-surface-600 bg-surface-50/50">
                          {item.a}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-surface-300 p-10 text-center text-surface-500 text-sm">
            No questions match "{search}". Have a specific query? Contact our property consultants below!
          </div>
        )}
      </div>

      {/* Help Banner */}
      <div className="mt-16 rounded-3xl bg-gradient-to-r from-surface-900 to-surface-800 p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-elevated">
        <div>
          <h3 className="text-xl font-bold font-display">Have more questions or need legal vetting?</h3>
          <p className="mt-1 text-sm text-surface-300">
            Our property advisors and documentation lawyers are available 7 days a week.
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <Link
            to="/enquiry"
            className="rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-5 py-2.5 text-sm font-semibold text-white shadow-card hover:shadow-elevated transition"
          >
            Submit Enquiry
          </Link>
          <a
            href="tel:+919876543210"
            className="inline-flex items-center gap-2 rounded-xl border border-surface-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-surface-700 transition"
          >
            <Phone size={15} /> +91 98765 43210
          </a>
        </div>
      </div>
    </div>
  )
}

export default Faq
