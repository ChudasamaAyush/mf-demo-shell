import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export function HomePage() {
  const { user } = useAuth();

  return (
    <section className="home">
      <div className="home-hero">
        <span className="home-pill">Cross-framework Module Federation</span>
        <h1>Module Federation Demo Shell</h1>
        <p>
          React host loading a React Calendar remote (via MF) and an Angular Reports
          remote (via Angular Elements). Three apps, three pipelines, three independent
          deploys — composed into one product at page load.
        </p>
        {user ? (
          <p className="home-greeting">
            Signed in as <strong>{user.name}</strong> · {user.role}.
          </p>
        ) : (
          <p className="home-greeting">
            Try <Link to="/login">signing in</Link> with <code>admin</code>/<code>admin</code>.
          </p>
        )}
      </div>

      <div className="home-cards">
        <Link to="/calendar" className="home-card">
          <span className="home-card-icon" aria-hidden>📅</span>
          <h3>Calendar</h3>
          <p>React 18 remote · loaded over Module Federation</p>
        </Link>
        <Link to="/reports" className="home-card">
          <span className="home-card-icon" aria-hidden>📊</span>
          <h3>Reports</h3>
          <p>Angular 17 remote · loaded as a Web Component</p>
        </Link>
        <Link to="/settings" className="home-card">
          <span className="home-card-icon" aria-hidden>⚙️</span>
          <h3>Settings</h3>
          <p>Host-owned · light / dark mode</p>
        </Link>
      </div>
    </section>
  );
}
