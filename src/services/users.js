import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { updatePassword } from 'firebase/auth'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { httpsCallable } from 'firebase/functions'
import { auth, db, functions, isFirebaseConfigured, storage } from '../firebase/config'

export function subscribeToUsers(onChange, onError) {
  if (!isFirebaseConfigured || !db) {
    onChange([])
    return () => undefined
  }
  return onSnapshot(
    collection(db, 'users'),
    (snapshot) => {
      onChange(snapshot.docs.map((item) => ({ uid: item.id, ...item.data() })))
    },
    onError
  )
}

export async function getUserProfile(uid) {
  if (!isFirebaseConfigured || !db) return null
  const snapshot = await getDoc(doc(db, 'users', uid))
  return snapshot.exists() ? { uid: snapshot.id, ...snapshot.data() } : null
}

export async function saveProfile(uid, values) {
  if (!isFirebaseConfigured || !db) throw new Error('Firebase is not configured.')
  await updateDoc(doc(db, 'users', uid), values)
}

export const updateCustomerProfile = saveProfile

export async function changeUserRole(uid, role) {
  if (!isFirebaseConfigured || !db) throw new Error('Firebase is not configured.')
  await updateDoc(doc(db, 'users', uid), { role })
}

export async function changePassword(password) {
  if (!auth?.currentUser) throw new Error('Sign in is required.')
  await updatePassword(auth.currentUser, password)
}

export function subscribeToCompany(onChange, onError) {
  if (!isFirebaseConfigured || !db) {
    onChange(null)
    return () => undefined
  }
  return onSnapshot(
    doc(db, 'settings', 'company'),
    (snapshot) => {
      onChange(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null)
    },
    onError
  )
}

export async function saveCompany(values) {
  if (!isFirebaseConfigured || !db) throw new Error('Firebase is not configured.')
  await setDoc(doc(db, 'settings', 'company'), { ...values, updatedAt: serverTimestamp() }, { merge: true })
}

export async function uploadKyc(uid, file) {
  if (!isFirebaseConfigured || !storage || !db) throw new Error('Firebase is not configured.')
  if (file.size > 10 * 1024 * 1024) throw new Error('KYC files must be 10 MB or smaller.')
  if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) {
    throw new Error('Use a PDF, JPG, or PNG KYC document.')
  }
  const fileRef = ref(storage, `kyc/${uid}/${Date.now()}-${file.name}`)
  await uploadBytes(fileRef, file)
  const url = await getDownloadURL(fileRef)
  
  const user = await getUserProfile(uid)
  const existingDocs = user?.kycDocuments || []
  await updateDoc(doc(db, 'users', uid), {
    kycDocuments: [...existingDocs, url],
  })
  return url
}

export async function inviteAgent(name, email, temporaryPassword) {
  if (!isFirebaseConfigured || !functions) throw new Error('Firebase Functions are not configured.')
  const call = httpsCallable(functions, 'inviteAgent')
  const result = await call({ name, email, temporaryPassword })
  return result.data.uid
}
