import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { AuthState, User } from '@mf-demo/contracts';
import { authenticate, fakeJwt } from './users';
import { clearAuth, readAuth, writeAuth } from './storage';

interface AuthContextValue extends AuthState {
  login: (username: string, password: string) => { ok: true } | { ok: false; error: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => readAuth());

  const login = useCallback<AuthContextValue['login']>((username, password) => {
    const user = authenticate(username, password);
    if (!user) return { ok: false, error: 'Invalid username or password' };
    const token = fakeJwt(user);
    writeAuth(user, token);
    setState({ user, token });
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setState({ user: null, token: null });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ ...state, login, logout }),
    [state, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

export type { User };
