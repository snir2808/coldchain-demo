import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/containers': 'http://localhost:3000',
      '/alerts': 'http://localhost:3000',
    },
  },
});
