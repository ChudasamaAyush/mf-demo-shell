import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
  plugins: [pluginReact()],
  html: {
    title: 'MF Demo · Calendar (standalone)',
  },
  server: {
    port: 3001,
  },
  source: {
    entry: {
      index: './src/bootstrap.tsx',
    },
  },
});
