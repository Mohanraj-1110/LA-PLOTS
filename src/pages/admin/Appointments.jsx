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
  const [filterTab, setFilterTab] = useState('all') // 'all' | 'Upcoming' | 'Completed'
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState(null)

  const [modalMode, setModalMode] = useState(null) // 'new' | 'edit' | 'details'
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
    <>
      <PageHeader
        title="Appointments & Visits"
        description="Schedule site visits, buyer meetings, and registration follow-ups."
        action={
          <button
            type="button"
            onClick={openNewModal}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-green-600 px-4 text-sm font-semibold text-white hover:bg-green-700 transition shadow-sm"
          >
            <Plus size={18} />
            Schedule Visit
          </button>
        }
      />

      {notice && (
        <div className="mb-4 rounded-xl bg-green-50 p-4 text-sm text-green-800 border border-green-200">
          {notice}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 p-4 text-sm text-red-700 border border-red-200">
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

      {/* Tabs */}
      <div className="mt-4 flex gap-2">
        {['all', 'Upcoming', 'Completed'].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilterTab(tab)}
            className={`min-h-10 rounded-xl px-4 text-xs font-bold uppercase tracking-wider transition ${
              filterTab === tab
                ? 'bg-green-100 text-green-800'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* List / Table */}
      {appointments === null ? (
        <div className="mt-6 h-64 animate-pulse rounded-2xl bg-slate-200" />
      ) : filteredAppointments.length > 0 ? (
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Type & Status</th>
                  <th className="px-5 py-3.5">Customer / Target Plot</th>
                  <th className="px-5 py-3.5">Date & Time</th>
                  <th className="px-5 py-3.5">Notes</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAppointments.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-4">
                      <span className="font-bold text-slate-900 capitalize block">{app.type}</span>
                      <StatusBadge status={app.status || 'Upcoming'} />
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
                          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                        >
                          <Eye size={17} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(app)}
                          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                        >
                          <Pencil size={17} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(app)}
                          className="rounded-lg p-2 text-red-500 hover:bg-red-50"
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

      {/* Modal: New / Edit */}
      {(modalMode === 'new' || modalMode === 'edit') && (
        <Modal
          title={modalMode === 'edit' ? 'Edit Appointment' : 'Schedule Appointment'}
          onClose={() => setModalMode(null)}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-600">Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm outline-none focus:border-green-500 capitalize"
                >
                  {appointmentTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm outline-none focus:border-green-500"
                >
                  <option value="Upcoming">Upcoming</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-600">Customer ID / Name</label>
                <input
                  type="text"
                  required
                  value={form.customerId}
                  onChange={(e) => setForm({ ...form, customerId: e.target.value })}
                  placeholder="e.g. Anand"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm outline-none focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600">Plot Number / ID</label>
                <input
                  type="text"
                  value={form.plotId}
                  onChange={(e) => setForm({ ...form, plotId: e.target.value })}
                  placeholder="e.g. A-102"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm outline-none focus:border-green-500"
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-600">Date *</label>
                <input
                  type="date"
                  required
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm outline-none focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600">Time *</label>
                <input
                  type="text"
                  required
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  placeholder="10:30 AM"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm outline-none focus:border-green-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600">Notes & Instructions</label>
              <textarea
                rows={3}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Pick up customer from airport / office at 10 AM..."
                className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm outline-none focus:border-green-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy}
                className="rounded-xl bg-green-600 px-5 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
              >
                {busy ? 'Saving...' : modalMode === 'edit' ? 'Update Visit' : 'Schedule Visit'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Details */}
      {modalMode === 'details' && activeItem && (
        <Modal title={`Appointment Details`} onClose={() => setModalMode(null)}>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <span className="font-bold capitalize text-slate-900">{activeItem.type}</span>
              <StatusBadge status={activeItem.status || 'Upcoming'} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-slate-400 block">Customer</span>
                <span className="font-bold text-slate-900">{activeItem.customerId}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Plot</span>
                <span className="font-bold text-slate-900">{activeItem.plotId || 'Any'}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Date</span>
                <span className="font-bold text-slate-900">
                  {activeItem.date?.toDate?.().toLocaleDateString('en-IN') || 'Date pending'}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Time</span>
                <span className="font-bold text-slate-900">{activeItem.time}</span>
              </div>
            </div>
            {activeItem.notes && (
              <div className="pt-3 border-t border-slate-100">
                <span className="text-xs text-slate-400 block">Notes</span>
                <p className="mt-1 text-slate-700">{activeItem.notes}</p>
              </div>
            )}
            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}
export default Appointments
