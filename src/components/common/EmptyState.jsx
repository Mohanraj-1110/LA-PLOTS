import React from 'react'
import { FileText } from 'lucide-react'

export function EmptyState({ title = 'No items found', description = 'Try adjusting your filters or add a new record.', icon: Icon = FileText, action }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <Icon className="mx-auto text-slate-400" size={32} aria-hidden="true" />
      <h3 className="mt-3 text-base font-semibold text-slate-800">{title}</h3>
      <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
