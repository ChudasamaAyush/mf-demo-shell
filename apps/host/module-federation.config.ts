import { createModuleFederationConfig } from '@module-federation/rsbuild-plugin';

function normalize(url: string): string {
  if (/^https?:\/\//i.test(url)) return url.replace(/\/+$/, '');
  return `https://${url.replace(/\/+$/, '')}`;
}

const CALENDAR_BASE = normalize(
  process.env.PUBLIC_CALENDAR_REMOTE_URL ?? 'http://localhost:3001',
);

export default createModuleFederationConfig({
  name: 'host',
  remotes: {
    calendar: `calendar@${CALENDAR_BASE}/mf-manifest.json`,
    // reports remote (Angular) is wired via its own Web Component path, not MF v1
  },
  shared: {
    react: { singleton: true, requiredVersion: '^18.0.0' },
    'react-dom': { singleton: true, requiredVersion: '^18.0.0' },
  },
});
