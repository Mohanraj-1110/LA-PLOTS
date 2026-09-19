import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'

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

// Firebase is used exclusively for Authentication
export const auth = isFirebaseConfigured ? getAuth(firebaseApp) : null

// All database persistence has migrated to MongoDB Atlas
export const db = null
export const storage = null
export const functions = null
export const analytics = null
