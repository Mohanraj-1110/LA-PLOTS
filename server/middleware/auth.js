/**
 * BUG-01 FIX: Firebase Admin SDK token verification middleware.
 *
 * Every protected API route passes requests through this middleware before
 * reaching route handlers. Requests without a valid Firebase ID token receive
 * a 401 response immediately.
 *
 * Public routes (enquiry POST submission, health check) can skip this
 * middleware by being explicitly excluded in server.js.
 */
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { readFileSync } from 'fs'

let adminInitialized = false

function initAdminIfNeeded() {
  if (adminInitialized) return
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID
  if (!projectId) {
    console.warn(
      '[Auth Middleware] FIREBASE_PROJECT_ID is not set. ' +
      'Add it to .env to enable token verification. ' +
      'API routes are UNPROTECTED until this is configured.'
    )
    return
  }

  try {
    if (getApps().length === 0) {
      const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
      if (serviceAccountPath) {
        const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'))
        initializeApp({ credential: cert(serviceAccount) })
      } else {
        initializeApp({ projectId })
      }
    }
    adminInitialized = true
    console.log('[Auth Middleware] Firebase Admin SDK initialized for project:', projectId)
  } catch (err) {
    console.error('[Auth Middleware] Firebase Admin SDK init failed:', err.message)
  }
}

// Initialize eagerly on module load (non-blocking)
initAdminIfNeeded()

/**
 * Express middleware that verifies a Firebase Bearer token.
 * Attaches the decoded token payload to req.decodedToken.
 *
 * Skip it on specific routes by NOT applying it in server.js (e.g. /api/enquiries POST).
 */
export async function requireAuth(req, res, next) {
  // If admin SDK was not initialized (missing config), skip verification and
  // log a warning — fail open so the app stays usable during development.
  if (!adminInitialized) {
    console.warn('[Auth Middleware] Skipping token verification — Firebase Admin not configured.')
    return next()
  }

  const authHeader = req.headers['authorization'] || ''
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid Authorization header.' })
  }

  const token = authHeader.slice(7)
  try {
    const decoded = await getAuth().verifyIdToken(token)
    req.decodedToken = decoded
    return next()
  } catch (err) {
    console.warn('[Auth Middleware] Token verification failed:', err.message)
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token.' })
  }
}

/**
 * Lightweight admin guard — returns 403 if the authenticated user is not an admin.
 * Must be used AFTER requireAuth.
 */
export function requireAdmin(req, res, next) {
  const rawAdmins =
    process.env.ADMIN_EMAILS || process.env.VITE_ADMIN_EMAILS || 'lkproperties153@gmail.com'
  const adminList = rawAdmins
    .toLowerCase()
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  const email = (req.decodedToken?.email || '').toLowerCase()
  if (!email || !adminList.includes(email)) {
    return res.status(403).json({ error: 'Forbidden: Admin access required.' })
  }
  return next()
}
