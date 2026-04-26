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
            // Split react and react-dom into a 'vendor-react' chunk
            if (id.includes('react/') || id.includes('react-dom/') || id.includes('react-router')) {
              return 'vendor-react';
            }
            // Put other dependencies into a general 'vendor' chunk
            return 'vendor';
          }
        }
      }
    },
    chunkSizeWarningLimit: 600,
  }
})
