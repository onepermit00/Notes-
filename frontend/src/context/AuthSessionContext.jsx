import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../services/authApi';

const AuthSessionContext = createContext(null);

export function AuthSessionProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('loading');

  const refresh = useCallback(async () => {
    setStatus('loading');
    const nextUser = await authApi.getMe();
    setUser(nextUser);
    setStatus(nextUser ? 'authenticated' : 'anonymous');
    return nextUser;
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const completeAuthentication = useCallback((nextUser) => {
    setUser(nextUser);
    setStatus('authenticated');
  }, []);

  const signOut = useCallback(async () => {
    await authApi.signOut();
    setUser(null);
    setStatus('anonymous');
  }, []);

  const value = useMemo(() => ({ user, status, refresh, completeAuthentication, signOut }), [user, status, refresh, completeAuthentication, signOut]);
  return <AuthSessionContext.Provider value={value}>{children}</AuthSessionContext.Provider>;
}

export function useAuthSession() {
  const context = useContext(AuthSessionContext);
  if (!context) throw new Error('useAuthSession must be used within AuthSessionProvider');
  return context;
}
