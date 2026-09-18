import { auth } from '../firebase/config'

const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || '/api'

/**
 * Normalizes MongoDB documents: ensures `id` property exists by falling back to `_id`
 */
export function normalizeMongoDoc(doc) {
  if (!doc || typeof doc !== 'object') return doc
  if (Array.isArray(doc)) {
    return doc.map(normalizeMongoDoc)
  }
  const cloned = { ...doc }
  if (!cloned.id && cloned._id) {
    cloned.id = String(cloned._id)
  }
  return cloned
}

/**
 * Helper to obtain the current user's Firebase Auth ID token
 */
async function getAuthToken() {
  try {
    const currentUser = auth?.currentUser
    if (currentUser) {
      return await currentUser.getIdToken()
    }
  } catch {
    // ignore token refresh errors
  }
  return null
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }

  const token = await getAuthToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (!response.ok) {
    let errorMessage = `API request failed with status ${response.status}`
    try {
      const errorData = await response.json()
      if (errorData.error) errorMessage = errorData.error
    } catch {
      // Use fallback error message
    }
    const error = new Error(errorMessage)
    error.status = response.status
    throw error
  }

  if (response.status === 204) return null

  const data = await response.json()
  return normalizeMongoDoc(data)
}

export const api = {
  get: (endpoint, options) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options) =>
    request(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),
  put: (endpoint, body, options) =>
    request(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }),
  delete: (endpoint, options) => request(endpoint, { ...options, method: 'DELETE' }),
}

export default api
