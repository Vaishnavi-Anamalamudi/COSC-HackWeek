import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authApi, firebaseReady } from '../services/firebase.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [guest, setGuest] = useState(() => localStorage.getItem('chronovault_guest') === 'true');
  const [loading, setLoading] = useState(firebaseReady);

  useEffect(() => {
    if (!firebaseReady) {
      setLoading(false);
      return undefined;
    }
    return authApi.onChange((nextUser) => {
      setUser(nextUser);
      setGuest(Boolean(nextUser?.isAnonymous));
      setLoading(false);
    });
  }, []);

  const value = useMemo(
    () => ({
      user,
      guest,
      loading,
      firebaseReady,
      async loginGoogle() {
        if (!firebaseReady) throw new Error('Firebase is not configured.');
        await authApi.signInGoogle();
      },
      async loginEmail(email, password, isRegistering = false) {
        if (!firebaseReady) throw new Error('Firebase is not configured.');
        return isRegistering ? authApi.registerEmail(email, password) : authApi.signInEmail(email, password);
      },
      async enterGuestMode() {
        if (firebaseReady) {
          await authApi.guest();
        }
        localStorage.setItem('chronovault_guest', 'true');
        setGuest(true);
      },
      async logout() {
        await authApi.logout();
        localStorage.removeItem('chronovault_guest');
        setGuest(false);
        setUser(null);
      },
    }),
    [guest, loading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
