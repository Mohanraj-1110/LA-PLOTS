import React from 'react'
import { X } from 'lucide-react'

export function Modal({ title, children, onClose, open = true }) {
  if (open === false) return null

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4 transition-opacity"
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
        className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between">
          <h2 id="modal-title" className="text-lg font-semibold text-slate-900">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 transition"
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

