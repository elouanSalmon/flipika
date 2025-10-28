import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Séparer les dépendances principales
          'react-vendor': ['react', 'react-dom'],
          'animation-vendor': ['framer-motion'],
          'firebase-vendor': ['firebase/app', 'firebase/firestore', 'firebase/analytics'],
          'icons-vendor': ['lucide-react']
        }
      }
    },
    // Optimisations de performance
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    chunkSizeWarningLimit: 1000
  },
  // Optimisations pour le développement
  server: {
    port: 5173,
    host: true
  },
  // Préchargement des modules
  optimizeDeps: {
    include: ['react', 'react-dom', 'framer-motion', 'lucide-react']
  }
})
