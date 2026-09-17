import React from 'react'
import { X } from 'lucide-react'

export function Modal({ title, children, onClose, open = true }) {
  if (open === false) return null

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-surface-950/40 backdrop-blur-sm p-4 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) {
          onClose()
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-elevated max-h-[90vh] overflow-y-auto animate-scale-in border border-surface-100"
      >
        <div className="flex items-center justify-between">
          <h2 id="modal-title" className="text-lg font-bold text-surface-900 font-display">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-surface-400 hover:bg-surface-100 hover:text-surface-600 transition-all duration-200 active:scale-95"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </section>
    </div>
  )
}
