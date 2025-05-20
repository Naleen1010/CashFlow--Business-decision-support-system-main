// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Configure build options
  build: {
    // Output to the dist folder
    outDir: 'dist',
    // Don't fail on warnings or errors
    reportCompressedSize: false,
    // Base path for assets
    base: '/',
    // Handle external dependencies
    rollupOptions: {
      external: ['quagga']
    }
  },
  // Development server proxy for API requests
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})