import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const env = (typeof import.meta !== 'undefined' && import.meta.env) || {}

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || 'AIzaSyA6hRTAzpI2jXFX_MjjMWKBjq-JHlYXojI',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || 'la-plots.firebaseapp.com',
  projectId: env.VITE_FIREBASE_PROJECT_ID || 'la-plots',
  appId: env.VITE_FIREBASE_APP_ID || '1:300884376441:web:57cf07cbf221ab00ca8da8',
}

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId)

export const firebaseApp = getApps().length > 0 
  ? getApps()[0] 
  : initializeApp(firebaseConfig)

// Firebase is strictly and exclusively used for Authentication
export const auth = isFirebaseConfigured ? getAuth(firebaseApp) : null

// All database persistence and document/image storage has migrated to MongoDB Atlas
export const db = null
export const storage = null
export const functions = null
export const analytics = null
