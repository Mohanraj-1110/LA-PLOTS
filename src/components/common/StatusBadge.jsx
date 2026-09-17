import React from 'react'

export function StatusBadge({ status = '' }) {
  const s = String(status).toLowerCase()
  let tone = 'bg-surface-100 text-surface-600 ring-1 ring-surface-200'

  if (s === 'available' || s === 'active' || s === 'completed') {
    tone = 'bg-primary-50 text-primary-700 ring-1 ring-primary-200'
  } else if (s === 'reserved' || s === 'pending' || s === 'upcoming' || s === 'processing') {
    tone = 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
  } else if (s === 'sold' || s === 'closed' || s === 'converted') {
    tone = 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
  } else if (s === 'blocked' || s === 'cancelled' || s === 'lost') {
    tone = 'bg-red-50 text-red-700 ring-1 ring-red-200'
  } else if (s === 'new') {
    tone = 'bg-purple-50 text-purple-700 ring-1 ring-purple-200'
  }

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold tracking-wide ${tone}`}>
      {status}
    </span>
  )
}
