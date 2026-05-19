import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
  plugins: [pluginReact()],
  html: {
    title: 'MF Demo · Host',
  },
  server: {
    port: 3000,
  },
  source: {
    entry: {
      index: './src/main.tsx',
    },
  },
});
