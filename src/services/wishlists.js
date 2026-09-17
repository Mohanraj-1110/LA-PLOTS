import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../firebase/config'

export function subscribeToWishlist(uid, onChange, onError) {
  if (!isFirebaseConfigured || !db || !uid) {
    onChange([])
    return () => undefined
  }
  return onSnapshot(
    collection(db, 'wishlists', uid, 'plots'),
    (snapshot) => {
      onChange(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })))
    },
    onError
  )
}

export async function toggleWishlist(uid, plotId, saved) {
  if (!isFirebaseConfigured || !db) throw new Error('Firebase is not configured.')
  const refDoc = doc(db, 'wishlists', uid, 'plots', plotId)
  if (saved) {
    await deleteDoc(refDoc)
  } else {
    await setDoc(refDoc, {
      customerId: uid,
      plotId,
      createdAt: serverTimestamp(),
    })
  }
}
