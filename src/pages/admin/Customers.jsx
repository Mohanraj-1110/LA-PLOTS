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

  const [modalMode, setModalMode] = useState(null) // 'new' | 'edit' | 'details'
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
    <>
      <PageHeader
        title="Customers & Leads"
        description={`${customers ? customers.length : 0} buyer records in database.`}
        action={
          <button
            type="button"
            onClick={openNewModal}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-green-600 px-4 text-sm font-semibold text-white hover:bg-green-700 transition shadow-sm"
          >
            <Plus size={18} />
            Add Customer
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
            placeholder="Search by customer name, phone, or interested project..."
            value={search}
            onChange={setSearch}
          />
        </div>
      </div>

      {/* Status Tabs */}
      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {leadStatuses.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setStatusFilter(item)}
            className={`min-h-10 whitespace-nowrap rounded-xl px-4 text-xs font-bold uppercase tracking-wider transition ${
              statusFilter === item
                ? 'bg-green-100 text-green-800'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {item}{' '}
            <span className="ml-1 rounded-full bg-white/70 px-1.5 py-0.5 text-[10px] text-slate-700">
              {item === 'all'
                ? customers?.length || 0
                : customers?.filter((c) => c.status === item).length || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Customers Table */}
      {customers === null ? (
        <div className="mt-6 h-64 animate-pulse rounded-2xl bg-slate-200" />
      ) : filteredCustomers.length > 0 ? (
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Contact</th>
                  <th className="px-5 py-3.5">Budget</th>
                  <th className="px-5 py-3.5">Interest</th>
                  <th className="px-5 py-3.5">Lead Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-4 font-bold text-slate-900">{c.name}</td>
                    <td className="px-5 py-4">
                      <span className="text-slate-900 font-medium">{c.phone}</span>
                      <span className="block text-xs text-slate-400">{c.email || 'No email'}</span>
                    </td>
                    <td className="px-5 py-4 font-semibold text-green-700">
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
                          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                        >
                          <Eye size={17} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(c)}
                          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                        >
                          <Pencil size={17} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(c)}
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
            title="No customers found"
            description="Adjust your search filters or record a new customer lead."
          />
        </div>
      )}

      {/* Modal: New / Edit */}
      {(modalMode === 'new' || modalMode === 'edit') && (
        <Modal
          title={modalMode === 'edit' ? `Edit Customer: ${activeCustomer?.name}` : 'Add New Customer'}
          onClose={() => setModalMode(null)}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-600">Full Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Sundar Pichai"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm outline-none focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+91 9876543210"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm outline-none focus:border-green-500"
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-600">Email Address</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="sundar@example.com"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm outline-none focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600">Budget (INR)</label>
                <input
                  type="number"
                  value={form.budget}
                  onChange={(e) => setForm({ ...form, budget: e.target.value })}
                  placeholder="3000000"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm outline-none focus:border-green-500"
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-600">Interested Project</label>
                <input
                  type="text"
                  value={form.interestedProjectId}
                  onChange={(e) => setForm({ ...form, interestedProjectId: e.target.value })}
                  placeholder="Green Meadows"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm outline-none focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm outline-none focus:border-green-500"
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
              <label className="block text-xs font-semibold text-slate-600">Next Follow-up Date</label>
              <input
                type="date"
                value={form.nextFollowupDate}
                onChange={(e) => setForm({ ...form, nextFollowupDate: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm outline-none focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600">Notes & Preference</label>
              <textarea
                rows={3}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Requested a weekend site visit with family..."
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
                {busy ? 'Saving...' : modalMode === 'edit' ? 'Update Customer' : 'Save Customer'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Details */}
      {modalMode === 'details' && activeCustomer && (
        <Modal title={`Customer: ${activeCustomer.name}`} onClose={() => setModalMode(null)}>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <span className="text-slate-500">Lead Status</span>
              <StatusBadge status={activeCustomer.status} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-slate-400 block">Phone</span>
                <span className="font-bold text-slate-900">{activeCustomer.phone}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Email</span>
                <span className="font-bold text-slate-900">{activeCustomer.email || 'N/A'}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Budget</span>
                <span className="font-bold text-green-700">
                  ₹{(Number(activeCustomer.budget) || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Interested Project</span>
                <span className="font-bold text-slate-900">
                  {activeCustomer.interestedProjectId || 'Any'}
                </span>
              </div>
            </div>
            {activeCustomer.notes && (
              <div className="pt-3 border-t border-slate-100">
                <span className="text-xs text-slate-400 block">Notes</span>
                <p className="mt-1 text-slate-700">{activeCustomer.notes}</p>
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
export default Customers
