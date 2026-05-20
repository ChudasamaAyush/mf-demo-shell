import { createModuleFederationConfig } from '@module-federation/rsbuild-plugin';

// Local dev defaults; pipeline sets PUBLIC_CALENDAR_REMOTE_URL to the prod SWA hostname.
const CALENDAR_BASE = process.env.PUBLIC_CALENDAR_REMOTE_URL ?? 'http://localhost:3001';

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
