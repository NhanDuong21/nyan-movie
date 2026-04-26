import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Bundle all node_modules into a single vendor chunk to ensure 
            // module singleton behavior (prevents createContext undefined errors)
            return 'vendor';
          }
        }
      }
    },
    chunkSizeWarningLimit: 600,
  }
})
