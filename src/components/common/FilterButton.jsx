import React from 'react'
import { ChevronRight, Filter } from 'lucide-react'

export function FilterButton({ label = 'Filters', active = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 text-sm font-semibold transition-all duration-200 active:scale-[0.98] ${
        active
          ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm shadow-primary-500/10'
          : 'border-surface-200 bg-white text-surface-700 hover:border-primary-300 hover:text-primary-700 hover:shadow-sm'
      }`}
    >
      <Filter size={16} aria-hidden="true" />
      <span>{label}</span>
      <ChevronRight size={16} aria-hidden="true" />
    </button>
  )
}
