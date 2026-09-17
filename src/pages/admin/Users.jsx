import React, { useEffect, useMemo, useState } from 'react'
import {
  Briefcase,
  CheckCircle2,
  MoreVertical,
  Pencil,
  Plus,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserPlus,
  UserRound,
  Users as UsersIcon,
  X,
} from 'lucide-react'
import { PageHeader } from '../../components/common/PageHeader'
import { StatCard } from '../../components/common/StatCard'
import { SearchBar } from '../../components/common/SearchBar'
import { EmptyState } from '../../components/common/EmptyState'
import { LoadingState } from '../../components/common/LoadingState'
import { Modal } from '../../components/common/Modal'
import { Toast } from '../../components/common/Toast'
import { useAuth } from '../../context/AuthContext'
import {
  changeUserRole,
  createUserDoc,
  deleteUserDoc,
  inviteAgent,
  saveProfile,
  subscribeToUsers,
} from '../../services/users'

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { value: 'agent', label: 'Agent', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'customer', label: 'Customer', color: 'bg-green-50 text-green-700 border-green-200' },
]

export function Users() {
  const { firebaseUser, refreshProfile } = useAuth()
  const [users, setUsers] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all') // 'all' | 'admin' | 'agent' | 'customer'
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState(null)

  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editUser, setEditUser] = useState(null)
  const [deleteUser, setDeleteUser] = useState(null)
  const [busy, setBusy] = useState(false)

  // Add User Form
  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'customer',
    temporaryPassword: '',
  })

  // Edit User Form
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    role: 'customer',
  })

  useEffect(() => {
    const unsub = subscribeToUsers(
      (data) => {
        setUsers(data)
        setLoading(false)
      },
      (err) => {
        console.warn('[Users] Subscribe notice:', err?.message)
        setError('Could not subscribe to users list in real-time.')
        setLoading(false)
      }
    )
    return () => unsub()
  }, [])

  // KPI Calculations
  const stats = useMemo(() => {
    if (!users) return { total: 0, admins: 0, agents: 0, customers: 0 }
    return {
      total: users.length,
      admins: users.filter((u) => u.role === 'admin').length,
      agents: users.filter((u) => u.role === 'agent').length,
      customers: users.filter((u) => !u.role || u.role === 'customer').length,
    }
  }, [users])

  // Filtered list
  const filteredUsers = useMemo(() => {
    if (!users) return []
    return users.filter((u) => {
      const q = search.toLowerCase().trim()
      const matchesSearch =
        !q ||
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.phone && u.phone.includes(q))

      const userRole = u.role || 'customer'
      const matchesRole = roleFilter === 'all' || userRole === roleFilter

      return matchesSearch && matchesRole
    })
  }, [users, search, roleFilter])

  // Quick Role Change Handler
  async function handleRoleChange(uid, nextRole) {
    try {
      // Optimistic instant UI update
      setUsers((prev) => (prev ? prev.map((u) => (u.uid === uid ? { ...u, role: nextRole } : u)) : prev))
      await changeUserRole(uid, nextRole)
      if (uid === firebaseUser?.uid) {
        await refreshProfile()
      }
      setNotice(`User role successfully changed to ${nextRole.toUpperCase()}`)
      setTimeout(() => setNotice(null), 3500)
    } catch (err) {
      setError(`Failed to update role: ${err?.message || 'Permission denied.'}`)
      setTimeout(() => setError(null), 4000)
    }
  }

  // Handle Add / Invite User Submit
  async function handleAddSubmit(e) {
    e.preventDefault()
    if (!addForm.name.trim() || !addForm.email.trim()) return

    setBusy(true)
    setError(null)
    try {
      let createdUser = null
      // If temporaryPassword provided and role is agent, try Cloud Function inviteAgent
      if (addForm.temporaryPassword && addForm.role === 'agent') {
        try {
          await inviteAgent(addForm.name, addForm.email, addForm.temporaryPassword)
        } catch {
          createdUser = await createUserDoc(addForm)
        }
      } else {
        createdUser = await createUserDoc(addForm)
      }

      if (createdUser) {
        setUsers((prev) => (prev ? [createdUser, ...prev] : [createdUser]))
      }

      setAddModalOpen(false)
      setAddForm({ name: '', email: '', phone: '', role: 'customer', temporaryPassword: '' })
      setNotice('User account created and role assigned successfully.')
      setTimeout(() => setNotice(null), 3500)
    } catch (err) {
      setError(`Failed to create user: ${err?.message || 'Database error.'}`)
    } finally {
      setBusy(false)
    }
  }

  // Handle Edit User Submit
  async function handleEditSubmit(e) {
    e.preventDefault()
    if (!editUser) return

    setBusy(true)
    setError(null)
    try {
      const updatedFields = {
        name: editForm.name.trim(),
        phone: editForm.phone.trim(),
        role: editForm.role,
      }
      await saveProfile(editUser.uid, updatedFields)

      setUsers((prev) =>
        prev
          ? prev.map((u) => (u.uid === editUser.uid ? { ...u, ...updatedFields } : u))
          : prev
      )

      if (editUser.uid === firebaseUser?.uid) {
        await refreshProfile()
      }

      setEditUser(null)
      setNotice('User profile updated successfully.')
      setTimeout(() => setNotice(null), 3500)
    } catch (err) {
      setError(`Failed to save changes: ${err?.message || 'Database error.'}`)
    } finally {
      setBusy(false)
    }
  }

  // Handle Delete User Submit
  async function handleDeleteSubmit() {
    if (!deleteUser) return
    if (deleteUser.uid === firebaseUser?.uid) {
      setError('You cannot delete your own active administrator account.')
      setDeleteUser(null)
      return
    }

    setBusy(true)
    setError(null)
    try {
      await deleteUserDoc(deleteUser.uid)
      setUsers((prev) => (prev ? prev.filter((u) => u.uid !== deleteUser.uid) : prev))
      setDeleteUser(null)
      setNotice('User record removed from platform.')
      setTimeout(() => setNotice(null), 3500)
    } catch (err) {
      setError(`Failed to delete user: ${err?.message || 'Permission denied.'}`)
    } finally {
      setBusy(false)
    }
  }

  function getInitials(name) {
    if (!name) return 'U'
    const parts = name.trim().split(' ')
    return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0][0].toUpperCase()
  }

  return (
    <div className="space-y-6">
      {notice && <Toast message={notice} variant="success" onClose={() => setNotice(null)} />}
      {error && <Toast message={error} variant="error" onClose={() => setError(null)} />}

      {/* Page Header */}
      <PageHeader
        title="Users & Roles"
        description="View platform users, assign administrator and agent privileges, and manage account permissions."
        action={
          <button
            type="button"
            onClick={() => setAddModalOpen(true)}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-green-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-green-700 transition"
          >
            <UserPlus size={18} />
            <span>Add / Invite User</span>
          </button>
        }
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard title="Total Users" value={stats.total} icon={UsersIcon} />
        <StatCard title="Administrators" value={stats.admins} icon={ShieldAlert} />
        <StatCard title="Agents" value={stats.agents} icon={Briefcase} />
        <StatCard title="Customers" value={stats.customers} icon={UserRound} />
      </div>

      {/* Filters and Controls */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:max-w-xs">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search by name, email, phone..."
          />
        </div>

        {/* Role Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-3 sm:border-0 sm:pt-0">
          {[
            { id: 'all', label: `All (${stats.total})` },
            { id: 'admin', label: `Admins (${stats.admins})` },
            { id: 'agent', label: `Agents (${stats.agents})` },
            { id: 'customer', label: `Customers (${stats.customers})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setRoleFilter(tab.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                roleFilter === tab.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Users Data List */}
      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12">
          <LoadingState message="Loading users directory..." />
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8">
          <EmptyState
            title="No users match your criteria"
            description={
              search
                ? `No user matching "${search}" was found.`
                : 'No registered user accounts found in this role.'
            }
            action={
              search ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('')
                    setRoleFilter('all')
                  }}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Clear Filters
                </button>
              ) : null
            }
          />
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Current Role</th>
                  <th className="px-6 py-4">Change Role</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => {
                  const isCurrent = u.uid === firebaseUser?.uid
                  const currentRole = u.role || 'customer'
                  const roleConfig =
                    ROLE_OPTIONS.find((r) => r.value === currentRole) || ROLE_OPTIONS[2]

                  return (
                    <tr key={u.uid} className="hover:bg-slate-50/75 transition">
                      {/* User Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {u.photoURL ? (
                            <img
                              src={u.photoURL}
                              alt=""
                              className="size-10 rounded-full object-cover border border-slate-200"
                            />
                          ) : (
                            <div className="flex size-10 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-700 border border-slate-200 text-xs">
                              {getInitials(u.name)}
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-900">{u.name || 'User'}</span>
                              {isCurrent && (
                                <span className="rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-bold text-green-800">
                                  YOU
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500">{u.email || 'No email'}</p>
                          </div>
                        </div>
                      </td>

                      {/* Contact Details */}
                      <td className="px-6 py-4 text-xs text-slate-600">
                        <p>{u.phone || 'No phone number'}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {u.createdAt?.seconds
                            ? `Joined ${new Date(u.createdAt.seconds * 1000).toLocaleDateString()}`
                            : 'Active User'}
                        </p>
                      </td>

                      {/* Current Role Badge */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold capitalize ${roleConfig.color}`}
                        >
                          {currentRole === 'admin' ? (
                            <ShieldCheck size={13} />
                          ) : currentRole === 'agent' ? (
                            <Briefcase size={13} />
                          ) : (
                            <UserRound size={13} />
                          )}
                          {roleConfig.label}
                        </span>
                      </td>

                      {/* Role Selector Control */}
                      <td className="px-6 py-4">
                        <select
                          value={currentRole}
                          onChange={(e) => handleRoleChange(u.uid, e.target.value)}
                          className="min-h-9 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-800 shadow-sm outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 cursor-pointer"
                        >
                          <option value="admin">Admin (Full Control)</option>
                          <option value="agent">Agent (Workspace Access)</option>
                          <option value="customer">Customer (Public Portal)</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            title="Edit User"
                            onClick={() => {
                              setEditUser(u)
                              setEditForm({
                                name: u.name || '',
                                phone: u.phone || '',
                                role: currentRole,
                              })
                            }}
                            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            type="button"
                            title={isCurrent ? 'Cannot delete own account' : 'Delete User'}
                            disabled={isCurrent}
                            onClick={() => setDeleteUser(u)}
                            className="rounded-lg p-2 text-red-500 hover:bg-red-50 hover:text-red-700 transition disabled:opacity-30 disabled:hover:bg-transparent"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View */}
          <div className="divide-y divide-slate-100 md:hidden">
            {filteredUsers.map((u) => {
              const isCurrent = u.uid === firebaseUser?.uid
              const currentRole = u.role || 'customer'
              const roleConfig =
                ROLE_OPTIONS.find((r) => r.value === currentRole) || ROLE_OPTIONS[2]

              return (
                <div key={u.uid} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-700 text-xs border border-slate-200">
                        {getInitials(u.name)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-900">{u.name || 'User'}</span>
                          {isCurrent && (
                            <span className="rounded bg-green-100 px-1.5 py-0.2 text-[9px] font-bold text-green-800">
                              YOU
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">{u.email}</p>
                      </div>
                    </div>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${roleConfig.color}`}
                    >
                      {roleConfig.label}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                    <span>{u.phone || 'No phone'}</span>
                    <div className="flex items-center gap-2">
                      <select
                        value={currentRole}
                        onChange={(e) => handleRoleChange(u.uid, e.target.value)}
                        className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-800"
                      >
                        <option value="admin">Admin</option>
                        <option value="agent">Agent</option>
                        <option value="customer">Customer</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => {
                          setEditUser(u)
                          setEditForm({
                            name: u.name || '',
                            phone: u.phone || '',
                            role: currentRole,
                          })
                        }}
                        className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100"
                      >
                        <Pencil size={15} />
                      </button>

                      <button
                        type="button"
                        disabled={isCurrent}
                        onClick={() => setDeleteUser(u)}
                        className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 disabled:opacity-30"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* MODAL 1: Add New User */}
      {addModalOpen && (
        <Modal
          onClose={() => !busy && setAddModalOpen(false)}
          title="Add or Invite User"
        >
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Full Name</label>
              <input
                required
                type="text"
                placeholder="e.g. Ramesh Kumar"
                value={addForm.name}
                onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Email Address</label>
              <input
                required
                type="email"
                placeholder="e.g. ramesh@example.com"
                value={addForm.email}
                onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Phone Number (Optional)</label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={addForm.phone}
                onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Assign Role</label>
              <div className="grid grid-cols-3 gap-2">
                {ROLE_OPTIONS.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setAddForm({ ...addForm, role: r.value })}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border transition ${
                      addForm.role === r.value
                        ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {addForm.role === 'admin'
                  ? 'Full system access to all management modules and user settings.'
                  : addForm.role === 'agent'
                  ? 'Access to plots, customers, visits, and follow-ups.'
                  : 'Regular customer portal access for browsing plots and booking visits.'}
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                disabled={busy}
                onClick={() => setAddModalOpen(false)}
                className="min-h-11 rounded-xl border border-slate-300 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy}
                className="min-h-11 rounded-xl bg-green-600 px-5 text-sm font-semibold text-white hover:bg-green-700 transition disabled:opacity-60"
              >
                {busy ? 'Saving...' : 'Add User'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 2: Edit User Profile */}
      {editUser && (
        <Modal
          onClose={() => !busy && setEditUser(null)}
          title="Edit User Details"
        >
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">User Email</label>
              <input
                disabled
                type="text"
                value={editUser?.email || ''}
                className="mt-1 min-h-11 w-full rounded-xl border border-slate-200 bg-slate-100 px-3 text-sm text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Full Name</label>
              <input
                required
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Phone Number</label>
              <input
                type="tel"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">User Role</label>
              <div className="grid grid-cols-3 gap-2">
                {ROLE_OPTIONS.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setEditForm({ ...editForm, role: r.value })}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border transition ${
                      editForm.role === r.value
                        ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                disabled={busy}
                onClick={() => setEditUser(null)}
                className="min-h-11 rounded-xl border border-slate-300 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy}
                className="min-h-11 rounded-xl bg-green-600 px-5 text-sm font-semibold text-white hover:bg-green-700 transition disabled:opacity-60"
              >
                {busy ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 3: Delete Confirmation */}
      {deleteUser && (
        <Modal
          onClose={() => !busy && setDeleteUser(null)}
          title="Remove User Account"
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Are you sure you want to remove user{' '}
              <strong className="text-slate-900">{deleteUser?.name || deleteUser?.email}</strong> from the
              platform? This action will remove their role and permissions.
            </p>
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                disabled={busy}
                onClick={() => setDeleteUser(null)}
                className="min-h-11 rounded-xl border border-slate-300 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={handleDeleteSubmit}
                className="min-h-11 rounded-xl bg-red-600 px-5 text-sm font-semibold text-white hover:bg-red-700 transition disabled:opacity-60"
              >
                {busy ? 'Deleting...' : 'Confirm Remove'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default Users
