import { app, initializeBackend } from '../server/server.js'

export default async function handler(req, res) {
  await initializeBackend()
  return app(req, res)
}
