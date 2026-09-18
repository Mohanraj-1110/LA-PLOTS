import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  waitForPendingWrites,
} from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { db, isFirebaseConfigured, storage } from '../firebase/config'

/**
 * Ensures a write operation has reached Cloud Firestore backend,
 * rather than only being stored in volatile local memory cache.
 */
async function confirmServerSync(actionName = 'save') {
  if (!db) return
  try {
    const syncPromise = waitForPendingWrites(db)
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('SYNC_TIMEOUT')), 3500)
    )
    await Promise.race([syncPromise, timeoutPromise])
  } catch (err) {
    if (err?.message === 'SYNC_TIMEOUT') {
      throw new Error(
        'Plot saved in local cache, but Cloud Firestore server did not acknowledge the write. Make sure Cloud Firestore database is created in Firebase Console (Project: la-plots) and firestore.rules allow writes.'
      )
    }
    throw err
  }
}

import { initialPlots } from '../data/mockPlots'

/**
 * Maps raw plot data to a standardized plot object
 */
export function formatPlot(id, data = {}) {
  let geo = typeof data.geo === 'object' && data.geo !== null && data.geo.lat ? data.geo : null;
  if (!geo && data.coordinates && typeof data.coordinates === 'string') {
    const parts = data.coordinates.split(',');
    if (parts.length >= 2) {
      geo = {
        lat: parseFloat(parts[0]) || 13.0827,
        lng: parseFloat(parts[1]) || 80.2707,
      };
    }
  }
  if (!geo) {
    geo = { lat: 13.0827, lng: 80.2707 };
  }

  return {
    id,
    projectId: String(data.projectId || 'proj-01'),
    projectName: String(data.projectName || data.projectId || 'Greenfield Meadows'),
    plotNumber: String(data.plotNumber || ''),
    surveyNumber: String(data.surveyNumber || ''),
    areaSqft: Number(data.areaSqft || 0),
    ratePerSqft: Number(data.ratePerSqft || 0),
    totalAmount: Number(data.totalAmount || (data.areaSqft && data.ratePerSqft ? data.areaSqft * data.ratePerSqft : 0)),
    status: data.status || 'available',
    facing: String(data.facing || 'East'),
    roadWidth: Number(data.roadWidth || 30),
    photos: Array.isArray(data.photos) && data.photos.length > 0
      ? data.photos.filter((item) => typeof item === 'string')
      : ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=80'],
    documents: Array.isArray(data.documents) ? data.documents.filter((item) => typeof item === 'string') : [],
    geo,
    coordinates: data.coordinates || `${geo.lat}° N, ${geo.lng}° E`,
    location: typeof data.location === 'string' ? data.location : 'Bengaluru',
    description: typeof data.description === 'string' ? data.description : '',
    amenities: Array.isArray(data.amenities) ? data.amenities : ['Gated Community', 'Clear Title', 'Tar Road'],
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || null,
  }
}

// Admin: subscribe to all plots
export function subscribeToPlots(onChange, onError) {
  if (!isFirebaseConfigured || !db) {
    onChange(initialPlots)
    return () => undefined
  }
  return onSnapshot(
    collection(db, 'plots'),
    (snapshot) => {
      if (snapshot.empty) {
        onChange(initialPlots)
      } else {
        onChange(snapshot.docs.map((item) => formatPlot(item.id, item.data())))
      }
    },
    (err) => {
      console.warn('subscribeToPlots fallback to mockPlots:', err?.message)
      onChange(initialPlots)
      if (onError) onError(err)
    }
  )
}

// Public: subscribe to available & reserved plots
export function subscribeToPublicPlots(onChange, onError) {
  const defaultPublic = initialPlots.filter((p) => p.status === 'available' || p.status === 'reserved');
  if (!isFirebaseConfigured || !db) {
    onChange(defaultPublic)
    return () => undefined
  }
  const q = query(collection(db, 'plots'), where('status', 'in', ['available', 'reserved']))
  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        onChange(defaultPublic)
      } else {
        onChange(snapshot.docs.map((item) => formatPlot(item.id, item.data())))
      }
    },
    (err) => {
      console.warn('subscribeToPublicPlots fallback to mockPlots:', err?.message)
      onChange(defaultPublic)
      if (onError) onError(err)
    }
  )
}

// Get single plot
export async function getPlot(plotId) {
  if (!isFirebaseConfigured || !db) return null
  const snapshot = await getDoc(doc(db, 'plots', plotId))
  return snapshot.exists() ? formatPlot(snapshot.id, snapshot.data()) : null
}

