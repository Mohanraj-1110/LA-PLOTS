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
      className="group block overflow-hidden rounded-2xl bg-white border border-surface-200/60 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover hover:border-surface-200"
    >
      <div className="relative h-52 bg-surface-100 overflow-hidden">
        {plot.photos && plot.photos[0] ? (
          <img
            src={plot.photos[0]}
            alt={`Plot ${plot.plotNumber}`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="grid h-full place-items-center text-surface-300 bg-gradient-to-br from-surface-50 to-surface-100">
            <Trees size={40} className="text-primary-300" />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={handleToggleWishlist}
          className={`absolute top-3 left-3 size-9 rounded-full p-2 flex items-center justify-center backdrop-blur-md shadow-sm transition-all duration-200 active:scale-90 ${
            saved
              ? 'bg-red-50 text-red-500 ring-1 ring-red-200/60'
              : 'bg-white/80 text-surface-500 hover:bg-white hover:text-red-500'
          }`}
          title={saved ? 'Remove from wishlist' : 'Save to wishlist'}
          aria-label="Toggle wishlist"
        >
          <Heart size={16} fill={saved ? 'currentColor' : 'none'} />
        </button>

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold shadow-sm backdrop-blur-sm ${
              isAvailable
                ? 'bg-primary-500/90 text-white'
                : 'bg-accent-500/90 text-white'
            }`}
          >
            {plot.status}
          </span>
        </div>
      </div>

      <div className="p-5">
        <div className="flex justify-between items-start gap-2">
          <div>
            <h3 className="font-bold text-surface-900 group-hover:text-primary-700 transition-colors duration-200 font-display">
              {plot.projectId ? `${plot.projectId} — Plot ${plot.plotNumber}` : `Plot ${plot.plotNumber}`}
            </h3>
            <p className="mt-1.5 flex items-center text-xs text-surface-500">
              <MapPin className="mr-1 inline text-surface-400 shrink-0" size={13} />
              <span className="truncate">{plot.location || 'Location details on request'}</span>
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-baseline justify-between border-t border-surface-100 pt-3.5">
          <div>
            <span className="text-lg font-extrabold text-primary-700 font-display">
              {currency.format(plot.totalAmount)}
            </span>
            {plot.ratePerSqft > 0 && (
              <span className="block text-[11px] text-surface-400 mt-0.5">
                {currency.format(plot.ratePerSqft)}/sq.ft
              </span>
            )}
          </div>
          <span className="text-xs font-semibold text-surface-500 bg-surface-50 px-2.5 py-1 rounded-lg">
            {plot.areaSqft.toLocaleString('en-IN')} sq.ft
          </span>
        </div>
      </div>
    </Link>
  )
}

export default PlotCard
