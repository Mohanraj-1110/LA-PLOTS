import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Calculator, CalendarDays, FileText, Heart, MapPin, Phone, ShieldCheck, Trees } from 'lucide-react'
import { getPublicPlot, subscribeToPublicPlots } from '../../services/plots'
import { isPlotWishlisted, toggleWishlist } from '../../services/wishlists'
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

  // EMI Calculator widget state
  const [loanPercent, setLoanPercent] = useState(80)
  const [interestRate, setInterestRate] = useState(8.5)
  const [tenureYears, setTenureYears] = useState(15)

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

  // Sync wishlist status
  useEffect(() => {
    if (user?.uid && plotId) {
      setIsSaved(isPlotWishlisted(user.uid, plotId))
    }
  }, [user, plotId])

  async function handleWishlistToggle() {
    if (!user) {
      navigate('/login')
      return
    }
    const nextSaved = !isSaved
    setIsSaved(nextSaved)
    setNotice(nextSaved ? 'Saved to your wishlist!' : 'Removed from wishlist')
    setTimeout(() => setNotice(null), 3000)
    try {
      await toggleWishlist(user.uid, plotId, isSaved)
    } catch {
      setNotice('Could not update wishlist.')
    }
  }

  // Calculate estimated EMI for this specific plot
  const { emiAmount, loanAmount } = useMemo(() => {
    const total = plot?.totalAmount || 0
    const P = (total * loanPercent) / 100
    const N = tenureYears * 12
    const r = interestRate / 12 / 100
    if (P <= 0 || r <= 0 || N <= 0) return { emiAmount: 0, loanAmount: 0 }
    const calculated = (P * r * Math.pow(1 + r, N)) / (Math.pow(1 + r, N) - 1)
    return {
      loanAmount: Math.round(P),
      emiAmount: Math.round(calculated),
    }
  }, [plot?.totalAmount, loanPercent, interestRate, tenureYears])

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="h-96 animate-pulse rounded-3xl bg-gradient-to-br from-surface-100 to-surface-200" />
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
            <Link to="/plots" className="inline-flex items-center gap-2 text-sm font-semibold text-primary-700">
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
        className="inline-flex items-center gap-2 text-sm font-semibold text-surface-500 hover:text-primary-600 mb-6 transition"
      >
        <ArrowLeft size={16} /> Back to browse plots
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
        {/* Left Column: Photos & Details */}
        <div>
          {/* Gallery */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="h-80 overflow-hidden rounded-3xl bg-surface-200 sm:row-span-2 sm:h-[500px] shadow-card">
              {plot.photos && plot.photos[0] ? (
                <img
                  src={plot.photos[0]}
                  alt={`Plot ${plot.plotNumber}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="grid h-full place-items-center text-surface-300 bg-surface-100">
                  <Trees size={48} />
                </div>
              )}
            </div>
            {plot.photos && plot.photos.slice(1, 3).map((photo, index) => (
              <div key={index} className="h-60 overflow-hidden rounded-3xl bg-surface-100 shadow-card">
                <img src={photo} alt="Plot view" className="h-full w-full object-cover" />
              </div>
            ))}
          </div>

          {/* Description & Overview */}
          <article className="mt-8 card-modern p-6 sm:p-8">
            <h2 className="font-display text-xl font-bold text-surface-900">About this plot</h2>
            <p className="mt-3 text-surface-600 leading-relaxed">
              {plot.description ||
                'Prime freehold plot situated in a gated layout with blacktop access roads, street lighting, and underground utilities ready for immediate home construction.'}
            </p>

            <h3 className="mt-8 font-display text-sm font-bold uppercase tracking-wider text-surface-400">
              Plot Specifications
            </h3>
            <dl className="mt-4 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-gradient-to-br from-primary-50/60 to-surface-50 p-3.5 border border-primary-100/50">
                <dt className="text-xs text-surface-500">Area</dt>
                <dd className="mt-1 text-base font-bold text-surface-900">
                  {plot.areaSqft.toLocaleString('en-IN')} sq.ft
                </dd>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-primary-50/60 to-surface-50 p-3.5 border border-primary-100/50">
                <dt className="text-xs text-surface-500">Facing</dt>
                <dd className="mt-1 text-base font-bold text-surface-900">{plot.facing || 'East'}</dd>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-primary-50/60 to-surface-50 p-3.5 border border-primary-100/50">
                <dt className="text-xs text-surface-500">Road Width</dt>
                <dd className="mt-1 text-base font-bold text-surface-900">
                  {plot.roadWidth ? `${plot.roadWidth} ft` : '30 ft'}
                </dd>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-primary-50/60 to-surface-50 p-3.5 border border-primary-100/50">
                <dt className="text-xs text-surface-500">Survey Number</dt>
                <dd className="mt-1 text-base font-bold text-surface-900">
                  {plot.surveyNumber || '142/2A'}
                </dd>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-primary-50/60 to-surface-50 p-3.5 border border-primary-100/50">
                <dt className="text-xs text-surface-500">Project</dt>
                <dd className="mt-1 text-base font-bold text-surface-900">
                  {plot.projectId || 'Lakeview Township'}
                </dd>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-primary-50/60 to-surface-50 p-3.5 border border-primary-100/50">
                <dt className="text-xs text-surface-500">Approvals</dt>
                <dd className="mt-1 text-base font-bold text-primary-600">DTCP & RERA Approved</dd>
              </div>
            </dl>
          </article>

          {/* Interactive Plot Loan EMI Widget */}
          <article className="mt-8 card-modern overflow-hidden">
            <div className="bg-gradient-to-r from-primary-600 to-primary-500 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-white/20 text-white grid place-items-center backdrop-blur-sm">
                    <Calculator size={18} />
                  </div>
                  <div>
                    <h2 className="font-display text-lg font-bold text-white">Estimated Monthly EMI</h2>
                    <p className="text-xs text-primary-100">Bank finance available up to 80%</p>
                  </div>
                </div>
                <Link to="/emi" className="text-xs font-bold text-white/90 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition">
                  Full Calculator
                </Link>
              </div>
            </div>

            <div className="p-6">
              <div className="grid gap-5 sm:grid-cols-3 bg-surface-50 p-4 rounded-xl border border-surface-100">
                <div>
                  <label className="text-xs font-semibold text-surface-600 block mb-1.5">
                    Bank Loan: {loanPercent}%
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="80"
                    step="5"
                    value={loanPercent}
                    onChange={(e) => setLoanPercent(Number(e.target.value))}
                    className="w-full accent-primary-600 cursor-pointer h-1.5 bg-surface-200 rounded"
                  />
                  <span className="text-[11px] text-surface-500">{currency.format(loanAmount)}</span>
                </div>
                <div>
                  <label className="text-xs font-semibold text-surface-600 block mb-1.5">
                    Interest: {interestRate}%
                  </label>
                  <input
                    type="range"
                    min="7.5"
                    max="12.0"
                    step="0.5"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    className="w-full accent-primary-600 cursor-pointer h-1.5 bg-surface-200 rounded"
                  />
                  <span className="text-[11px] text-surface-500">Annual rate</span>
                </div>
                <div>
                  <label className="text-xs font-semibold text-surface-600 block mb-1.5">
                    Tenure: {tenureYears} Yrs
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="25"
                    step="5"
                    value={tenureYears}
                    onChange={(e) => setTenureYears(Number(e.target.value))}
                    className="w-full accent-primary-600 cursor-pointer h-1.5 bg-surface-200 rounded"
                  />
                  <span className="text-[11px] text-surface-500">{tenureYears * 12} Months</span>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between pt-4 border-t border-surface-100">
                <div>
                  <span className="text-xs text-surface-400 font-medium">Estimated EMI</span>
                  <p className="text-2xl font-extrabold text-primary-600">
                    {currency.format(emiAmount)}
                    <span className="text-xs font-normal text-surface-400"> / month</span>
                  </p>
                </div>
                <Link
                  to={`/enquiry?plotId=${plot.id}&budget=${loanAmount}&requirement=Financing assistance for Plot #${plot.plotNumber}`}
                  className="rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 px-5 py-2.5 text-xs font-bold text-white hover:from-primary-600 hover:to-primary-700 transition shadow-card"
                >
                  Apply for Loan Assistance
                </Link>
              </div>
            </div>
          </article>

          {/* Map Location */}
          {plot.geo && (plot.geo.lat !== 0 || plot.geo.lng !== 0) && (
            <div className="mt-8">
              <h2 className="font-display text-xl font-bold text-surface-900 mb-4">Location & Directions</h2>
              <PlotMap plots={[plot]} />
            </div>
          )}

          {/* Legal Documents Preview */}
          {plot.documents && plot.documents.length > 0 && (
            <article className="mt-8 card-modern p-6 sm:p-8">
              <h2 className="font-display text-xl font-bold text-surface-900">Layout Approvals & Documents</h2>
              <p className="mt-1 text-sm text-surface-500">
                Verified public layout blueprints and sanction copies.
              </p>
              <div className="mt-4 space-y-2.5">
                {plot.documents.map((docUrl, idx) => (
                  <a
                    key={idx}
                    href={docUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between rounded-xl border border-surface-200 p-4 hover:border-primary-300 hover:bg-primary-50/50 transition-all group"
                  >
                    <span className="flex items-center gap-3 text-sm font-semibold text-surface-800">
                      <span className="size-9 rounded-lg bg-primary-100 text-primary-600 grid place-items-center group-hover:bg-primary-200 transition">
                        <FileText size={16} />
                      </span>
                      Approved Layout Plan #{idx + 1}
                    </span>
                    <span className="text-xs font-bold text-primary-600 bg-primary-50 border border-primary-200 px-3 py-1 rounded-lg">View PDF</span>
                  </a>
                ))}
              </div>
            </article>
          )}
        </div>

        {/* Right Column: Pricing & Action Sidebar */}
        <div>
          <div className="sticky top-24 card-modern overflow-hidden">
            {/* Gradient Header */}
            <div className="bg-gradient-to-br from-surface-800 to-surface-900 p-6 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-surface-300">
                    {plot.projectId || 'Residential Layout'}
                  </p>
                  <h1 className="mt-1 font-display text-2xl font-extrabold">
                    Plot #{plot.plotNumber}
                  </h1>
                </div>
                <button
                  type="button"
                  onClick={handleWishlistToggle}
                  className={`rounded-full p-2.5 border transition ${
                    isSaved
                      ? 'border-red-400/40 bg-red-500/20 text-red-400'
                      : 'border-white/20 bg-white/10 text-white/60 hover:text-red-400'
                  }`}
                  title={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
                >
                  <Heart size={20} fill={isSaved ? 'currentColor' : 'none'} />
                </button>
              </div>

              <p className="mt-3 flex items-center text-sm text-surface-300">
                <MapPin size={14} className="mr-1 text-primary-400 shrink-0" />
                <span>{plot.location || 'Chennai Outer Growth Corridor'}</span>
              </p>

              <div className="mt-5 pt-5 border-t border-white/10">
                <p className="text-3xl font-extrabold text-white">
                  {currency.format(plot.totalAmount)}
                </p>
                {plot.ratePerSqft > 0 && (
                  <p className="mt-1 text-xs text-surface-400">
                    ₹{plot.ratePerSqft.toLocaleString('en-IN')} per sq.ft
                  </p>
                )}
                <div className="mt-3">
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                      plot.status === 'available'
                        ? 'bg-primary-500/20 text-primary-300 border border-primary-400/30'
                        : 'bg-accent-500/20 text-accent-300 border border-accent-400/30'
                    }`}
                  >
                    {plot.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              {notice && (
                <div className="mb-4 rounded-xl bg-primary-50 p-3 text-xs font-medium text-primary-800 border border-primary-200">
                  {notice}
                </div>
              )}

              <div className="space-y-3">
                <Link
                  to={`/enquiry?plotId=${plot.id}&plotNumber=${plot.plotNumber}&projectId=${encodeURIComponent(
                    plot.projectId
                  )}`}
                  className="btn-primary flex min-h-12 w-full items-center justify-center"
                >
                  Enquire for this Plot
                </Link>
                <Link
                  to={`/enquiry?plotId=${plot.id}&plotNumber=${plot.plotNumber}&projectId=${encodeURIComponent(
                    plot.projectId
                  )}&type=visit`}
                  className="btn-secondary flex min-h-12 w-full items-center justify-center gap-2"
                >
                  <CalendarDays size={18} />
                  Book Guided Site Visit
                </Link>
              </div>

              <div className="mt-6 pt-5 border-t border-surface-100">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-white grid place-items-center font-bold shadow-card">
                    <Phone size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-surface-400">Need instant assistance?</p>
                    <p className="text-sm font-bold text-surface-900">+91 98765 43210</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Plots */}
      {similarPlots.length > 0 && (
        <section className="mt-16 border-t border-surface-200 pt-12">
          <h2 className="font-display text-2xl font-extrabold text-surface-900">Similar Plots in this Project</h2>
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

export default PlotDetails
