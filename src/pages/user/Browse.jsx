import React, { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Map, Search } from 'lucide-react'
import { subscribeToPublicPlots } from '../../services/plots'
import { PlotCard } from '../../components/user/PlotCard'
import { PlotMap } from '../../components/user/PlotMap'
import { EmptyState } from '../../components/common/EmptyState'

export function Browse() {
  const [searchParams] = useSearchParams()
  const [plots, setPlots] = useState(null)
  const [error, setError] = useState(null)

  const [search, setSearch] = useState(searchParams.get('location') || '')
  const [project, setProject] = useState('')
  const [status, setStatus] = useState('All')
  const [facing, setFacing] = useState('')
  const [budget, setBudget] = useState(searchParams.get('budget') || '')
  const [area, setArea] = useState('')
  const [isMapView, setIsMapView] = useState(false)

  useEffect(() => {
    const unsub = subscribeToPublicPlots(
      (data) => setPlots(data),
      () => setError('Unable to load plots at this time.')
    )
    return () => unsub()
  }, [])

  const filteredPlots = useMemo(() => {
    if (!plots) return []
    return plots.filter((plot) => {
      const matchSearch =
        !search ||
        `${plot.location} ${plot.projectId} ${plot.plotNumber}`
          .toLowerCase()
          .includes(search.toLowerCase())
      const matchProject = !project || plot.projectId === project
      const matchStatus = status === 'All' || plot.status === status.toLowerCase()
      const matchFacing = !facing || plot.facing === facing
      const matchBudget = !budget || plot.totalAmount <= Number(budget)
      const matchArea = !area || plot.areaSqft >= Number(area)

      return matchSearch && matchProject && matchStatus && matchFacing && matchBudget && matchArea
    })
  }, [plots, search, project, status, facing, budget, area])

  const projectOptions = useMemo(() => {
    if (!plots) return []
    return [...new Set(plots.map((p) => p.projectId).filter(Boolean))]
  }, [plots])

  const facingOptions = useMemo(() => {
    if (!plots) return []
    return [...new Set(plots.map((p) => p.facing).filter(Boolean))]
  }, [plots])

  // Inventory counts for quick multi-color pill strip
  const totalCount = plots ? plots.length : 0
  const availableCount = plots ? plots.filter((p) => p.status === 'available').length : 0
  const reservedCount = plots ? plots.filter((p) => p.status === 'reserved').length : 0
  const projectsCount = projectOptions.length

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      {/* Header and Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="animate-slide-up">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/60">
            🌳 Prime Real Estate Portfolio
          </span>
          <h1 className="mt-2 text-3xl sm:text-4xl font-black font-display text-surface-900 dark:text-white tracking-tight">
            Browse Approved Plots
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Filter by layout, facing direction, budget, or land size across all prime corridors.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsMapView(!isMapView)}
          className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-5 text-sm font-bold transition-all duration-300 shadow-sm cursor-pointer ${
            isMapView
              ? 'btn-royal text-white shadow-md hover:shadow-lg'
              : 'card-modern text-surface-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:shadow-card'
          }`}
        >
          <Map size={17} className="text-cyan-500" />
          {isMapView ? 'Show Grid View' : 'Interactive Map View'}
        </button>
      </div>

      {/* 5-Color Quick Inventory Status Ribbon */}
      <div className="mt-6 flex flex-wrap items-center gap-2.5 animate-slide-up">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 text-xs font-bold shadow-2xs">
          <span className="size-2 rounded-full bg-indigo-500" />
          <span>Total Inventory: <strong>{totalCount}</strong></span>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 text-xs font-bold shadow-2xs">
          <span className="size-2 rounded-full bg-emerald-500" />
          <span>Available Now: <strong>{availableCount}</strong></span>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60 text-xs font-bold shadow-2xs">
          <span className="size-2 rounded-full bg-amber-500" />
          <span>Token Reserved: <strong>{reservedCount}</strong></span>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200/60 dark:border-cyan-800/60 text-xs font-bold shadow-2xs">
          <span className="size-2 rounded-full bg-cyan-500" />
          <span>Active Layouts: <strong>{projectsCount}</strong></span>
        </div>
      </div>

      {/* Multi-Color Filter Bar */}
      <div className="mt-6 card-modern p-5 animate-slide-up border border-slate-200/80 dark:border-slate-800 dark:bg-slate-900/90 shadow-lg" style={{ animationDelay: '0.1s' }}>
        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
          {/* 1. Cyan: Location / Plot Search */}
          <label className="flex items-center gap-2 rounded-xl border border-surface-200 dark:border-slate-700 bg-surface-50 dark:bg-slate-800/80 px-3.5 py-2 text-sm text-surface-500 dark:text-slate-400 focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/20 focus-within:bg-white dark:focus-within:bg-slate-800 transition-all duration-200">
            <Search size={16} className="text-cyan-500 shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search location/plot..."
              className="w-full bg-transparent text-surface-900 dark:text-white outline-none placeholder:text-surface-400 dark:placeholder:text-slate-500 text-xs"
            />
          </label>

          {/* 2. Indigo: Project Filter */}
          <select
            value={project}
            onChange={(e) => setProject(e.target.value)}
            className="min-h-10 rounded-xl border border-surface-200 dark:border-slate-700 bg-surface-50 dark:bg-slate-800/80 px-3 text-xs font-medium text-surface-700 dark:text-slate-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
          >
            <option value="">🏛️ All Projects</option>
            {projectOptions.map((proj) => (
              <option key={proj} value={proj}>
                {proj}
              </option>
            ))}
          </select>

          {/* 3. Emerald: Status Filter */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="min-h-10 rounded-xl border border-surface-200 dark:border-slate-700 bg-surface-50 dark:bg-slate-800/80 px-3 text-xs font-medium text-surface-700 dark:text-slate-200 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
          >
            <option value="All">🏷️ All Statuses</option>
            <option value="Available">🟢 Available Only</option>
            <option value="Reserved">🟡 Reserved Plots</option>
          </select>

          {/* 4. Purple: Facing Filter */}
          <select
            value={facing}
            onChange={(e) => setFacing(e.target.value)}
            className="min-h-10 rounded-xl border border-surface-200 dark:border-slate-700 bg-surface-50 dark:bg-slate-800/80 px-3 text-xs font-medium text-surface-700 dark:text-slate-200 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
          >
            <option value="">🧭 Any Facing Direction</option>
            {facingOptions.map((f) => (
              <option key={f} value={f}>
                {f} Facing
              </option>
            ))}
          </select>

          {/* 5. Amber: Min Area Filter */}
          <label className="flex items-center gap-1.5 rounded-xl border border-surface-200 dark:border-slate-700 bg-surface-50 dark:bg-slate-800/80 px-3 py-2 text-sm text-surface-500 dark:text-slate-400 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20 focus-within:bg-white dark:focus-within:bg-slate-800 transition-all duration-200">
            <span className="text-amber-500 font-bold text-xs">📐</span>
            <input
              type="number"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="Min sq.ft"
              className="w-full bg-transparent text-surface-900 dark:text-white outline-none placeholder:text-surface-400 dark:placeholder:text-slate-500 text-xs"
            />
          </label>
        </div>

        {(search || project || status !== 'All' || facing || budget || area) && (
          <div className="mt-4 pt-3 border-t border-surface-100 dark:border-slate-800 flex items-center justify-between text-xs text-surface-500 dark:text-slate-400">
            <span>
              Showing <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{filteredPlots.length}</span> matching plots
            </span>
            <button
              type="button"
              onClick={() => {
                setSearch('')
                setProject('')
                setStatus('All')
                setFacing('')
                setBudget('')
                setArea('')
              }}
              className="font-bold text-rose-600 dark:text-rose-400 hover:underline transition-colors cursor-pointer"
            >
              Reset all filters ✕
            </button>
          </div>
        )}
      </div>

      {/* Main Results View */}
      {error ? (
        <div className="mt-8 rounded-xl bg-red-50 p-5 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      ) : plots === null ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-80 animate-pulse rounded-2xl bg-surface-200" />
          ))}
        </div>
      ) : isMapView ? (
        <div className="mt-8 animate-slide-up">
          <PlotMap plots={filteredPlots} />
        </div>
      ) : filteredPlots.length ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPlots.map((plot, idx) => (
            <div key={plot.id} className="animate-slide-up" style={{ animationDelay: `${Math.min(idx, 5) * 0.05}s` }}>
              <PlotCard plot={plot} />
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-8">
          <EmptyState
            title="No matching plots found"
            description="Try loosening your filters or budget range to see available plots."
          />
        </div>
      )}
    </div>
  )
}
