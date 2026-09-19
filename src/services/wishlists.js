import { api } from './api.js'

const CACHE_PREFIX = 'la_plots_wishlist_'

export function getLocalWishlist(uid) {
  if (!uid || typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${uid}`)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveLocalWishlist(uid, ids) {
  if (!uid || typeof window === 'undefined') return
  try {
    localStorage.setItem(`${CACHE_PREFIX}${uid}`, JSON.stringify(ids))
  } catch {
    // ignore
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

  // Pre-seed with local cached IDs
  const localCached = getLocalWishlist(uid)
  if (localCached.length > 0) {
    onChange(localCached.map((id) => ({ id, plotId: id })))
  }

  let isMounted = true

  const fetchWishlist = async () => {
    try {
      const items = await api.get(`/wishlists?customerId=${uid}`)
      if (isMounted && Array.isArray(items)) {
        const ids = items.map((i) => i.plotId || i.id)
        saveLocalWishlist(uid, ids)
        onChange(items)
      }
    } catch (err) {
      if (isMounted) {
        console.warn('[MongoDB Atlas] subscribeToWishlist note:', err?.message)
        if (onError) onError(err)
      }
    }
  }

  fetchWishlist()
  const intervalId = setInterval(fetchWishlist, 10000)

  return () => {
    isMounted = false
    clearInterval(intervalId)
  }
}

export async function toggleWishlist(uid, plotId, currentlySaved) {
  if (!uid || !plotId) return false
  const list = getLocalWishlist(uid)
  const updatedList = currentlySaved
    ? list.filter((id) => id !== plotId)
    : Array.from(new Set([...list, plotId]))

  saveLocalWishlist(uid, updatedList)

  try {
    const res = await api.post('/wishlists/toggle', { customerId: uid, plotId })
    return res.isSaved
  } catch (err) {
    console.warn('[MongoDB Atlas] toggleWishlist local fallback:', err?.message)
    return !currentlySaved
  }
}

export const wishlistService = {
  getWishlist: async (uid) => {
    if (!uid) return []
    try {
      const items = await api.get(`/wishlists?customerId=${uid}`)
      if (Array.isArray(items)) {
        return items.map((i) => i.plotId || i.id)
      }
    } catch {
      // ignore
    }
    return getLocalWishlist(uid)
  },
  toggle: toggleWishlist,
  getLocal: getLocalWishlist,
  isPlotWishlisted,
}
