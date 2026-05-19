import type { User } from '@mf-demo/contracts';

interface Credential {
  username: string;
  password: string;
  user: User;
}

const CREDENTIALS: Credential[] = [
  {
    username: 'admin',
    password: 'admin',
    user: { id: 'u-admin', name: 'Admin', role: 'admin' },
  },
  {
    username: 'staff',
    password: 'staff',
    user: { id: 'u-staff', name: 'Staff', role: 'staff' },
  },
];

export function authenticate(username: string, password: string): User | null {
  const match = CREDENTIALS.find(
    (c) => c.username === username && c.password === password,
  );
  return match ? match.user : null;
}

function base64UrlEncode(value: string): string {
  return btoa(value).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
}

export function fakeJwt(user: User): string {
  const header = { alg: 'none', typ: 'JWT' };
  const payload = {
    sub: user.id,
    name: user.name,
    role: user.role,
    iat: Math.floor(Date.now() / 1000),
  };
  return [
    base64UrlEncode(JSON.stringify(header)),
    base64UrlEncode(JSON.stringify(payload)),
    'unsigned',
  ].join('.');
}
