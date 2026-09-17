import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, FileText, Heart, MapPin, Phone, Trees } from 'lucide-react'
import { getPublicPlot, subscribeToPublicPlots } from '../../services/plots'
import { toggleWishlist } from '../../services/wishlists'
import { useAuth } from '../../context/AuthContext'
import { PlotMap } from '../../components/user/PlotMap'
import { PlotCard } from '../../components/user/PlotCard'
import { EmptyState } from '../../components/common/EmptyState'

const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

export function PlotDetails() {
  const { plotId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [plot, setPlot] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [allPlots, setAllPlots] = useState([])
  const [isSaved, setIsSaved] = useState(false)
  const [notice, setNotice] = useState(null)

  useEffect(() => {
    if (!plotId) return
    setLoading(true)
    getPublicPlot(plotId)
      .then((data) => {
        setPlot(data)
        setLoading(false)
      })
      .catch(() => {
        setError('Could not load plot details.')
        setLoading(false)
      })

    const unsub = subscribeToPublicPlots(
      (data) => setAllPlots(data),
      () => {}
    )
    return () => unsub()
  }, [plotId])

  async function handleWishlistToggle() {
    if (!user) {
      navigate('/login')
      return
    }
    try {
      await toggleWishlist(user.uid, plotId, isSaved)
      setIsSaved(!isSaved)
      setNotice(isSaved ? 'Removed from wishlist' : 'Saved to your wishlist!')
      setTimeout(() => setNotice(null), 3000)
    } catch {
      setNotice('Could not update wishlist.')
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="h-96 animate-pulse rounded-2xl bg-slate-200" />
      </div>
    )
  }

  if (error || !plot) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <EmptyState
          title="Plot not available"
          description={error || 'This plot might have been reserved or removed from inventory.'}
          action={
            <Link to="/plots" className="inline-flex items-center gap-2 text-sm font-semibold text-green-700">
              <ArrowLeft size={16} /> Back to all plots
            </Link>
          }
        />
      </div>
    )
  }

  const similarPlots = allPlots
    .filter((p) => p.id !== plot.id && p.projectId === plot.projectId)
    .slice(0, 3)

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Link
        to="/plots"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-green-700 mb-6 transition"
      >
        <ArrowLeft size={16} /> Back to browse plots
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
        {/* Left Column: Photos & Details */}
        <div>
          {/* Gallery */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="h-80 overflow-hidden rounded-2xl bg-slate-200 sm:row-span-2 sm:h-[500px]">
              {plot.photos && plot.photos[0] ? (
                <img
                  src={plot.photos[0]}
                  alt={`Plot ${plot.plotNumber}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="grid h-full place-items-center text-slate-400 bg-slate-100">
                  <Trees size={48} />
                </div>
              )}
            </div>
            {plot.photos && plot.photos.slice(1, 3).map((photo, index) => (
              <div key={index} className="h-60 overflow-hidden rounded-2xl bg-slate-100">
                <img src={photo} alt="Plot view" className="h-full w-full object-cover" />
              </div>
            ))}
          </div>

          {/* Description & Overview */}
          <article className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">About this plot</h2>
            <p className="mt-3 text-slate-600 leading-relaxed">
              {plot.description ||
                'Prime freehold plot situated in a gated layout with blacktop access roads, street lighting, and underground utilities ready for immediate home construction.'}
            </p>

            <h3 className="mt-8 text-sm font-bold uppercase tracking-wider text-slate-400">
              Plot Specifications
            </h3>
            <dl className="mt-4 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
                <dt className="text-xs text-slate-500">Area</dt>
                <dd className="mt-1 text-base font-bold text-slate-900">
                  {plot.areaSqft.toLocaleString('en-IN')} sq.ft
                </dd>
              </div>
              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
                <dt className="text-xs text-slate-500">Facing</dt>
                <dd className="mt-1 text-base font-bold text-slate-900">{plot.facing || 'East'}</dd>
              </div>
              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
                <dt className="text-xs text-slate-500">Road Width</dt>
                <dd className="mt-1 text-base font-bold text-slate-900">
                  {plot.roadWidth ? `${plot.roadWidth} ft` : '30 ft'}
                </dd>
              </div>
              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
                <dt className="text-xs text-slate-500">Survey Number</dt>
                <dd className="mt-1 text-base font-bold text-slate-900">
                  {plot.surveyNumber || '142/2A'}
                </dd>
              </div>
              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
                <dt className="text-xs text-slate-500">Project</dt>
                <dd className="mt-1 text-base font-bold text-slate-900">
                  {plot.projectId || 'Lakeview Township'}
                </dd>
              </div>
              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
                <dt className="text-xs text-slate-500">Approvals</dt>
                <dd className="mt-1 text-base font-bold text-green-700">DTCP & RERA</dd>
              </div>
            </dl>
          </article>

          {/* Map Location */}
          {plot.geo && (plot.geo.lat !== 0 || plot.geo.lng !== 0) && (
            <div className="mt-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Location & Directions</h2>
              <PlotMap plots={[plot]} />
            </div>
          )}

          {/* Legal Documents Preview */}
          {plot.documents && plot.documents.length > 0 && (
            <article className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">Layout Approvals & Documents</h2>
              <p className="mt-1 text-sm text-slate-500">
                Verified public layout blueprints and sanction copies.
              </p>
              <div className="mt-4 space-y-2">
                {plot.documents.map((docUrl, idx) => (
                  <a
                    key={idx}
                    href={docUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between rounded-xl border border-slate-200 p-3.5 hover:border-green-300 hover:bg-green-50 transition"
                  >
                    <span className="flex items-center gap-3 text-sm font-semibold text-slate-800">
                      <FileText size={18} className="text-green-600" />
                      Approved Layout Plan #{idx + 1}
                    </span>
                    <span className="text-xs font-semibold text-green-700">View PDF</span>
                  </a>
                ))}
              </div>
            </article>
          )}
        </div>

        {/* Right Column: Pricing & Action Sidebar */}
        <div>
          <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {plot.projectId || 'Residential Layout'}
                </p>
                <h1 className="mt-1 text-2xl font-extrabold text-slate-900">
                  Plot #{plot.plotNumber}
                </h1>
              </div>
              <button
                type="button"
                onClick={handleWishlistToggle}
                className={`rounded-full p-2.5 border transition ${
                  isSaved
                    ? 'border-red-200 bg-red-50 text-red-600'
                    : 'border-slate-200 bg-white text-slate-400 hover:text-red-500'
                }`}
                title={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
              >
                <Heart size={20} fill={isSaved ? 'currentColor' : 'none'} />
              </button>
            </div>

            <p className="mt-4 flex items-center text-sm text-slate-500">
              <MapPin size={16} className="mr-1 text-slate-400" />
              {plot.location || 'Chennai Outer Growth Corridor'}
            </p>

            <div className="mt-6 border-t border-slate-100 pt-6">
              <p className="text-3xl font-extrabold text-green-700">
                {currency.format(plot.totalAmount)}
              </p>
              {plot.ratePerSqft > 0 && (
                <p className="mt-1 text-xs text-slate-500">
                  ₹{plot.ratePerSqft.toLocaleString('en-IN')} per sq.ft
                </p>
              )}
              <div className="mt-4">
                <span
                  className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                    plot.status === 'available'
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {plot.status.toUpperCase()}
                </span>
              </div>
            </div>

            {notice && (
              <div className="mt-4 rounded-lg bg-green-50 p-3 text-xs font-medium text-green-800 border border-green-200">
                {notice}
              </div>
            )}

            <div className="mt-6 space-y-3">
              <Link
                to={`/enquiry?plotId=${plot.id}&plotNumber=${plot.plotNumber}&projectId=${encodeURIComponent(
                  plot.projectId
                )}`}
                className="flex min-h-12 w-full items-center justify-center rounded-xl bg-green-600 font-bold text-white hover:bg-green-700 transition shadow-sm"
              >
                Enquire for this Plot
              </Link>
              <Link
                to={`/enquiry?plotId=${plot.id}&type=visit`}
                className="flex min-h-12 w-full items-center justify-center rounded-xl border border-green-600 font-bold text-green-700 hover:bg-green-50 transition"
              >
                Book Guided Site Visit
              </Link>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-6">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-green-100 text-green-700 grid place-items-center font-bold">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Need instant assistance?</p>
                  <p className="text-sm font-bold text-slate-900">+91 98765 43210</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Plots */}
      {similarPlots.length > 0 && (
        <section className="mt-16 border-t border-slate-200 pt-12">
          <h2 className="text-2xl font-extrabold text-slate-900">Similar Plots in this Project</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {similarPlots.map((item) => (
              <PlotCard key={item.id} plot={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
