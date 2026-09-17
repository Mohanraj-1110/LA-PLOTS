import React from 'react'
import { FileText } from 'lucide-react'

export function StatCard({ label, value, detail, icon: Icon = FileText, trend, color }) {
  const colorStyles = {
    green: {
      iconBg: 'bg-gradient-to-br from-primary-50 to-primary-100',
      iconText: 'text-primary-600',
    },
    blue: {
      iconBg: 'bg-gradient-to-br from-blue-50 to-blue-100',
      iconText: 'text-blue-600',
    },
    amber: {
      iconBg: 'bg-gradient-to-br from-accent-50 to-accent-100',
      iconText: 'text-accent-600',
    },
    purple: {
      iconBg: 'bg-gradient-to-br from-purple-50 to-purple-100',
      iconText: 'text-purple-600',
    },
    red: {
      iconBg: 'bg-gradient-to-br from-red-50 to-red-100',
      iconText: 'text-red-600',
    },
  }

  const style = colorStyles[color] || colorStyles.green

  return (
    <section className="card-modern p-5 group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-surface-500">{label}</p>
          <p className="mt-2 text-3xl font-extrabold text-surface-900 font-display tracking-tight">{value}</p>
        </div>
        <span className={`${style.iconBg} ${style.iconText} rounded-xl p-2.5 transition-transform duration-200 group-hover:scale-110`}>
          <Icon size={20} aria-hidden="true" />
        </span>
      </div>
      {(detail || trend) && (
        <div className="mt-3 flex items-center gap-2">
          {trend && (
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${trend > 0 ? 'bg-primary-50 text-primary-700' : 'bg-red-50 text-red-700'}`}>
              {trend > 0 ? '+' : ''}{trend}%
            </span>
          )}
          <p className="text-xs text-surface-500">{detail}</p>
        </div>
      )}
    </section>
  )
}
