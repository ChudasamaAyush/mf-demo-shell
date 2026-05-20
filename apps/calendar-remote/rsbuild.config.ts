import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import mfConfig from './module-federation.config';

function normalizeUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) return url.replace(/\/+$/, '') + '/';
  return `https://${url.replace(/\/+$/, '')}/`;
}

// In prod the calendar must know its own deployed URL so the chunks listed in
// mf-manifest.json carry absolute hrefs — otherwise the host (a different
// origin) resolves them against itself and 404s.
const ASSET_PREFIX = process.env.PUBLIC_CALENDAR_REMOTE_URL
  ? normalizeUrl(process.env.PUBLIC_CALENDAR_REMOTE_URL)
  : undefined;

export default defineConfig({
  plugins: [pluginReact(), pluginModuleFederation(mfConfig)],
  html: {
    title: 'MF Demo · Calendar (standalone)',
  },
  server: {
    port: 3001,
  },
  source: {
    entry: {
      index: './src/index.tsx',
    },
  },
  ...(ASSET_PREFIX ? { output: { assetPrefix: ASSET_PREFIX } } : {}),
});
