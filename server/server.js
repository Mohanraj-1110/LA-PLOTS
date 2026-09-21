import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { connectDB } from './db.js'
import { requireAuth } from './middleware/auth.js'

import { plotsRouter } from './routes/plots.js'
import { customersRouter } from './routes/customers.js'
import { appointmentsRouter } from './routes/appointments.js'
import { salesRouter } from './routes/sales.js'
import { documentsRouter } from './routes/documents.js'
import { enquiriesRouter } from './routes/enquiries.js'
import { messagesRouter } from './routes/messages.js'
import { usersRouter } from './routes/users.js'
import { wishlistsRouter } from './routes/wishlists.js'
import { reviewsRouter } from './routes/reviews.js'
import { dashboardRouter } from './routes/dashboard.js'
import { healthRouter } from './routes/health.js'
import { uploadRouter } from './routes/upload.js'
import { projectsRouter } from './routes/projects.js'

dotenv.config()

export const app = express()

// BUG-16 FIX: Restrict CORS to the configured origin instead of allowing all.
// Set ALLOWED_ORIGIN in .env to your production domain (e.g. https://yourdomain.com).
const allowedOrigin = process.env.ALLOWED_ORIGIN || 'http://localhost:5173'
app.use(cors({
  origin: allowedOrigin,
  credentials: true,
}))
app.use(express.json({ limit: '25mb' }))
app.use(express.urlencoded({ extended: true, limit: '25mb' }))

// Initialize MongoDB Atlas connection (Clean production mode - No auto-seeding)
let initPromise = null
export async function initializeBackend() {
  if (initPromise) return initPromise
  initPromise = (async () => {
    try {
      await connectDB()
    } catch (err) {
      console.warn('[Server Init] Backend initialized with in-memory fallback:', err.message)
    }
  })()
  return initPromise
}

// Ensure init is called
initializeBackend().catch(() => {})

// -----------------------------------------------------------------------
// Mount API Routes
// BUG-01 FIX: Apply requireAuth middleware to all protected routes.
// Public exceptions:
//   - GET  /api/health   — liveness probe, no auth needed
//   - POST /api/enquiries — public enquiry form submission from customer portal
// -----------------------------------------------------------------------

// Public routes (no auth required)
app.use('/api/health', healthRouter)

// Partially public: enquiry creation is open, admin operations require auth
app.use('/api/enquiries', (req, res, next) => {
  // Allow unauthenticated POST (customer submitting an enquiry from the portal)
  if (req.method === 'POST') return next()
  return requireAuth(req, res, next)
}, enquiriesRouter)

// Public read routes for customer browsing; mutations require auth
app.use('/api/plots', (req, res, next) => {
  if (req.method === 'GET') return next()
  return requireAuth(req, res, next)
}, plotsRouter)

app.use('/api/projects', (req, res, next) => {
  if (req.method === 'GET') return next()
  return requireAuth(req, res, next)
}, projectsRouter)

app.use('/api/reviews', (req, res, next) => {
  if (req.method === 'GET') return next()
  return requireAuth(req, res, next)
}, reviewsRouter)

// Protected operational routes (require valid Firebase token)
app.use('/api/customers', requireAuth, customersRouter)
app.use('/api/appointments', requireAuth, appointmentsRouter)
app.use('/api/sales', requireAuth, salesRouter)
app.use('/api/documents', requireAuth, documentsRouter)
app.use('/api/messages', requireAuth, messagesRouter)
app.use('/api/users', requireAuth, usersRouter)
app.use('/api/wishlists', requireAuth, wishlistsRouter)
app.use('/api/dashboard', requireAuth, dashboardRouter)
app.use('/api/upload', requireAuth, uploadRouter)

// Root API Welcome / Status
app.get('/api', (req, res) => {
  res.json({
    message: 'LK PROPERTIES API Server running with MongoDB Atlas',
    version: '2.0.0',
    authProvider: 'Firebase Authentication',
    databaseProvider: 'MongoDB Atlas',
  })
})

const PORT = process.env.PORT || 5000

// If executed directly with node server/server.js
if (process.argv[1]?.replace(/\\/g, '/').endsWith('server/server.js')) {
  app.listen(PORT, () => {
    console.log(`\n======================================================`)
    console.log(`🚀 LK PROPERTIES Backend API running on http://localhost:${PORT}`)
    console.log(`📦 Database: MongoDB Atlas (Mongoose)`)
    console.log(`🔐 Authentication: Firebase Auth Only`)
    console.log(`======================================================\n`)
  })
}

export default app
