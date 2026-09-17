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
              className="inline-flex rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
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
      <div className="flex items-center gap-3">
        <div className="size-12 rounded-full bg-green-100 text-green-700 grid place-items-center font-bold">
          <User size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">My Profile</h1>
          <p className="text-xs text-slate-500">{user.email}</p>
        </div>
      </div>

      {notice && (
        <div className="mt-6 rounded-xl bg-green-50 p-4 text-sm text-green-800 border border-green-200">
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
        className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4"
      >
        <h2 className="text-base font-bold text-slate-900">Personal Information</h2>
        <div>
          <label className="block text-sm font-medium text-slate-700">Full Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 min-h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-900 outline-none focus:border-green-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Phone Number</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 9876543210"
            className="mt-1 min-h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-900 outline-none focus:border-green-500"
          />
        </div>
        <button
          type="submit"
          className="min-h-11 rounded-xl bg-green-600 px-5 text-sm font-semibold text-white hover:bg-green-700 transition shadow-sm"
        >
          Save Changes
        </button>
      </form>

      {/* KYC Documents */}
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-900">KYC Verification Documents</h2>
        <p className="mt-1 text-xs text-slate-500">
          Upload Aadhaar, PAN card, or passport copy (PDF, JPG, PNG up to 10 MB).
        </p>

        <label className="mt-4 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-slate-300 bg-slate-50 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition">
          <Upload size={16} />
          {uploading ? 'Uploading...' : 'Upload KYC Document'}
          <input
            type="file"
            accept="application/pdf,image/jpeg,image/png"
            className="sr-only"
            disabled={uploading}
            onChange={handleKycUpload}
          />
        </label>

        {profile?.kycDocuments && profile.kycDocuments.length > 0 && (
          <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Uploaded Documents
            </h3>
            {profile.kycDocuments.map((docUrl, idx) => (
              <a
                key={idx}
                href={docUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-xl border border-slate-200 p-3 text-sm hover:border-green-300 hover:bg-green-50 transition"
              >
                <span className="flex items-center gap-2 font-medium text-slate-800">
                  <FileText size={16} className="text-green-600" />
                  Verified KYC Document #{idx + 1}
                </span>
                <span className="text-xs font-semibold text-green-700">View</span>
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
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white font-semibold text-red-600 hover:bg-red-50 transition"
        >
          <LogOut size={16} />
          Sign Out of Account
        </button>
      </div>
    </div>
  )
}
