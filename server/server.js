import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { connectDB } from './db.js'

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

dotenv.config()

export const app = express()

// Middlewares
app.use(cors())
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

// Mount API Routes
app.use('/api/plots', plotsRouter)
app.use('/api/customers', customersRouter)
app.use('/api/appointments', appointmentsRouter)
app.use('/api/sales', salesRouter)
app.use('/api/documents', documentsRouter)
app.use('/api/enquiries', enquiriesRouter)
app.use('/api/messages', messagesRouter)
app.use('/api/users', usersRouter)
app.use('/api/wishlists', wishlistsRouter)
app.use('/api/reviews', reviewsRouter)
app.use('/api/dashboard', dashboardRouter)
app.use('/api/health', healthRouter)
app.use('/api/upload', uploadRouter)

// Root API Welcome / Status
app.get('/api', (req, res) => {
  res.json({
    message: 'LA PLOTS API Server running with MongoDB Atlas',
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
    console.log(`🚀 LA PLOTS Backend API running on http://localhost:${PORT}`)
    console.log(`📦 Database: MongoDB Atlas (Mongoose)`)
    console.log(`🔐 Authentication: Firebase Auth Only`)
    console.log(`======================================================\n`)
  })
}

export default app
