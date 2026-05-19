import { Routes, Route, NavLink } from 'react-router-dom';
import { HomePage } from './routes/HomePage';
import { CalendarPage } from './routes/CalendarPage';
import { ReportsPage } from './routes/ReportsPage';
import { SettingsPage } from './routes/SettingsPage';

export function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">MF Demo</div>
        <nav className="app-nav">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/calendar">Calendar</NavLink>
          <NavLink to="/reports">Reports</NavLink>
          <NavLink to="/settings">Settings</NavLink>
        </nav>
      </header>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
    </div>
  );
}
