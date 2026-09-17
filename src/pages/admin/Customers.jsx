import React, { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react'
import { PageHeader } from '../../components/common/PageHeader'
import { SearchBar } from '../../components/common/SearchBar'
import { StatusBadge } from '../../components/common/StatusBadge'
import { EmptyState } from '../../components/common/EmptyState'
import { Modal } from '../../components/common/Modal'
import {
  createCustomer,
  deleteCustomer,
  subscribeToCustomers,
  updateCustomer,
} from '../../services/customers'

const leadStatuses = ['all', 'New', 'Contacted', 'Interested', 'Site Visit Done', 'Converted', 'Lost']

const initialForm = {
  name: '',
  phone: '',
  email: '',
  address: '',
  budget: '',
  interestedProjectId: '',
  interestedPlotId: '',
  status: 'New',
  nextFollowupDate: '',
  notes: '',
  assignedAgentId: '',
}

export function Customers() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [customers, setCustomers] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState(null)

  const [modalMode, setModalMode] = useState(null)
  const [activeCustomer, setActiveCustomer] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const unsub = subscribeToCustomers(
      (data) => setCustomers(data),
      () => setError('Customers could not be loaded. Check Firebase connection.')
    )
    return () => unsub()
  }, [])

  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      openNewModal()
      setSearchParams({})
    }
  }, [searchParams, setSearchParams])

  const filteredCustomers = useMemo(() => {
    if (!customers) return []
    return customers.filter((c) => {
      const q = search.toLowerCase()
      const matches = [c.name, c.phone, c.email, c.interestedProjectId].some((v) =>
        String(v || '').toLowerCase().includes(q)
      )
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter
      return matches && matchesStatus
    })
  }, [customers, search, statusFilter])

  function openNewModal() {
    setForm(initialForm)
    setActiveCustomer(null)
    setModalMode('new')
  }

  function openEditModal(c) {
    setActiveCustomer(c)
    setForm({
      name: c.name || '',
      phone: c.phone || '',
      email: c.email || '',
      address: c.address || '',
      budget: c.budget || '',
      interestedProjectId: c.interestedProjectId || '',
      interestedPlotId: c.interestedPlotId || '',
      status: c.status || 'New',
      nextFollowupDate: c.nextFollowupDate?.toDate?.()
        ? c.nextFollowupDate.toDate().toISOString().slice(0, 10)
        : '',
      notes: c.notes || '',
      assignedAgentId: c.assignedAgentId || '',
    })
    setModalMode('edit')
  }

  function openDetailsModal(c) {
    setActiveCustomer(c)
    setModalMode('details')
  }

  async function handleDelete(c) {
    if (!window.confirm(`Delete customer ${c.name}?`)) return
    try {
      await deleteCustomer(c.id)
      setNotice('Customer deleted.')
      setTimeout(() => setNotice(null), 3000)
    } catch {
      setError('Could not delete customer.')
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const input = {
        ...form,
        budget: Number(form.budget) || 0,
      }
      if (modalMode === 'edit' && activeCustomer) {
        await updateCustomer(activeCustomer.id, input)
        setNotice('Customer updated successfully!')
      } else {
        await createCustomer(input)
        setNotice('Customer added successfully!')
      }
      setTimeout(() => setNotice(null), 3000)
      setModalMode(null)
    } catch (err) {
      setError(err?.message || 'Failed to save customer.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page-enter">
      <PageHeader
        title="Customers & Leads"
        description={`${customers ? customers.length : 0} buyer records in database.`}
        action={
          <button
            type="button"
            onClick={openNewModal}
            className="btn-primary inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-semibold"
          >
            <Plus size={18} />
            Add Customer
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
            placeholder="Search by customer name, phone, or interested project..."
            value={search}
            onChange={setSearch}
          />
        </div>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {leadStatuses.map((item) => (
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
                ? customers?.length || 0
                : customers?.filter((c) => c.status === item).length || 0}
            </span>
          </button>
        ))}
      </div>

      {customers === null ? (
        <div className="mt-6 h-64 animate-pulse rounded-2xl bg-surface-100" />
      ) : filteredCustomers.length > 0 ? (
        <div className="mt-6 overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-surface-200 bg-surface-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3.5 font-bold">Customer</th>
                  <th className="px-5 py-3.5 font-bold">Contact</th>
                  <th className="px-5 py-3.5 font-bold">Budget</th>
                  <th className="px-5 py-3.5 font-bold">Interest</th>
                  <th className="px-5 py-3.5 font-bold">Lead Status</th>
                  <th className="px-5 py-3.5 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {filteredCustomers.map((c) => (
                  <tr key={c.id} className="group transition-colors hover:bg-gradient-to-r hover:from-primary-50/50 hover:to-transparent">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-sm font-bold text-white shadow-glow">
                          {c.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <span className="font-display font-bold text-slate-900">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-slate-900 font-medium">{c.phone}</span>
                      <span className="block text-xs text-slate-400">{c.email || 'No email'}</span>
                    </td>
                    <td className="px-5 py-4 font-semibold text-primary-600">
                      ₹{(Number(c.budget) || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      {c.interestedProjectId || 'Any'}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openDetailsModal(c)}
                          className="rounded-xl p-2 text-slate-400 transition-all hover:bg-surface-100 hover:text-slate-700"
                        >
                          <Eye size={17} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(c)}
                          className="rounded-xl p-2 text-slate-400 transition-all hover:bg-primary-50 hover:text-primary-600"
                        >
                          <Pencil size={17} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(c)}
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
            title="No customers found"
            description="Adjust your search filters or record a new customer lead."
          />
        </div>
      )}

      {(modalMode === 'new' || modalMode === 'edit') && (
        <Modal
          title={modalMode === 'edit' ? `Edit Customer: ${activeCustomer?.name}` : 'Add New Customer'}
          onClose={() => setModalMode(null)}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Full Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Sundar Pichai"
                  className="input-modern mt-1 w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+91 9876543210"
                  className="input-modern mt-1 w-full"
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Email Address</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="sundar@example.com"
                  className="input-modern mt-1 w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Budget (INR)</label>
                <input
                  type="number"
                  value={form.budget}
                  onChange={(e) => setForm({ ...form, budget: e.target.value })}
                  placeholder="3000000"
                  className="input-modern mt-1 w-full"
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Interested Project</label>
                <input
                  type="text"
                  value={form.interestedProjectId}
                  onChange={(e) => setForm({ ...form, interestedProjectId: e.target.value })}
                  placeholder="Green Meadows"
                  className="input-modern mt-1 w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="input-modern mt-1 w-full"
                >
                  {leadStatuses.filter((s) => s !== 'all').map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Next Follow-up Date</label>
              <input
                type="date"
                value={form.nextFollowupDate}
                onChange={(e) => setForm({ ...form, nextFollowupDate: e.target.value })}
                className="input-modern mt-1 w-full"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Notes & Preference</label>
              <textarea
                rows={3}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Requested a weekend site visit with family..."
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
                {busy ? 'Saving...' : modalMode === 'edit' ? 'Update Customer' : 'Save Customer'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {modalMode === 'details' && activeCustomer && (
        <Modal title={`Customer: ${activeCustomer.name}`} onClose={() => setModalMode(null)}>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between items-center pb-3 border-b border-surface-100">
              <span className="text-slate-500 font-medium">Lead Status</span>
              <StatusBadge status={activeCustomer.status} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-slate-400 block font-medium">Phone</span>
                <span className="font-display font-bold text-slate-900">{activeCustomer.phone}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">Email</span>
                <span className="font-display font-bold text-slate-900">{activeCustomer.email || 'N/A'}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">Budget</span>
                <span className="font-display font-bold text-primary-600">
                  ₹{(Number(activeCustomer.budget) || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">Interested Project</span>
                <span className="font-display font-bold text-slate-900">
                  {activeCustomer.interestedProjectId || 'Any'}
                </span>
              </div>
            </div>
            {activeCustomer.notes && (
              <div className="pt-3 border-t border-surface-100">
                <span className="text-xs text-slate-400 block font-medium">Notes</span>
                <p className="mt-1 text-slate-700">{activeCustomer.notes}</p>
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
export default Customers