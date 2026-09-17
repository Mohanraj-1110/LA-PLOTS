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

function toCustomerData(input) {
  return {
    ...input,
    budget: Number(input.budget) || 0,
    nextFollowupDate: input.nextFollowupDate
      ? Timestamp.fromDate(new Date(`${input.nextFollowupDate}T00:00:00`))
      : null,
    updatedAt: serverTimestamp(),
  }
}

export function subscribeToCustomers(onChange, onError) {
  if (!isFirebaseConfigured || !db) {
    onChange([])
    return () => undefined
  }
  return onSnapshot(
    collection(db, 'customers'),
    (snapshot) => {
      onChange(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })))
    },
    onError
  )
}

export async function getCustomer(customerId) {
  if (!isFirebaseConfigured || !db) return null
  const snapshot = await getDoc(doc(db, 'customers', customerId))
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null
}

export async function createCustomer(input) {
  if (!isFirebaseConfigured || !db) throw new Error('Firebase is not configured.')
  return addDoc(collection(db, 'customers'), {
    ...toCustomerData(input),
    createdAt: serverTimestamp(),
  })
}

export async function updateCustomer(customerId, input) {
  if (!isFirebaseConfigured || !db) throw new Error('Firebase is not configured.')
  await updateDoc(doc(db, 'customers', customerId), toCustomerData(input))
}

export async function deleteCustomer(customerId) {
  if (!isFirebaseConfigured || !db) throw new Error('Firebase is not configured.')
  await deleteDoc(doc(db, 'customers', customerId))
}
