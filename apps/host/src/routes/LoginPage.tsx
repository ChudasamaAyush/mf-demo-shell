import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

interface LocationState {
  from?: string;
}

export function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as LocationState | null)?.from ?? '/';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const result = login(username.trim(), password);
    if (result.ok) {
      navigate(from, { replace: true });
    } else {
      setError(result.error);
    }
  }

  if (user) {
    return (
      <section>
        <h1>Already signed in</h1>
        <p>You're signed in as <strong>{user.name}</strong>.</p>
      </section>
    );
  }

  return (
    <section style={{ maxWidth: 360 }}>
      <h1>Sign in</h1>
      <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>
        Mock auth — try <code>admin</code>/<code>admin</code> or <code>staff</code>/<code>staff</code>.
      </p>
      <form onSubmit={handleSubmit} className="login-form">
        <label>
          Username
          <input
            type="text"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {error && <div className="login-error" role="alert">{error}</div>}
        <button type="submit">Sign in</button>
      </form>
    </section>
  );
}
