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
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-green-950 px-4 py-20 text-white sm:px-6 lg:py-28">
        <div className="mx-auto max-w-7xl relative z-10">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-green-300 backdrop-blur">
            <Sparkles size={14} />
            Verified & Approved Plots
          </p>
          <h1 className="mt-6 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-6xl sm:leading-tight">
            Find premium land that builds your future.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-slate-300 leading-relaxed">
            Discover verified residential and investment plots with clear titles, transparent pricing, and guided site visits across prime growth corridors.
          </p>

          {/* Quick Search Form */}
          <form
            onSubmit={handleSearch}
            className="mt-10 grid max-w-3xl gap-3 rounded-2xl bg-white p-3 shadow-xl sm:grid-cols-[1fr_1fr_auto]"
          >
            <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 text-slate-500 focus-within:border-green-500">
              <MapPin size={18} className="text-slate-400 shrink-0" />
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                placeholder="Location or project name"
              />
            </label>
            <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 text-slate-500 focus-within:border-green-500">
              <span className="font-semibold text-slate-400">₹</span>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                placeholder="Max budget (INR)"
              />
            </label>
            <button
              type="submit"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-green-600 px-6 font-semibold text-white hover:bg-green-700 transition shadow-sm"
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
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-green-700">Prime Inventory</p>
            <h2 className="mt-1 text-3xl font-extrabold text-slate-900">Featured Plots</h2>
          </div>
          <Link
            to="/plots"
            className="hidden items-center gap-1 text-sm font-semibold text-green-700 hover:text-green-800 sm:inline-flex"
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
              <div key={i} className="h-80 animate-pulse rounded-2xl bg-slate-200" />
            ))}
          </div>
        ) : featured.length ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((plot) => (
              <PlotCard key={plot.id} plot={plot} />
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

      {/* Why Choose LA PLOTS */}
      <section className="border-t border-slate-200 bg-white px-4 py-16 sm:px-6 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-widest text-green-700">The LA PLOTS Standard</p>
            <h2 className="mt-1 text-3xl font-extrabold text-slate-900">Why Investors Choose Us</h2>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <article className="rounded-2xl border border-slate-100 bg-slate-50 p-8">
              <div className="size-12 rounded-xl bg-green-100 text-green-700 grid place-items-center mb-5">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">100% Clear Titles</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Every layout is rigorously vetted, legally certified, and DTCP/RERA compliant with complete document transparency.
              </p>
            </article>

            <article className="rounded-2xl border border-slate-100 bg-slate-50 p-8">
              <div className="size-12 rounded-xl bg-green-100 text-green-700 grid place-items-center mb-5">
                <MapPin size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">High-Growth Locations</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Positioned strategically near upcoming infrastructure, ring roads, metro links, and IT/industrial corridors.
              </p>
            </article>

            <article className="rounded-2xl border border-slate-100 bg-slate-50 p-8">
              <div className="size-12 rounded-xl bg-green-100 text-green-700 grid place-items-center mb-5">
                <Trees size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Ready for Construction</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Blacktop roads, street lights, compound wall security, underground drainage, and immediate registration.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="rounded-3xl bg-green-700 p-8 text-white sm:p-14 flex flex-col sm:flex-row items-center justify-between gap-8 shadow-xl">
          <div>
            <p className="text-sm font-semibold text-green-200">Start Your Investment Journey</p>
            <h2 className="mt-2 text-3xl font-extrabold sm:text-4xl">Ready to own your plot?</h2>
            <p className="mt-2 text-green-100 max-w-lg">
              Book a complimentary guided site visit with our property advisors today.
            </p>
          </div>
          <div className="flex gap-4 shrink-0">
            <Link
              to="/plots"
              className="rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-green-800 hover:bg-green-50 transition shadow-md"
            >
              Browse Inventory
            </Link>
            <Link
              to="/enquiry"
              className="rounded-xl border border-green-400 px-6 py-3.5 text-sm font-bold text-white hover:bg-green-600 transition"
            >
              Book Site Visit
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
