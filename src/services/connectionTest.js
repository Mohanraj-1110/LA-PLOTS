import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getDocsFromServer,
  limit,
  query,
  serverTimestamp,
  setDoc,
  waitForPendingWrites,
} from 'firebase/firestore'
import { auth, db, isFirebaseConfigured } from '../firebase/config.js'
import { isAdminEmail } from './auth.js'

const env = (typeof import.meta !== 'undefined' && import.meta.env) || {}

/**
 * Runs a comprehensive end-to-end diagnostic of the Firebase & Firestore connection.
 * Tests configuration, authentication, database reachability, write capability,
 * remote server persistence (waitForPendingWrites), and cleanup.
 */
export async function testFirestoreConnection() {
  const startTime = Date.now()
  const results = {
    timestamp: new Date().toISOString(),
    overall: 'checking', // 'success' | 'warning' | 'error'
    latencyMs: 0,
    projectId: env.VITE_FIREBASE_PROJECT_ID || 'la-plots',
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || 'la-plots.firebaseapp.com',
    user: null,
    checks: [],
    primaryIssue: null,
    recommendations: [],
    rawError: null,
  }

  // -------------------------------------------------------------
  // Check 1: Firebase SDK Configuration
  // -------------------------------------------------------------
  const hasConfig = Boolean(
    isFirebaseConfigured &&
    db &&
    (env.VITE_FIREBASE_API_KEY || true) &&
    (env.VITE_FIREBASE_PROJECT_ID || true)
  )

  if (!hasConfig) {
    results.checks.push({
      id: 'config',
      name: 'Firebase SDK Configuration',
      status: 'fail',
      title: 'Missing Configuration',
      description: 'Firebase API Key or Project ID is missing from environment variables.',
    })
    results.overall = 'error'
    results.primaryIssue = 'CONFIG_MISSING'
    results.recommendations.push(
      'Ensure .env or environment variables contain valid VITE_FIREBASE_API_KEY and VITE_FIREBASE_PROJECT_ID.'
    )
    results.latencyMs = Date.now() - startTime
    return results
  }

  results.checks.push({
    id: 'config',
    name: 'Firebase SDK Configuration',
    status: 'pass',
    title: 'Configured',
    description: `Targeting project "${results.projectId}". SDK initialized.`,
  })

  // -------------------------------------------------------------
  // Check 2: Admin Authentication State
  // -------------------------------------------------------------
  const currentUser = auth?.currentUser
  if (currentUser) {
    const isEmailAdmin = isAdminEmail(currentUser.email)
    results.user = {
      uid: currentUser.uid,
      email: currentUser.email || 'No email',
      displayName: currentUser.displayName || 'No name',
      isAdminEligible: isEmailAdmin,
    }

    results.checks.push({
      id: 'auth',
      name: 'Firebase Authentication State',
      status: isEmailAdmin ? 'pass' : 'warn',
      title: isEmailAdmin ? 'Authenticated as Admin' : 'Signed in (Check Role)',
      description: `Signed in as ${currentUser.email} (UID: ${currentUser.uid.slice(0, 8)}...). ${
        isEmailAdmin
          ? 'Email matches admin security rule rules.'
          : 'Warning: Email does not contain "admin" or "mohan". Writing to restricted collections may be blocked unless a role document exists.'
      }`,
    })
  } else {
    results.user = null
    results.checks.push({
      id: 'auth',
      name: 'Firebase Authentication State',
      status: 'warn',
      title: 'Not Authenticated with Firebase Auth',
      description:
        'No active Firebase Auth session detected. Unauthenticated requests will fail on collections protected by security rules.',
    })
  }

  // -------------------------------------------------------------
  // Check 3: Cloud Firestore Reachability & Database Existence
  // -------------------------------------------------------------
  let readSucceeded = false
  try {
    const probeQuery = query(collection(db, 'plots'), limit(1))
    // Use getDocsFromServer to verify true Cloud Firestore server reachability (skips local memory cache)
    const readPromise = getDocsFromServer(probeQuery).catch(() => getDocs(probeQuery))
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('READ_TIMEOUT')), 5000)
    )

    const snap = await Promise.race([readPromise, timeoutPromise])
    const isFromCache = Boolean(snap?.metadata?.fromCache)

    if (isFromCache) {
      results.checks.push({
        id: 'read',
        name: 'Firestore Database Reachability',
        status: 'warn',
        title: 'Operating in Offline Cache Mode',
        description: 'Read returned from local memory cache. Cloud Firestore remote server is not acknowledging connections.',
      })
    } else {
      readSucceeded = true
      results.checks.push({
        id: 'read',
        name: 'Firestore Database Reachability',
        status: 'pass',
        title: 'Database Responding (Server Confirmed)',
        description: `Successfully reached Cloud Firestore server. Plots collection scanned (${snap.size} sample docs read).`,
      })
    }
  } catch (err) {
    results.rawError = {
      code: err?.code || '',
      message: err?.message || '',
    }

    const isNotFound =
      err?.code === 'not-found' ||
      err?.message?.includes('5 NOT_FOUND') ||
      err?.message?.includes('does not exist')

    const isPermissionDenied =
      err?.code === 'permission-denied' ||
      err?.message?.includes('Missing or insufficient permissions')

    const isTimeout = err?.message === 'READ_TIMEOUT'

    if (isNotFound) {
      results.checks.push({
        id: 'read',
        name: 'Firestore Database Reachability',
        status: 'fail',
        title: 'Database Not Found (5 NOT_FOUND)',
        description: `Cloud Firestore database does not exist in project "${results.projectId}".`,
      })
      results.primaryIssue = 'DATABASE_NOT_FOUND'
      results.recommendations.push(
        `Cloud Firestore has not been created yet for Firebase project "${results.projectId}". Go to Firebase Console > Firestore Database and click "Create database".`
      )
    } else if (isPermissionDenied) {
      results.checks.push({
        id: 'read',
        name: 'Firestore Database Reachability',
        status: 'warn',
        title: 'Permission Denied',
        description: 'Database is reachable, but read permissions are blocked by firestore.rules.',
      })
      results.recommendations.push(
        'Deploy firestore.rules to allow read access to the plots collection.'
      )
    } else if (isTimeout) {
      results.checks.push({
        id: 'read',
        name: 'Firestore Database Reachability',
        status: 'fail',
        title: 'Connection Timed Out',
        description: 'Could not connect to Cloud Firestore backend within 6 seconds. Check your internet connection or firewall.',
      })
      results.primaryIssue = 'NETWORK_TIMEOUT'
    } else {
      results.checks.push({
        id: 'read',
        name: 'Firestore Database Reachability',
        status: 'fail',
        title: 'Read Error',
        description: err.message || 'Unknown read error.',
      })
    }
  }

  // -------------------------------------------------------------
  // Check 4 & 5: Write Capability & Remote Server Synchronization
  // -------------------------------------------------------------
  const testDocId = `test_probe_${Date.now()}`
  const probeDocRef = doc(db, '_connection_test', testDocId)

  let writeSucceeded = false
  let serverSyncSucceeded = false

  try {
    // Attempt write probe
    const writePromise = setDoc(probeDocRef, {
      diagnostic: true,
      timestamp: serverTimestamp(),
      testRanAt: new Date().toISOString(),
      initiatedBy: currentUser?.email || 'Admin Tester',
    })

    const writeTimeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('WRITE_TIMEOUT')), 7000)
    )

    await Promise.race([writePromise, writeTimeoutPromise])
    writeSucceeded = true

    // Now verify the write is physically committed to Google Cloud server (not just local memory cache)
    try {
      const syncPromise = waitForPendingWrites(db)
      const syncTimeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('SYNC_TIMEOUT')), 5000)
      )
      await Promise.race([syncPromise, syncTimeoutPromise])
      serverSyncSucceeded = true

      results.checks.push({
        id: 'write',
        name: 'Remote Cloud Server Sync',
        status: 'pass',
        title: 'Write Confirmed on Cloud Server',
        description: 'Test document was successfully written and acknowledged by Google Cloud Firestore servers.',
      })
    } catch (syncErr) {
      results.checks.push({
        id: 'write',
        name: 'Remote Cloud Server Sync',
        status: 'warn',
        title: 'Buffered in Local Memory (Not Synced to Cloud)',
        description:
          'Document was accepted into local cache, but Google Cloud server did NOT acknowledge the write. Cloud Firestore may be offline or unprovisioned.',
      })
      if (!results.primaryIssue) results.primaryIssue = 'LOCAL_CACHE_ONLY'
      results.recommendations.push(
        'Verify in Firebase Console that Cloud Firestore is in Active status and not suspended.'
      )
    }

    // Clean up test document
    try {
      await deleteDoc(probeDocRef)
    } catch {
      // Ignore cleanup error
    }
  } catch (writeErr) {
    if (!results.rawError) {
      results.rawError = {
        code: writeErr?.code || '',
        message: writeErr?.message || '',
      }
    }

    const isNotFound =
      writeErr?.code === 'not-found' ||
      writeErr?.message?.includes('5 NOT_FOUND') ||
      writeErr?.message?.includes('does not exist')

    const isPermissionDenied =
      writeErr?.code === 'permission-denied' ||
      writeErr?.message?.includes('Missing or insufficient permissions')

    const isTimeout = writeErr?.message === 'WRITE_TIMEOUT'

    if (isNotFound) {
      results.checks.push({
        id: 'write',
        name: 'Cloud Firestore Write Test',
        status: 'fail',
        title: 'Database Does Not Exist (5 NOT_FOUND)',
        description: `Cannot save data because Cloud Firestore database does not exist in Firebase project "${results.projectId}".`,
      })
      results.primaryIssue = 'DATABASE_NOT_FOUND'
      results.recommendations.push(
        'Step 1: Open https://console.firebase.google.com/project/' +
          results.projectId +
          '/firestore\nStep 2: Click "Create database" and select a location.\nStep 3: Choose "Start in test mode" (or deploy project rules) and click Enable.'
      )
    } else if (isPermissionDenied) {
      results.checks.push({
        id: 'write',
        name: 'Cloud Firestore Write Test',
        status: 'fail',
        title: 'Write Permission Denied',
        description: 'Firestore security rules rejected the write operation. Missing write authorization.',
      })
      results.primaryIssue = 'RULES_PERMISSION_DENIED'
      results.recommendations.push(
        'Update firestore.rules in Firebase Console to grant write permissions to authorized admins, or deploy the repository firestore.rules file.'
      )
    } else if (isTimeout) {
      results.checks.push({
        id: 'write',
        name: 'Cloud Firestore Write Test',
        status: 'fail',
        title: 'Write Timed Out',
        description: 'Write request timed out after 7 seconds without server response.',
      })
      if (!results.primaryIssue) results.primaryIssue = 'WRITE_TIMEOUT'
      results.recommendations.push(
        'Cloud Firestore backend is not responding. Ensure the database is created and enabled in Firebase Console.'
      )
    } else {
      results.checks.push({
        id: 'write',
        name: 'Cloud Firestore Write Test',
        status: 'fail',
        title: 'Write Failed',
        description: writeErr.message || 'Write operation failed.',
      })
    }
  }

  // -------------------------------------------------------------
  // Summary & Overall Status
  // -------------------------------------------------------------
  if (writeSucceeded && serverSyncSucceeded && readSucceeded) {
    results.overall = 'success'
  } else if (results.primaryIssue === 'DATABASE_NOT_FOUND' || results.primaryIssue === 'CONFIG_MISSING') {
    results.overall = 'error'
  } else if (results.checks.some((c) => c.status === 'fail')) {
    results.overall = 'error'
  } else {
    results.overall = 'warning'
  }

  results.latencyMs = Date.now() - startTime
  return results
}

