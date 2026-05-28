import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: process.env.GGDD_PAGES_BASE ?? '/',
  test: {
    environment: 'jsdom',
    globals: true,
  },
});
