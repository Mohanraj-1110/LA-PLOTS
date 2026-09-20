import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getAnalytics, isSupported } from 'firebase/analytics'
import { getStorage } from 'firebase/storage'

const env = (typeof import.meta !== 'undefined' && import.meta.env) || {}

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || 'AIzaSyDeVkAV_3dpq2UlfS7S2Qr3RUUH9aGk_VY',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || 'lk-properties-58446.firebaseapp.com',
  projectId: env.VITE_FIREBASE_PROJECT_ID || 'lk-properties-58446',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || 'lk-properties-58446.firebasestorage.app',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '609964515952',
  appId: env.VITE_FIREBASE_APP_ID || '1:609964515952:web:24b17fac843b7f127f4ab5',
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || 'G-SQHDC689H3',
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

