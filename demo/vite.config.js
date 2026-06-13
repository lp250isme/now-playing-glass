import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));

// Demo imports the package by its real name, aliased to the local source —
// so the demo doubles as living usage docs and never lags behind the package.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'now-playing-glass/styles.css': path.resolve(here, '../src/styles.css'),
      'now-playing-glass': path.resolve(here, '../src/index.js'),
    },
  },
});
