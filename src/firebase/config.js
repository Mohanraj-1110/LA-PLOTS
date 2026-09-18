import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getFunctions } from 'firebase/functions'
import { getAnalytics, isSupported } from 'firebase/analytics'

const env = (typeof import.meta !== 'undefined' && import.meta.env) || {}

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || 'AIzaSyA6hRTAzpI2jXFX_MjjMWKBjq-JHlYXojI',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || 'la-plots.firebaseapp.com',
  projectId: env.VITE_FIREBASE_PROJECT_ID || 'la-plots',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || 'la-plots.firebasestorage.app',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '300884376441',
  appId: env.VITE_FIREBASE_APP_ID || '1:300884376441:web:57cf07cbf221ab00ca8da8',
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || 'G-WFV5NBQ5MQ',
}

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId)

export const firebaseApp = getApps().length > 0 
  ? getApps()[0] 
  : initializeApp(firebaseConfig)

export const auth = isFirebaseConfigured ? getAuth(firebaseApp) : null
export const db = isFirebaseConfigured 
  ? (env.VITE_FIREBASE_FIRESTORE_DATABASE_ID 
      ? getFirestore(firebaseApp, env.VITE_FIREBASE_FIRESTORE_DATABASE_ID)
      : getFirestore(firebaseApp))
  : null
export const storage = isFirebaseConfigured ? getStorage(firebaseApp) : null
if (storage) {
  storage.maxUploadRetryTime = 10000
  storage.maxOperationRetryTime = 10000
}
export const functions = isFirebaseConfigured ? getFunctions(firebaseApp) : null

export let analytics = null
if (typeof window !== 'undefined' && isFirebaseConfigured) {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(firebaseApp)
    }
  }).catch(() => {})
}
