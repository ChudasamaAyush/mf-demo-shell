import { DestroyRef, Injectable, inject, signal, type Signal } from '@angular/core';
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

@Injectable({ providedIn: 'root' })
export class AuthBridgeService {
  private readonly _state = signal<AuthState>(readInitial());
  readonly state: Signal<AuthState> = this._state.asReadonly();

  constructor() {
    const destroyRef = inject(DestroyRef);
    const channel = new BroadcastChannel(AUTH_CHANNEL);

    channel.onmessage = (event: MessageEvent<AuthEvent>) => {
      const msg = event.data;
      if (!msg || typeof msg.type !== 'string') return;
      if (msg.type === 'auth:login') {
        this._state.set({ user: msg.user, token: msg.token });
      } else if (msg.type === 'auth:logout') {
        this._state.set({ user: null, token: null });
      }
    };

    destroyRef.onDestroy(() => channel.close());
  }
}
