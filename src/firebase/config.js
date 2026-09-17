import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getFunctions } from 'firebase/functions'
import { getAnalytics, isSupported } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyA6hRTAzpI2jXFX_MjjMWKBjq-JHlYXojI',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'la-plots.firebaseapp.com',
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || 'https://la-plots-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'la-plots',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'la-plots.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '300884376441',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:300884376441:web:57cf07cbf221ab00ca8da8',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-WFV5NBQ5MQ',
}

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId)

export const firebaseApp = getApps().length > 0 
  ? getApps()[0] 
  : initializeApp(firebaseConfig)

export const auth = isFirebaseConfigured ? getAuth(firebaseApp) : null
export const db = isFirebaseConfigured ? getFirestore(firebaseApp) : null
export const storage = isFirebaseConfigured ? getStorage(firebaseApp) : null
export const functions = isFirebaseConfigured ? getFunctions(firebaseApp) : null

export let analytics = null
if (typeof window !== 'undefined' && isFirebaseConfigured) {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(firebaseApp)
    }
  }).catch(() => {})
}
