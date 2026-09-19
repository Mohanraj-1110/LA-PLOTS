import { updatePassword } from 'firebase/auth'
import { auth } from '../firebase/config'
import { api } from './api.js'

const CACHE_KEY = 'la_plots_all_users'

export function getCachedUsers() {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        return parsed
      }
    }
  } catch {
    // Ignore parse or access errors
  }
  return []
}

export function saveCachedUsers(usersList) {
  if (typeof window === 'undefined' || !Array.isArray(usersList)) return
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(usersList))
  } catch {
    // Ignore storage write errors
  }
}

function mergeUsers(apiUsers) {
  const currentAuth = auth?.currentUser
  const list = Array.isArray(apiUsers) ? [...apiUsers] : []

  if (currentAuth) {
    const existingIndex = list.findIndex((u) => u.uid === currentAuth.uid || u.email === currentAuth.email)
    if (existingIndex >= 0) {
      list[existingIndex] = {
        ...list[existingIndex],
        uid: currentAuth.uid,
        name: list[existingIndex].name || currentAuth.displayName || currentAuth.email?.split('@')[0] || 'User',
        email: currentAuth.email || list[existingIndex].email,
      }
    }
  }

  return list
}

export function subscribeToUsers(onChange, onError) {
  const initialData = getCachedUsers()
  onChange(initialData)

  let isMounted = true

  const fetchUsers = async () => {
    try {
      const users = await api.get('/users')
      if (isMounted) {
        const merged = mergeUsers(Array.isArray(users) && users.length > 0 ? users : initialData)
        saveCachedUsers(merged)
        onChange(merged)
      }
    } catch (err) {
      if (isMounted) {
        console.warn('[MongoDB Atlas] subscribeToUsers fallback:', err?.message)
        if (onError) onError(err)
        onChange(getCachedUsers())
      }
    }
  }

  fetchUsers()
  const intervalId = setInterval(fetchUsers, 10000)

  return () => {
    isMounted = false
    clearInterval(intervalId)
  }
}

export async function getUserProfile(uid) {
  if (!uid) return null
  try {
    return await api.get(`/users/${uid}`)
  } catch (err) {
    console.warn('[MongoDB Atlas] getUserProfile note:', err?.message)
    const cached = getCachedUsers()
    return cached.find((u) => u.uid === uid) || null
  }
}

export async function saveProfile(uid, values) {
  const cached = getCachedUsers()
  const updated = cached.map((u) => (u.uid === uid ? { ...u, ...values } : u))
  saveCachedUsers(updated)

  try {
    return await api.put(`/users/${uid}`, values)
  } catch (err) {
    console.warn('[MongoDB Atlas] saveProfile local fallback:', err?.message)
    return { uid, ...values }
  }
}

export const updateCustomerProfile = saveProfile

export async function createUserDoc(values) {
  const uid = values.uid || `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  const newDoc = {
    uid,
    name: values.name?.trim() || 'User',
    email: values.email?.trim() || '',
    phone: values.phone?.trim() || '',
    role: values.role || 'customer',
    photoURL: values.photoURL || '',
  }

  const cached = getCachedUsers()
  saveCachedUsers([newDoc, ...cached])

  try {
    return await api.post('/users', newDoc)
  } catch (err) {
    console.warn('[MongoDB Atlas] createUserDoc note:', err?.message)
    return newDoc
  }
}

export async function changeUserRole(uid, role) {
  const cached = getCachedUsers()
  const updated = cached.map((u) => (u.uid === uid ? { ...u, role } : u))
  saveCachedUsers(updated)

  if (typeof window !== 'undefined') {
    try {
      const pKey = `la_plots_profile_${uid}`
      const p = localStorage.getItem(pKey)
      if (p) {
        localStorage.setItem(pKey, JSON.stringify({ ...JSON.parse(p), role }))
      }
      if (auth?.currentUser?.uid === uid) {
        localStorage.setItem('la_plots_user_role', role)
      }
    } catch {
      // Ignore local storage errors
    }
  }

  try {
    return await api.put(`/users/${uid}/role`, { role })
  } catch (err) {
    console.warn('[MongoDB Atlas] changeUserRole note:', err?.message)
    return { uid, role }
  }
}

export async function deleteUserDoc(uid) {
  const cached = getCachedUsers()
  const updated = cached.filter((u) => u.uid !== uid)
  saveCachedUsers(updated)

  try {
    await api.delete(`/users/${uid}`)
  } catch (err) {
    console.warn('[MongoDB Atlas] deleteUserDoc note:', err?.message)
  }
}

export async function changePassword(password) {
  if (!auth?.currentUser) throw new Error('Sign in is required.')
  await updatePassword(auth.currentUser, password)
}

const COMPANY_KEY = 'la_plots_company_settings'

export function subscribeToCompany(onChange) {
  const defaultCompany = {
    name: 'LK Properties',
    phone: '+91 98451 99001',
    email: 'contact@lkproperties.com',
    address: 'No. 42, GST Road, Tambaram, Chennai - 600045',
  }
  try {
    const raw = localStorage.getItem(COMPANY_KEY)
    onChange(raw ? JSON.parse(raw) : defaultCompany)
  } catch {
    onChange(defaultCompany)
  }
  return () => undefined
}

export async function saveCompany(values) {
  try {
    localStorage.setItem(COMPANY_KEY, JSON.stringify(values))
  } catch {
    // ignore quota
  }
}

export async function uploadKyc(uid, file) {
  if (file.size > 10 * 1024 * 1024) throw new Error('KYC files must be 10 MB or smaller.')
  if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) {
    throw new Error('Use a PDF, JPG, or PNG KYC document.')
  }

  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

  try {
    const res = await api.post('/upload', {
      name: file.name,
      data: dataUrl,
      type: file.type,
    })
    const url = res.url || dataUrl
    const user = await getUserProfile(uid)
    const existingDocs = user?.kycDocuments || []
    await saveProfile(uid, {
      kycDocuments: [...existingDocs, url],
    })
    return url
  } catch {
    return dataUrl
  }
}

export async function inviteAgent(name, email, temporaryPassword) {
  return createUserDoc({
    name,
    email,
    role: 'agent',
    phone: '',
    temporaryPassword,
  })
}
