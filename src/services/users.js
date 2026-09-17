import {
  collection,
  deleteDoc,
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

const CACHE_KEY = 'la_plots_all_users'

function getInitialSeedUsers() {
  const currentAuth = auth?.currentUser
  const seed = [
    {
      uid: currentAuth?.uid || 'admin_mohanraj',
      name: currentAuth?.displayName || 'Mohanraj S',
      email: currentAuth?.email || 'admin@laplots.com',
      phone: currentAuth?.phoneNumber || '+91 98400 12345',
      role: 'admin',
      createdAt: { seconds: Math.floor(Date.now() / 1000) - 86400 * 30 },
    },
    {
      uid: 'agent_saravanan',
      name: 'Saravanan K',
      email: 'saravanan.agent@laplots.com',
      phone: '+91 94440 56789',
      role: 'agent',
      createdAt: { seconds: Math.floor(Date.now() / 1000) - 86400 * 14 },
    },
    {
      uid: 'customer_priya',
      name: 'Priya Raman',
      email: 'priya.customer@gmail.com',
      phone: '+91 98840 98765',
      role: 'customer',
      createdAt: { seconds: Math.floor(Date.now() / 1000) - 86400 * 5 },
    },
  ]
  return seed
}

export function getCachedUsers() {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    }
  } catch {}
  return getInitialSeedUsers()
}

export function saveCachedUsers(usersList) {
  if (typeof window === 'undefined' || !Array.isArray(usersList)) return
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(usersList))
  } catch {}
}

function mergeUsers(firestoreUsers) {
  const currentAuth = auth?.currentUser
  const list = [...firestoreUsers]

  if (currentAuth) {
    const existingIndex = list.findIndex((u) => u.uid === currentAuth.uid || u.email === currentAuth.email)
    const localRole = typeof window !== 'undefined' ? localStorage.getItem('la_plots_user_role') : null
    const effectiveRole = localRole || 'admin'

    if (existingIndex >= 0) {
      list[existingIndex] = {
        ...list[existingIndex],
        uid: currentAuth.uid,
        name: list[existingIndex].name || currentAuth.displayName || 'Mohanraj S',
        email: currentAuth.email || list[existingIndex].email,
        role: list[existingIndex].role || effectiveRole,
      }
    } else {
      list.unshift({
        uid: currentAuth.uid,
        name: currentAuth.displayName || 'Mohanraj S',
        email: currentAuth.email || 'admin@laplots.com',
        phone: currentAuth.phoneNumber || '',
        role: effectiveRole,
        createdAt: { seconds: Math.floor(Date.now() / 1000) },
      })
    }
  }

  return list
}

export function subscribeToUsers(onChange, onError) {
  // 1. Immediately provide cached/seed users so the page never renders blank or 0
  const initialData = getCachedUsers()
  onChange(initialData)

  if (!isFirebaseConfigured || !db) {
    return () => undefined
  }

  // 2. Real-time Firestore listener
  return onSnapshot(
    collection(db, 'users'),
    (snapshot) => {
      let firestoreUsers = snapshot.docs.map((item) => ({ uid: item.id, ...item.data() }))
      if (firestoreUsers.length === 0) {
        // If Firestore collection is empty, seed it with the current user doc
        firestoreUsers = initialData
        const currentAuth = auth?.currentUser
        if (currentAuth) {
          setDoc(
            doc(db, 'users', currentAuth.uid),
            {
              uid: currentAuth.uid,
              name: currentAuth.displayName || 'Mohanraj S',
              email: currentAuth.email || '',
              role: 'admin',
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          ).catch(() => {})
        }
      }

      const merged = mergeUsers(firestoreUsers)
      saveCachedUsers(merged)
      onChange(merged)
    },
    (err) => {
      console.warn('[Firestore] users subscribe warning, keeping fallback active:', err?.message)
      if (onError) onError(err)
      onChange(getCachedUsers())
    }
  )
}

export async function getUserProfile(uid) {
  if (!isFirebaseConfigured || !db || !uid) return null
  try {
    const snapshot = await getDoc(doc(db, 'users', uid))
    return snapshot.exists() ? { uid: snapshot.id, ...snapshot.data() } : null
  } catch (err) {
    console.warn('[Firestore] getUserProfile error:', err?.message)
    return null
  }
}

export async function saveProfile(uid, values) {
  // Update local cache immediately
  const cached = getCachedUsers()
  const updated = cached.map((u) => (u.uid === uid ? { ...u, ...values } : u))
  saveCachedUsers(updated)

  if (!isFirebaseConfigured || !db) return
  await setDoc(
    doc(db, 'users', uid),
    {
      ...values,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  )
}

export const updateCustomerProfile = saveProfile

export async function createUserDoc(values) {
  const uid = values.uid || `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  const newDoc = {
    uid,
    name: values.name?.trim() || 'User',
    email: values.email?.trim() || '',
    phone: values.phone?.trim() || '',
    role: values.role || 'customer',
    photoURL: values.photoURL || '',
    createdAt: { seconds: Math.floor(Date.now() / 1000) },
  }

  // Update local cache immediately
  const cached = getCachedUsers()
  saveCachedUsers([newDoc, ...cached])

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'users', uid), {
        ...newDoc,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    } catch (err) {
      console.warn('[Firestore] createUserDoc write note:', err?.message)
    }
  }

  return newDoc
}

export async function changeUserRole(uid, role) {
  // Update local cache immediately
  const cached = getCachedUsers()
  const updated = cached.map((u) => (u.uid === uid ? { ...u, role } : u))
  saveCachedUsers(updated)

  // Synchronize active session if this is the current user
  if (typeof window !== 'undefined') {
    try {
      const pKey = `la_plots_profile_${uid}`
      const p = localStorage.getItem(pKey)
      if (p) {
        localStorage.setItem(pKey, JSON.stringify({ ...JSON.parse(p), role }))
      }
      if (auth?.currentUser?.uid === uid) {
        localStorage.setItem('la_plots_user_role', role)
      }
    } catch {}
  }

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(
        doc(db, 'users', uid),
        {
          role,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      )
    } catch (err) {
      console.warn('[Firestore] changeUserRole update note:', err?.message)
    }
  }
}

export async function deleteUserDoc(uid) {
  // Remove from local cache immediately
  const cached = getCachedUsers()
  const updated = cached.filter((u) => u.uid !== uid)
  saveCachedUsers(updated)

  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, 'users', uid))
    } catch (err) {
      console.warn('[Firestore] deleteUserDoc notice:', err?.message)
    }
  }
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
