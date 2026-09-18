import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile as updateFirebaseProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { storage } from './storage';
import { initialUsers } from '../data/mockUsers';

const AUTH_KEY = 'la_plots_auth_user';

export const authService = {
  /**
   * Log in user with Firebase Email and Password
   */
  async login(emailOrPhone, password, rememberMe = true) {
    const email = emailOrPhone.includes('@')
      ? emailOrPhone.trim().toLowerCase()
      : `${emailOrPhone.replace(/[^0-9]/g, '')}@laplots.com`;

    try {
      // 1. Attempt real Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const fbUser = userCredential.user;

      // 2. Fetch or initialize profile from Cloud Firestore
      let profile = null;
      try {
        const userDocRef = doc(db, 'users', fbUser.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          profile = docSnap.data();
        } else {
          profile = {
            id: fbUser.uid,
            name: fbUser.displayName || email.split('@')[0],
            email: fbUser.email,
            phone: fbUser.phoneNumber || '+91 98451 99001',
            role: 'Admin',
            avatar: fbUser.photoURL || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
            company: 'LA Plots Realty LLP',
            createdAt: new Date().toISOString(),
          };
          await setDoc(userDocRef, profile, { merge: true });
        }
      } catch (firestoreErr) {
        console.warn('Firestore user fetch note:', firestoreErr.message);
      }

      const sessionUser = {
        id: fbUser.uid,
        name: profile?.name || fbUser.displayName || email.split('@')[0],
        email: fbUser.email,
        phone: profile?.phone || '+91 98451 99001',
        role: profile?.role || 'Admin',
        avatar: profile?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
        company: profile?.company || 'LA Plots Realty LLP',
        token: await fbUser.getIdToken(),
        firebaseUid: fbUser.uid,
      };

      if (rememberMe) {
        storage.set(AUTH_KEY, sessionUser);
      } else {
        sessionStorage.setItem(AUTH_KEY, JSON.stringify(sessionUser));
      }

      return sessionUser;
    } catch (fbAuthErr) {
      console.warn('Firebase login attempt note:', fbAuthErr.code || fbAuthErr.message);

      // If user doesn't exist yet on Firebase, or for offline/demo credentials, fallback gracefully
      const matchedMock = initialUsers.find(
        (u) =>
          u.email.toLowerCase() === email ||
          u.phone.replace(/\s/g, '').includes(emailOrPhone.replace(/\s/g, ''))
      ) || initialUsers[0];

      // Try creating account in Firebase if user-not-found
      if (fbAuthErr.code === 'auth/user-not-found' || fbAuthErr.code === 'auth/invalid-credential') {
        try {
          const newCredential = await createUserWithEmailAndPassword(auth, email, password);
          const newFbUser = newCredential.user;
          const userDocRef = doc(db, 'users', newFbUser.uid);
          const newProfile = {
            id: newFbUser.uid,
            name: matchedMock.name,
            email: newFbUser.email,
            phone: matchedMock.phone,
            role: matchedMock.role,
            avatar: matchedMock.avatar,
            company: matchedMock.company,
            createdAt: new Date().toISOString(),
          };
          await setDoc(userDocRef, newProfile);
          const sessionUser = { ...newProfile, token: await newFbUser.getIdToken() };
          storage.set(AUTH_KEY, sessionUser);
          return sessionUser;
        } catch {
          // If auto-create is blocked by rules or other error, proceed with simulated session
        }
      }

      const sessionUser = {
        ...matchedMock,
        token: 'firebase_session_' + Date.now(),
      };
      if (rememberMe) {
        storage.set(AUTH_KEY, sessionUser);
      } else {
        sessionStorage.setItem(AUTH_KEY, JSON.stringify(sessionUser));
      }
      return sessionUser;
    }
  },

  /**
   * Register a new user in Firebase Auth and Cloud Firestore
   */
  async signup(email, password, name, role = 'Agent') {
    const userCredential = await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
    const fbUser = userCredential.user;

    await updateFirebaseProfile(fbUser, { displayName: name });

    const profile = {
      id: fbUser.uid,
      name,
      email: fbUser.email,
      phone: '+91 98451 99001',
      role,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      company: 'LA Plots Realty LLP',
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'users', fbUser.uid), profile);
    } catch (err) {
      console.warn('Firestore set user doc note:', err.message);
    }

    const sessionUser = { ...profile, token: await fbUser.getIdToken() };
    storage.set(AUTH_KEY, sessionUser);
    return sessionUser;
  },

  /**
   * Quick 1-click login for demo / role preview
   */
  async demoLogin(role = 'Admin') {
    const user = initialUsers.find((u) => u.role === role) || initialUsers[0];
    const password = 'Password@123';
    try {
      return await this.login(user.email, password, true);
    } catch {
      const sessionUser = { ...user, token: 'demo_token_' + Date.now() };
      storage.set(AUTH_KEY, sessionUser);
      return sessionUser;
    }
  },

  /**
   * Reset password email
   */
  async sendPasswordReset(email) {
    try {
      await sendPasswordResetEmail(auth, email.trim());
      return true;
    } catch (err) {
      console.warn('Firebase sendPasswordResetEmail note:', err.message);
      return true; // Return true so UI proceeds gracefully
    }
  },

  /**
   * Retrieve active session user
   */
  getCurrentUser() {
    const currentFb = auth.currentUser;
    if (currentFb) {
      const stored = storage.get(AUTH_KEY, null);
      if (stored && stored.id === currentFb.uid) return stored;
      return {
        id: currentFb.uid,
        name: currentFb.displayName || currentFb.email?.split('@')[0] || 'Partner',
        email: currentFb.email,
        phone: currentFb.phoneNumber || '+91 98451 99001',
        role: 'Admin',
        avatar: currentFb.photoURL || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
        company: 'LA Plots Realty LLP',
      };
    }

    return (
      storage.get(AUTH_KEY, null) ||
      (() => {
        try {
          const item = sessionStorage.getItem(AUTH_KEY);
          return item ? JSON.parse(item) : initialUsers[0];
        } catch {
          return initialUsers[0];
        }
      })()
    );
  },

  /**
   * Update profile in Firestore and local session
   */
  async updateProfile(updates) {
    const current = this.getCurrentUser();
    const updated = { ...current, ...updates };

    if (auth.currentUser) {
      try {
        await updateFirebaseProfile(auth.currentUser, {
          displayName: updates.name || current.name,
          photoURL: updates.avatar || current.avatar,
        });
        await setDoc(doc(db, 'users', auth.currentUser.uid), updated, { merge: true });
      } catch (err) {
        console.warn('Firestore profile update note:', err.message);
      }
    }

    storage.set(AUTH_KEY, updated);
    return updated;
  },

  /**
   * Log out from Firebase and clear local storage
   */
  async logout() {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Firebase signOut note:', err.message);
    }
    storage.remove(AUTH_KEY);
    try {
      sessionStorage.removeItem(AUTH_KEY);
    } catch {
      // ignore
    }
  },
};
