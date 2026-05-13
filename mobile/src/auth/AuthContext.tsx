import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { clearSession, getSession, setSession, type Session } from './session';
import { setAuthToken, setUnauthorizedHandler } from '@/api/client';

interface AuthContextValue {
  session: Session | null;
  loading: boolean;
  signIn: (s: Session) => Promise<void>;
  updateSession: (s: Session) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSession().then((s) => {
      setSessionState(s);
      setAuthToken(s?.token ?? null);
      setLoading(false);
    });
  }, []);

  const signIn = useCallback(async (s: Session) => {
    await setSession(s);
    setAuthToken(s.token);
    setSessionState(s);
  }, []);

  const signOut = useCallback(async () => {
    await clearSession();
    setAuthToken(null);
    setSessionState(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      // 401 from any API call kicks the user back to /auth so they re-login
      // with a fresh token. Avoids stuck states with stale/expired tokens.
      void signOut();
    });
    return () => setUnauthorizedHandler(null);
  }, [signOut]);

  const value = useMemo(
    () => ({ session, loading, signIn, updateSession: signIn, signOut }),
    [session, loading, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
