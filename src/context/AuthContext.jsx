import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  checkRedirectResult,
  ensureUserDocument,
  formatAuthError,
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
  const cached = getCachedProfile(user.uid || user.id);
  const isDefaultAdmin = isAdminEmail(user.email);
  const defaultRole = isDefaultAdmin ? 'admin' : 'customer';

  // Only allow admin role if email matches admin list
  let resolvedRole = isDefaultAdmin ? 'admin' : (cached?.role || defaultRole);
  if (extra.role && (extra.role !== 'admin' || isDefaultAdmin)) {
    resolvedRole = extra.role;
  }

  return {
    id: user.uid || user.id,
    uid: user.uid || user.id,
    name: extra.name || cached?.name || user.displayName || user.name || user.email?.split('@')[0] || 'User',
    email: user.email || '',
    phone: user.phoneNumber || user.phone || cached?.phone || '',
    role: resolvedRole,
    photoURL: user.photoURL || cached?.photoURL || cached?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    avatar: user.photoURL || cached?.photoURL || cached?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    company: user.company || cached?.company || 'LK Properties',
    ...extra,
  };
}

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadUserProfile = useCallback(async (user, extra = {}) => {
    if (!user) {
      setProfile(null);
      return null;
    }

    const userKey = user.uid || user.id;
    const isUserAdmin = isAdminEmail(user.email);
    const fallback = buildFallbackProfile(user, extra);

    if (inflightProfileRequests.has(userKey)) {
      return inflightProfileRequests.get(userKey);
    }

    const fetchTask = (async () => {
      try {
        const remote = await getUserProfile(userKey);
        if (remote) {
          const finalProfile = {
            ...fallback,
            ...remote,
            id: userKey,
            uid: userKey,
            role: isUserAdmin ? 'admin' : (remote.role || fallback.role),
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

    // Ensure loadUserProfile never hangs UI longer than 3 seconds
    const resilientTask = Promise.race([
      fetchTask,
      new Promise((resolve) => setTimeout(() => resolve(fallback), 3000)),
    ]);

    inflightProfileRequests.set(userKey, resilientTask);
    return resilientTask;
  }, []);

  useEffect(() => {
    // Check if user just returned from a Google redirect sign-in
    checkRedirectResult().then((redirectUser) => {
      if (redirectUser) {
        setFirebaseUser(redirectUser);
        loadUserProfile(redirectUser);
      }
    }).catch((err) => {
      if (err?.code !== 'auth/popup-closed-by-user') {
        console.warn('[Auth] checkRedirectResult notice:', err?.message);
      }
    });

    const unsub = subscribeToAuth(async (user) => {
      setFirebaseUser(user);
      if (user) {
        await loadUserProfile(user);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsub();
  }, [loadUserProfile]);

  const login = useCallback(async (emailOrPhone, password, rememberMe = true) => {
    setError(null);
    setLoading(true);
    try {
      const cleanEmailOrPhone = (emailOrPhone || '').trim();
      const cleanPassword = (password || '').trim();

      if (!cleanEmailOrPhone) {
        const err = new Error('Please enter your email or mobile number.');
        err.code = 'auth/missing-email';
        throw err;
      }
      if (!cleanPassword) {
        const err = new Error('Please enter your password.');
        err.code = 'auth/missing-password';
        throw err;
      }

      if (cleanEmailOrPhone.includes('@')) {
        const result = await signIn(cleanEmailOrPhone, cleanPassword);
        setFirebaseUser(result.user);
        const userProfile = await loadUserProfile(result.user);
        return { user: result.user, profile: userProfile };
      } else {
        const loggedUser = await authService.login(cleanEmailOrPhone, cleanPassword, rememberMe);
        setProfile(loggedUser);
        return { user: loggedUser, profile: loggedUser };
      }
    } catch (err) {
      const friendlyMsg = formatAuthError(err);
      setError(friendlyMsg);
      const friendlyError = new Error(friendlyMsg);
      friendlyError.code = err?.code;
      throw friendlyError;
    } finally {
      setLoading(false);
    }
  }, [loadUserProfile]);

  const signup = useCallback(async (...args) => {
    setError(null);
    setLoading(true);
    try {
      let name = '';
      let phone = '';
      let email = '';
      let password = '';
      let role = 'customer';

      if (args.length >= 4 && typeof args[1] === 'string' && !args[1].includes('@') && args[2]?.includes('@')) {
        // Called as (name, phone, email, password, role)
        name = args[0] || '';
        phone = args[1] || '';
        email = args[2] || '';
        password = args[3] || '';
        role = args[4] || 'customer';
      } else {
        // Called as (name, email, password, role) or (name, email, password)
        name = args[0] || '';
        email = args[1] || '';
        password = args[2] || '';
        role = args[3] || 'customer';
      }

      const cleanName = (name || '').trim();
      const cleanPhone = (phone || '').trim();
      const cleanEmail = (email || '').trim().toLowerCase();
      const cleanPassword = (password || '').trim();

      if (!cleanEmail) {
        const err = new Error('Please enter your email address.');
        err.code = 'auth/missing-email';
        throw err;
      }
      if (!cleanPassword) {
        const err = new Error('Please enter a password.');
        err.code = 'auth/missing-password';
        throw err;
      }

      const user = await signUp(cleanName, cleanPhone, cleanEmail, cleanPassword, role);
      setFirebaseUser(user);
      const userProfile = await loadUserProfile(user, { name: cleanName, phone: cleanPhone, role });
      return { user, profile: userProfile };
    } catch (err) {
      const friendlyMsg = formatAuthError(err);
      setError(friendlyMsg);
      const friendlyError = new Error(friendlyMsg);
      friendlyError.code = err?.code;
      throw friendlyError;
    } finally {
      setLoading(false);
    }
  }, [loadUserProfile]);

  const googleSignIn = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const user = await authGoogleSignIn();
      if (!user) {
        // Redirect was initiated due to blocked popup; waiting for browser redirect
        return null;
      }
      setFirebaseUser(user);
      const userProfile = await loadUserProfile(user, { name: user.displayName });
      return { user, profile: userProfile };
    } catch (err) {
      const friendlyMsg = formatAuthError(err);
      setError(friendlyMsg);
      const friendlyError = new Error(friendlyMsg);
      friendlyError.code = err?.code;
      throw friendlyError;
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
    const userEmail = firebaseUser?.email || profile?.email;
    if (newRole === 'admin' && !isAdminEmail(userEmail)) {
      throw new Error('Access denied: Admin role requires authorized administrator email.');
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

  const isAuthenticated = Boolean(firebaseUser || (profile && profile.id));
  const userEmail = firebaseUser?.email || profile?.email;
  const isEmailAdmin = isAdminEmail(userEmail);
  const rawRole = isEmailAdmin ? 'admin' : (profile?.role || (isAuthenticated ? 'customer' : null));
  const effectiveRole = rawRole ? rawRole.toLowerCase() : null;
  const isAdmin = effectiveRole === 'admin' && isAuthenticated;
  const isAgent = (effectiveRole === 'agent' || isAdmin) && isAuthenticated;
  const isManager = (effectiveRole === 'agent' || effectiveRole === 'manager' || isAdmin) && isAuthenticated;

  const value = {
    firebaseUser,
    user: profile || firebaseUser,
    profile,
    role: effectiveRole,
    isAuthenticated,
    isAdmin,
    isAgent,
    isManager,
    loading,
    error,
    login,
    signup,
    register: signup,
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
