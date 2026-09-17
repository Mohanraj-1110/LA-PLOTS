import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../firebase/config'

export function subscribeToSales(onChange, onError) {
  if (!isFirebaseConfigured || !db) {
    onChange([])
    return () => undefined
  }
  return onSnapshot(
    collection(db, 'sales'),
    (snapshot) => {
      onChange(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })))
    },
    onError
  )
}

export async function getSale(saleId) {
  if (!isFirebaseConfigured || !db) return null
  const snapshot = await getDoc(doc(db, 'sales', saleId))
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null
}

export async function createSale(input) {
  if (!isFirebaseConfigured || !db) throw new Error('Firebase is not configured.')
  const saleAmount = Number(input.saleAmount) || 0
  const cost = Number(input.cost) || 0
  const profit = saleAmount - cost
  return addDoc(collection(db, 'sales'), {
    ...input,
    saleAmount,
    cost,
    profit,
    saleDate: input.saleDate ? Timestamp.fromDate(new Date(input.saleDate)) : serverTimestamp(),
    createdAt: serverTimestamp(),
  })
}

export async function updateSale(saleId, input) {
  if (!isFirebaseConfigured || !db) throw new Error('Firebase is not configured.')
  const saleAmount = Number(input.saleAmount) || 0
  const cost = Number(input.cost) || 0
  const profit = saleAmount - cost
  await updateDoc(doc(db, 'sales', saleId), {
    ...input,
    saleAmount,
    cost,
    profit,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteSale(saleId) {
  if (!isFirebaseConfigured || !db) throw new Error('Firebase is not configured.')
  await deleteDoc(doc(db, 'sales', saleId))
}
