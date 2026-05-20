import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import mfConfig from './module-federation.config';

const REPORTS_REMOTE_URL =
  process.env.PUBLIC_REPORTS_REMOTE_URL ?? 'http://localhost:3002';

export default defineConfig({
  plugins: [pluginReact(), pluginModuleFederation(mfConfig)],
  html: {
    title: 'MF Demo · Host',
  },
  server: {
    port: 3000,
    historyApiFallback: true,
  },
  source: {
    entry: {
      index: './src/index.tsx',
    },
    define: {
      'process.env.PUBLIC_REPORTS_REMOTE_URL': JSON.stringify(REPORTS_REMOTE_URL),
    },
  },
});
