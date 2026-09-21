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

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="animate-slide-up">
          <p className="text-xs font-bold uppercase tracking-widest text-primary-600">Explore Inventory</p>
          <h1 className="mt-1 text-3xl font-extrabold font-display text-surface-900">Browse Available Plots</h1>
        </div>
        <button
          type="button"
          onClick={() => setIsMapView(!isMapView)}
          className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-5 text-sm font-semibold transition-all duration-300 shadow-sm ${
            isMapView
              ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-md hover:shadow-lg hover:scale-[1.02]'
              : 'card-modern text-surface-700 hover:shadow-card'
          }`}
        >
          <Map size={17} />
          {isMapView ? 'Show Grid View' : 'Show Map View'}
        </button>
      </div>

      {/* Filter Bar */}
      <div className="mt-8 card-modern p-5 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="flex items-center gap-2 rounded-xl border border-surface-200 bg-surface-50 px-3 py-2 text-sm text-surface-500 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:bg-white transition-all duration-300">
            <Search size={16} className="text-primary-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search location/plot..."
              className="w-full bg-transparent text-surface-900 outline-none placeholder:text-surface-400"
            />
          </label>

          <select
            value={project}
            onChange={(e) => setProject(e.target.value)}
            className="min-h-10 rounded-xl border border-surface-200 bg-surface-50 px-3 text-sm text-surface-700 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-300"
          >
            <option value="">All Projects</option>
            {projectOptions.map((proj) => (
              <option key={proj} value={proj}>
                {proj}
              </option>
            ))}
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="min-h-10 rounded-xl border border-surface-200 bg-surface-50 px-3 text-sm text-surface-700 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-300"
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Reserved">Reserved</option>
          </select>

          <select
            value={facing}
            onChange={(e) => setFacing(e.target.value)}
            className="min-h-10 rounded-xl border border-surface-200 bg-surface-50 px-3 text-sm text-surface-700 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-300"
          >
            <option value="">Any Facing</option>
            {facingOptions.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-2 rounded-xl border border-surface-200 bg-surface-50 px-3 py-2 text-sm text-surface-500 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:bg-white transition-all duration-300">
            <input
              type="number"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="Min area (sq.ft)"
              className="w-full bg-transparent text-surface-900 outline-none placeholder:text-surface-400"
            />
          </label>
        </div>

        {(search || project || status !== 'All' || facing || budget || area) && (
          <div className="mt-4 pt-3 border-t border-surface-100 flex items-center justify-between text-xs text-surface-500">
            <span>Showing <span className="font-semibold text-primary-700">{filteredPlots.length}</span> filtered results</span>
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
              className="font-semibold text-primary-700 hover:text-primary-800 hover:underline transition-colors"
            >
              Reset filters
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
