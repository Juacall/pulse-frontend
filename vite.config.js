import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    allowedHosts: ['lettuce-verse-kindling.ngrok-free.dev', '.ngrok-free.dev'],
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    // Raises the warning threshold slightly for single-page dashboard apps
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Isolates Lucide icons into its own chunk
            if (id.includes('lucide-react')) {
              return 'vendor-icons'
            }
            // Isolates React core packages
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-core'
            }
            // Separates remaining third-party dependencies
            return 'vendor'
          }
        },
      },
    },
  },
})