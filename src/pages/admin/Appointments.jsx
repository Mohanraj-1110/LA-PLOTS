import React, { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CalendarDays, Clock, Eye, Pencil, Plus, Trash2 } from 'lucide-react'
import { PageHeader } from '../../components/common/PageHeader'
import { SearchBar } from '../../components/common/SearchBar'
import { StatusBadge } from '../../components/common/StatusBadge'
import { EmptyState } from '../../components/common/EmptyState'
import { Modal } from '../../components/common/Modal'
import {
  appointmentTypes,
  createAppointment,
  deleteAppointment,
  subscribeToAppointments,
  updateAppointment,
} from '../../services/appointments'

const initialForm = {
  customerId: '',
  plotId: '',
  type: 'site visit',
  date: new Date().toISOString().slice(0, 10),
  time: '10:00 AM',
  status: 'Upcoming',
  notes: '',
}

export function Appointments() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [appointments, setAppointments] = useState(null)
  const [search, setSearch] = useState('')
  const [filterTab, setFilterTab] = useState('all')
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState(null)

  const [modalMode, setModalMode] = useState(null)
  const [activeItem, setActiveItem] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const unsub = subscribeToAppointments(
      (data) => setAppointments(data),
      () => setError('Appointments could not be loaded.')
    )
    return () => unsub()
  }, [])

  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      openNewModal()
      setSearchParams({})
    }
  }, [searchParams, setSearchParams])

  const filteredAppointments = useMemo(() => {
    if (!appointments) return []
    return appointments.filter((app) => {
      const q = search.toLowerCase()
      const matchesSearch = [app.type, app.customerId, app.plotId, app.notes].some((v) =>
        String(v || '').toLowerCase().includes(q)
      )
      const matchesTab = filterTab === 'all' || app.status === filterTab
      return matchesSearch && matchesTab
    })
  }, [appointments, search, filterTab])

  function openNewModal() {
    setForm(initialForm)
    setActiveItem(null)
    setModalMode('new')
  }

  function openEditModal(app) {
    setActiveItem(app)
    setForm({
      customerId: app.customerId || '',
      plotId: app.plotId || '',
      type: app.type || 'site visit',
      date: app.date?.toDate?.() ? app.date.toDate().toISOString().slice(0, 10) : '',
      time: app.time || '10:00 AM',
      status: app.status || 'Upcoming',
      notes: app.notes || '',
    })
    setModalMode('edit')
  }

  function openDetailsModal(app) {
    setActiveItem(app)
    setModalMode('details')
  }

  async function handleDelete(app) {
    if (!window.confirm(`Delete this appointment?`)) return
    try {
      await deleteAppointment(app.id)
      setNotice('Appointment deleted.')
      setTimeout(() => setNotice(null), 3000)
    } catch {
      setError('Could not delete appointment.')
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      if (modalMode === 'edit' && activeItem) {
        await updateAppointment(activeItem.id, form)
        setNotice('Appointment updated!')
      } else {
        await createAppointment(form)
        setNotice('Appointment scheduled!')
      }
      setTimeout(() => setNotice(null), 3000)
      setModalMode(null)
    } catch (err) {
      setError(err?.message || 'Failed to save appointment.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page-enter">
      <PageHeader
        title="Appointments & Visits"
        description="Schedule site visits, buyer meetings, and registration follow-ups."
        action={
          <button
            type="button"
            onClick={openNewModal}
            className="btn-primary inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-semibold"
          >
            <Plus size={18} />
            Schedule Visit
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
            placeholder="Search appointments by customer or notes..."
            value={search}
            onChange={setSearch}
          />
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        {['all', 'Upcoming', 'Completed'].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilterTab(tab)}
            className={`min-h-10 rounded-xl px-4 text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
              filterTab === tab
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-glow'
                : 'bg-white text-slate-600 hover:bg-surface-50 border border-surface-200 shadow-card'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {appointments === null ? (
        <div className="mt-6 h-64 animate-pulse rounded-2xl bg-surface-100" />
      ) : filteredAppointments.length > 0 ? (
        <div className="mt-6 overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-surface-200 bg-surface-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3.5 font-bold">Type & Status</th>
                  <th className="px-5 py-3.5 font-bold">Customer / Target Plot</th>
                  <th className="px-5 py-3.5 font-bold">Date & Time</th>
                  <th className="px-5 py-3.5 font-bold">Notes</th>
                  <th className="px-5 py-3.5 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {filteredAppointments.map((app) => (
                  <tr key={app.id} className="group transition-colors hover:bg-gradient-to-r hover:from-primary-50/50 hover:to-transparent">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-glow">
                          <CalendarDays size={18} />
                        </div>
                        <div>
                          <span className="font-display font-bold text-slate-900 capitalize block">{app.type}</span>
                          <StatusBadge status={app.status || 'Upcoming'} />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-medium text-slate-800 block">
                        Customer: {app.customerId || 'General Visitor'}
                      </span>
                      <span className="text-xs text-slate-400">Plot: {app.plotId || 'Any'}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-slate-900 font-medium block">
                        {app.date?.toDate?.().toLocaleDateString('en-IN') || 'Date pending'}
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock size={12} /> {app.time || '10:00 AM'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-600 text-xs max-w-xs truncate">
                      {app.notes || '—'}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openDetailsModal(app)}
                          className="rounded-xl p-2 text-slate-400 transition-all hover:bg-surface-100 hover:text-slate-700"
                        >
                          <Eye size={17} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(app)}
                          className="rounded-xl p-2 text-slate-400 transition-all hover:bg-primary-50 hover:text-primary-600"
                        >
                          <Pencil size={17} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(app)}
                          className="rounded-xl p-2 text-slate-400 transition-all hover:bg-red-50 hover:text-red-600"
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
            title="No appointments found"
            description="Adjust your search or schedule a new site visit."
          />
        </div>
      )}

      {(modalMode === 'new' || modalMode === 'edit') && (
        <Modal
          title={modalMode === 'edit' ? 'Edit Appointment' : 'Schedule Appointment'}
          onClose={() => setModalMode(null)}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="input-modern mt-1 w-full capitalize"
                >
                  {appointmentTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="input-modern mt-1 w-full"
                >
                  <option value="Upcoming">Upcoming</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Customer ID / Name</label>
                <input
                  type="text"
                  required
                  value={form.customerId}
                  onChange={(e) => setForm({ ...form, customerId: e.target.value })}
                  placeholder="e.g. Anand"
                  className="input-modern mt-1 w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Plot Number / ID</label>
                <input
                  type="text"
                  value={form.plotId}
                  onChange={(e) => setForm({ ...form, plotId: e.target.value })}
                  placeholder="e.g. A-102"
                  className="input-modern mt-1 w-full"
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Date *</label>
                <input
                  type="date"
                  required
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="input-modern mt-1 w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Time *</label>
                <input
                  type="text"
                  required
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  placeholder="10:30 AM"
                  className="input-modern mt-1 w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Notes & Instructions</label>
              <textarea
                rows={3}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Pick up customer from airport / office at 10 AM..."
                className="input-modern mt-1 w-full resize-none"
              />
            </div>

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
                {busy ? 'Saving...' : modalMode === 'edit' ? 'Update Visit' : 'Schedule Visit'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {modalMode === 'details' && activeItem && (
        <Modal title={`Appointment Details`} onClose={() => setModalMode(null)}>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between items-center pb-3 border-b border-surface-100">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-glow">
                  <CalendarDays size={18} />
                </div>
                <span className="font-display font-bold text-slate-900 capitalize">{activeItem.type}</span>
              </div>
              <StatusBadge status={activeItem.status || 'Upcoming'} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-slate-400 block font-medium">Customer</span>
                <span className="font-display font-bold text-slate-900">{activeItem.customerId}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">Plot</span>
                <span className="font-display font-bold text-slate-900">{activeItem.plotId || 'Any'}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">Date</span>
                <span className="font-display font-bold text-slate-900">
                  {activeItem.date?.toDate?.().toLocaleDateString('en-IN') || 'Date pending'}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">Time</span>
                <span className="font-display font-bold text-slate-900">{activeItem.time}</span>
              </div>
            </div>
            {activeItem.notes && (
              <div className="pt-3 border-t border-surface-100">
                <span className="text-xs text-slate-400 block font-medium">Notes</span>
                <p className="mt-1 text-slate-700">{activeItem.notes}</p>
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
export default Appointments