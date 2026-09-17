import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, MapPin, Trees } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { isPlotWishlisted, toggleWishlist } from '../../services/wishlists'

const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

export function PlotCard({ plot }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [saved, setSaved] = useState(false)
  const isAvailable = plot.status === 'available'

  useEffect(() => {
    if (user?.uid && plot?.id) {
      setSaved(isPlotWishlisted(user.uid, plot.id))
    }
  }, [user, plot?.id])

  async function handleToggleWishlist(e) {
    e.preventDefault()
    e.stopPropagation()
    if (!user) {
      navigate('/login')
      return
    }
    const nextState = !saved
    setSaved(nextState)
    await toggleWishlist(user.uid, plot.id, saved)
  }

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
            loading="lazy"
          />
        ) : (
          <div className="grid h-full place-items-center text-slate-400 bg-slate-100">
            <Trees size={36} />
          </div>
        )}

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={handleToggleWishlist}
          className={`absolute top-3 left-3 size-8.5 rounded-full p-2 flex items-center justify-center backdrop-blur shadow-sm transition active:scale-90 ${
            saved
              ? 'bg-red-50 text-red-600 ring-1 ring-red-200'
              : 'bg-white/80 text-slate-600 hover:bg-white hover:text-red-500'
          }`}
          title={saved ? 'Remove from wishlist' : 'Save to wishlist'}
          aria-label="Toggle wishlist"
        >
          <Heart size={16} fill={saved ? 'currentColor' : 'none'} />
        </button>

        {/* Status Badge */}
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
              <MapPin className="mr-1 inline text-slate-400 shrink-0" size={13} />
              <span className="truncate">{plot.location || 'Location details on request'}</span>
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

export default PlotCard
