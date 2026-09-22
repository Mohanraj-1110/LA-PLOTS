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
      className="group block overflow-hidden rounded-2xl bg-white dark:bg-slate-900/90 border border-surface-200/80 dark:border-slate-800 shadow-card hover:shadow-xl hover:shadow-indigo-500/10 dark:hover:shadow-indigo-500/20 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-300 dark:hover:border-indigo-500/40 relative"
    >
      <div className="relative h-52 bg-slate-100 dark:bg-slate-800 overflow-hidden">
        {plot.photos && plot.photos[0] ? (
          <img
            src={plot.photos[0]}
            alt={`Plot ${plot.plotNumber}`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-108"
            loading="lazy"
          />
        ) : (
          <div className="grid h-full place-items-center text-slate-300 dark:text-slate-600 bg-gradient-to-br from-slate-100 via-indigo-50/30 to-emerald-50/30 dark:from-slate-800 dark:via-indigo-950/20 dark:to-emerald-950/20">
            <Trees size={44} className="text-emerald-500/40" />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

        {/* Wishlist Button (Rose/Coral accent) */}
        <button
          type="button"
          onClick={handleToggleWishlist}
          className={`absolute top-3 left-3 size-9 rounded-full p-2 flex items-center justify-center backdrop-blur-md shadow-md transition-all duration-200 active:scale-90 cursor-pointer ${
            saved
              ? 'bg-rose-50 text-rose-500 ring-2 ring-rose-300 dark:bg-rose-950/80 dark:ring-rose-700'
              : 'bg-white/85 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:text-rose-500'
          }`}
          title={saved ? 'Remove from wishlist' : 'Save to wishlist'}
          aria-label="Toggle wishlist"
        >
          <Heart size={16} fill={saved ? 'currentColor' : 'none'} />
        </button>

        {/* Project Tag (Royal Indigo accent) */}
        <div className="absolute bottom-3 left-3">
          <span className="inline-flex items-center gap-1 rounded-lg bg-indigo-600/90 text-white font-bold text-[11px] px-2.5 py-1 backdrop-blur-md shadow-xs">
            {plot.projectName || 'DTCP Approved'}
          </span>
        </div>

        {/* Status Badge (Emerald / Amber / Rose) */}
        <div className="absolute top-3 right-3">
          <span
            className={`rounded-full px-3 py-1 text-xs font-black shadow-md backdrop-blur-md uppercase tracking-wider ${
              isAvailable
                ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                : plot.status === 'reserved'
                ? 'bg-amber-500 text-white shadow-amber-500/30'
                : 'bg-rose-600 text-white shadow-rose-600/30'
            }`}
          >
            {plot.status}
          </span>
        </div>
      </div>

      <div className="p-5">
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-extrabold text-base text-surface-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200 font-display truncate">
              {(plot.projectName || plot.projectId)
                ? `${plot.projectName || plot.projectId} — Plot #${plot.plotNumber}`
                : `Plot #${plot.plotNumber}`}
            </h3>
            <p className="mt-1 flex items-center text-xs text-slate-500 dark:text-slate-400">
              <MapPin className="mr-1 inline text-cyan-600 dark:text-cyan-400 shrink-0" size={13} />
              <span className="truncate">{plot.location || 'Prime Growth Corridor, Coimbatore'}</span>
            </p>
          </div>
        </div>

        {/* Multi-color tags ribbon (Cyan Area + Purple Facing/Perk) */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center text-[11px] font-bold text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200/70 dark:border-cyan-800/60 px-2 py-0.5 rounded-md">
            📐 {plot.areaSqft ? plot.areaSqft.toLocaleString('en-IN') : '1200'} sq.ft
          </span>
          <span className="inline-flex items-center text-[11px] font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 border border-purple-200/70 dark:border-purple-800/60 px-2 py-0.5 rounded-md">
            🧭 {plot.facing || 'East Facing'}
          </span>
          {plot.roadWidth && (
            <span className="inline-flex items-center text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/70 dark:border-emerald-800/60 px-2 py-0.5 rounded-md">
              🛣️ {plot.roadWidth}ft Road
            </span>
          )}
        </div>

        {/* Pricing Strip (Warm Amber/Gold highlight + Emerald CTA button) */}
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
          <div>
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 font-extrabold text-xs border border-amber-200/80 dark:border-amber-800/60 shadow-2xs">
              💰 Price on Request
            </span>
          </div>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
            View Details →
          </span>
        </div>
      </div>
    </Link>
  )
}

export default PlotCard
