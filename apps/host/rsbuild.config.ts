import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import mfConfig from './module-federation.config';

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
  },
});
