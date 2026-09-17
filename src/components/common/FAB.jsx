import React from 'react'
import { Plus } from 'lucide-react'

export function FAB({ label = 'Add', onClick, icon: Icon = Plus }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-20 right-5 z-30 inline-flex min-h-12 items-center gap-2 rounded-full bg-gradient-to-r from-primary-600 to-primary-500 px-5 text-sm font-bold text-white shadow-lg shadow-primary-600/30 hover:from-primary-700 hover:to-primary-600 hover:shadow-xl hover:shadow-primary-600/40 hover:-translate-y-0.5 active:translate-y-0 lg:bottom-8 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200"
    >
      <Icon size={18} aria-hidden="true" />
      <span>{label}</span>
    </button>
  )
}
