import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../firebase/config'

export function subscribeToEnquiries(onChange, onError) {
  if (!isFirebaseConfigured || !db) {
    onChange([])
    return () => undefined
  }
  return onSnapshot(
    collection(db, 'enquiries'),
    (snapshot) => {
      onChange(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })))
    },
    onError
  )
}

export async function createEnquiry(data) {
  if (!isFirebaseConfigured || !db) throw new Error('Firebase is not configured.')
  return addDoc(collection(db, 'enquiries'), {
    ...data,
    status: data.status || 'New',
    createdAt: serverTimestamp(),
  })
}

export async function updateEnquiry(id, values) {
  if (!isFirebaseConfigured || !db) throw new Error('Firebase is not configured.')
  await updateDoc(doc(db, 'enquiries', id), values)
}

export async function convertEnquiry(item, agentId) {
  if (!isFirebaseConfigured || !db) throw new Error('Firebase is not configured.')
  const customer = {
    name: item.customerName,
    phone: item.phone,
    email: '',
    address: '',
    budget: item.budget || 0,
    interestedProjectId: item.projectId || '',
    interestedPlotId: '',
    status: 'Converted',
    nextFollowupDate: null,
    notes: item.requirement || '',
    assignedAgentId: agentId,
    createdAt: serverTimestamp(),
  }
  await addDoc(collection(db, 'customers'), customer)
  await updateEnquiry(item.id, { status: 'Converted', assignedAgentId: agentId })
}
