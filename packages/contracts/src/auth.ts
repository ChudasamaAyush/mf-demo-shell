export type Role = 'admin' | 'staff';

export interface User {
  id: string;
  name: string;
  role: Role;
}

export interface AuthState {
  user: User | null;
  token: string | null;
}

export type AuthEvent =
  | { type: 'auth:login'; user: User; token: string }
  | { type: 'auth:logout' };
