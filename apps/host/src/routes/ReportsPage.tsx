import { ReportsRemote } from '../remotes/ReportsRemote';

export function ReportsPage() {
  return (
    <section>
      <h1>Reports</h1>
      <p style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>
        Rendered by the Angular <code>reports-remote</code>. The host script-loads
        the Angular bundle once, then drops <code>&lt;reports-dashboard /&gt;</code> into
        JSX — React doesn't know it's Angular.
      </p>
      <ReportsRemote />
    </section>
  );
}
