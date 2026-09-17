import React from 'react'
import { FileText } from 'lucide-react'

export function EmptyState({ title = 'No items found', description = 'Try adjusting your filters or add a new record.', icon: Icon = FileText, action }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-surface-200 bg-gradient-to-b from-surface-50 to-white px-6 py-14 text-center">
      <div className="mx-auto size-16 rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100/50 grid place-items-center mb-4">
        <Icon className="text-primary-500" size={28} aria-hidden="true" />
      </div>
      <h3 className="text-lg font-bold text-surface-800 font-display">{title}</h3>
      <p className="mt-2 text-sm text-surface-500 max-w-sm mx-auto leading-relaxed">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
