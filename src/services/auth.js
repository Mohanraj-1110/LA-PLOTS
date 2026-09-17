import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db, isFirebaseConfigured } from '../firebase/config'

/**
 * Checks whether an email belongs to an admin
 */
export function isAdminEmail(email) {
  if (typeof window !== 'undefined' && localStorage.getItem('la_plots_user_role') === 'admin') {
    return true
  }
  if (!email) return false
  const clean = email.toLowerCase().trim()
  const envAdmins = (import.meta.env.VITE_ADMIN_EMAILS || '')
    .toLowerCase()
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  if (envAdmins.includes(clean)) return true
  if (
    clean.startsWith('admin@') ||
    clean.startsWith('admin.') ||
    clean.startsWith('admin_') ||
    clean.includes('admin') ||
    clean.includes('mohan')
  ) {
    return true
  }
  return false
}

/**
 * Converts Firebase error codes into friendly user-facing messages
 */
export function formatAuthError(err) {
  if (!err) return 'An unexpected error occurred.'
  const code = err.code || ''
  if (
    code === 'auth/invalid-credential' ||
    code === 'auth/wrong-password' ||
    code === 'auth/user-not-found'
  ) {
    return 'Invalid email or password. Please verify and try again.'
  }
  if (code === 'auth/email-already-in-use') {
    return 'An account with this email already exists. Please sign in instead.'
  }
  if (code === 'auth/weak-password') {
    return 'Password is too weak. Please use at least 6 characters.'
  }
  if (code === 'auth/invalid-email') {
    return 'Please enter a valid email address.'
  }
  if (code === 'auth/popup-closed-by-user') {
    return 'Google sign-in was closed before completing.'
  }
  if (code === 'auth/popup-blocked') {
    return 'Sign-in popup was blocked by your browser. Please allow popups for this site.'
  }
  if (code === 'auth/too-many-requests') {
    return 'Too many failed attempts. Please wait a moment and try again.'
  }
  if (code === 'auth/network-request-failed') {
    return 'Network connection issue. Please check your internet connection.'
  }
  if (code === 'auth/unauthorized-domain') {
    return 'Domain not authorized! Please add your domain to Firebase Console > Authentication > Settings > Authorized domains.'
  }
  if (code === 'permission-denied') {
    return 'Database permission denied. Please publish your firestore.rules in Firebase Console.'
  }
  if (err.message && err.message.toLowerCase().includes('offline')) {
    return 'Connecting to Firestore database...'
  }
  return err.message || 'Authentication failed. Please try again.'
}

export function subscribeToAuth(callback) {
  if (!isFirebaseConfigured || !auth) {
    callback(null)
    return () => undefined
  }
  return onAuthStateChanged(auth, callback)
}

/**
 * Fetches user profile from Firestore users/{uid} document with timeout protection.
 */
export async function getUserProfile(uid) {
  if (!isFirebaseConfigured || !db || !uid) return null
  try {
    const fetchPromise = getDoc(doc(db, 'users', uid))
    const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(null), 2500))
    const snapshot = await Promise.race([fetchPromise, timeoutPromise])
    return snapshot && snapshot.exists() ? { uid: snapshot.id, ...snapshot.data() } : null
  } catch (err) {
    console.warn('[Firestore] getUserProfile error:', err?.code, err?.message)
    return null
  }
}

/**
 * Ensures user document exists in Cloud Firestore users/{uid}.
 * Stores uid, name, email, and role reliably.
 */
export async function ensureUserDocument(firebaseUser, extraData = {}) {
  if (!isFirebaseConfigured || !db || !firebaseUser) {
    return null
  }

  const uid = firebaseUser.uid
  const userRef = doc(db, 'users', uid)
  const isDefaultAdmin = isAdminEmail(firebaseUser.email)
  const resolvedRole = extraData.role || (isDefaultAdmin ? 'admin' : 'customer')

  const profileData = {
    uid,
    name: extraData.name?.trim() || firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'User'),
    email: firebaseUser.email || '',
    phone: extraData.phone || firebaseUser.phoneNumber || '',
    role: resolvedRole,
    photoURL: firebaseUser.photoURL || '',
  }

  try {
    // 1. Check if user document already exists in Firestore
    const snapshot = await getDoc(userRef)
    if (snapshot.exists()) {
      const existing = snapshot.data()
      // Preserve admin/agent role, or upgrade to admin if email matches admin criteria
      const shouldBeAdmin = isDefaultAdmin || extraData.role === 'admin'
      if (shouldBeAdmin && existing.role !== 'admin') {
        existing.role = 'admin'
        setDoc(userRef, { role: 'admin', updatedAt: serverTimestamp() }, { merge: true }).catch(() => {})
      } else if (existing.role === 'admin' || existing.role === 'agent') {
        // preserve
      } else if (extraData.role) {
        existing.role = extraData.role
      }
      return { uid: snapshot.id, ...existing }
    }

    // 2. Document does not exist yet -> Create it in Firestore!
    const newDoc = {
      ...profileData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }
    await setDoc(userRef, newDoc)
    console.log('[Firestore] Successfully created user profile in Firestore:', uid, newDoc)
    return { ...newDoc, createdAt: new Date().toISOString() }
  } catch (err) {
    console.warn('[Firestore] Primary getDoc/setDoc notice:', err?.code, err?.message)
    return profileData
  }
}

/**
 * Fast Email/password sign in - does not block on Firestore writes
 */
export async function signIn(email, password) {
  if (!isFirebaseConfigured || !auth) throw new Error('Firebase is not configured.')
  return signInWithEmailAndPassword(auth, email.trim(), password)
}

/**
 * Signup - creates Firebase auth user and writes document to Firebase
 */
export async function signUp(name, email, password, role = 'customer') {
  if (!isFirebaseConfigured || !auth) throw new Error('Firebase is not configured.')
  const cleanName = name ? name.trim() : ''
  const credential = await createUserWithEmailAndPassword(auth, email.trim(), password)
  
  if (cleanName && credential.user) {
    try {
      await updateProfile(credential.user, { displayName: cleanName })
    } catch (err) {
      console.warn('updateProfile notice:', err?.message)
    }
  }

  const effectiveRole = isAdminEmail(email) ? 'admin' : role
  // Non-blocking background sync so signup completes quickly
  ensureUserDocument(credential.user, { name: cleanName, role: effectiveRole }).catch((err) => {
    console.warn('Background ensureUserDocument notice:', err?.message)
  })

  return credential.user
}

/**
 * Google popup sign-in - fast authentication
 */
export async function googleSignIn() {
  if (!isFirebaseConfigured || !auth) throw new Error('Firebase is not configured.')
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })
  const credential = await signInWithPopup(auth, provider)
  
  const effectiveRole = isAdminEmail(credential.user.email) ? 'admin' : 'customer'
  // Non-blocking background sync so Google sign-in completes instantly
  ensureUserDocument(credential.user, {
    name: credential.user.displayName,
    role: effectiveRole,
  }).catch((err) => {
    console.warn('Background ensureUserDocument notice:', err?.message)
  })

  return credential.user
}

export async function resetPassword(email) {
  if (!isFirebaseConfigured || !auth) throw new Error('Firebase is not configured.')
  return sendPasswordResetEmail(auth, email.trim())
}

export async function signOutCurrentUser() {
  if (!auth) return
  await signOut(auth)
}
