import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile as updateFirebaseProfile,
} from 'firebase/auth'
import { auth } from '../firebase'
import { storage } from './storage'
import { isAdminEmail } from './auth.js'
import { api } from './api.js'

const AUTH_KEY = 'la_plots_auth_user'

export const authService = {
  /**
   * Log in user with Firebase Email and Password, sync profile with MongoDB Atlas
   */
  async login(emailOrPhone, password, rememberMe = true) {
    const email = (emailOrPhone || '').trim().toLowerCase()

    try {
      // 1. Attempt real Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const fbUser = userCredential.user

      // 2. Fetch profile from MongoDB Atlas /api/users/:uid
      let profile = null
      try {
        profile = await api.get(`/users/${fbUser.uid}`)
      } catch (err) {
        console.warn('[MongoDB Atlas] user fetch note:', err.message)
      }

      if (!profile) {
        const isAdmin = isAdminEmail(fbUser.email)
        profile = {
          id: fbUser.uid,
          uid: fbUser.uid,
          name: fbUser.displayName || email.split('@')[0],
          email: fbUser.email,
          phone: fbUser.phoneNumber || '',
          role: isAdmin ? 'admin' : 'customer',
          avatar:
            fbUser.photoURL ||
            'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
          company: 'LK Properties',
          createdAt: new Date().toISOString(),
        }
        api.post('/users', profile).catch(() => {})
      }

      const isAdmin = isAdminEmail(fbUser.email) || profile?.role === 'admin'
      const sessionUser = {
        id: fbUser.uid,
        name: profile?.name || fbUser.displayName || email.split('@')[0],
        email: fbUser.email,
        phone: profile?.phone || '',
        role: isAdmin ? 'admin' : (profile?.role || 'customer'),
        avatar:
          profile?.photoURL ||
          profile?.avatar ||
          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
        company: profile?.company || 'LK Properties',
        token: await fbUser.getIdToken(),
        firebaseUid: fbUser.uid,
      }

      if (rememberMe) {
        storage.set(AUTH_KEY, sessionUser)
      } else {
        sessionStorage.setItem(AUTH_KEY, JSON.stringify(sessionUser))
      }

      return sessionUser
    } catch (fbAuthErr) {
      console.warn('Firebase login failed:', fbAuthErr.code || fbAuthErr.message)
      throw fbAuthErr
    }
  },

  /**
   * Register a new user in Firebase Auth and sync to MongoDB Atlas
   */
  async signup(email, password, name, phone = '') {
    const userCredential = await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), password)
    const fbUser = userCredential.user

    await updateFirebaseProfile(fbUser, { displayName: name })

    const profile = {
      id: fbUser.uid,
      uid: fbUser.uid,
      name,
      email: fbUser.email,
      phone: phone || '',
      role: 'customer',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      company: 'LK Properties',
      createdAt: new Date().toISOString(),
    }

    try {
      await api.post('/users', profile)
    } catch (err) {
      console.warn('[MongoDB Atlas] signup user sync note:', err.message)
    }

    const sessionUser = { ...profile, token: await fbUser.getIdToken() }
    storage.set(AUTH_KEY, sessionUser)
    return sessionUser
  },

  /**
   * Reset password email
   */
  async sendPasswordReset(email) {
    try {
      await sendPasswordResetEmail(auth, email.trim())
      return true
    } catch (err) {
      console.warn('Firebase sendPasswordResetEmail note:', err.message)
      return true
    }
  },

  /**
   * Retrieve active session user
   */
  getCurrentUser() {
    const currentFb = auth?.currentUser
    if (currentFb) {
      const stored = storage.get(AUTH_KEY, null)
      if (stored && stored.id === currentFb.uid) return stored
      const isAdmin = isAdminEmail(currentFb.email)
      return {
        id: currentFb.uid,
        name: currentFb.displayName || currentFb.email?.split('@')[0] || 'User',
        email: currentFb.email,
        phone: currentFb.phoneNumber || '',
        role: isAdmin ? 'admin' : 'customer',
        avatar:
          currentFb.photoURL ||
          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
        company: 'LK Properties',
      }
    }

    const stored = storage.get(AUTH_KEY, null)
    if (stored) return stored
    try {
      const item = sessionStorage.getItem(AUTH_KEY)
      return item ? JSON.parse(item) : null
    } catch {
      return null
    }
  },

  /**
   * Update profile in MongoDB Atlas and local session
   */
  async updateProfile(updates) {
    const current = this.getCurrentUser()
    const updated = { ...current, ...updates }

    if (auth?.currentUser) {
      try {
        await updateFirebaseProfile(auth.currentUser, {
          displayName: updates.name || current.name,
          photoURL: updates.avatar || current.avatar,
        })
        await api.put(`/users/${auth.currentUser.uid}`, updated)
      } catch (err) {
        console.warn('[MongoDB Atlas] profile update note:', err.message)
      }
    }

    storage.set(AUTH_KEY, updated)
    return updated
  },

  /**
   * Log out from Firebase and clear local storage
   */
  async logout() {
    try {
      await signOut(auth)
    } catch (err) {
      console.warn('Firebase signOut note:', err.message)
    }
    storage.remove(AUTH_KEY)
    try {
      sessionStorage.removeItem(AUTH_KEY)
    } catch {
      // ignore
    }
  },
}
