import React, { useEffect, useState } from 'react'
import { Building2, Info, LockKeyhole, Palette, UserCog, UserRound } from 'lucide-react'
import { PageHeader } from '../../components/common/PageHeader'
import { Toast } from '../../components/common/Toast'
import { EmptyState } from '../../components/common/EmptyState'
import { useAuth } from '../../context/AuthContext'
import {
  changePassword,
  changeUserRole,
  inviteAgent,
  saveCompany,
  saveProfile,
  subscribeToCompany,
  subscribeToUsers,
} from '../../services/users'

const sections = [
  { id: 'profile', label: 'Profile', icon: UserRound },
  { id: 'company', label: 'Company', icon: Building2 },
  { id: 'users', label: 'Users & Roles', icon: UserCog },
  { id: 'security', label: 'Security', icon: LockKeyhole },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'about', label: 'About', icon: Info },
]

export function Settings() {
  const { profile, refreshProfile } = useAuth()
  const [section, setSection] = useState('profile')
  const [company, setCompany] = useState(null)
  const [users, setUsers] = useState(null)
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState(null)

  useEffect(() => {
    const unsub = subscribeToCompany(
      (data) => setCompany(data),
      () => setError('Company settings could not be loaded.')
    )
    return () => unsub()
  }, [])

  useEffect(() => {
    if (profile?.role === 'admin') {
      const unsub = subscribeToUsers(
        (data) => setUsers(data),
        () => setError('Users list could not be loaded.')
      )
      return () => unsub()
    }
  }, [profile?.role])

  if (!profile) {
    return (
      <>
        <PageHeader title="Settings" description="Manage your workspace preferences." />
        <EmptyState
          title="Profile unavailable"
          description="Your user profile is required to access system settings."
        />
      </>
    )
  }

  const done = (msg) => {
    setError(null)
    setNotice(msg)
    setTimeout(() => setNotice(null), 3000)
  }

  return (
    <>
      <PageHeader
        title="Settings & Workspace Preferences"
        description="Profile details, company contact, user permissions, and security."
      />

      {notice && <Toast message={notice} />}

      {error && (
        <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[230px_1fr]">
        <nav
          className="flex gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 lg:flex-col lg:self-start shadow-sm"
          aria-label="Settings sections"
        >
          {sections.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSection(item.id)}
                className={`inline-flex min-h-11 shrink-0 items-center gap-2.5 rounded-xl px-4 text-left text-sm font-semibold transition ${
                  section === item.id
                    ? 'bg-green-50 text-green-800 font-bold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            )
          })}
        </nav>

        <main>
          {section === 'profile' && (
            <ProfileForm profile={profile} onSuccess={done} onError={setError} onRefresh={refreshProfile} />
          )}
          {section === 'company' && (
            <CompanyForm company={company} isAdmin={profile.role === 'admin'} onSuccess={done} onError={setError} />
          )}
          {section === 'users' &&
            (profile.role === 'admin' ? (
              <UsersPanel users={users} onSuccess={done} onError={setError} />
            ) : (
              <EmptyState
                title="Admin access required"
                description="Only system administrators can invite agents or modify user roles."
              />
            ))}
          {section === 'security' && <SecurityForm onSuccess={done} onError={setError} />}
          {section === 'appearance' && <AppearanceForm onSuccess={done} />}
          {section === 'about' && <About />}
        </main>
      </div>
    </>
  )
}

function Panel({ title, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  )
}

function ProfileForm({ profile, onSuccess, onError, onRefresh }) {
  const [name, setName] = useState(profile.name || '')
  const [phone, setPhone] = useState(profile.phone || '')
  const [photoURL, setPhotoURL] = useState(profile.photoURL || '')

  async function submit(e) {
    e.preventDefault()
    try {
      await saveProfile(profile.uid, { name, phone, photoURL })
      await onRefresh()
      onSuccess('Profile updated successfully.')
    } catch {
      onError('Failed to save profile.')
    }
  }

  return (
    <Panel title="Personal Profile">
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-slate-700">
          Full Name
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block min-h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-900 outline-none focus:border-green-500"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Phone Number
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 block min-h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-900 outline-none focus:border-green-500"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
          Profile Photo URL
          <input
            value={photoURL}
            onChange={(e) => setPhotoURL(e.target.value)}
            className="mt-1 block min-h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-900 outline-none focus:border-green-500"
          />
        </label>
        <button
          type="submit"
          className="min-h-11 rounded-xl bg-green-600 px-5 text-sm font-semibold text-white hover:bg-green-700 transition sm:w-fit"
        >
          Save Profile
        </button>
      </form>
    </Panel>
  )
}

function CompanyForm({ company, isAdmin, onSuccess, onError }) {
  const [name, setName] = useState(company?.name || 'LA PLOTS')
  const [phone, setPhone] = useState(company?.phone || '')
  const [email, setEmail] = useState(company?.email || '')
  const [address, setAddress] = useState(company?.address || '')

  useEffect(() => {
    if (company) {
      setName(company.name || 'LA PLOTS')
      setPhone(company.phone || '')
      setEmail(company.email || '')
      setAddress(company.address || '')
    }
  }, [company])

  async function submit(e) {
    e.preventDefault()
    try {
      await saveCompany({ name, phone, email, address })
      onSuccess('Company profile saved.')
    } catch {
      onError('Failed to save company information.')
    }
  }

  return (
    <Panel title="Company Information">
      {isAdmin ? (
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700">
            Company Name
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block min-h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-900 outline-none focus:border-green-500"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Official Phone
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 block min-h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-900 outline-none focus:border-green-500"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
            Contact Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block min-h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-900 outline-none focus:border-green-500"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
            Registered Office Address
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-1 block w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-900 outline-none focus:border-green-500"
            />
          </label>
          <button
            type="submit"
            className="min-h-11 rounded-xl bg-green-600 px-5 text-sm font-semibold text-white hover:bg-green-700 transition sm:w-fit"
          >
            Save Company Details
          </button>
        </form>
      ) : (
        <p className="text-sm text-slate-500">Only administrators can modify company data.</p>
      )}
    </Panel>
  )
}

function UsersPanel({ users, onSuccess, onError }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleInvite(e) {
    e.preventDefault()
    setBusy(true)
    try {
      await inviteAgent(name, email, password)
      setName('')
      setEmail('')
      setPassword('')
      onSuccess('Agent account provisioned successfully.')
    } catch {
      onError('Agent invitation failed. Ensure Firebase callable Cloud Function is deployed.')
    } finally {
      setBusy(false)
    }
  }

  async function handleRoleChange(uid, nextRole) {
    try {
      await changeUserRole(uid, nextRole)
      onSuccess('User role changed successfully.')
    } catch {
      onError('Failed to update user role.')
    }
  }

  return (
    <div className="space-y-6">
      <Panel title="Invite New Agent">
        <form onSubmit={handleInvite} className="grid gap-3 sm:grid-cols-3">
          <input
            required
            placeholder="Agent Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="min-h-11 rounded-xl border border-slate-200 px-3 text-sm"
          />
          <input
            required
            type="email"
            placeholder="Agent Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="min-h-11 rounded-xl border border-slate-200 px-3 text-sm"
          />
          <input
            required
            type="password"
            placeholder="Temp Password (6+ chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="min-h-11 rounded-xl border border-slate-200 px-3 text-sm"
          />
          <button
            type="submit"
            disabled={busy}
            className="min-h-11 rounded-xl bg-green-600 px-5 text-sm font-semibold text-white hover:bg-green-700 transition sm:col-span-3 sm:w-fit"
          >
            {busy ? 'Creating...' : 'Create Agent Account'}
          </button>
        </form>
      </Panel>

      <Panel title="Users & Roles">
        {users ? (
          users.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b text-xs uppercase text-slate-400">
                  <tr>
                    <th className="py-3">Name</th>
                    <th className="py-3">Email</th>
                    <th className="py-3">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => (
                    <tr key={u.uid}>
                      <td className="py-3 font-semibold text-slate-900">{u.name || 'User'}</td>
                      <td className="py-3 text-slate-600">{u.email}</td>
                      <td className="py-3">
                        <select
                          value={u.role || 'customer'}
                          onChange={(e) => handleRoleChange(u.uid, e.target.value)}
                          className="min-h-9 rounded-lg border border-slate-200 px-2 text-xs font-semibold capitalize"
                        >
                          <option value="admin">Admin</option>
                          <option value="agent">Agent</option>
                          <option value="customer">Customer</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-slate-500">No users found.</p>
          )
        ) : (
          <p className="text-sm text-slate-500">Loading user accounts...</p>
        )}
      </Panel>
    </div>
  )
}

function SecurityForm({ onSuccess, onError }) {
  const [password, setPassword] = useState('')

  async function submit(e) {
    e.preventDefault()
    if (password.length < 6) {
      onError('Password must be at least 6 characters.')
      return
    }
    try {
      await changePassword(password)
      setPassword('')
      onSuccess('Password updated successfully.')
    } catch {
      onError('Changing password requires a fresh sign-in. Sign out, sign back in, and retry.')
    }
  }

  return (
    <Panel title="Security & Credentials">
      <form onSubmit={submit} className="max-w-md space-y-4">
        <label className="block text-sm font-medium text-slate-700">
          New Password
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="mt-1 block min-h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-900 outline-none focus:border-green-500"
          />
        </label>
        <button
          type="submit"
          className="min-h-11 rounded-xl bg-green-600 px-5 text-sm font-semibold text-white hover:bg-green-700 transition"
        >
          Update Password
        </button>
      </form>
    </Panel>
  )
}

function AppearanceForm({ onSuccess }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('appearance') || 'system')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  function save(val) {
    setTheme(val)
    localStorage.setItem('appearance', val)
    onSuccess('Appearance preference saved.')
  }

  return (
    <Panel title="Appearance & Themes">
      <div className="flex flex-wrap gap-3">
        {['light', 'dark', 'system'].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => save(t)}
            className={`min-h-11 rounded-xl px-5 text-sm font-semibold capitalize transition ${
              theme === t
                ? 'bg-green-100 text-green-800'
                : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {t}
          </button>
        ))}
      </div>
    </Panel>
  )
}

function About() {
  return (
    <Panel title="About LA PLOTS">
      <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
        <p>
          <strong className="text-slate-900">LA PLOTS</strong> is a real estate plot management
          platform unifying catalog inventory, lead conversion, guided site inspections, document
          verification, and business analytics into a single reactive workspace.
        </p>
        <p>
          <strong className="text-slate-800">Version:</strong> 2.0.0 (Unified JavaScript Edition)
        </p>
        <p>
          <strong className="text-slate-800">Stack:</strong> React 19 + Vite + Tailwind CSS +
          Firebase Firestore, Storage & Auth
        </p>
      </div>
    </Panel>
  )
}
export default Settings
