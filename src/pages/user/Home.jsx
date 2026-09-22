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
      {/* Hero Section with Multi-Color Ambient Mesh Glow */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#021f18] via-[#09152e] to-[#1e1035] px-4 py-20 text-white sm:px-6 lg:py-28 transition-colors duration-300">
        <div className="pointer-events-none absolute inset-0 z-0">
          <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-emerald-500/25 blur-3xl animate-pulse-soft" />
          <div className="absolute top-1/4 right-0 h-96 w-96 rounded-full bg-indigo-600/30 blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-amber-500/20 blur-3xl animate-pulse-soft" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-10 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl animate-pulse-soft" style={{ animationDelay: '1.5s' }} />
        </div>

        <div className="mx-auto max-w-7xl relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 dark:bg-white/5 px-4 py-1.5 text-xs font-bold text-emerald-300 backdrop-blur-md border border-emerald-400/30 shadow-xs animate-slide-up">
            <Sparkles size={14} className="text-amber-400" />
            <span>DTCP & RERA Approved Layouts</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          </div>

          <h1 className="mt-6 max-w-4xl text-4xl font-black font-display tracking-tight sm:text-6xl sm:leading-tight animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Find <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">premium land</span> that builds your generational wealth.
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-slate-300 leading-relaxed animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Discover verified residential and commercial plots with 100% clear titles, blacktop roads, transparent pricing, and instant deed registration across prime Coimbatore corridors.
          </p>

          {/* Quick Search Form */}
          <form
            onSubmit={handleSearch}
            className="mt-10 grid max-w-3xl gap-3 rounded-2xl bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl p-3 shadow-2xl sm:grid-cols-[1fr_1fr_auto] animate-slide-up border border-white/20 dark:border-slate-800"
            style={{ animationDelay: '0.3s' }}
          >
            <label className="flex items-center gap-2 rounded-xl border border-surface-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-surface-500 dark:text-slate-400 focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/20 transition-all duration-200">
              <MapPin size={18} className="text-cyan-500 shrink-0" />
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-transparent text-sm text-surface-900 dark:text-white outline-none placeholder:text-surface-400 dark:placeholder:text-slate-500"
                placeholder="Location or project name"
              />
            </label>
            <label className="flex items-center gap-2 rounded-xl border border-surface-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-surface-500 dark:text-slate-400 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all duration-200">
              <span className="font-bold text-amber-500">₹</span>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full bg-transparent text-sm text-surface-900 dark:text-white outline-none placeholder:text-surface-400 dark:placeholder:text-slate-500"
                placeholder="Max budget (INR)"
              />
            </label>
            <button
              type="submit"
              className="btn-primary inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-6 font-bold text-white shadow-lg cursor-pointer"
            >
              <Search size={17} />
              Search
            </button>
          </form>
        </div>
      </section>

      {/* 4-Color Luxury KPI Trust Bar */}
      <section className="relative -mt-8 z-20 mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          {/* Card 1: Emerald (Legal Approvals) */}
          <div className="bg-white dark:bg-slate-900/95 rounded-2xl p-4 sm:p-5 border border-emerald-200/80 dark:border-emerald-800/60 shadow-lg shadow-emerald-500/5 flex items-center gap-3.5">
            <div className="size-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 grid place-items-center shrink-0 shadow-xs">
              <ShieldCheck size={22} />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-display leading-none">100%</p>
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mt-1">DTCP / RERA Approved</p>
            </div>
          </div>

          {/* Card 2: Royal Indigo (Acreage & Infrastructure) */}
          <div className="bg-white dark:bg-slate-900/95 rounded-2xl p-4 sm:p-5 border border-indigo-200/80 dark:border-indigo-800/60 shadow-lg shadow-indigo-500/5 flex items-center gap-3.5">
            <div className="size-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 grid place-items-center shrink-0 shadow-xs">
              <MapPin size={22} />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-display leading-none">120+ Acres</p>
              <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-400 mt-1">Prime Gated Land</p>
            </div>
          </div>

          {/* Card 3: Warm Gold/Amber (Annual Appreciation ROI) */}
          <div className="bg-white dark:bg-slate-900/95 rounded-2xl p-4 sm:p-5 border border-amber-200/80 dark:border-amber-800/60 shadow-lg shadow-amber-500/5 flex items-center gap-3.5">
            <div className="size-11 rounded-xl bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 grid place-items-center shrink-0 shadow-xs">
              <Sparkles size={22} />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-display leading-none">18.4%</p>
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mt-1">Avg. Annual ROI Growth</p>
            </div>
          </div>

          {/* Card 4: Electric Cyan (Happy Families / Site Visits) */}
          <div className="bg-white dark:bg-slate-900/95 rounded-2xl p-4 sm:p-5 border border-cyan-200/80 dark:border-cyan-800/60 shadow-lg shadow-cyan-500/5 flex items-center gap-3.5">
            <div className="size-11 rounded-xl bg-cyan-50 dark:bg-cyan-950/70 text-cyan-600 dark:text-cyan-400 grid place-items-center shrink-0 shadow-xs">
              <Trees size={22} />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-display leading-none">2,500+</p>
              <p className="text-xs font-semibold text-cyan-700 dark:text-cyan-400 mt-1">Happy Plot Owners</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Inventory Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="flex items-end justify-between">
          <div className="animate-slide-up">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/60">
              💎 Prime Inventory
            </span>
            <h2 className="mt-2 text-3xl font-black font-display text-surface-900 dark:text-white">
              Featured Handpicked Plots
            </h2>
          </div>
          <Link
            to="/plots"
            className="hidden items-center gap-1.5 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors sm:inline-flex"
          >
            <span>View all plots</span> <ArrowRight size={16} />
          </Link>
        </div>

        {error ? (
          <div className="mt-8 rounded-xl bg-rose-50 dark:bg-rose-950/50 p-5 text-sm text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            {error}
          </div>
        ) : plots === null ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 animate-pulse rounded-2xl bg-surface-200 dark:bg-slate-800" />
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

      {/* Why Choose LK PROPERTIES: 4-Color Luxury Grid */}
      <section className="border-t border-surface-200 dark:border-slate-800 bg-surface-50 dark:bg-[#060911] px-4 py-16 sm:px-6 lg:py-20 transition-colors duration-200">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/60">
              ⭐ The LK PROPERTIES Guarantee
            </span>
            <h2 className="mt-2 text-3xl font-black font-display text-surface-900 dark:text-white">
              Why Smart Investors Trust Our Land
            </h2>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* 1. Emerald: Legal Guarantee */}
            <article className="card-modern group p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-t-4 border-t-emerald-500">
              <div className="size-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 grid place-items-center mb-5 group-hover:scale-110 transition-transform shadow-xs">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-lg font-extrabold font-display text-surface-900 dark:text-white">100% Clear Titles</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                Rigorous parent document tracing and DTCP/RERA certified clearances with zero litigation.
              </p>
            </article>

            {/* 2. Royal Indigo: Growth Locations */}
            <article className="card-modern group p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-t-4 border-t-indigo-500">
              <div className="size-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 grid place-items-center mb-5 group-hover:scale-110 transition-transform shadow-xs">
                <MapPin size={24} />
              </div>
              <h3 className="text-lg font-extrabold font-display text-surface-900 dark:text-white">High-Growth Corridors</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                Direct frontage to ring roads, industrial parks, and educational hubs for maximum appreciation.
              </p>
            </article>

            {/* 3. Electric Cyan: Ready Infrastructure */}
            <article className="card-modern group p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-t-4 border-t-cyan-500">
              <div className="size-12 rounded-xl bg-cyan-50 dark:bg-cyan-950/70 text-cyan-600 dark:text-cyan-400 grid place-items-center mb-5 group-hover:scale-110 transition-transform shadow-xs">
                <Trees size={24} />
              </div>
              <h3 className="text-lg font-extrabold font-display text-surface-900 dark:text-white">Ready to Construct</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                40ft blacktop roads, underground EB cabling, water connections, and immediate registration.
              </p>
            </article>

            {/* 4. Velvet Purple: Easy Bank Approvals */}
            <article className="card-modern group p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-t-4 border-t-purple-500">
              <div className="size-12 rounded-xl bg-purple-50 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400 grid place-items-center mb-5 group-hover:scale-110 transition-transform shadow-xs">
                <Sparkles size={24} />
              </div>
              <h3 className="text-lg font-extrabold font-display text-surface-900 dark:text-white">Up to 80% Bank Loans</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                Pre-approved by leading nationalized banks (SBI, HDFC, ICICI) with expedited loan processing.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-emerald-950 p-8 text-white sm:p-14 flex flex-col sm:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden border border-white/10">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute -top-10 -right-10 h-72 w-72 rounded-full bg-cyan-500 blur-3xl" />
            <div className="absolute -bottom-10 -left-10 h-72 w-72 rounded-full bg-amber-500 blur-3xl" />
          </div>
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-amber-300 bg-amber-500/20 border border-amber-400/30">
              🚀 Limited Plots Available
            </span>
            <h2 className="mt-3 text-3xl font-black font-display sm:text-4xl">
              Ready to claim your piece of land?
            </h2>
            <p className="mt-2 text-slate-300 max-w-lg text-sm leading-relaxed">
              Book a complimentary private site inspection with door-to-door transport and property advisors.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0 relative z-10">
            <Link
              to="/plots"
              className="btn-primary !px-6 !py-3.5 text-sm !font-bold"
            >
              Browse Inventory
            </Link>
            <Link
              to="/enquiry"
              className="rounded-xl border border-white/30 px-6 py-3.5 text-sm font-bold text-white hover:bg-white/10 hover:border-white/60 transition-all duration-200"
            >
              Book Site Visit
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
