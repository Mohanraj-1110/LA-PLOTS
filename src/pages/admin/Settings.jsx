import React, { useEffect, useState } from 'react'
import { Building2, Database, Info, LockKeyhole, Palette, UserCog, UserRound } from 'lucide-react'
import { PageHeader } from '../../components/common/PageHeader'
import { Toast } from '../../components/common/Toast'
import { EmptyState } from '../../components/common/EmptyState'
import { useAuth } from '../../context/AuthContext'
import { DatabaseSettingsPanel } from '../../components/admin/DatabaseSettingsPanel'
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
  { id: 'database', label: 'Database & Connection', icon: Database },
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
        <div className="mb-6 rounded-2xl bg-red-50 p-4 text-sm text-red-700 border border-red-200 shadow-card">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[230px_1fr]">
        <nav
          className="card-modern flex gap-2 overflow-x-auto p-2 lg:flex-col lg:self-start"
          aria-label="Settings sections"
        >
          {sections.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSection(item.id)}
                className={`inline-flex min-h-11 shrink-0 items-center gap-2.5 rounded-xl px-4 text-left text-sm font-semibold transition-all ${
                  section === item.id
                    ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white font-bold shadow-card'
                    : 'text-surface-600 hover:bg-surface-50'
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
          {section === 'database' && <DatabaseSettingsPanel />}
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
    <section className="card-modern p-6">
      <h2 className="font-display text-lg font-bold text-surface-900">{title}</h2>
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
      {/* Profile Photo Preview */}
      <div className="mb-6 flex items-center gap-4">
        <div className="relative">
          {photoURL ? (
            <img
              src={photoURL}
              alt={name}
              className="size-20 rounded-2xl object-cover border-2 border-surface-200 shadow-card"
            />
          ) : (
            <div className="flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 text-white font-display font-bold text-2xl shadow-card">
              {name ? name.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 size-5 rounded-full bg-primary-500 border-2 border-white flex items-center justify-center">
            <div className="size-2 rounded-full bg-white" />
          </div>
        </div>
        <div>
          <p className="font-display font-bold text-surface-900">{name || 'Your Name'}</p>
          <p className="text-sm text-surface-500">{profile.email || profile.uid}</p>
        </div>
      </div>

      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-bold text-surface-700">
          Full Name
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-modern mt-1 block w-full"
          />
        </label>
        <label className="block text-sm font-bold text-surface-700">
          Phone Number
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="input-modern mt-1 block w-full"
          />
        </label>
        <label className="block text-sm font-bold text-surface-700 sm:col-span-2">
          Profile Photo URL
          <input
            value={photoURL}
            onChange={(e) => setPhotoURL(e.target.value)}
            placeholder="https://..."
            className="input-modern mt-1 block w-full"
          />
        </label>
        <button
          type="submit"
          className="btn-primary min-h-11 sm:w-fit"
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
          <label className="block text-sm font-bold text-surface-700">
            Company Name
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-modern mt-1 block w-full"
            />
          </label>
          <label className="block text-sm font-bold text-surface-700">
            Official Phone
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input-modern mt-1 block w-full"
            />
          </label>
          <label className="block text-sm font-bold text-surface-700 sm:col-span-2">
            Contact Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-modern mt-1 block w-full"
            />
          </label>
          <label className="block text-sm font-bold text-surface-700 sm:col-span-2">
            Registered Office Address
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="input-modern mt-1 block w-full min-h-[60px]"
            />
          </label>
          <button
            type="submit"
            className="btn-primary min-h-11 sm:w-fit"
          >
            Save Company Details
          </button>
        </form>
      ) : (
        <p className="text-sm text-surface-500">Only administrators can modify company data.</p>
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
            className="input-modern"
          />
          <input
            required
            type="email"
            placeholder="Agent Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-modern"
          />
          <input
            required
            type="password"
            placeholder="Temp Password (6+ chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-modern"
          />
          <button
            type="submit"
            disabled={busy}
            className="btn-primary min-h-11 sm:col-span-3 sm:w-fit disabled:opacity-60"
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
                <thead className="border-b border-surface-100 text-xs uppercase text-surface-400">
                  <tr>
                    <th className="py-3 font-semibold">Name</th>
                    <th className="py-3 font-semibold">Email</th>
                    <th className="py-3 font-semibold">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {users.map((u) => (
                    <tr key={u.uid} className="hover:bg-surface-50 transition-colors">
                      <td className="py-3 font-semibold text-surface-900">{u.name || 'User'}</td>
                      <td className="py-3 text-surface-600">{u.email}</td>
                      <td className="py-3">
                        <select
                          value={u.role || 'customer'}
                          onChange={(e) => handleRoleChange(u.uid, e.target.value)}
                          className="input-modern min-h-9 text-xs font-semibold capitalize"
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
            <p className="text-sm text-surface-500">No users found.</p>
          )
        ) : (
          <p className="text-sm text-surface-500">Loading user accounts...</p>
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
        <label className="block text-sm font-bold text-surface-700">
          New Password
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="input-modern mt-1 block w-full"
          />
        </label>
        <button
          type="submit"
          className="btn-primary min-h-11"
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

  const themeOptions = [
    { value: 'light', label: 'Light', icon: '☀️', desc: 'Clean and bright interface' },
    { value: 'dark', label: 'Dark', icon: '🌙', desc: 'Easy on the eyes at night' },
    { value: 'system', label: 'System', icon: '💻', desc: 'Follow device settings' },
  ]

  return (
    <Panel title="Appearance & Themes">
      <div className="grid gap-3 sm:grid-cols-3">
        {themeOptions.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => save(t.value)}
            className={`card-modern p-4 text-left transition-all ${
              theme === t.value
                ? 'border-primary-500 shadow-glow ring-2 ring-primary-200'
                : 'hover:shadow-elevated hover:border-surface-300'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{t.icon}</span>
              <span className={`font-display font-bold text-sm ${
                theme === t.value ? 'text-primary-700' : 'text-surface-900'
              }`}>
                {t.label}
              </span>
            </div>
            <p className="text-xs text-surface-500">{t.desc}</p>
            {theme === t.value && (
              <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-primary-600">
                <div className="size-1.5 rounded-full bg-primary-500" />
                Active
              </div>
            )}
          </button>
        ))}
      </div>
    </Panel>
  )
}

function About() {
  return (
    <Panel title="About LA PLOTS">
      <div className="space-y-4">
        {/* Brand Header */}
        <div className="flex items-center gap-4 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-500 p-6 text-white shadow-card">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm font-display font-bold text-xl">
            LP
          </div>
          <div>
            <h3 className="font-display font-bold text-xl">LA PLOTS</h3>
            <p className="text-primary-100 text-sm">Real Estate Plot Management Platform</p>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-3 text-sm text-surface-600 leading-relaxed">
          <p className="text-surface-700">
            <strong className="text-surface-900">LA PLOTS</strong> is a real estate plot management
            platform unifying catalog inventory, lead conversion, guided site inspections, document
            verification, and business analytics into a single reactive workspace.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="rounded-xl bg-surface-50 p-3 border border-surface-100">
              <p className="text-xs font-bold text-surface-400 uppercase">Version</p>
              <p className="font-semibold text-surface-900">2.0.0 (Unified JavaScript Edition)</p>
            </div>
            <div className="rounded-xl bg-surface-50 p-3 border border-surface-100">
              <p className="text-xs font-bold text-surface-400 uppercase">Stack</p>
              <p className="font-semibold text-surface-900">React 19 + Vite + Tailwind CSS + Firebase</p>
            </div>
          </div>
        </div>
      </div>
    </Panel>
  )
}
export default Settings
