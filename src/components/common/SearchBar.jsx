import React from 'react'
import { Search } from 'lucide-react'

export function SearchBar({ placeholder = 'Search...', value = '', onChange }) {
  return (
    <label className="flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-500 focus-within:border-green-500">
      <Search size={17} aria-hidden="true" />
      <span className="sr-only">{placeholder}</span>
      <input
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-slate-400 text-slate-900"
        placeholder={placeholder}
      />
    </label>
  )
}
