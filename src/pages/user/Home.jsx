import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, MapPin, Search, ShieldCheck, Sparkles, Trees } from 'lucide-react'
import { subscribeToPublicPlots } from '../../services/plots'
import { PlotCard } from '../../components/user/PlotCard'
import { EmptyState } from '../../components/common/EmptyState'

export function Home() {
  const navigate = useNavigate()
  const [plots, setPlots] = useState(null)
  const [error, setError] = useState(null)
  const [location, setLocation] = useState('')
  const [budget, setBudget] = useState('')

  useEffect(() => {
    const unsub = subscribeToPublicPlots(
      (data) => setPlots(data),
      () => setError('Unable to load featured plots at this time.')
    )
    return () => unsub()
  }, [])

  function handleSearch(e) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (location) params.set('location', location)
    if (budget) params.set('budget', budget)
    navigate(`/plots?${params.toString()}`)
  }

  const featured = plots ? plots.slice(0, 3) : []

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-950 via-surface-900 to-indigo-950 px-4 py-20 text-white sm:px-6 lg:py-28">
        <div className="pointer-events-none absolute inset-0 z-0">
          <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-primary-600/20 blur-3xl animate-slide-up" />
          <div className="absolute top-1/2 right-0 h-80 w-80 rounded-full bg-indigo-500/15 blur-3xl animate-slide-up" style={{ animationDelay: '0.2s' }} />
          <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-accent-500/10 blur-3xl animate-slide-up" style={{ animationDelay: '0.4s' }} />
        </div>
        <div className="mx-auto max-w-7xl relative z-10">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-primary-300 backdrop-blur-sm border border-white/10 animate-slide-up">
            <Sparkles size={14} />
            Verified & Approved Plots
          </p>
          <h1 className="mt-6 max-w-3xl text-4xl font-extrabold font-display tracking-tight sm:text-6xl sm:leading-tight animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Find premium land that builds your future.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-slate-300 leading-relaxed animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Discover verified residential and investment plots with clear titles, transparent pricing, and guided site visits across prime growth corridors.
          </p>

          {/* Quick Search Form */}
          <form
            onSubmit={handleSearch}
            className="mt-10 grid max-w-3xl gap-3 rounded-2xl bg-white/80 backdrop-blur-xl p-3 shadow-elevated sm:grid-cols-[1fr_1fr_auto] animate-slide-up border border-white/20"
            style={{ animationDelay: '0.3s' }}
          >
            <label className="flex items-center gap-2 rounded-xl border border-surface-200 bg-white px-3.5 py-2 text-surface-500 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20 transition-all duration-300">
              <MapPin size={18} className="text-primary-500 shrink-0" />
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-transparent text-sm text-surface-900 outline-none placeholder:text-surface-400"
                placeholder="Location or project name"
              />
            </label>
            <label className="flex items-center gap-2 rounded-xl border border-surface-200 bg-white px-3.5 py-2 text-surface-500 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20 transition-all duration-300">
              <span className="font-semibold text-primary-600">₹</span>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full bg-transparent text-sm text-surface-900 outline-none placeholder:text-surface-400"
                placeholder="Max budget (INR)"
              />
            </label>
            <button
              type="submit"
              className="btn-primary inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-6 font-semibold text-white shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
            >
              <Search size={17} />
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Featured Inventory Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="flex items-end justify-between">
          <div className="animate-slide-up">
            <p className="text-xs font-bold uppercase tracking-widest text-primary-600">Prime Inventory</p>
            <h2 className="mt-1 text-3xl font-extrabold font-display text-surface-900">Featured Plots</h2>
          </div>
          <Link
            to="/plots"
            className="hidden items-center gap-1 text-sm font-semibold text-primary-700 hover:text-primary-800 transition-colors sm:inline-flex"
          >
            View all plots <ArrowRight size={16} />
          </Link>
        </div>

        {error ? (
          <div className="mt-8 rounded-xl bg-red-50 p-5 text-sm text-red-700 border border-red-200">
            {error}
          </div>
        ) : plots === null ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 animate-pulse rounded-2xl bg-surface-200" />
            ))}
          </div>
        ) : featured.length ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((plot, idx) => (
              <div key={plot.id} className="animate-slide-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                <PlotCard plot={plot} />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-8">
            <EmptyState
              title="Fresh plots arriving soon"
              description="New layout inventory is being surveyed and registered."
            />
          </div>
        )}
      </section>

      {/* Why Choose LK PROPERTIES */}
      <section className="border-t border-surface-200 bg-surface-50 px-4 py-16 sm:px-6 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-widest text-primary-600">The LK PROPERTIES Standard</p>
            <h2 className="mt-1 text-3xl font-extrabold font-display text-surface-900">Why Investors Choose Us</h2>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <article className="card-modern group p-8 hover:shadow-elevated transition-all duration-300 hover:-translate-y-1">
              <div className="size-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white grid place-items-center mb-5 shadow-glow group-hover:scale-110 transition-transform duration-300">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-xl font-bold font-display text-surface-900">100% Clear Titles</h3>
              <p className="mt-3 text-sm leading-relaxed text-surface-600">
                Every layout is rigorously vetted, legally certified, and DTCP/RERA compliant with complete document transparency.
              </p>
            </article>

            <article className="card-modern group p-8 hover:shadow-elevated transition-all duration-300 hover:-translate-y-1">
              <div className="size-12 rounded-xl bg-gradient-to-br from-accent-500 to-accent-700 text-white grid place-items-center mb-5 shadow-glow group-hover:scale-110 transition-transform duration-300">
                <MapPin size={24} />
              </div>
              <h3 className="text-xl font-bold font-display text-surface-900">High-Growth Locations</h3>
              <p className="mt-3 text-sm leading-relaxed text-surface-600">
                Positioned strategically near upcoming infrastructure, ring roads, metro links, and IT/industrial corridors.
              </p>
            </article>

            <article className="card-modern group p-8 hover:shadow-elevated transition-all duration-300 hover:-translate-y-1">
              <div className="size-12 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 text-white grid place-items-center mb-5 shadow-glow group-hover:scale-110 transition-transform duration-300">
                <Trees size={24} />
              </div>
              <h3 className="text-xl font-bold font-display text-surface-900">Ready for Construction</h3>
              <p className="mt-3 text-sm leading-relaxed text-surface-600">
                Blacktop roads, street lights, compound wall security, underground drainage, and immediate registration.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="rounded-3xl bg-gradient-to-r from-primary-700 via-primary-600 to-primary-500 p-8 text-white sm:p-14 flex flex-col sm:flex-row items-center justify-between gap-8 shadow-elevated relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-white blur-3xl" />
            <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-accent-500 blur-3xl" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-semibold text-primary-200">Start Your Investment Journey</p>
            <h2 className="mt-2 text-3xl font-extrabold font-display sm:text-4xl">Ready to own your plot?</h2>
            <p className="mt-2 text-primary-100 max-w-lg">
              Book a complimentary guided site visit with our property advisors today.
            </p>
          </div>
          <div className="flex gap-4 shrink-0 relative z-10">
            <Link
              to="/plots"
              className="rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-primary-700 hover:bg-primary-50 transition shadow-md hover:shadow-lg hover:scale-[1.02] duration-300"
            >
              Browse Inventory
            </Link>
            <Link
              to="/enquiry"
              className="rounded-xl border-2 border-white/40 px-6 py-3.5 text-sm font-bold text-white hover:bg-white/10 hover:border-white/60 transition-all duration-300"
            >
              Book Site Visit
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
