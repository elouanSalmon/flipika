import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'Flipika',
        short_name: 'Flipika',
        description: 'Flipika crée, gère et optimise automatiquement vos campagnes Google Ads comme un Media Buyer expert, mais 100x plus rapide.',
        theme_color: '#0066ff',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        orientation: 'portrait-primary',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icon-maskable-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: '/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        categories: ['business', 'productivity', 'marketing'],
        shortcuts: [
          {
            name: 'Dashboard',
            short_name: 'Dashboard',
            description: 'Accéder au tableau de bord',
            url: '/app/dashboard',
            icons: [{ src: '/icon-192.png', sizes: '192x192' }]
          },
          {
            name: 'Rapports',
            short_name: 'Rapports',
            description: 'Créer un rapport',
            url: '/app/reports',
            icons: [{ src: '/icon-192.png', sizes: '192x192' }]
          }
        ]
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 4000000,
        // Network-First strategy for API and Firestore requests
        // This ensures users NEVER see stale data
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'firestore-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 5 // 5 minutes fallback cache
              },
              networkTimeoutSeconds: 10
            }
          },
          {
            urlPattern: /^https:\/\/.*\.googleapis\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'google-apis-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 5
              },
              networkTimeoutSeconds: 10
            }
          },
          {
            urlPattern: /^https:\/\/.*\.cloudfunctions\.net\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'cloud-functions-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 5
              },
              networkTimeoutSeconds: 10
            }
          },
          // Cache-First strategy for static assets (images, fonts, etc.)
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          },
          {
            urlPattern: /\.(?:woff|woff2|ttf|eot)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'fonts-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          }
        ],
        // Don't cache these patterns at all
        navigateFallbackDenylist: [/^\/api/, /^\/auth/],
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true
      },
      devOptions: {
        enabled: false // Disable in development to avoid confusion
      }
    })
  ],
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
