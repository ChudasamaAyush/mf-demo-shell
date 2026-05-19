import { useEffect, useState } from 'react';
import { AUTH_CHANNEL, type AuthEvent, type AuthState } from '@mf-demo/contracts';

const STORAGE_KEY = 'mf-demo:auth';

function readInitial(): AuthState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { user: null, token: null };
    const parsed = JSON.parse(raw) as AuthState;
    if (parsed && parsed.user && parsed.token) return parsed;
  } catch {
    // ignore
  }
  return { user: null, token: null };
}

export interface UseAuthResult extends AuthState {
  logout: () => void;
}

export function useAuth(): UseAuthResult {
  const [state, setState] = useState<AuthState>(readInitial);

  useEffect(() => {
    const channel = new BroadcastChannel(AUTH_CHANNEL);
    channel.onmessage = (event: MessageEvent<AuthEvent>) => {
      const msg = event.data;
      if (!msg || typeof msg.type !== 'string') return;
      if (msg.type === 'auth:login') {
        setState({ user: msg.user, token: msg.token });
      } else if (msg.type === 'auth:logout') {
        setState({ user: null, token: null });
      }
    };
    return () => channel.close();
  }, []);

  function logout() {
    const channel = new BroadcastChannel(AUTH_CHANNEL);
    try {
      channel.postMessage({ type: 'auth:logout' } satisfies AuthEvent);
    } finally {
      channel.close();
    }
    setState({ user: null, token: null });
  }

  return { ...state, logout };
}
