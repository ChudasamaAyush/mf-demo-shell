import type { AuthState, User } from '@mf-demo/contracts';

const STORAGE_KEY = 'mf-demo:auth';

export function readAuth(): AuthState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { user: null, token: null };
    const parsed = JSON.parse(raw) as AuthState;
    if (parsed && parsed.user && parsed.token) return parsed;
  } catch {
    // fall through
  }
  return { user: null, token: null };
}

export function writeAuth(user: User, token: string): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, token }));
}

export function clearAuth(): void {
  localStorage.removeItem(STORAGE_KEY);
}
