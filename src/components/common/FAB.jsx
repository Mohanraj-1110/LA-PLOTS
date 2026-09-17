import React from 'react'
import { Plus } from 'lucide-react'

export function FAB({ label = 'Add', onClick, icon: Icon = Plus }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-20 right-5 z-30 inline-flex min-h-12 items-center gap-2 rounded-full bg-green-600 px-5 text-sm font-semibold text-white shadow-lg shadow-green-900/20 hover:bg-green-700 lg:bottom-8 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
    >
      <Icon size={18} aria-hidden="true" />
      <span>{label}</span>
    </button>
  )
}
