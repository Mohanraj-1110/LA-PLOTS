import React from 'react'
import { ChevronRight, Filter } from 'lucide-react'

export function FilterButton({ label = 'Filters', active = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-11 items-center gap-2 rounded-lg border px-4 text-sm font-medium transition ${
        active
          ? 'border-green-600 bg-green-50 text-green-700'
          : 'border-slate-200 bg-white text-slate-700 hover:border-green-300 hover:text-green-700'
      }`}
    >
      <Filter size={16} aria-hidden="true" />
      <span>{label}</span>
      <ChevronRight size={16} aria-hidden="true" />
    </button>
  )
}