export const getPublicPlot = getPlot

// Create plot
export async function createPlot(input) {
  if (!isFirebaseConfigured || !db) throw new Error('Firebase is not configured.')
  const { areaSqft, ratePerSqft, ...rest } = input
  const totalAmount = Number(areaSqft) * Number(ratePerSqft)
  
  const addPromise = addDoc(collection(db, 'plots'), {
    ...rest,
    areaSqft: Number(areaSqft),
    ratePerSqft: Number(ratePerSqft),
    totalAmount,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(
      () =>
        reject(
          new Error(
            'Database write timed out. Cloud Firestore database does not exist or is unreachable. Please finish creating Cloud Firestore in your Firebase Console (Step 2 of 2) and click Enable.'
          )
        ),
      8000
    )
  )

  const docRef = await Promise.race([addPromise, timeoutPromise])
  await confirmServerSync('create')
  return docRef
}

// Update plot
export async function updatePlot(plotId, input) {
  if (!isFirebaseConfigured || !db) throw new Error('Firebase is not configured.')
  const { areaSqft, ratePerSqft, ...rest } = input
  const totalAmount = Number(areaSqft) * Number(ratePerSqft)

  const updatePromise = updateDoc(doc(db, 'plots', plotId), {
    ...rest,
    areaSqft: Number(areaSqft),
    ratePerSqft: Number(ratePerSqft),
    totalAmount,
    updatedAt: serverTimestamp(),
  })

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(
      () =>
        reject(
          new Error(
            'Database update timed out. Cloud Firestore database is unreachable. Please make sure it is enabled in Firebase Console.'
          )
        ),
      8000
    )
  )

  await Promise.race([updatePromise, timeoutPromise])
  await confirmServerSync('update')
}

// Delete plot
export async function deletePlot(plotId) {
  if (!isFirebaseConfigured || !db) throw new Error('Firebase is not configured.')

  const deletePromise = deleteDoc(doc(db, 'plots', plotId))
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(
      () =>
        reject(
          new Error('Database delete timed out. Cloud Firestore database is unreachable.')
        ),
      8000
    )
  )

  return Promise.race([deletePromise, timeoutPromise])
}

// Upload plot photos/documents to Firebase Storage
export async function uploadPlotFiles(plotId, files, kind = 'photos') {
  if (!isFirebaseConfigured || !storage) throw new Error('Firebase Storage is not configured.')
  if (!files.length) return []
  const maxBytes = 10 * 1024 * 1024
  const allowed = kind === 'photos' ? ['image/jpeg', 'image/png', 'image/webp'] : ['application/pdf']
  if (files.some((file) => file.size > maxBytes)) throw new Error('Each file must be 10 MB or smaller.')
  if (files.some((file) => !allowed.includes(file.type))) {
    throw new Error(kind === 'photos' ? 'Photos must be JPG, PNG, or WebP files.' : 'Documents must be PDF files.')
  }
  const uploadTask = Promise.all(
    files.map(async (file) => {
      const fileRef = ref(storage, `plots/${plotId}/${kind}/${Date.now()}-${file.name}`)
      await uploadBytes(fileRef, file)
      return getDownloadURL(fileRef)
    })
  )

  const timeoutTask = new Promise((_, reject) =>
    setTimeout(
      () =>
        reject(
          new Error(
            'File upload timed out. Please make sure Firebase Storage is enabled in Firebase Console (Storage > Get started) and storage.rules are published.'
          )
        ),
      12000
    )
  )

  try {
    return await Promise.race([uploadTask, timeoutTask])
  } catch (err) {
    if (err?.code === 'storage/unauthorized') {
      throw new Error('Firebase Storage permission denied. Please update and publish storage.rules in Firebase Console.')
    }
    if (
      err?.code === 'storage/bucket-not-found' ||
      err?.code === 'storage/project-not-found' ||
      err?.message?.includes('404')
    ) {
      throw new Error(
        'Firebase Storage has not been enabled yet. Please go to Firebase Console > Storage and click "Get started".'
      )
    }
    throw err
  }
}

export async function appendPlotFiles(plotId, kind, urls) {
  if (!isFirebaseConfigured || !db) throw new Error('Firebase is not configured.')
  if (!urls.length) return
  const plot = await getPlot(plotId)
  if (!plot) throw new Error('Plot not found.')
  await updateDoc(doc(db, 'plots', plotId), {
    [kind]: [...(plot[kind] || []), ...urls],
    updatedAt: serverTimestamp(),
  })
}
