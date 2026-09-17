import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  ensureUserDocument,
  googleSignIn,
  resetPassword,
  signIn,
  signOutCurrentUser,
  signUp,
  subscribeToAuth,
} from '../services/auth'

const AuthContext = createContext(null)

function buildFallbackProfile(user, extra = {}) {
  if (!user) return null
  return {
    uid: user.uid,
    name: extra.name || user.displayName || user.email?.split('@')[0] || 'User',
    email: user.email || '',
    role: extra.role || 'customer',
    photoURL: user.photoURL || '',
    ...extra,
  }
}

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function loadUserProfile(user) {
    if (!user) {
      setProfile(null)
      return null
    }

    const fallback = buildFallbackProfile(user)
    setProfile(fallback)

    try {
      const firestoreProfile = await ensureUserDocument(user)
      if (firestoreProfile) {
        setProfile(firestoreProfile)
        return firestoreProfile
      }
    } catch (err) {
      console.warn('[Auth] Could not ensure user in Firestore:', err?.message)
    }

    return fallback
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
    const userProfile = await loadUserProfile(user)
    return { user, profile: userProfile }
  }

  async function loginWithGoogle() {
    setError(null)
    const user = await googleSignIn()
    setFirebaseUser(user)
    const userProfile = await loadUserProfile(user)
    return { user, profile: userProfile }
  }

  async function logout() {
    await signOutCurrentUser()
    setProfile(null)
    setFirebaseUser(null)
  }

  async function refreshProfile() {
    if (firebaseUser) {
      return loadUserProfile(firebaseUser)
    }
    return null
  }

  const role = profile?.role || (firebaseUser ? 'customer' : null)

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
