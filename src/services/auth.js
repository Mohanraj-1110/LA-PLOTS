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
 * Fetches user profile from Firestore users/{uid} collection.
 */
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

/**
 * Ensures user document exists in Firestore users/{uid}.
 * Awaits and writes the document so data is reliably saved to Firestore.
 */
export async function ensureUserDocument(firebaseUser, extraData = {}) {
  if (!isFirebaseConfigured || !db || !firebaseUser) {
    return null
  }

  const userRef = doc(db, 'users', firebaseUser.uid)

  const profileData = {
    uid: firebaseUser.uid,
    name: extraData.name || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
    email: firebaseUser.email || '',
    phone: extraData.phone || firebaseUser.phoneNumber || '',
    role: extraData.role || 'customer',
    photoURL: firebaseUser.photoURL || '',
  }

  try {
    // Check if document already exists to preserve role (e.g. admin) and createdAt
    const snapshot = await getDoc(userRef)
    if (snapshot.exists()) {
      const existing = snapshot.data()
      return { uid: snapshot.id, ...existing }
    }

    // Document does not exist yet -> create it in Firestore!
    const newDoc = {
      ...profileData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }
    await setDoc(userRef, newDoc)
    console.log('[Firestore] Successfully created user document in Firestore:', firebaseUser.uid)
    return newDoc
  } catch (err) {
    console.warn('[Firestore] getDoc read error, attempting direct setDoc write:', err?.message)
    try {
      await setDoc(userRef, {
        ...profileData,
        createdAt: serverTimestamp(),
      }, { merge: true })
      console.log('[Firestore] User document created via fallback write:', firebaseUser.uid)
      return profileData
    } catch (writeErr) {
      console.error('[Firestore] CRITICAL: Could not write user to Firestore:', writeErr?.message)
      return profileData
    }
  }
}

/**
 * Email/password sign in - ensures user document exists in Firestore
 */
export async function signIn(email, password) {
  if (!isFirebaseConfigured || !auth) throw new Error('Firebase is not configured.')
  const credential = await signInWithEmailAndPassword(auth, email.trim(), password)
  try {
    await ensureUserDocument(credential.user)
  } catch (err) {
    console.warn('ensureUserDocument on login failed:', err?.message)
  }
  return credential
}

/**
 * Signup - creates Firebase auth user and writes document to Firestore
 */
export async function signUp(name, email, password, role = 'customer') {
  if (!isFirebaseConfigured || !auth) throw new Error('Firebase is not configured.')
  const credential = await createUserWithEmailAndPassword(auth, email.trim(), password)
  
  if (name && credential.user) {
    try {
      await updateProfile(credential.user, { displayName: name.trim() })
    } catch {
      // Non-critical
    }
  }

  // Await Firestore document creation so user data is guaranteed to go to Firestore
  try {
    await ensureUserDocument(credential.user, { name, role })
  } catch (err) {
    console.warn('ensureUserDocument on signup failed:', err?.message)
  }

  return credential.user
}

/**
 * Google popup sign-in - writes user profile to Firestore
 */
export async function googleSignIn() {
  if (!isFirebaseConfigured || !auth) throw new Error('Firebase is not configured.')
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })
  const credential = await signInWithPopup(auth, provider)
  
  // Await Firestore document creation so Google user data is guaranteed to go to Firestore
  try {
    await ensureUserDocument(credential.user)
  } catch (err) {
    console.warn('ensureUserDocument on Google sign-in failed:', err?.message)
  }

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
