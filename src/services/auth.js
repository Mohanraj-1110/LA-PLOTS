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
import { auth, isFirebaseConfigured } from '../firebase/config.js'
import { api } from './api.js'

/**
 * Checks whether an email belongs to an authorized admin
 */
export function isAdminEmail(email) {
  if (!email) return false
  const clean = email.toLowerCase().trim()
  // Admin emails MUST be set via VITE_ADMIN_EMAILS environment variable.
  // No hardcoded fallback - prevents accidental privilege escalation in production.
  const rawAdmins =
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADMIN_EMAILS) || ''
  if (!rawAdmins.trim()) return false
  const envAdmins = rawAdmins
    .toLowerCase()
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  return envAdmins.includes(clean)
}

/**
 * Converts Firebase error codes into friendly user-facing messages
 */
export function formatAuthError(err) {
  if (!err) return 'An unexpected error occurred.'
  const code = err.code || ''
  if (code === 'auth/missing-password') {
    return 'Please enter your password.'
  }
  if (code === 'auth/missing-email') {
    return 'Please enter your email address.'
  }
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
  if (code === 'auth/account-exists-with-different-credential') {
    return 'An account with this email already exists with a different sign-in method. Please sign in with your email and password.'
  }
  if (code === 'auth/credential-already-in-use') {
    return 'This credential is already linked to another account.'
  }
  if (code === 'auth/weak-password') {
    return 'Password is too weak. Please use at least 6 characters.'
  }
  if (code === 'auth/invalid-email') {
    return 'Please enter a valid email address.'
  }
  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
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
  return err.message || 'Authentication failed. Please try again.'
}

export function subscribeToAuth(callback) {
  if (!isFirebaseConfigured || !auth) {
    callback(null)
  } else {
    return onAuthStateChanged(auth, callback)
  }
  return () => undefined
}

/**
 * Fetches user profile from MongoDB Atlas /api/users/:uid
 */
export async function getUserProfile(uid) {
  if (!uid) return null
  try {
    const user = await api.get(`/users/${uid}`)
    return user
  } catch (err) {
    console.warn('[MongoDB Atlas] getUserProfile note:', err?.message)
    return null
  }
}

/**
 * Ensures user document exists in MongoDB Atlas users collection
 */
export async function ensureUserDocument(firebaseUser, extraData = {}) {
  if (!firebaseUser) return null

  const uid = firebaseUser.uid
  const isDefaultAdmin = isAdminEmail(firebaseUser.email)
  const resolvedRole = isDefaultAdmin ? 'admin' : (extraData.role === 'admin' ? 'customer' : (extraData.role || 'customer'))

  const profileData = {
    uid,
    name: extraData.name?.trim() || firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'User'),
    email: firebaseUser.email || '',
    phone: extraData.phone || firebaseUser.phoneNumber || '',
    role: resolvedRole,
    photoURL: firebaseUser.photoURL || '',
    company: extraData.company || 'LK Properties',
  }

  try {
    const saved = await api.post('/users', profileData)
    return saved
  } catch (err) {
    console.warn('[MongoDB Atlas] ensureUserDocument notice:', err?.message)
    return profileData
  }
}

/**
 * Fast Email/password sign in
 */
export async function signIn(email, password) {
  if (!isFirebaseConfigured || !auth) throw new Error('Firebase is not configured.')
  const cleanEmail = (email || '').trim().toLowerCase()
  const cleanPassword = (password || '').trim()

  if (!cleanEmail) {
    const err = new Error('Please enter your email address.')
    err.code = 'auth/missing-email'
    throw err
  }
  if (!cleanPassword) {
    const err = new Error('Please enter your password.')
    err.code = 'auth/missing-password'
    throw err
  }

  return signInWithEmailAndPassword(auth, cleanEmail, cleanPassword)
}

/**
 * Signup - creates Firebase auth user and syncs profile with MongoDB Atlas
 * Supports both (name, email, password, role) and (name, phone, email, password, role)
 */
export async function signUp(...args) {
  if (!isFirebaseConfigured || !auth) throw new Error('Firebase is not configured.')

  let name = ''
  let phone = ''
  let email = ''
  let password = ''
  let role = 'customer'

  if (args.length >= 4 && typeof args[1] === 'string' && !args[1].includes('@') && args[2]?.includes('@')) {
    // (name, phone, email, password, role)
    name = args[0] || ''
    phone = args[1] || ''
    email = args[2] || ''
    password = args[3] || ''
    role = args[4] || 'customer'
  } else {
    // (name, email, password, role) or (name, email, password)
    name = args[0] || ''
    email = args[1] || ''
    password = args[2] || ''
    role = args[3] || 'customer'
  }

  const cleanName = (name || '').trim()
  const cleanPhone = (phone || '').trim()
  const cleanEmail = (email || '').trim().toLowerCase()
  const cleanPassword = (password || '').trim()

  if (!cleanEmail) {
    const err = new Error('Please enter your email address.')
    err.code = 'auth/missing-email'
    throw err
  }
  if (!cleanPassword) {
    const err = new Error('Please enter a password.')
    err.code = 'auth/missing-password'
    throw err
  }

  const credential = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPassword)
  
  if (cleanName && credential.user) {
    try {
      await updateProfile(credential.user, { displayName: cleanName })
    } catch (err) {
      console.warn('updateProfile notice:', err?.message)
    }
  }

  const effectiveRole = isAdminEmail(cleanEmail) ? 'admin' : (role || 'customer')
  // Sync profile to MongoDB Atlas
  ensureUserDocument(credential.user, {
    name: cleanName,
    phone: cleanPhone,
    role: effectiveRole,
  }).catch((err) => {
    console.warn('Background MongoDB Atlas ensureUserDocument notice:', err?.message)
  })

  return credential.user
}

/**
 * Google popup sign-in - fast authentication + MongoDB Atlas user record sync
 */
export async function googleSignIn() {
  if (!isFirebaseConfigured || !auth) throw new Error('Firebase is not configured.')
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })
  const credential = await signInWithPopup(auth, provider)
  
  const effectiveRole = isAdminEmail(credential.user.email) ? 'admin' : 'customer'
  // Sync user profile into MongoDB Atlas
  ensureUserDocument(credential.user, {
    name: credential.user.displayName || credential.user.email?.split('@')[0] || 'User',
    phone: credential.user.phoneNumber || '',
    role: effectiveRole,
  }).catch((err) => {
    console.warn('Background MongoDB Atlas ensureUserDocument notice:', err?.message)
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
