import React from 'react'
import { FileText } from 'lucide-react'

export function StatCard({ label, value, detail, icon: Icon = FileText }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
        </div>
        <span className="rounded-lg bg-green-50 p-2 text-green-700">
          <Icon size={18} aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 text-xs text-slate-500">{detail}</p>
    </section>
  )
}
