import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  AUTH_CHANNEL,
  type AuthEvent,
  type AuthState,
  type User,
} from '@mf-demo/contracts';
import { authenticate, fakeJwt } from './users';
import { clearAuth, readAuth, writeAuth } from './storage';

interface AuthContextValue extends AuthState {
  login: (username: string, password: string) => { ok: true } | { ok: false; error: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => readAuth());
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    const channel = new BroadcastChannel(AUTH_CHANNEL);
    channelRef.current = channel;

    channel.onmessage = (event: MessageEvent<AuthEvent>) => {
      const msg = event.data;
      if (!msg || typeof msg.type !== 'string') return;
      if (msg.type === 'auth:logout') {
        clearAuth();
        setState({ user: null, token: null });
      } else if (msg.type === 'auth:login') {
        writeAuth(msg.user, msg.token);
        setState({ user: msg.user, token: msg.token });
      }
    };

    return () => {
      channel.close();
      channelRef.current = null;
    };
  }, []);

  const broadcast = useCallback((event: AuthEvent) => {
    channelRef.current?.postMessage(event);
  }, []);

  const login = useCallback<AuthContextValue['login']>(
    (username, password) => {
      const user = authenticate(username, password);
      if (!user) return { ok: false, error: 'Invalid username or password' };
      const token = fakeJwt(user);
      writeAuth(user, token);
      setState({ user, token });
      broadcast({ type: 'auth:login', user, token });
      return { ok: true };
    },
    [broadcast],
  );

  const logout = useCallback(() => {
    clearAuth();
    setState({ user: null, token: null });
    broadcast({ type: 'auth:logout' });
  }, [broadcast]);

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
