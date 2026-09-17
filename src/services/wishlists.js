import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../firebase/config'

const CACHE_PREFIX = 'la_plots_wishlist_'

export function getLocalWishlist(uid) {
  if (!uid || typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${uid}`)
    return raw ? JSON.parse(raw) : []
  } catch {
    // ignore parse or storage errors
    return []
  }
}

export function saveLocalWishlist(uid, ids) {
  if (!uid || typeof window === 'undefined') return
  try {
    localStorage.setItem(`${CACHE_PREFIX}${uid}`, JSON.stringify(ids))
  } catch {
    // ignore storage quota errors
  }
}

export function isPlotWishlisted(uid, plotId) {
  if (!uid || !plotId) return false
  const list = getLocalWishlist(uid)
  return list.includes(plotId)
}

export function subscribeToWishlist(uid, onChange, onError) {
  if (!uid) {
    onChange([])
    return () => undefined
  }

  // Pre-seed with local cached IDs so UI renders immediately without waiting for network
  const localCached = getLocalWishlist(uid)
  if (localCached.length > 0) {
    onChange(localCached.map((id) => ({ id, plotId: id })))
  }

  if (!isFirebaseConfigured || !db) {
    onChange(localCached.map((id) => ({ id, plotId: id })))
    return () => undefined
  }

  return onSnapshot(
    collection(db, 'wishlists', uid, 'plots'),
    (snapshot) => {
      const items = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
      const ids = items.map((i) => i.plotId || i.id)
      saveLocalWishlist(uid, ids)
      onChange(items)
    },
    (err) => {
      console.warn('[Wishlist] subscription note:', err?.message)
      if (onError) onError(err)
    }
  )
}

export async function toggleWishlist(uid, plotId, currentlySaved) {
  if (!uid || !plotId) return false
  const list = getLocalWishlist(uid)
  const updatedList = currentlySaved
    ? list.filter((id) => id !== plotId)
    : Array.from(new Set([...list, plotId]))

  saveLocalWishlist(uid, updatedList)

  if (isFirebaseConfigured && db) {
    try {
      const refDoc = doc(db, 'wishlists', uid, 'plots', plotId)
      if (currentlySaved) {
        await deleteDoc(refDoc)
      } else {
        await setDoc(refDoc, {
          customerId: uid,
          plotId,
          createdAt: serverTimestamp(),
        })
      }
    } catch (err) {
      console.warn('[Wishlist] Firestore update note:', err?.message)
    }
  }

  return !currentlySaved
}