/**
 * Creates a real diagnostic plot document in the 'plots' collection
 * to test live end-to-end saving and verify it reflects in the catalog.
 */
export async function seedTestPlot() {
  if (!isFirebaseConfigured || !db) throw new Error('Firebase is not configured.')

  const testPlotNumber = `TEST-${Math.floor(100 + Math.random() * 900)}`
  const plotData = {
    plotNumber: testPlotNumber,
    projectId: 'DIAGNOSTIC-DEMO',
    surveyNumber: 'SY-999',
    areaSqft: 1200,
    ratePerSqft: 1500,
    totalAmount: 1800000,
    status: 'available',
    facing: 'North',
    roadWidth: 30,
    location: 'Diagnostic Test Area',
    description: 'System-generated test plot to verify Firestore cloud persistence.',
    photos: [],
    documents: [],
    geo: { lat: 12.9716, lng: 77.5946 },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }

  const addPromise = addDoc(collection(db, 'plots'), plotData)
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(
      () =>
        reject(
          new Error(
            'Write timed out. Cloud Firestore server did not acknowledge the write. Please verify Cloud Firestore is created and enabled in Firebase Console.'
          )
        ),
      8000
    )
  )

  const docRef = await Promise.race([addPromise, timeoutPromise])

  // Verify server persistence
  try {
    await waitForPendingWrites(db)
  } catch {
    // If pending writes fails, inform caller
    console.warn('[Diagnostic] waitForPendingWrites note: write may be local only.')
  }

  return { id: docRef.id, plotNumber: testPlotNumber }
}
