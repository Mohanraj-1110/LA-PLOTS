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
        <p className="text-xs font-bold uppercase tracking-widest text-green-700">Client Feedback</p>
        <h1 className="mt-1 text-3xl font-extrabold text-slate-900">What Our Buyers Say</h1>
        <p className="mt-2 text-sm text-slate-500">
          Real experiences from land owners and investors across LA PLOTS communities.
        </p>
      </div>

      {/* Review Submission Form */}
      <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Write a Review</h2>
        {notice && (
          <div className="mt-3 rounded-lg bg-green-50 p-3 text-sm text-green-800 border border-green-200">
            {notice}
          </div>
        )}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Your Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 focus:outline-none"
                >
                  <Star
                    size={24}
                    className={
                      star <= rating
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-300'
                    }
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <textarea
              required
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience purchasing land or visiting layouts with LA PLOTS..."
              className="w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-900 outline-none focus:border-green-500"
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700 transition"
          >
            {busy ? 'Submitting...' : 'Post Review'}
          </button>
        </form>
      </div>

      {/* Reviews List */}
      <div className="mt-12 space-y-4">
        {reviews.length > 0 ? (
          reviews.map((item) => (
            <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900">{item.customerName || 'Verified Investor'}</h3>
                  <p className="text-xs text-slate-400">
                    {item.createdAt?.toDate?.().toLocaleDateString('en-IN') || 'Recently'}
                  </p>
                </div>
                <div className="flex gap-0.5 text-amber-400">
                  {Array.from({ length: item.rating || 5 }).map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">{item.comment}</p>
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
