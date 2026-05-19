import { useEffect, useState } from 'react';

type ThemeMode = 'light' | 'dark';

export function SettingsPage() {
  const [mode, setMode] = useState<ThemeMode>(() =>
    (document.documentElement.dataset.theme as ThemeMode) || 'light',
  );

  useEffect(() => {
    document.documentElement.dataset.theme = mode;
  }, [mode]);

  return (
    <section>
      <h1>Settings</h1>
      <div className="placeholder" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <label>
          Theme:&nbsp;
          <select value={mode} onChange={(e) => setMode(e.target.value as ThemeMode)}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>
      </div>
    </section>
  );
}
