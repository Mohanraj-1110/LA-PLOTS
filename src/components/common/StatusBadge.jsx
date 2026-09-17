import React from 'react'

export function StatusBadge({ status = '' }) {
  const s = String(status).toLowerCase()
  let tone = 'bg-slate-100 text-slate-700'

  if (s === 'available' || s === 'active' || s === 'completed') {
    tone = 'bg-green-50 text-green-700 border border-green-200'
  } else if (s === 'reserved' || s === 'pending' || s === 'upcoming') {
    tone = 'bg-amber-50 text-amber-700 border border-amber-200'
  } else if (s === 'sold' || s === 'closed' || s === 'converted') {
    tone = 'bg-blue-50 text-blue-700 border border-blue-200'
  } else if (s === 'blocked' || s === 'cancelled' || s === 'lost') {
    tone = 'bg-red-50 text-red-700 border border-red-200'
  }

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${tone}`}>
      {status}
    </span>
  )
}
