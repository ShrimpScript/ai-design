import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' + HashRouter: dist/ works from any static server and any sub-path.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: { target: 'es2020', cssCodeSplit: true, assetsInlineLimit: 0 },
});
