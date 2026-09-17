import { initializeApp } from 'firebase/app'
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyA6hRTAzpI2jXFX_MjjMWKBjq-JHlYXojI',
  authDomain: 'la-plots.firebaseapp.com',
  projectId: 'la-plots',
  storageBucket: 'la-plots.firebasestorage.app',
  messagingSenderId: '300884376441',
  appId: '1:300884376441:web:57cf07cbf221ab00ca8da8',
  measurementId: 'G-WFV5NBQ5MQ',
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

console.log('Firebase initialized. Testing Firestore connection...')

async function runDiagnostic() {
  const collections = ['plots', 'enquiries', 'messages', 'customers', 'appointments', 'documents', 'users', 'sales', 'reviews', 'settings']
  
  for (const col of collections) {
    try {
      const snap = await getDocs(collection(db, col))
      console.log(`[PASS READ] Collection: ${col} - Docs count: ${snap.size}`)
    } catch (err) {
      console.error(`[FAIL READ] Collection: ${col} - Error: ${err.code || err.message}`)
    }
  }

  // Test guest create enquiry (should succeed if rule allows: match /enquiries allow create: if true)
  try {
    const docRef = await addDoc(collection(db, 'enquiries'), {
      customerName: 'Diagnostic Test Guest',
      phone: '9999999999',
      requirement: 'Testing automated write',
      status: 'New',
      createdAt: serverTimestamp()
    })
    console.log(`[PASS CREATE] enquiries - Created doc ID: ${docRef.id}`)
  } catch (err) {
    console.error(`[FAIL CREATE] enquiries - Error: ${err.code || err.message}`)
  }

  // Test guest create review (fails if rule missing)
  try {
    const docRef = await addDoc(collection(db, 'reviews'), {
      rating: 5,
      comment: 'Diagnostic test review',
      createdAt: serverTimestamp()
    })
    console.log(`[PASS CREATE] reviews - Created doc ID: ${docRef.id}`)
  } catch (err) {
    console.error(`[FAIL CREATE] reviews - Error: ${err.code || err.message}`)
  }

  // Test guest read/write sales
  try {
    const docRef = await addDoc(collection(db, 'sales'), {
      saleAmount: 100000,
      createdAt: serverTimestamp()
    })
    console.log(`[PASS CREATE] sales - Created doc ID: ${docRef.id}`)
  } catch (err) {
    console.error(`[FAIL CREATE] sales - Error: ${err.code || err.message}`)
  }
}

runDiagnostic().then(() => {
  console.log('Diagnostic finished.')
  process.exit(0)
}).catch((err) => {
  console.error('Fatal diagnostic error:', err)
  process.exit(1)
})
