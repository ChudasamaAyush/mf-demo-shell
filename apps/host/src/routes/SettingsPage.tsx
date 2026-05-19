import { useState } from 'react';
import { applyTheme, readTheme, writeTheme, type ThemeMode } from '../theme';

export function SettingsPage() {
  const [mode, setMode] = useState<ThemeMode>(readTheme);

  function update(next: ThemeMode) {
    setMode(next);
    writeTheme(next);
    applyTheme(next);
  }

  return (
    <section>
      <h1>Settings</h1>
      <div className="placeholder" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <label>
          Theme:&nbsp;
          <select value={mode} onChange={(e) => update(e.target.value as ThemeMode)}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>
        <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
          Both remotes pick this up via <code>var(--color-…)</code> with no remote code change.
        </span>
      </div>
    </section>
  );
}
