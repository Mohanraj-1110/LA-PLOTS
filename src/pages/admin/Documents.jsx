import React, { useEffect, useMemo, useState } from 'react'
import { Download, ExternalLink, FilePlus, Share2, Trash2 } from 'lucide-react'
import { PageHeader } from '../../components/common/PageHeader'
import { EmptyState } from '../../components/common/EmptyState'
import { useAuth } from '../../context/AuthContext'
import {
  deleteDocument,
  documentCategories,
  subscribeToDocuments,
  uploadDocument,
} from '../../services/documents'

export function Documents() {
  const { firebaseUser } = useAuth()
  const [documents, setDocuments] = useState(null)
  const [category, setCategory] = useState('All')
  const [progress, setProgress] = useState(null)
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState(null)

  useEffect(() => {
    const unsub = subscribeToDocuments(
      (data) => setDocuments(data),
      () => setError('Documents could not be loaded.')
    )
    return () => unsub()
  }, [])

  const filtered = useMemo(
    () => (documents || []).filter((item) => category === 'All' || item.category === category),
    [documents, category]
  )

  async function handleUpload(file) {
    setError(null)
    setProgress(0)
    try {
      await uploadDocument(
        file,
        {
          name: file.name,
          category: category === 'All' ? 'Other' : category,
          projectId: '',
          plotId: '',
          customerId: '',
          uploadedBy: firebaseUser?.uid || 'unknown',
        },
        setProgress
      )
      setNotice('Document uploaded successfully!')
      setTimeout(() => setNotice(null), 3000)
    } catch (err) {
      setError(err?.message || 'Upload failed.')
    } finally {
      setProgress(null)
    }
  }

  async function handleRemove(doc) {
    if (!window.confirm(`Delete ${doc.name}? This cannot be undone.`)) return
    try {
      await deleteDocument(doc)
      setNotice('Document deleted.')
      setTimeout(() => setNotice(null), 3000)
    } catch {
      setError('Could not delete document.')
    }
  }

  async function handleShare(doc) {
    try {
      await navigator.clipboard.writeText(doc.fileUrl)
      setNotice('Document link copied to clipboard!')
      setTimeout(() => setNotice(null), 3000)
    } catch {
      setNotice('Open the document to copy its link.')
    }
  }

  return (
    <div className="page-enter">
      <PageHeader
        title="Document Management"
        description={`${documents ? documents.length : 0} verified legal documents stored.`}
        action={
          <label className="btn-primary inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl px-4 text-sm font-semibold">
            <FilePlus size={18} />
            Upload PDF
            <input
              type="file"
              accept="application/pdf"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleUpload(file)
              }}
            />
          </label>
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

      {progress !== null && (
        <div className="mb-6 card-modern p-4">
          <div className="flex justify-between font-semibold text-sm">
            <span className="text-slate-700">Uploading document...</span>
            <span className="font-display text-primary-600">{progress}%</span>
          </div>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-surface-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-400 transition-all duration-300 shadow-glow"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setCategory('All')}
          className={`min-h-10 whitespace-nowrap rounded-xl px-4 text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
            category === 'All'
              ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-glow'
              : 'bg-white text-slate-600 hover:bg-surface-50 border border-surface-200 shadow-card'
          }`}
        >
          All
        </button>
        {documentCategories.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setCategory(item)}
            className={`min-h-10 whitespace-nowrap rounded-xl px-4 text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
              category === item
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-glow'
                : 'bg-white text-slate-600 hover:bg-surface-50 border border-surface-200 shadow-card'
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {documents === null ? (
        <div className="mt-6 h-64 animate-pulse rounded-2xl bg-surface-100" />
      ) : filtered.length > 0 ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((doc) => (
            <article
              key={doc.id}
              className="card-modern group p-5 transition-all duration-200 hover:shadow-elevated"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate font-display font-bold text-slate-900" title={doc.name}>
                    {doc.name}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 font-medium">{doc.category}</p>
                </div>
                <span className="shrink-0 rounded-lg bg-gradient-to-br from-red-500 to-red-600 px-2 py-1 text-xs font-bold text-white shadow-sm">
                  PDF
                </span>
              </div>

              <div className="mt-5 flex flex-wrap gap-2 pt-3 border-t border-surface-100">
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-surface-200 bg-white px-3 text-xs font-semibold text-slate-700 transition-all hover:bg-surface-50 hover:border-surface-300 shadow-card"
                >
                  <ExternalLink size={14} /> Preview
                </a>
                <a
                  href={doc.fileUrl}
                  download
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-surface-200 bg-white px-3 text-xs font-semibold text-slate-700 transition-all hover:bg-surface-50 hover:border-surface-300 shadow-card"
                >
                  <Download size={14} /> Download
                </a>
                <button
                  type="button"
                  onClick={() => handleShare(doc)}
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-surface-200 bg-white px-3 text-xs font-semibold text-slate-700 transition-all hover:bg-surface-50 hover:border-surface-300 shadow-card"
                >
                  <Share2 size={14} /> Share
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(doc)}
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-red-200 bg-white px-3 text-xs font-semibold text-red-600 transition-all hover:bg-red-50 hover:border-red-300 shadow-card"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-8">
          <EmptyState
            title="No documents in this category"
            description="Upload approved layout plans, legal opinions, or sale deeds to this category."
          />
        </div>
      )}
    </div>
  )
}
export default Documents