import { Link, NavLink, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { RequireAuth } from './auth/RequireAuth';
import { HomePage } from './routes/HomePage';
import { CalendarPage } from './routes/CalendarPage';
import { ReportsPage } from './routes/ReportsPage';
import { SettingsPage } from './routes/SettingsPage';
import { LoginPage } from './routes/LoginPage';

function HeaderUserChip() {
  const { user, logout } = useAuth();
  if (!user) {
    return (
      <div className="user-chip">
        <Link to="/login">Sign in</Link>
      </div>
    );
  }
  return (
    <div className="user-chip">
      <span>
        <strong>{user.name}</strong> · {user.role}
      </span>
      <button type="button" onClick={logout}>Log out</button>
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <div className="app-shell">
        <header className="app-header">
          <div className="brand">MF Demo</div>
          <nav className="app-nav">
            <NavLink to="/" end>Home</NavLink>
            <NavLink to="/calendar">Calendar</NavLink>
            <NavLink to="/reports">Reports</NavLink>
            <NavLink to="/settings">Settings</NavLink>
          </nav>
          <HeaderUserChip />
        </header>
        <main className="app-main">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/calendar"
              element={<RequireAuth><CalendarPage /></RequireAuth>}
            />
            <Route
              path="/reports"
              element={<RequireAuth><ReportsPage /></RequireAuth>}
            />
            <Route
              path="/settings"
              element={<RequireAuth><SettingsPage /></RequireAuth>}
            />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
}
