import React, { useEffect, useState } from 'react'
import { Star, MessageSquare } from 'lucide-react'
import { subscribeToReviews, addReview } from '../../services/reviews'
import { useAuth } from '../../context/AuthContext'
import { EmptyState } from '../../components/common/EmptyState'

export function Reviews() {
  const { user, profile } = useAuth()
  const [reviews, setReviews] = useState([])
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState(null)

  useEffect(() => {
    const unsub = subscribeToReviews(
      (data) => setReviews(data),
      () => {}
    )
    return () => unsub()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!comment.trim()) return
    setBusy(true)
    try {
      await addReview({
        customerId: user?.uid || 'anonymous',
        customerName: profile?.name || 'Happy Customer',
        rating,
        comment,
      })
      setComment('')
      setNotice('Thank you for sharing your review!')
      setTimeout(() => setNotice(null), 3000)
    } catch {
      setNotice('Could not post review.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="text-center max-w-xl mx-auto">
        <span className="inline-block rounded-full bg-primary-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary-700 border border-primary-200">Client Feedback</span>
        <h1 className="mt-3 font-display text-3xl font-extrabold text-surface-900">What Our Buyers Say</h1>
        <p className="mt-2 text-sm text-surface-500">
          Real experiences from land owners and investors across LA PLOTS communities.
        </p>
      </div>

      {/* Review Submission Form */}
      <div className="mt-10 card-modern p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="size-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white grid place-items-center shadow-glow">
            <MessageSquare size={18} />
          </div>
          <h2 className="font-display text-lg font-bold text-surface-900">Write a Review</h2>
        </div>
        {notice && (
          <div className="mt-4 rounded-xl bg-primary-50 p-3.5 text-sm text-primary-800 border border-primary-200 font-medium">
            {notice}
          </div>
        )}
        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-surface-600 mb-2">Your Rating</label>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-0.5 focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    size={28}
                    strokeWidth={1.5}
                    className={
                      star <= rating
                        ? 'text-accent-500 fill-accent-500 drop-shadow-sm'
                        : 'text-surface-200 hover:text-accent-300'
                    }
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-surface-600 mb-1.5">Your Review</label>
            <textarea
              required
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience purchasing land or visiting layouts with LA PLOTS..."
              className="input-modern w-full resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="btn-primary w-full sm:w-auto"
          >
            {busy ? 'Submitting...' : 'Post Review'}
          </button>
        </form>
      </div>

      {/* Reviews List */}
      <div className="mt-12 space-y-4">
        {reviews.length > 0 ? (
          reviews.map((item) => (
            <article key={item.id} className="card-modern p-6 sm:p-7 transition-all hover:shadow-elevated">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-white grid place-items-center font-bold text-sm shadow-card">
                    {(item.customerName || 'V')[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-surface-900">{item.customerName || 'Verified Investor'}</h3>
                    <p className="text-xs text-surface-400">
                      {item.createdAt?.toDate?.().toLocaleDateString('en-IN') || 'Recently'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-0.5 bg-accent-50 rounded-lg px-2 py-1 border border-accent-100">
                  {Array.from({ length: Math.max(1, Math.min(5, Math.round(Number(item.rating) || 5))) }).map((_, i) => (
                    <Star key={i} size={14} fill="currentColor" className="text-accent-500" />
                  ))}
                </div>
              </div>
              <p className="mt-4 text-sm text-surface-600 leading-relaxed">{item.comment}</p>
              <div className="mt-4 h-px bg-gradient-to-r from-primary-200 via-surface-100 to-transparent" />
            </article>
          ))
        ) : (
          <EmptyState
            title="Be the first to leave a review"
            description="Share your feedback on our layout planning, documentation clarity, and staff assistance."
            icon={MessageSquare}
          />
        )}
      </div>
    </div>
  )
}
