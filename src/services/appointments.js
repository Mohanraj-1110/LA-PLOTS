import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../firebase/config'

export const appointmentTypes = ['site visit', 'meeting', 'call', 'registration', 'payment']

function appointmentData(input) {
  return {
    ...input,
    date: input.date ? Timestamp.fromDate(new Date(`${input.date}T00:00:00`)) : null,
    updatedAt: serverTimestamp(),
  }
}

// Admin: subscribe to all appointments
export function subscribeToAppointments(onChange, onError) {
  if (!isFirebaseConfigured || !db) {
    onChange([])
    return () => undefined
  }
  return onSnapshot(
    collection(db, 'appointments'),
    (snapshot) => {
      onChange(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })))
    },
    onError
  )
}

// Customer: subscribe to personal appointments
export function subscribeToCustomerAppointments(uid, onChange, onError) {
  if (!isFirebaseConfigured || !db) {
    onChange([])
    return () => undefined
  }
  return onSnapshot(
    query(collection(db, 'appointments'), where('customerId', '==', uid)),
    (snapshot) => {
      onChange(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })))
    },
    onError
  )
}

export async function getAppointment(appointmentId) {
  if (!isFirebaseConfigured || !db) return null
  const snapshot = await getDoc(doc(db, 'appointments', appointmentId))
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null
}

export async function createAppointment(input) {
  if (!isFirebaseConfigured || !db) throw new Error('Firebase is not configured.')
  return addDoc(collection(db, 'appointments'), {
    ...appointmentData(input),
    createdAt: serverTimestamp(),
  })
}

export async function updateAppointment(appointmentId, input) {
  if (!isFirebaseConfigured || !db) throw new Error('Firebase is not configured.')
  await updateDoc(doc(db, 'appointments', appointmentId), appointmentData(input))
}

export async function deleteAppointment(appointmentId) {
  if (!isFirebaseConfigured || !db) throw new Error('Firebase is not configured.')
  await deleteDoc(doc(db, 'appointments', appointmentId))
}
