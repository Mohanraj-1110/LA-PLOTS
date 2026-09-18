import { Router } from 'express'
import { getDBStatus } from '../db.js'

export const healthRouter = Router()

healthRouter.get('/', (req, res) => {
  const dbStatus = getDBStatus()
  return res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: {
      provider: 'MongoDB Atlas',
      ...dbStatus,
      message: dbStatus.connected
        ? `Connected to MongoDB Atlas (${dbStatus.host})`
        : dbStatus.hasUriConfigured
        ? 'Connecting to MongoDB Atlas...'
        : 'MONGODB_URI not configured in .env. Running on local in-memory store.',
    },
    auth: {
      provider: 'Firebase Authentication',
      status: 'active',
      scope: 'Authentication only (login, registration, Google OAuth, session tokens)',
    },
  })
})
