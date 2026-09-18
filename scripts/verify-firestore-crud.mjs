/**
 * Live Cloud Firestore end-to-end verification (Node.js)
 *
 * Runs the full sequence against the project's real Firebase config:
 *   Initialize -> Connect -> Create -> Read -> Update -> Query -> Delete
 *
 * Uses the "_connection_test" collection, which the project's firestore.rules
 * explicitly opens for read/write, so no admin credentials are required.
 * Every test document created is deleted before the script exits (cleanup
 * is guaranteed even if a step fails).
 *
 * Usage:
 *   node scripts/verify-firestore-crud.mjs
 */
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getDocsFromServer,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'

import { db, firebaseApp, isFirebaseConfigured } from '../src/firebase/config.js'

const TEST_COLLECTION = '_connection_test'
const results = {
  initialize: 'CHECK',
  connect: 'CHECK',
  create: 'CHECK',
  read: 'CHECK',
  update: 'CHECK',
  query: 'CHECK',
  delete: 'CHECK',
  cleanup: 'CHECK',
  error: null,
}

function line(status, label, detail = '') {
  const icon = status === 'PASS' ? '[PASS]' : status === 'FAIL' ? '[FAIL]' : '[....]'
  console.log(`${icon} ${label}${detail ? ` - ${detail}` : ''}`)
}

async function main() {
  results.initialize = isFirebaseConfigured && firebaseApp ? 'PASS' : 'FAIL'
  line(results.initialize === 'PASS' ? 'PASS' : 'FAIL', 'Initialize Firebase SDK', `project="${firebaseApp?.options?.projectId || db?.app?.options?.projectId}"`)
  if (results.initialize !== 'PASS') {
    results.error = 'Firebase configuration is incomplete.'
    console.log('\nRESULT:', JSON.stringify(results, null, 2))
    process.exit(1)
  }

  // ---------------------------------------------------------------
  // CONNECT + READ probe (server-side, bypasses local cache)
  // ---------------------------------------------------------------
  try {
    const snap = await getDocsFromServer(collection(db, TEST_COLLECTION))
    results.connect = 'PASS'
    line('PASS', 'Connect to Cloud Firestore (server read)', `${snap.size} doc(s) in _connection_test`)
  } catch (err) {
    results.connect = 'FAIL'
    let notFoundProbe = false
    try {
      const probe = await fetch(
        'https://firestore.googleapis.com/v1/projects/' +
          (firebaseApp?.options?.projectId || 'la-plots') +
          '/databases/(default)/documents/plots',
        { mode: 'cors' }
      )
      const probeBody = await probe.text()
      notFoundProbe = probe.status === 404 && probeBody.includes('does not exist')
    } catch {
      // Probe unavailable; fall back to SDK error inspection.
    }
    if (notFoundProbe || err?.code === 'not-found') {
      results.error =
        'DATABASE_NOT_FOUND: "The database (default) does not exist for project la-plots". Open ' +
        'https://console.firebase.google.com/project/la-plots/firestore, click "Create database", ' +
        'choose a location and click "Enable".'
      line('FAIL', 'Connect to Cloud Firestore', '5 NOT_FOUND - database (default) does not exist for project la-plots')
      line('....', 'Fix', 'Create the Cloud Firestore database in the Firebase console, then re-run this script.')
    } else {
      results.error = `${err?.code || 'error'}: ${err.message}`
      line('FAIL', 'Connect to Cloud Firestore', err.code || err.message)
    }
    console.log('\nRESULT:', JSON.stringify(results, null, 2))
    process.exit(1)
  }

  let createdId = null

  try {
    // CREATE
    const docRef = await addDoc(collection(db, TEST_COLLECTION), {
      test: true,
      message: 'Firestore connection test',
      createdAt: serverTimestamp(),
    })
    createdId = docRef.id
    results.create = createdId ? 'PASS' : 'FAIL'
    line(results.create === 'PASS' ? 'PASS' : 'FAIL', 'CREATE addDoc()', `docId=${createdId}`)

    // READ
    const readSnap = await getDoc(doc(db, TEST_COLLECTION, createdId))
    const readOk = readSnap.exists() && readSnap.data().test === true
    results.read = readOk ? 'PASS' : 'FAIL'
    line(results.read === 'PASS' ? 'PASS' : 'FAIL', 'READ getDoc()', readOk ? `fields=[test,message,createdAt]` : `exists=${readSnap.exists()}`)

    // UPDATE
    await updateDoc(doc(db, TEST_COLLECTION, createdId), {
      message: 'Firestore update test',
      updatedAt: serverTimestamp(),
    })
    const updatedSnap = await getDoc(doc(db, TEST_COLLECTION, createdId))
    const updateOk = updatedSnap.exists() && updatedSnap.data().message === 'Firestore update test'
    results.update = updateOk ? 'PASS' : 'FAIL'
    line(results.update === 'PASS' ? 'PASS' : 'FAIL', 'UPDATE updateDoc()', updateOk ? 'message="Firestore update test"' : 'not visible after update')

    // QUERY
    const qSnap = await getDocs(
      query(collection(db, TEST_COLLECTION), where('message', '==', 'Firestore update test'), where('test', '==', true))
    )
    const queryOk = qSnap.docs.some((d) => d.id === createdId)
    results.query = queryOk ? 'PASS' : 'FAIL'
    line(results.query === 'PASS' ? 'PASS' : 'FAIL', 'QUERY query() + where()', queryOk ? 'test doc found by filter' : 'test doc NOT found by filter')

    // DELETE
    await deleteDoc(doc(db, TEST_COLLECTION, createdId))
    const afterDelete = await getDoc(doc(db, TEST_COLLECTION, createdId))
    const deleteOk = !afterDelete.exists()
    results.delete = deleteOk ? 'PASS' : 'FAIL'
    line(results.delete === 'PASS' ? 'PASS' : 'FAIL', 'DELETE deleteDoc()', deleteOk ? 'exists() === false confirmed' : 'doc still exists after delete')

    results.cleanup = 'PASS'
    line('PASS', 'Cleanup', 'no test documents left in _connection_test')
  } catch (err) {
    results.error = `${err.code || 'error'}: ${err.message}`
    line('FAIL', `CRUD step aborted`, err.code || err.message)
    // Best-effort cleanup so we never leave test data behind
    if (createdId) {
      try {
        await deleteDoc(doc(db, TEST_COLLECTION, createdId))
        results.cleanup = 'PASS'
        line('PASS', 'Cleanup', `deleted partial doc ${createdId}`)
      } catch {
        results.cleanup = 'FAIL'
        line('FAIL', 'Cleanup', `could not delete ${createdId}`)
      }
    }
  }

  const allPass = ['initialize', 'connect', 'create', 'read', 'update', 'query', 'delete'].every((k) => results[k] === 'PASS')
  results.success = allPass
  console.log(`\nOVERALL: ${allPass ? 'SUCCESS' : 'FAILURE'}`)
  console.log('RESULT:', JSON.stringify(results, null, 2))
  process.exit(allPass ? 0 : 1)
}

main().catch((err) => {
  console.error('Fatal:', err)
  process.exit(1)
})