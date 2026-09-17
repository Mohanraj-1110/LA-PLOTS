import React from 'react'

export function Toast({ message }) {
  if (!message) return null
  return (
    <div
      role="status"
      className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-slate-900 px-4 py-3 text-sm text-white shadow-lg animate-fade-in"
    >
      {message}
    </div>
  )
}
