import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore'
import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage'
import { db, isFirebaseConfigured, storage } from '../firebase/config'

export const documentCategories = [
  'Land Documents',
  'Layout',
  'Sale Agreement',
  'Customer Documents',
  'Receipts',
  'Registration',
  'Other',
]

export function subscribeToDocuments(onChange, onError) {
  if (!isFirebaseConfigured || !db) {
    onChange([])
    return () => undefined
  }
  return onSnapshot(
    collection(db, 'documents'),
    (snapshot) => {
      onChange(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })))
    },
    onError
  )
}

export async function uploadDocument(file, metadata, onProgress) {
  if (!isFirebaseConfigured || !storage || !db) throw new Error('Firebase is not configured.')
  if (file.size > 10 * 1024 * 1024) throw new Error('Documents must be 10 MB or smaller.')
  if (file.type !== 'application/pdf') throw new Error('Only PDF documents are supported.')

  const fileRef = ref(storage, `documents/${Date.now()}-${file.name}`)
  const upload = uploadBytesResumable(fileRef, file)

  const url = await new Promise((resolve, reject) => {
    upload.on(
      'state_changed',
      (snapshot) => {
        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
        onProgress?.(progress)
      },
      reject,
      async () => {
        const downloadUrl = await getDownloadURL(upload.snapshot.ref)
        resolve(downloadUrl)
      }
    )
  })

  const document = await addDoc(collection(db, 'documents'), {
    ...metadata,
    fileUrl: url,
    createdAt: serverTimestamp(),
  })

  return document.id
}

export async function deleteDocument(document) {
  if (!isFirebaseConfigured || !db) throw new Error('Firebase is not configured.')
  await deleteDoc(doc(db, 'documents', document.id))
  if (storage && document.fileUrl) {
    try {
      await deleteObject(ref(storage, document.fileUrl))
    } catch {
      // Storage object might already be removed or unreachable
    }
  }
}
