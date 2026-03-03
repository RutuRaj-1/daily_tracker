import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { firebaseAuth } from '../services/firebase/auth';
import { getUserProfile, createUserProfile } from '../services/firebase/firestore';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Persistent session — Firebase uses IndexedDB persistence by default.
  // onAuthStateChanged fires ONCE on app load with cached user, no re-login needed.
  useEffect(() => {
    let mounted = true;

    const unsubscribe = firebaseAuth.onAuthStateChanged(async (firebaseUser) => {
      if (!mounted) return;

      if (firebaseUser) {
        setUser(firebaseUser);

        // Try to load profile, but NEVER block on it
        try {
          const result = await getUserProfile(firebaseUser.uid);
          if (mounted) {
            if (result.success) {
              setUserProfile(result.data);
            } else {
              // Auto-create profile for new users (e.g., first OAuth login)
              try {
                const newProfile = {
                  displayName: firebaseUser.displayName || '',
                  email: firebaseUser.email || '',
                  photoURL: firebaseUser.photoURL || '',
                  createdAt: new Date().toISOString(),
                  settings: {
                    theme: 'light',
                    notifications: true,
                    workPreference: 'morning',
                    goalEndDate: new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0]
                  },
                };
                await createUserProfile(firebaseUser.uid, newProfile);
                if (mounted) setUserProfile({ id: firebaseUser.uid, ...newProfile });
              } catch (createErr) {
                console.warn('Profile creation skipped:', createErr.message);
                // Still set a minimal profile so the app works
                if (mounted) setUserProfile({
                  id: firebaseUser.uid,
                  displayName: firebaseUser.displayName || 'User',
                  email: firebaseUser.email || '',
                });
              }
            }
          }
        } catch (err) {
          console.warn('Profile fetch failed, using fallback:', err.message);
          // Fallback: use Firebase Auth data directly
          if (mounted) setUserProfile({
            id: firebaseUser.uid,
            displayName: firebaseUser.displayName || 'User',
            email: firebaseUser.email || '',
          });
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }

      // ALWAYS set loading to false, no matter what path we took
      if (mounted) setLoading(false);
    });

    // Safety timeout — if auth takes >5s, force loading to false
    const timeout = setTimeout(() => {
      if (mounted && loading) {
        console.warn('Auth timeout — forcing loading to false');
        setLoading(false);
      }
    }, 5000);

    return () => {
      mounted = false;
      unsubscribe();
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (email, password) => {
    return firebaseAuth.signIn(email, password);
  }, []);

  const signup = useCallback(async (email, password, displayName) => {
    return firebaseAuth.signUp(email, password, displayName);
  }, []);

  const logout = useCallback(async () => {
    return firebaseAuth.signOut();
  }, []);

  const value = useMemo(() => ({
    user,
    userProfile,
    loading,
    login,
    signup,
    logout,
  }), [user, userProfile, loading, login, signup, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};