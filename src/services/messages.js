import {
  addDoc,
  collection,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../firebase/config'

export function subscribeToMessages(onChange, onError) {
  if (!isFirebaseConfigured || !db) {
    onChange([])
    return () => undefined
  }
  return onSnapshot(
    collection(db, 'messages'),
    (snapshot) => {
      onChange(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })))
    },
    onError
  )
}

export async function sendMessage(input) {
  if (!isFirebaseConfigured || !db) throw new Error('Firebase is not configured.')
  return addDoc(collection(db, 'messages'), {
    ...input,
    createdAt: serverTimestamp(),
  })
}
