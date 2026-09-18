import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  ensureUserDocument,
  getUserProfile,
  googleSignIn as authGoogleSignIn,
  isAdminEmail,
  resetPassword as authResetPassword,
  signIn,
  signOutCurrentUser,
  signUp,
  subscribeToAuth,
} from '../services/auth';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

const inflightProfileRequests = new Map();

function getCachedProfile(uid) {
  if (!uid || typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(`la_plots_profile_${uid}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveCachedProfile(uid, profileData) {
  if (!uid || !profileData || typeof window === 'undefined') return;
  try {
    localStorage.setItem(`la_plots_profile_${uid}`, JSON.stringify(profileData));
  } catch {
    // Ignore storage quota
  }
}

function buildFallbackProfile(user, extra = {}) {
  if (!user) return null;
  const localOverride = typeof window !== 'undefined' ? localStorage.getItem('la_plots_user_role') : null;
  const cached = getCachedProfile(user.uid || user.id);
  const isDefaultAdmin = isAdminEmail(user.email);
  const defaultRole = isDefaultAdmin ? 'admin' : 'customer';

  const resolvedRole = localOverride || extra.role || (isDefaultAdmin ? 'admin' : (cached?.role || defaultRole));

  return {
    id: user.uid || user.id,
    uid: user.uid || user.id,
    name: extra.name || cached?.name || user.displayName || user.name || user.email?.split('@')[0] || 'User',
    email: user.email || '',
    phone: user.phoneNumber || user.phone || cached?.phone || '+91 98451 99001',
    role: resolvedRole,
    photoURL: user.photoURL || cached?.photoURL || cached?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    avatar: user.photoURL || cached?.photoURL || cached?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    company: user.company || cached?.company || 'LA Plots Realty LLP',
    ...extra,
  };
}

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [profile, setProfile] = useState(() => authService.getCurrentUser());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadUserProfile = useCallback(async (user, extra = {}) => {
    if (!user) {
      setProfile(null);
      return null;
    }

    const fallback = buildFallbackProfile(user, extra);
    setProfile((prev) => {
      if (prev?.id === fallback.id && (prev?.role === 'admin' || prev?.role === 'Admin') && fallback.role !== 'admin') {
        return { ...fallback, role: 'admin' };
      }
      return fallback;
    });

    const userKey = user.uid || user.id;
    if (inflightProfileRequests.has(userKey)) {
      return inflightProfileRequests.get(userKey);
    }

    const fetchTask = (async () => {
      try {
        const firestoreProfile = await getUserProfile(userKey);
        const localRole = typeof window !== 'undefined' ? localStorage.getItem('la_plots_user_role') : null;
        const isUserAdmin = localRole === 'admin' || isAdminEmail(user.email);

        if (firestoreProfile) {
          const finalProfile = {
            ...fallback,
            ...firestoreProfile,
            id: userKey,
            uid: userKey,
            role: isUserAdmin ? 'admin' : (firestoreProfile.role || fallback.role),
          };
          setProfile(finalProfile);
          saveCachedProfile(userKey, finalProfile);
          return finalProfile;
        }

        ensureUserDocument(user, extra).then((created) => {
          if (created) {
            const finalProfile = {
              ...fallback,
              ...created,
              id: userKey,
              uid: userKey,
              role: isUserAdmin ? 'admin' : (created.role || fallback.role),
            };
            setProfile(finalProfile);
            saveCachedProfile(userKey, finalProfile);
          }
        }).catch(() => {});
      } catch (err) {
        console.warn('[Auth] Profile resolution note:', err?.message);
      } finally {
        inflightProfileRequests.delete(userKey);
      }
      return fallback;
    })();

    inflightProfileRequests.set(userKey, fetchTask);
    return fetchTask;
  }, []);

  useEffect(() => {
    const unsub = subscribeToAuth(async (user) => {
      setFirebaseUser(user);
      if (user) {
        await loadUserProfile(user);
      } else {
        const demoUser = authService.getCurrentUser();
        if (demoUser && !demoUser.firebaseUid) {
          setProfile(demoUser);
        } else {
          setProfile(null);
        }
      }
      setLoading(false);
    });

    return () => unsub();
  }, [loadUserProfile]);

  const login = useCallback(async (emailOrPhone, password, rememberMe = true) => {
    setError(null);
    setLoading(true);
    try {
      if (emailOrPhone.includes('@')) {
        const result = await signIn(emailOrPhone, password);
        setFirebaseUser(result.user);
        const userProfile = await loadUserProfile(result.user);
        return { user: result.user, profile: userProfile };
      } else {
        const loggedUser = await authService.login(emailOrPhone, password, rememberMe);
        setProfile(loggedUser);
        return { user: loggedUser, profile: loggedUser };
      }
    } catch (err) {
      setError(err?.message || 'Login failed.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadUserProfile]);

  const signup = useCallback(async (name, email, password, role = 'customer') => {
    setError(null);
    setLoading(true);
    try {
      const user = await signUp(name, email, password, role);
      setFirebaseUser(user);
      const userProfile = await loadUserProfile(user, { name, role });
      return { user, profile: userProfile };
    } catch (err) {
      setError(err?.message || 'Signup failed.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadUserProfile]);

  const demoLogin = useCallback(async (role = 'Admin') => {
    setError(null);
    setLoading(true);
    try {
      const demoUser = await authService.demoLogin(role);
      const normalizedRole = role.toLowerCase() === 'admin' ? 'admin' : (role.toLowerCase() === 'manager' ? 'agent' : 'customer');
      if (typeof window !== 'undefined') {
        localStorage.setItem('la_plots_user_role', normalizedRole);
      }
      setProfile({ ...demoUser, role: normalizedRole });
      return demoUser;
    } finally {
      setLoading(false);
    }
  }, []);

  const googleSignIn = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const user = await authGoogleSignIn();
      setFirebaseUser(user);
      const userProfile = await loadUserProfile(user, { name: user.displayName });
      return { user, profile: userProfile };
    } catch (err) {
      setError(err?.message || 'Google Sign-in failed.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadUserProfile]);

  const logout = useCallback(async () => {
    await signOutCurrentUser();
    await authService.logout();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('la_plots_user_role');
    }
    setFirebaseUser(null);
    setProfile(null);
  }, []);

  const resetPassword = useCallback(async (email) => {
    return authResetPassword(email);
  }, []);

  const updateProfile = useCallback(async (updates) => {
    const updated = await authService.updateProfile(updates);
    setProfile((prev) => ({ ...prev, ...updated }));
    return updated;
  }, []);

  const switchRole = useCallback(async (newRole) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('la_plots_user_role', newRole);
    }
    setProfile((prev) => (prev ? { ...prev, role: newRole } : { role: newRole }));
    if (firebaseUser?.uid) {
      saveCachedProfile(firebaseUser.uid, { ...profile, role: newRole });
      ensureUserDocument(firebaseUser, { role: newRole }).catch(() => {});
    }
  }, [firebaseUser, profile]);

  const refreshProfile = useCallback(async () => {
    if (firebaseUser) {
      return loadUserProfile(firebaseUser);
    }
    return profile;
  }, [firebaseUser, loadUserProfile, profile]);

  const effectiveRole = (profile?.role || (isAdminEmail(firebaseUser?.email) ? 'admin' : (firebaseUser ? 'customer' : null)) || 'admin').toLowerCase();
  const isAdmin = effectiveRole === 'admin';
  const isManager = effectiveRole === 'agent' || effectiveRole === 'manager' || isAdmin;
  const isAuthenticated = Boolean(profile || firebaseUser);

  const value = {
    firebaseUser,
    user: profile || firebaseUser,
    profile,
    role: effectiveRole,
    isAuthenticated,
    isAdmin,
    isManager,
    loading,
    error,
    login,
    signup,
    register: signup,
    demoLogin,
    googleSignIn,
    logout,
    resetPassword,
    refreshProfile,
    switchRole,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export const useCustomerAuth = useAuth;

export default AuthContext;
