import React, { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, MessageCircle, Phone, UserPlus } from 'lucide-react'
import { PageHeader } from '../../components/common/PageHeader'
import { SearchBar } from '../../components/common/SearchBar'
import { Toast } from '../../components/common/Toast'
import { EmptyState } from '../../components/common/EmptyState'
import { useAuth } from '../../context/AuthContext'
import {
  convertEnquiry,
  subscribeToEnquiries,
  updateEnquiry,
} from '../../services/enquiries'

export function Enquiries() {
  const { firebaseUser, profile } = useAuth()
  const [items, setItems] = useState(null)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('All')
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState(null)

  useEffect(() => {
    const unsub = subscribeToEnquiries(
      (data) => setItems(data),
      () => setError('Enquiries could not be loaded.')
    )
    return () => unsub()
  }, [])

  const filtered = useMemo(() => {
    if (!items) return []
    return items.filter((item) => {
      const matchStatus = status === 'All' || String(item.status).toLowerCase() === status.toLowerCase()
      const matchQuery = `${item.customerName} ${item.phone} ${item.projectId} ${item.requirement || ''}`
        .toLowerCase()
        .includes(query.toLowerCase())
      return matchStatus && matchQuery
    })
  }, [items, query, status])

  async function handleAction(item, actionType) {
    try {
      if (actionType === 'convert') {
        await convertEnquiry(item, firebaseUser?.uid || '')
        setNotice('Lead successfully converted to Customer record!')
      } else if (actionType === 'assign') {
        await updateEnquiry(item.id, {
          assignedAgentId: firebaseUser?.uid || '',
          assignedAgentName: profile?.name || firebaseUser?.displayName || 'Agent',
          status: 'Assigned',
        })
        setNotice('Enquiry assigned to your account.')
      } else {
        await updateEnquiry(item.id, { status: 'Follow-up' })
        setNotice('Enquiry marked for follow-up.')
      }
      setTimeout(() => setNotice(null), 3000)
    } catch {
      setError('Could not update enquiry status.')
    }
  }

  return (
    <>
      <PageHeader
        title="Enquiries & Leads"
        description={`${items ? items.length : 0} incoming inquiries from website and ads.`}
      />

      {notice && <Toast message={notice} />}

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 p-4 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="min-w-0 flex-1">
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder="Search by customer name, mobile, or project..."
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-green-500"
        >
          <option>All</option>
          <option>New</option>
          <option>Assigned</option>
          <option>Follow-up</option>
          <option>Converted</option>
        </select>
      </div>

      {items === null ? (
        <div className="mt-6 h-64 animate-pulse rounded-2xl bg-slate-200" />
      ) : filtered.length > 0 ? (
        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          {filtered.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-300 transition"
            >
              <div className="flex justify-between items-start gap-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{item.customerName}</h3>
                  <p className="mt-1 text-xs text-slate-500 font-medium">
                    {item.phone} · {item.projectId || 'General Area'}
                  </p>
                </div>
                <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700">
                  {item.status || 'New'}
                </span>
              </div>

              <dl className="mt-4 grid gap-2 text-xs sm:grid-cols-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <dt className="text-slate-400 font-semibold uppercase">Budget</dt>
                  <dd className="font-bold text-green-800 text-sm mt-0.5">
                    ₹{Number(item.budget || 0).toLocaleString('en-IN')}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-400 font-semibold uppercase">Source</dt>
                  <dd className="font-medium text-slate-700 mt-0.5">{item.source || 'Website Form'}</dd>
                </div>
                <div className="sm:col-span-2 mt-1">
                  <dt className="text-slate-400 font-semibold uppercase">Requirement</dt>
                  <dd className="font-medium text-slate-800 mt-0.5">
                    {item.requirement || 'Standard buyer enquiry'}
                  </dd>
                </div>
              </dl>

              <div className="mt-4 flex flex-wrap gap-2 pt-2">
                <a
                  href={`tel:${item.phone}`}
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  <Phone size={14} /> Call
                </a>
                <a
                  href={`https://wa.me/${String(item.phone).replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-green-200 bg-green-50 px-3 text-xs font-semibold text-green-800 hover:bg-green-100 transition"
                >
                  <MessageCircle size={14} /> WhatsApp
                </a>
                <button
                  type="button"
                  onClick={() => handleAction(item, 'assign')}
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  <UserPlus size={14} /> Assign
                </button>
                <button
                  type="button"
                  onClick={() => handleAction(item, 'follow-up')}
                  className="inline-flex min-h-9 items-center rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Follow-up
                </button>
                <button
                  type="button"
                  onClick={() => handleAction(item, 'convert')}
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-xl bg-green-600 px-3 text-xs font-bold text-white hover:bg-green-700 transition"
                >
                  <CheckCircle2 size={14} /> Convert to Customer
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-8">
          <EmptyState
            title="No enquiries found"
            description="Incoming buyer leads will automatically be listed here."
          />
        </div>
      )}
    </>
  )
}
export default Enquiries
