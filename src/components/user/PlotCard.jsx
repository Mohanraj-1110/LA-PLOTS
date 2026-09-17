import React from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Trees } from 'lucide-react'

const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

export function PlotCard({ plot }) {
  const isAvailable = plot.status === 'available'

  return (
    <Link
      to={`/plots/${plot.id}`}
      className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
    >
      <div className="relative h-48 bg-slate-100 overflow-hidden">
        {plot.photos && plot.photos[0] ? (
          <img
            src={plot.photos[0]}
            alt={`Plot ${plot.plotNumber}`}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full place-items-center text-slate-400 bg-slate-100">
            <Trees size={36} />
          </div>
        )}
        <div className="absolute top-3 right-3">
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm ${
              isAvailable
                ? 'bg-green-600 text-white'
                : 'bg-amber-500 text-white'
            }`}
          >
            {plot.status}
          </span>
        </div>
      </div>

      <div className="p-5">
        <div className="flex justify-between items-start gap-2">
          <div>
            <h3 className="font-bold text-slate-900 group-hover:text-green-700 transition">
              {plot.projectId ? `${plot.projectId} — Plot ${plot.plotNumber}` : `Plot ${plot.plotNumber}`}
            </h3>
            <p className="mt-1 flex items-center text-xs text-slate-500">
              <MapPin className="mr-1 inline text-slate-400" size={13} />
              {plot.location || 'Location details on request'}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-baseline justify-between border-t border-slate-100 pt-3">
          <div>
            <span className="text-lg font-extrabold text-green-700">
              {currency.format(plot.totalAmount)}
            </span>
            {plot.ratePerSqft > 0 && (
              <span className="block text-[11px] text-slate-400">
                ₹{plot.ratePerSqft.toLocaleString('en-IN')}/sq.ft
              </span>
            )}
          </div>
          <span className="text-xs font-medium text-slate-600">
            {plot.areaSqft.toLocaleString('en-IN')} sq.ft
          </span>
        </div>
      </div>
    </Link>
  )
}
