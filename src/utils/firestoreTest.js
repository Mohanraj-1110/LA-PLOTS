import { auth } from '../firebase/config'
import { api } from '../services/api'

export const TEST_COLLECTION = '_connection_test'

export function classifyFirestoreError(err) {
  if (!err) return 'Unknown database error.'
  const message = err.message || ''
  return message || 'Database operation failed.'
}

/**
 * Runs a complete MongoDB Atlas CRUD verification with Firebase Auth state:
 *   connect -> create -> read -> update -> query -> delete
 */
export async function runFirestoreCrudTest() {
  const result = {
    success: false,
    connect: false,
    create: false,
    read: false,
    update: false,
    query: false,
    delete: false,
    authenticated: Boolean(auth?.currentUser),
    errorCode: null,
    error: null,
    provider: 'MongoDB Atlas',
    authProvider: 'Firebase Auth',
  }

  let testPlotId = null

  try {
    // 1. CONNECT: check /api/health
    const health = await api.get('/health')
    result.connect = Boolean(health && health.status === 'ok')

    // 2. CREATE: add temporary test plot
    testPlotId = `test-${Date.now()}`
    const created = await api.post('/plots', {
      id: testPlotId,
      plotNumber: 'TEST-000',
      areaSqft: 1200,
      ratePerSqft: 2000,
      totalAmount: 2400000,
      status: 'available',
      location: 'Test Area',
      description: 'Temporary diagnostic plot',
    })
    result.create = Boolean(created && created.id === testPlotId)

    // 3. READ
    const read = await api.get(`/plots/${testPlotId}`)
    result.read = Boolean(read && read.id === testPlotId)

    // 4. UPDATE
    const updated = await api.put(`/plots/${testPlotId}`, { description: 'Updated diagnostic plot' })
    result.update = Boolean(updated && updated.description === 'Updated diagnostic plot')

    // 5. QUERY
    const list = await api.get('/plots')
    result.query = Array.isArray(list) && list.some((p) => p.id === testPlotId)

    // 6. DELETE
    await api.delete(`/plots/${testPlotId}`)
    result.delete = true

    result.success =
      result.connect &&
      result.create &&
      result.read &&
      result.update &&
      result.query &&
      result.delete
  } catch (err) {
    result.errorCode = err.status || 'ERR_DATABASE'
    result.error = err.message || 'Database test failed.'
  } finally {
    if (testPlotId) {
      try {
        await api.delete(`/plots/${testPlotId}`)
      } catch {
        // cleanup best effort
      }
    }
  }

  return result
}

export const runDatabaseCrudTest = runFirestoreCrudTest