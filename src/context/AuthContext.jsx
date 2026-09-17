import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  ensureUserDocument,
  getUserProfile,
  googleSignIn,
  isAdminEmail,
  resetPassword,
  signIn,
  signOutCurrentUser,
  signUp,
  subscribeToAuth,
} from '../services/auth'

const AuthContext = createContext(null)

const inflightProfileRequests = new Map()

function getCachedProfile(uid) {
  if (!uid || typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(`la_plots_profile_${uid}`)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveCachedProfile(uid, profileData) {
  if (!uid || !profileData || typeof window === 'undefined') return
  try {
    localStorage.setItem(`la_plots_profile_${uid}`, JSON.stringify(profileData))
  } catch {
    // Ignore storage quota or access errors in restricted modes
  }
}

function buildFallbackProfile(user, extra = {}) {
  if (!user) return null
  const localOverride = typeof window !== 'undefined' ? localStorage.getItem('la_plots_user_role') : null
  const cached = getCachedProfile(user.uid)
  const isDefaultAdmin = isAdminEmail(user.email)
  const defaultRole = isDefaultAdmin ? 'admin' : 'customer'

  const resolvedRole = localOverride || extra.role || (isDefaultAdmin ? 'admin' : (cached?.role || defaultRole))

  return {
    uid: user.uid,
    name: extra.name || cached?.name || user.displayName || user.email?.split('@')[0] || 'User',
    email: user.email || '',
    role: resolvedRole,
    photoURL: user.photoURL || cached?.photoURL || '',
    ...extra,
  }
}

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function loadUserProfile(user, extra = {}) {
    if (!user) {
      setProfile(null)
      return null
    }

    const fallback = buildFallbackProfile(user, extra)
    // Instantly set profile so UI does not stall or navigate to the wrong route
    setProfile((prev) => {
      if (prev?.uid === user.uid && prev?.role === 'admin' && fallback.role !== 'admin') {
        return { ...fallback, role: 'admin' }
      }
      return fallback
    })

    // Deduplicate in-flight requests for the same user
    if (inflightProfileRequests.has(user.uid)) {
      return inflightProfileRequests.get(user.uid)
    }

    const fetchTask = (async () => {
      try {
        // Fast Firestore profile resolution
        const firestoreProfile = await getUserProfile(user.uid)
        const localRole = typeof window !== 'undefined' ? localStorage.getItem('la_plots_user_role') : null
        const isUserAdmin = localRole === 'admin' || isAdminEmail(user.email)

        if (firestoreProfile) {
          const finalProfile = {
            ...fallback,
            ...firestoreProfile,
            role: isUserAdmin ? 'admin' : (firestoreProfile.role || fallback.role),
          }
          setProfile(finalProfile)
          saveCachedProfile(user.uid, finalProfile)
          return finalProfile
        }

        // If doc does not exist yet, trigger background creation
        ensureUserDocument(user, extra).then((created) => {
          if (created) {
            const finalProfile = {
              ...fallback,
              ...created,
              role: isUserAdmin ? 'admin' : (created.role || fallback.role),
            }
            setProfile(finalProfile)
            saveCachedProfile(user.uid, finalProfile)
          }
        }).catch(() => {})
      } catch (err) {
        console.warn('[Auth] Background profile load note:', err?.message)
      } finally {
        inflightProfileRequests.delete(user.uid)
      }
      return fallback
    })()

    inflightProfileRequests.set(user.uid, fetchTask)
    return fetchTask
  }

  useEffect(() => {
    return subscribeToAuth(async (user) => {
      setFirebaseUser(user)
      if (user) {
        await loadUserProfile(user)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })
  }, [])

  async function login(email, password) {
    setError(null)
    const result = await signIn(email, password)
    setFirebaseUser(result.user)
    const userProfile = await loadUserProfile(result.user)
    return { user: result.user, profile: userProfile }
  }

  async function register(name, email, password, role = 'customer') {
    setError(null)
    const user = await signUp(name, email, password, role)
    setFirebaseUser(user)
    const userProfile = await loadUserProfile(user, { name, role })
    return { user, profile: userProfile }
  }

  async function loginWithGoogle() {
    setError(null)
    const user = await googleSignIn()
    setFirebaseUser(user)
    const userProfile = await loadUserProfile(user, {
      name: user.displayName,
    })
    return { user, profile: userProfile }
  }

  async function logout() {
    await signOutCurrentUser()
    setProfile(null)
    setFirebaseUser(null)
  }

  async function switchRole(newRole) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('la_plots_user_role', newRole)
    }
    setProfile((prev) => (prev ? { ...prev, role: newRole } : { role: newRole }))
    if (firebaseUser?.uid) {
      saveCachedProfile(firebaseUser.uid, { ...profile, role: newRole })
      ensureUserDocument(firebaseUser, { role: newRole }).catch(() => {})
    }
  }

  async function refreshProfile() {
    if (firebaseUser) {
      return loadUserProfile(firebaseUser)
    }
    return null
  }

  const localRole = typeof window !== 'undefined' ? localStorage.getItem('la_plots_user_role') : null
  const role =
    (localRole === 'admin' ? 'admin' : null) ||
    (isAdminEmail(firebaseUser?.email) ? 'admin' : null) ||
    profile?.role ||
    localRole ||
    (firebaseUser ? 'customer' : null)

  const value = {
    firebaseUser,
    user: firebaseUser,
    profile,
    role,
    loading,
    error,
    login,
    signup: register,
    register,
    logout,
    googleSignIn: loginWithGoogle,
    resetPassword,
    refreshProfile,
    switchRole,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const useCustomerAuth = useAuth
