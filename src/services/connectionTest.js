import { auth, isFirebaseConfigured } from '../firebase/config.js'
import { api } from './api.js'

const env = (typeof import.meta !== 'undefined' && import.meta.env) || {}

/**
 * Runs a comprehensive diagnostic of Firebase Authentication and MongoDB Atlas connectivity.
 */
export async function testDatabaseConnection() {
  const startTime = Date.now()
  const results = {
    timestamp: new Date().toISOString(),
    overall: 'checking',
    latencyMs: 0,
    authProvider: 'Firebase Authentication',
    databaseProvider: 'MongoDB Atlas',
    user: null,
    checks: [],
    primaryIssue: null,
    recommendations: [],
    rawError: null,
  }

  // Check 1: Firebase Auth Configuration
  const hasAuthConfig = Boolean(isFirebaseConfigured && auth && env.VITE_FIREBASE_API_KEY)
  if (hasAuthConfig) {
    results.checks.push({
      id: 'auth_config',
      name: 'Firebase Auth Configuration',
      status: 'pass',
      title: 'Configured',
      description: 'Firebase Authentication credentials configured correctly.',
    })
  } else {
    results.checks.push({
      id: 'auth_config',
      name: 'Firebase Auth Configuration',
      status: 'fail',
      title: 'Missing Keys',
      description: 'Firebase Auth environment variables are missing.',
    })
  }

  // Check 2: Active Auth Session
  const currentUser = auth?.currentUser
  if (currentUser) {
    results.user = {
      uid: currentUser.uid,
      email: currentUser.email,
      displayName: currentUser.displayName,
    }
    results.checks.push({
      id: 'auth_session',
      name: 'Firebase User Session',
      status: 'pass',
      title: 'Signed In',
      description: `Active session for ${currentUser.email || currentUser.uid}`,
    })
  } else {
    results.checks.push({
      id: 'auth_session',
      name: 'Firebase User Session',
      status: 'pass',
      title: 'Anonymous / Guest',
      description: 'Not currently signed in with Firebase Auth.',
    })
  }

  // Check 3: Backend & MongoDB Atlas Health Check
  try {
    const health = await api.get('/health')
    const dbInfo = health.database || {}
    if (dbInfo.connected) {
      results.checks.push({
        id: 'mongodb_connection',
        name: 'MongoDB Atlas Connection',
        status: 'pass',
        title: 'Connected',
        description: `Successfully connected to MongoDB Atlas cluster (${dbInfo.host || 'Cloud'}).`,
      })
    } else {
      results.checks.push({
        id: 'mongodb_connection',
        name: 'MongoDB Atlas Connection',
        status: dbInfo.hasUriConfigured ? 'warning' : 'info',
        title: dbInfo.hasUriConfigured ? 'Connecting' : 'In-Memory Fallback Active',
        description: dbInfo.message || 'Set MONGODB_URI in .env to connect to your Atlas cluster.',
      })
    }
  } catch (err) {
    results.checks.push({
      id: 'mongodb_connection',
      name: 'MongoDB Atlas Backend',
      status: 'warning',
      title: 'API Reachability',
      description: `Backend API check note: ${err.message}`,
    })
  }

  // Check 4: Data Read Capability
  try {
    const plots = await api.get('/plots')
    results.checks.push({
      id: 'data_read',
      name: 'Data Read Capability',
      status: 'pass',
      title: 'Data Flowing',
      description: `Successfully queried ${Array.isArray(plots) ? plots.length : 0} plot records.`,
    })
  } catch (err) {
    results.checks.push({
      id: 'data_read',
      name: 'Data Read Capability',
      status: 'fail',
      title: 'Read Failed',
      description: err.message,
    })
  }

  results.latencyMs = Date.now() - startTime
  const hasFail = results.checks.some((c) => c.status === 'fail')
  const hasWarning = results.checks.some((c) => c.status === 'warning')
  results.overall = hasFail ? 'error' : hasWarning ? 'warning' : 'success'

  return results
}

export const testFirestoreConnection = testDatabaseConnection
