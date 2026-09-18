import { api } from './api.js'

let initialReviews = [
  {
    id: 'rev-1',
    customerName: 'Karthik Raja',
    rating: 5,
    comment: 'Exceptional transparency and smooth registration experience with LA Plots team.',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'rev-2',
    customerName: 'Ananya Deshmukh',
    rating: 4.8,
    comment: 'Great layout planning with wide roads and clear DTCP approvals. Highly recommended!',
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
]

export function subscribeToReviews(onChange, onError) {
  let isMounted = true

  const fetchReviews = async () => {
    try {
      const reviews = await api.get('/reviews')
      if (isMounted) {
        onChange(Array.isArray(reviews) && reviews.length > 0 ? reviews : initialReviews)
      }
    } catch (err) {
      if (isMounted) {
        console.warn('[MongoDB Atlas] subscribeToReviews fallback:', err?.message)
        onChange(initialReviews)
        if (onError) onError(err)
      }
    }
  }

  fetchReviews()
  const intervalId = setInterval(fetchReviews, 10000)

  return () => {
    isMounted = false
    clearInterval(intervalId)
  }
}

export async function addReview(reviewData) {
  const rev = {
    ...reviewData,
    rating: Number(reviewData.rating) || 5,
    createdAt: new Date().toISOString(),
  }
  return api.post('/reviews', rev)
}

export async function deleteReview(reviewId) {
  return api.delete(`/reviews/${reviewId}`)
}
