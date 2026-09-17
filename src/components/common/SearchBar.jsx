import React from 'react'
import { Search } from 'lucide-react'

export function SearchBar({ placeholder = 'Search...', value = '', onChange }) {
  return (
    <label className="flex min-h-11 items-center gap-2.5 rounded-xl border border-surface-200 bg-white px-3.5 text-sm text-surface-500 transition-all duration-200 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:shadow-glow">
      <Search size={17} className="text-surface-400" aria-hidden="true" />
      <span className="sr-only">{placeholder}</span>
      <input
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-surface-400 text-surface-900"
        placeholder={placeholder}
      />
    </label>
  )
}
