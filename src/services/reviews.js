import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../firebase/config'

export function subscribeToReviews(onChange, onError) {
  if (!isFirebaseConfigured || !db) {
    onChange([])
    return () => undefined
  }
  return onSnapshot(
    collection(db, 'reviews'),
    (snapshot) => {
      onChange(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })))
    },
    onError
  )
}

export async function addReview(reviewData) {
  if (!isFirebaseConfigured || !db) throw new Error('Firebase is not configured.')
  return addDoc(collection(db, 'reviews'), {
    ...reviewData,
    rating: Number(reviewData.rating) || 5,
    createdAt: serverTimestamp(),
  })
}

export async function deleteReview(reviewId) {
  if (!isFirebaseConfigured || !db) throw new Error('Firebase is not configured.')
  await deleteDoc(doc(db, 'reviews', reviewId))
}
