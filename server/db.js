import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

let isConnected = false
let connectionPromise = null

export async function connectDB() {
  if (isConnected) return mongoose.connection
  // BUG-13 FIX: Only cache the promise while it is in-flight. If a previous
  // attempt failed, connectionPromise is cleared so we retry cleanly.
  if (connectionPromise) return connectionPromise

  const mongoUri = process.env.MONGODB_URI

  if (!mongoUri) {
    console.warn(
      '\n[MongoDB Atlas] Notice: MONGODB_URI is not set in .env.\n' +
      'Using in-memory/resilient store until MongoDB Atlas connection string is provided.\n' +
      'To connect to MongoDB Atlas, add your URI in .env:\n' +
      'MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/la_plots?retryWrites=true&w=majority\n'
    )
    return null
  }

  // Cache the promise so concurrent callers await the same attempt.
  connectionPromise = mongoose
    .connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    })
    .then((conn) => {
      isConnected = true
      connectionPromise = null // clear cache — next call will use isConnected shortcut
      console.log(`\n[MongoDB Atlas] Connected successfully to: ${conn.connection.host}/${conn.connection.name}\n`)
      return conn.connection
    })
    .catch((err) => {
      isConnected = false
      connectionPromise = null // clear cache so the next call can retry
      console.error('\n[MongoDB Atlas] Connection Error:', err.message)
      console.warn('Falling back to safe local/memory store.\n')
      return null
    })

  return connectionPromise
}

export function isDBConnected() {
  return isConnected && mongoose.connection.readyState === 1
}

export function getDBStatus() {
  const stateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  }
  return {
    connected: isDBConnected(),
    state: stateMap[mongoose.connection.readyState] || 'disconnected',
    host: isDBConnected() ? mongoose.connection.host : null,
    dbName: isDBConnected() ? mongoose.connection.name : null,
    hasUriConfigured: Boolean(process.env.MONGODB_URI),
  }
}
