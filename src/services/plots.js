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
} from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { db, isFirebaseConfigured, storage } from '../firebase/config'

/**
 * Maps raw plot data to a standardized plot object
 */
export function formatPlot(id, data = {}) {
  return {
    id,
    projectId: String(data.projectId || ''),
    plotNumber: String(data.plotNumber || ''),
    surveyNumber: String(data.surveyNumber || ''),
    areaSqft: Number(data.areaSqft || 0),
    ratePerSqft: Number(data.ratePerSqft || 0),
    totalAmount: Number(data.totalAmount || (data.areaSqft && data.ratePerSqft ? data.areaSqft * data.ratePerSqft : 0)),
    status: data.status || 'available',
    facing: String(data.facing || ''),
    roadWidth: Number(data.roadWidth || 0),
    photos: Array.isArray(data.photos) ? data.photos.filter((item) => typeof item === 'string') : [],
    documents: Array.isArray(data.documents) ? data.documents.filter((item) => typeof item === 'string') : [],
    geo: typeof data.geo === 'object' && data.geo !== null ? data.geo : { lat: 0, lng: 0 },
    location: typeof data.location === 'string' ? data.location : '',
    description: typeof data.description === 'string' ? data.description : '',
    createdAt: data.createdAt || null,
    updatedAt: data.updatedAt || null,
  }
}

// Admin: subscribe to all plots
export function subscribeToPlots(onChange, onError) {
  if (!isFirebaseConfigured || !db) {
    onChange([])
    return () => undefined
  }
  return onSnapshot(
    collection(db, 'plots'),
    (snapshot) => {
      onChange(snapshot.docs.map((item) => formatPlot(item.id, item.data())))
    },
    onError
  )
}

// Public: subscribe to available & reserved plots
export function subscribeToPublicPlots(onChange, onError) {
  if (!isFirebaseConfigured || !db) {
    onChange([])
    return () => undefined
  }
  const q = query(collection(db, 'plots'), where('status', 'in', ['available', 'reserved']))
  return onSnapshot(
    q,
    (snapshot) => {
      onChange(snapshot.docs.map((item) => formatPlot(item.id, item.data())))
    },
    onError
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
  return addDoc(collection(db, 'plots'), {
    ...rest,
    areaSqft: Number(areaSqft),
    ratePerSqft: Number(ratePerSqft),
    totalAmount,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

// Update plot
export async function updatePlot(plotId, input) {
  if (!isFirebaseConfigured || !db) throw new Error('Firebase is not configured.')
  const { areaSqft, ratePerSqft, ...rest } = input
  const totalAmount = Number(areaSqft) * Number(ratePerSqft)
  await updateDoc(doc(db, 'plots', plotId), {
    ...rest,
    areaSqft: Number(areaSqft),
    ratePerSqft: Number(ratePerSqft),
    totalAmount,
    updatedAt: serverTimestamp(),
  })
}

// Delete plot
export async function deletePlot(plotId) {
  if (!isFirebaseConfigured || !db) throw new Error('Firebase is not configured.')
  await deleteDoc(doc(db, 'plots', plotId))
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
  return Promise.all(
    files.map(async (file) => {
      const fileRef = ref(storage, `plots/${plotId}/${kind}/${Date.now()}-${file.name}`)
      await uploadBytes(fileRef, file)
      return getDownloadURL(fileRef)
    })
  )
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
