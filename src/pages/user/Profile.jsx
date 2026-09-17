import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FileText, LogOut, Upload, User } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { updateCustomerProfile, uploadKyc } from '../../services/users'
import { EmptyState } from '../../components/common/EmptyState'

export function Profile() {
  const navigate = useNavigate()
  const { user, profile, logout, refreshProfile } = useAuth()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [notice, setNotice] = useState(null)
  const [error, setError] = useState(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (profile) {
      setName(profile.name || '')
      setPhone(profile.phone || '')
    }
  }, [profile])

  if (!user) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
        <EmptyState
          title="Please sign in"
          description="You must be signed in to view your profile settings."
          action={
            <Link
              to="/login"
              className="inline-flex rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-5 py-2.5 text-sm font-semibold text-white shadow-card hover:shadow-elevated transition"
            >
              Sign In
            </Link>
          }
        />
      </div>
    )
  }

  async function handleSaveProfile(e) {
    e.preventDefault()
    setError(null)
    setNotice(null)
    try {
      await updateCustomerProfile(user.uid, { name, phone })
      await refreshProfile()
      setNotice('Profile updated successfully!')
      setTimeout(() => setNotice(null), 3000)
    } catch {
      setError('Failed to update profile.')
    }
  }

  async function handleKycUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError(null)
    setNotice(null)
    try {
      await uploadKyc(user.uid, file)
      await refreshProfile()
      setNotice('KYC Document uploaded successfully!')
      setTimeout(() => setNotice(null), 3000)
    } catch (err) {
      setError(err?.message || 'KYC upload failed.')
    } finally {
      setUploading(false)
    }
  }

  async function handleSignOut() {
    await logout()
    navigate('/')
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:px-6">
      <div className="flex items-center gap-4">
        <div className="size-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 text-white grid place-items-center font-bold shadow-elevated">
          <User size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-surface-900 font-display">My Profile</h1>
          <p className="text-xs text-surface-500">{user.email}</p>
        </div>
      </div>

      {notice && (
        <div className="mt-6 rounded-xl bg-primary-50 p-4 text-sm text-primary-800 border border-primary-200">
          {notice}
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}

      {/* Account Info Form */}
      <form
        onSubmit={handleSaveProfile}
        className="mt-6 card-modern p-6 space-y-4"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="size-9 rounded-xl bg-gradient-to-br from-primary-100 to-primary-50 text-primary-600 grid place-items-center">
            <User size={18} />
          </div>
          <h2 className="text-base font-bold text-surface-900 font-display">Personal Information</h2>
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700">Full Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-modern mt-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700">Phone Number</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 9876543210"
            className="input-modern mt-1"
          />
        </div>
        <button
          type="submit"
          className="btn-primary"
        >
          Save Changes
        </button>
      </form>

      {/* KYC Documents */}
      <section className="mt-6 card-modern p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="size-9 rounded-xl bg-gradient-to-br from-accent-100 to-accent-50 text-accent-600 grid place-items-center">
            <FileText size={18} />
          </div>
          <h2 className="text-base font-bold text-surface-900 font-display">KYC Verification Documents</h2>
        </div>
        <p className="mt-1 text-xs text-surface-500">
          Upload Aadhaar, PAN card, or passport copy (PDF, JPG, PNG up to 10 MB).
        </p>

        <label className="mt-4 flex items-center justify-center gap-3 min-h-[100px] cursor-pointer rounded-2xl border-2 border-dashed border-primary-300 bg-primary-50/30 p-6 text-sm font-semibold text-primary-700 hover:bg-primary-50 hover:border-primary-400 transition group">
          <div className="size-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white grid place-items-center shadow-card group-hover:shadow-elevated transition">
            <Upload size={18} />
          </div>
          <div className="text-left">
            <span className="block text-sm font-bold text-surface-800">
              {uploading ? 'Uploading...' : 'Upload KYC Document'}
            </span>
            <span className="text-xs text-surface-400 font-normal">PDF, JPG, PNG up to 10 MB</span>
          </div>
          <input
            type="file"
            accept="application/pdf,image/jpeg,image/png"
            className="sr-only"
            disabled={uploading}
            onChange={handleKycUpload}
          />
        </label>

        {profile?.kycDocuments && profile.kycDocuments.length > 0 && (
          <div className="mt-4 space-y-2 border-t border-surface-100 pt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-surface-400">
              Uploaded Documents
            </h3>
            {profile.kycDocuments.map((docUrl, idx) => (
              <a
                key={idx}
                href={docUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-xl border border-surface-200 p-3 text-sm hover:border-primary-300 hover:bg-primary-50/50 transition"
              >
                <span className="flex items-center gap-2 font-medium text-surface-800">
                  <FileText size={16} className="text-primary-500" />
                  Verified KYC Document #{idx + 1}
                </span>
                <span className="text-xs font-semibold text-primary-600">View</span>
              </a>
            ))}
          </div>
        )}
      </section>

      {/* Sign Out Button */}
      <div className="mt-8">
        <button
          type="button"
          onClick={handleSignOut}
          className="btn-secondary flex min-h-11 w-full items-center justify-center gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
        >
          <LogOut size={16} />
          Sign Out of Account
        </button>
      </div>
    </div>
  )
}
