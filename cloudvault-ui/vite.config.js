import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The browser calls /api on port 5173; Vite forwards it to Drive-Service (8091).
// Same origin for the browser, so no CORS setup is needed in Spring Boot.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy: { '/api': { target: 'http://localhost:8091', changeOrigin: true } } },
});
