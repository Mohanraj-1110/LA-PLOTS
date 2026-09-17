import React, { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react'
import { PageHeader } from '../../components/common/PageHeader'
import { SearchBar } from '../../components/common/SearchBar'
import { StatusBadge } from '../../components/common/StatusBadge'
import { EmptyState } from '../../components/common/EmptyState'
import { Modal } from '../../components/common/Modal'
import {
  createPlot,
  deletePlot,
  subscribeToPlots,
  updatePlot,
  uploadPlotFiles,
  appendPlotFiles,
} from '../../services/plots'

const statuses = ['all', 'available', 'reserved', 'sold', 'blocked']

const initialForm = {
  projectId: '',
  plotNumber: '',
  surveyNumber: '',
  areaSqft: '',
  ratePerSqft: '',
  status: 'available',
  facing: '',
  roadWidth: '',
  location: '',
  description: '',
  geo: { lat: 0, lng: 0 },
}

export function Plots() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [plots, setPlots] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState(null)

  const [modalMode, setModalMode] = useState(null)
  const [activePlot, setActivePlot] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [photos, setPhotos] = useState([])
  const [documents, setDocuments] = useState([])
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const unsub = subscribeToPlots(
      (data) => setPlots(data),
      () => setError('Plots could not be loaded. Please check Firebase connection.')
    )
    return () => unsub()
  }, [])

  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      openNewModal()
      setSearchParams({})
    }
  }, [searchParams, setSearchParams])

  const filteredPlots = useMemo(() => {
    if (!plots) return []
    return plots.filter((plot) => {
      const q = search.toLowerCase()
      const matches = [plot.plotNumber, plot.surveyNumber, plot.projectId, plot.location].some(
        (v) => String(v || '').toLowerCase().includes(q)
      )
      const matchesStatus = statusFilter === 'all' || plot.status === statusFilter
      return matches && matchesStatus
    })
  }, [plots, search, statusFilter])

  function openNewModal() {
    setForm(initialForm)
    setActivePlot(null)
    setPhotos([])
    setDocuments([])
    setModalMode('new')
  }

  function openEditModal(plot) {
    setActivePlot(plot)
    setForm({
      projectId: plot.projectId || '',
      plotNumber: plot.plotNumber || '',
      surveyNumber: plot.surveyNumber || '',
      areaSqft: plot.areaSqft || '',
      ratePerSqft: plot.ratePerSqft || '',
      status: plot.status || 'available',
      facing: plot.facing || '',
      roadWidth: plot.roadWidth || '',
      location: plot.location || '',
      description: plot.description || '',
      geo: plot.geo || { lat: 0, lng: 0 },
    })
    setPhotos([])
    setDocuments([])
    setModalMode('edit')
  }

  function openDetailsModal(plot) {
    setActivePlot(plot)
    setModalMode('details')
  }

  async function handleDelete(plot) {
    if (!window.confirm(`Delete Plot #${plot.plotNumber}? This action cannot be undone.`)) return
    try {
      await deletePlot(plot.id)
      setNotice('Plot deleted successfully.')
      setTimeout(() => setNotice(null), 3000)
    } catch {
      setError('Could not delete plot.')
    }
  }

  async function handleFormSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const plotInput = {
        ...form,
        areaSqft: Number(form.areaSqft),
        ratePerSqft: Number(form.ratePerSqft),
        roadWidth: Number(form.roadWidth) || 0,
      }

      let savedId
      if (modalMode === 'edit' && activePlot) {
        await updatePlot(activePlot.id, plotInput)
        savedId = activePlot.id
      } else {
        const docRef = await createPlot(plotInput)
        savedId = docRef.id
      }

      if (photos.length > 0) {
        const photoUrls = await uploadPlotFiles(savedId, photos, 'photos')
        await appendPlotFiles(savedId, 'photos', photoUrls)
      }

      if (documents.length > 0) {
        const docUrls = await uploadPlotFiles(savedId, documents, 'documents')
        await appendPlotFiles(savedId, 'documents', docUrls)
      }

      setNotice(modalMode === 'edit' ? 'Plot updated successfully!' : 'Plot created successfully!')
      setTimeout(() => setNotice(null), 3000)
      setModalMode(null)
    } catch (err) {
      setError(err?.message || 'Failed to save plot.')
    } finally {
      setBusy(false)
    }
  }

  const totalCalculated =
    (Number(form.areaSqft) || 0) * (Number(form.ratePerSqft) || 0)

  return (
    <div className="page-enter">
      <PageHeader
        title="Plot Inventory"
        description={`${plots ? plots.length : 0} plots in total catalog.`}
        action={
          <button
            type="button"
            onClick={openNewModal}
            className="btn-primary inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-semibold"
          >
            <Plus size={18} />
            Add New Plot
          </button>
        }
      />

      {notice && (
        <div className="mb-4 rounded-2xl border border-primary-200 bg-gradient-to-r from-primary-50 to-emerald-50 p-4 text-sm font-medium text-primary-800 shadow-card">
          {notice}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-card">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="min-w-0 flex-1">
          <SearchBar
            placeholder="Search by plot number, survey number, or project..."
            value={search}
            onChange={setSearch}
          />
        </div>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {statuses.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setStatusFilter(item)}
            className={`min-h-10 whitespace-nowrap rounded-xl px-4 text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
              statusFilter === item
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-glow'
                : 'bg-white text-slate-600 hover:bg-surface-50 border border-surface-200 shadow-card'
            }`}
          >
            {item}{' '}
            <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] ${statusFilter === item ? 'bg-white/20 text-white' : 'bg-surface-100 text-slate-700'}`}>
              {item === 'all'
                ? plots?.length || 0
                : plots?.filter((p) => p.status === item).length || 0}
            </span>
          </button>
        ))}
      </div>

      {plots === null ? (
        <div className="mt-6 h-64 animate-pulse rounded-2xl bg-surface-100" />
      ) : filteredPlots.length > 0 ? (
        <div className="mt-6 overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-surface-200 bg-surface-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3.5 font-bold">Plot Details</th>
                  <th className="px-5 py-3.5 font-bold">Project & Location</th>
                  <th className="px-5 py-3.5 font-bold">Area & Rate</th>
                  <th className="px-5 py-3.5 font-bold">Total Amount</th>
                  <th className="px-5 py-3.5 font-bold">Status</th>
                  <th className="px-5 py-3.5 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {filteredPlots.map((plot) => (
                  <tr key={plot.id} className="group transition-colors hover:bg-gradient-to-r hover:from-primary-50/50 hover:to-transparent">
                    <td className="px-5 py-4">
                      <span className="font-display font-bold text-slate-900">Plot #{plot.plotNumber}</span>
                      <span className="block text-xs text-slate-400">
                        Survey: {plot.surveyNumber || 'N/A'} · Facing: {plot.facing || 'East'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-medium text-slate-800">{plot.projectId || 'General'}</span>
                      <span className="block text-xs text-slate-400">{plot.location}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-medium text-slate-900">
                        {plot.areaSqft.toLocaleString('en-IN')} sq.ft
                      </span>
                      <span className="block text-xs text-slate-400">
                        ₹{plot.ratePerSqft.toLocaleString('en-IN')}/sq.ft
                      </span>
                    </td>
                    <td className="px-5 py-4 font-display font-bold text-primary-600">
                      ₹{plot.totalAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={plot.status} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openDetailsModal(plot)}
                          className="rounded-xl p-2 text-slate-400 transition-all hover:bg-surface-100 hover:text-slate-700"
                          title="View Details"
                        >
                          <Eye size={17} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(plot)}
                          className="rounded-xl p-2 text-slate-400 transition-all hover:bg-primary-50 hover:text-primary-600"
                          title="Edit Plot"
                        >
                          <Pencil size={17} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(plot)}
                          className="rounded-xl p-2 text-slate-400 transition-all hover:bg-red-50 hover:text-red-600"
                          title="Delete Plot"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="mt-8">
          <EmptyState
            title="No plots match your criteria"
            description="Try changing the search query or adding a new plot listing."
          />
        </div>
      )}

      {(modalMode === 'new' || modalMode === 'edit') && (
        <Modal
          title={modalMode === 'edit' ? `Edit Plot #${activePlot?.plotNumber}` : 'Add New Plot'}
          onClose={() => setModalMode(null)}
        >
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Project Name *</label>
                <input
                  type="text"
                  required
                  value={form.projectId}
                  onChange={(e) => setForm({ ...form, projectId: e.target.value })}
                  placeholder="Green Meadows"
                  className="input-modern mt-1 w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Plot Number *</label>
                <input
                  type="text"
                  required
                  value={form.plotNumber}
                  onChange={(e) => setForm({ ...form, plotNumber: e.target.value })}
                  placeholder="A-102"
                  className="input-modern mt-1 w-full"
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Survey Number *</label>
                <input
                  type="text"
                  required
                  value={form.surveyNumber}
                  onChange={(e) => setForm({ ...form, surveyNumber: e.target.value })}
                  placeholder="142/2B"
                  className="input-modern mt-1 w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Location *</label>
                <input
                  type="text"
                  required
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="Vandalur Outer Ring Road"
                  className="input-modern mt-1 w-full"
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Area (sq.ft) *</label>
                <input
                  type="number"
                  required
                  value={form.areaSqft}
                  onChange={(e) => setForm({ ...form, areaSqft: e.target.value })}
                  placeholder="1200"
                  className="input-modern mt-1 w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Rate per sq.ft (₹) *</label>
                <input
                  type="number"
                  required
                  value={form.ratePerSqft}
                  onChange={(e) => setForm({ ...form, ratePerSqft: e.target.value })}
                  placeholder="2500"
                  className="input-modern mt-1 w-full"
                />
              </div>
            </div>

            {totalCalculated > 0 && (
              <div className="rounded-2xl bg-gradient-to-r from-primary-50 to-emerald-50 p-4 border border-primary-100">
                <span className="text-xs font-bold uppercase tracking-wider text-primary-600">
                  Total Calculated Price
                </span>
                <p className="text-xl font-extrabold font-display text-primary-700">
                  ₹{totalCalculated.toLocaleString('en-IN')}
                </p>
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="input-modern mt-1 w-full"
                >
                  <option value="available">Available</option>
                  <option value="reserved">Reserved</option>
                  <option value="sold">Sold</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Facing</label>
                <input
                  type="text"
                  value={form.facing}
                  onChange={(e) => setForm({ ...form, facing: e.target.value })}
                  placeholder="North / East"
                  className="input-modern mt-1 w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Road Width (ft)</label>
                <input
                  type="number"
                  value={form.roadWidth}
                  onChange={(e) => setForm({ ...form, roadWidth: e.target.value })}
                  placeholder="30"
                  className="input-modern mt-1 w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Description</label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Corner plot, DTCP approved, immediate electricity..."
                className="input-modern mt-1 w-full resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Upload Photos</label>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setPhotos(Array.from(e.target.files || []))}
                className="mt-1 block w-full text-xs text-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Upload Layout PDFs</label>
              <input
                type="file"
                multiple
                accept="application/pdf"
                onChange={(e) => setDocuments(Array.from(e.target.files || []))}
                className="mt-1 block w-full text-xs text-slate-500"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-surface-100">
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="btn-secondary rounded-xl px-4 py-2 text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy}
                className="btn-primary rounded-xl px-5 py-2 text-sm font-semibold disabled:opacity-60"
              >
                {busy ? 'Saving...' : modalMode === 'edit' ? 'Update Plot' : 'Create Plot'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {modalMode === 'details' && activePlot && (
        <Modal title={`Plot Details: #${activePlot.plotNumber}`} onClose={() => setModalMode(null)}>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between items-center pb-3 border-b border-surface-100">
              <span className="text-slate-500 font-medium">Status</span>
              <StatusBadge status={activePlot.status} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-slate-400 block font-medium">Project</span>
                <span className="font-display font-bold text-slate-900">{activePlot.projectId}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">Location</span>
                <span className="font-display font-bold text-slate-900">{activePlot.location}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">Survey Number</span>
                <span className="font-display font-bold text-slate-900">{activePlot.surveyNumber}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">Facing / Road</span>
                <span className="font-display font-bold text-slate-900">
                  {activePlot.facing || 'East'} / {activePlot.roadWidth || 30}ft
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">Area</span>
                <span className="font-display font-bold text-slate-900">
                  {activePlot.areaSqft.toLocaleString()} sq.ft
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">Total Price</span>
                <span className="font-display font-bold text-primary-600 text-base">
                  ₹{activePlot.totalAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
            {activePlot.description && (
              <div className="pt-3 border-t border-surface-100">
                <span className="text-xs text-slate-400 block font-medium">Description</span>
                <p className="mt-1 text-slate-700">{activePlot.description}</p>
              </div>
            )}
            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="btn-secondary rounded-xl px-4 py-2 text-sm font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
export default Plots