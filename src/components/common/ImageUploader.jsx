import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Link2, Plus, X, Star, ExternalLink, Image as ImageIcon, Sparkles, AlertCircle } from 'lucide-react'

const CURATED_SUGGESTIONS = [
  {
    name: 'Green Meadows',
    url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Villa Community',
    url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Plotted Layout',
    url: 'https://images.unsplash.com/photo-1500076656116-558758c991c1?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Coastal Enclave',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Modern Masterplan',
    url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Avenue Parcel',
    url: 'https://images.unsplash.com/photo-1448630360428-65456885c650?w=800&auto=format&fit=crop&q=80',
  },
]

/**
 * ImageUploader — URL-based image manager.
 * Stores lightweight web image URLs instead of heavy base64 strings in the database,
 * while displaying images identically across cards, banners, and detail views.
 */
export function ImageUploader({
  images = [],
  onChange,
  primaryImage = '',
  onPrimaryChange,
  maxFiles = 8,
  label = 'photos',
}) {
  const [urlInput, setUrlInput] = useState('')
  const [error, setError] = useState('')

  const handleAddUrl = (customUrl) => {
    setError('')
    const targetUrl = (typeof customUrl === 'string' ? customUrl : urlInput).trim()

    if (!targetUrl) {
      setError('Please paste a web image URL.')
      return
    }

    // Explicitly reject base64 to keep MongoDB lightweight
    if (targetUrl.startsWith('data:')) {
      setError('Direct base64 image data is disabled. Please provide a standard web image URL (HTTP/HTTPS) to keep MongoDB fast and lightweight.')
      return
    }

    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://') && !targetUrl.startsWith('/')) {
      setError('Image URL must start with https:// or http://')
      return
    }

    if (images.includes(targetUrl)) {
      setError('This image URL has already been added.')
      return
    }

    if (images.length >= maxFiles) {
      setError(`Maximum limit of ${maxFiles} ${label} reached.`)
      return
    }

    const updated = [...images, targetUrl]
    onChange(updated)

    // If no primary image is currently set, make this new image primary
    if (!primaryImage || images.length === 0) {
      onPrimaryChange(targetUrl)
    }

    setUrlInput('')
  }

  const handleRemove = (indexToRemove) => {
    const removedUrl = images[indexToRemove]
    const updated = images.filter((_, idx) => idx !== indexToRemove)
    onChange(updated)

    if (removedUrl === primaryImage) {
      onPrimaryChange(updated[0] || '')
    }
  }

  const handleSetPrimary = (url) => {
    onPrimaryChange(url)
  }

  const canAdd = images.length < maxFiles

  return (
    <div className="space-y-4">
      {/* URL Input Box */}
      {canAdd && (
        <div className="bg-slate-50 p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Link2 className="w-4 h-4" />
              </div>
              <input
                type="url"
                value={urlInput}
                onChange={(e) => {
                  setUrlInput(e.target.value)
                  if (error) setError('')
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddUrl()
                  }
                }}
                placeholder="Paste image URL (e.g. https://images.unsplash.com/...)"
                className="w-full pl-9 pr-3 py-2 text-xs bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-slate-800 placeholder-slate-400"
              />
            </div>
            <button
              type="button"
              onClick={() => handleAddUrl()}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex-shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Image URL</span>
            </button>
          </div>

          {/* Curated Suggested Images Quick Bar */}
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 mb-1.5">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Quick sample layout images:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {CURATED_SUGGESTIONS.map((sug, i) => {
                const isAdded = images.includes(sug.url)
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={isAdded}
                    onClick={() => handleAddUrl(sug.url)}
                    className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                      isAdded
                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300 hover:text-primary-700 hover:bg-primary-50/50'
                    }`}
                  >
                    {isAdded ? '✓ ' : '+ '}
                    {sug.name}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-2.5 flex items-center gap-2 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Image Gallery & Preview Grid */}
      {images.length > 0 ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Added Images ({images.length} of {maxFiles})</span>
            <span className="text-[11px] text-amber-600 font-semibold">Click ⭐ to set cover image</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {images.map((src, idx) => {
              const isPrimary = src === primaryImage || (!primaryImage && idx === 0)
              return (
                <div
                  key={idx}
                  className={`group relative rounded-2xl overflow-hidden border-2 bg-slate-100 transition-all flex flex-col justify-between ${
                    isPrimary
                      ? 'border-amber-400 shadow-md shadow-amber-500/10'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Image Container with Aspect Ratio */}
                  <div className="relative aspect-4/3 w-full bg-slate-200 overflow-hidden">
                    <img
                      src={src}
                      alt={`Photo ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=80'
                      }}
                    />

                    {/* Primary Badge */}
                    {isPrimary && (
                      <div className="absolute top-2 left-2 flex items-center gap-1 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                        <Star className="w-2.5 h-2.5 fill-white" />
                        <span>Primary Cover</span>
                      </div>
                    )}

                    {/* Quick Action Overlay */}
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      {!isPrimary && (
                        <button
                          type="button"
                          onClick={() => handleSetPrimary(src)}
                          title="Set as Primary Cover"
                          className="p-1.5 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-full shadow transition-transform hover:scale-110 cursor-pointer"
                        >
                          <Star className="w-3.5 h-3.5 fill-slate-950" />
                        </button>
                      )}
                      <a
                        href={src}
                        target="_blank"
                        rel="noreferrer"
                        title="Open image in new tab"
                        className="p-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-full shadow transition-transform hover:scale-110"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        type="button"
                        onClick={() => handleRemove(idx)}
                        title="Remove Image"
                        className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow transition-transform hover:scale-110 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* URL Text Snippet */}
                  <div className="p-1.5 bg-white border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 truncate">
                    <span className="truncate flex-1 font-mono text-[9px]">{src}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="py-6 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center p-4 bg-slate-50/50">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mb-2">
            <ImageIcon className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-slate-700">No images linked yet</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Paste any web image URL above or pick a sample layout to show photos on web pages without storing heavy files in MongoDB.
          </p>
        </div>
      )}
    </div>
  )
}

ImageUploader.propTypes = {
  images: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func.isRequired,
  primaryImage: PropTypes.string,
  onPrimaryChange: PropTypes.func.isRequired,
  maxFiles: PropTypes.number,
  label: PropTypes.string,
}

export default ImageUploader
