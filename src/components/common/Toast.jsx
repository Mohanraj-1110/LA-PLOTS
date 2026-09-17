import React from 'react'

export function Toast({ message }) {
  if (!message) return null
  return (
    <div
      role="status"
      className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-surface-900 px-5 py-3 text-sm font-medium text-white shadow-elevated animate-slide-up"
    >
      <div className="flex items-center gap-2">
        <div className="size-2 rounded-full bg-primary-400 animate-pulse" />
        {message}
      </div>
    </div>
  )
}
