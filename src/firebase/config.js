import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getAnalytics, isSupported } from 'firebase/analytics'
import { getStorage } from 'firebase/storage'

const env = (typeof import.meta !== 'undefined' && import.meta.env) || {}

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || '',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: env.VITE_FIREBASE_APP_ID || '',
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || '',
}

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId
)

export const firebaseApp = getApps().length > 0
  ? getApps()[0]
  : initializeApp(firebaseConfig)

// Firebase Authentication
export const auth = isFirebaseConfigured ? getAuth(firebaseApp) : null

// Firebase Storage (for document & image uploads if enabled)
export const storage = isFirebaseConfigured && firebaseConfig.storageBucket
  ? getStorage(firebaseApp)
  : null

// Firebase Analytics (supported in browser environments)
export let analytics = null
if (typeof window !== 'undefined' && isFirebaseConfigured && firebaseConfig.measurementId) {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(firebaseApp)
    }
  }).catch(() => {
    // Ignore analytics initialization failure in unsupported environments
  })
}

// All database persistence has migrated to MongoDB Atlas
export const db = null
export const functions = null

