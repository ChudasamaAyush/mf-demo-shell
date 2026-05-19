export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'mf-demo:theme';
const VALID: readonly ThemeMode[] = ['light', 'dark'];

export function readTheme(): ThemeMode {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw && (VALID as readonly string[]).includes(raw)) return raw as ThemeMode;
  } catch {
    // ignore
  }
  return 'light';
}

export function writeTheme(mode: ThemeMode): void {
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // ignore
  }
}

export function applyTheme(mode: ThemeMode): void {
  document.documentElement.dataset.theme = mode;
}
