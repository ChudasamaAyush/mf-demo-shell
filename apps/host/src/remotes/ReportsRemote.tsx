import { useEffect, useState } from 'react';

declare const process: { env: { PUBLIC_REPORTS_REMOTE_URL?: string } };

const REPORTS_REMOTE_URL =
  (typeof window !== 'undefined' && (window as any).__REPORTS_REMOTE_URL__) ||
  process.env.PUBLIC_REPORTS_REMOTE_URL ||
  'http://localhost:3002';

const REPORTS_BUNDLES = ['polyfills.js', 'main.js'];
const ELEMENT_TAG = 'reports-dashboard';

let loadPromise: Promise<void> | null = null;

function injectScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-mf-reports="${src}"]`);
    if (existing) {
      if ((existing as HTMLScriptElement).dataset.loaded === 'true') {
        resolve();
        return;
      }
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)), { once: true });
      return;
    }
    const tag = document.createElement('script');
    tag.type = 'module';
    tag.src = src;
    tag.async = true;
    tag.dataset.mfReports = src;
    tag.addEventListener('load', () => {
      tag.dataset.loaded = 'true';
      resolve();
    }, { once: true });
    tag.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)), { once: true });
    document.head.appendChild(tag);
  });
}

function loadReportsBundle(): Promise<void> {
  if (customElements.get(ELEMENT_TAG)) return Promise.resolve();
  if (!loadPromise) {
    loadPromise = Promise.all(
      REPORTS_BUNDLES.map((b) => injectScript(`${REPORTS_REMOTE_URL}/${b}`)),
    )
      .then(() => customElements.whenDefined(ELEMENT_TAG))
      .then(() => undefined)
      .catch((err) => {
        loadPromise = null;
        throw err;
      });
  }
  return loadPromise;
}

export function ReportsRemote() {
  const [ready, setReady] = useState(
    () => typeof customElements !== 'undefined' && !!customElements.get(ELEMENT_TAG),
  );
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadReportsBundle()
      .then(() => { if (!cancelled) setReady(true); })
      .catch((err) => { if (!cancelled) setError(err); });
    return () => { cancelled = true; };
  }, []);

  if (error) {
    return (
      <div className="placeholder">
        Reports remote failed to load from <code>{REPORTS_REMOTE_URL}</code>.
        Is the Angular dev server running on port 3002?
        <pre style={{ marginTop: 8, fontSize: 12, whiteSpace: 'pre-wrap' }}>
          {error.message}
        </pre>
      </div>
    );
  }

  if (!ready) return <div className="placeholder">Loading reports…</div>;

  return <reports-dashboard />;
}
