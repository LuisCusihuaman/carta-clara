import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['offline.html', 'icons/icon.svg', 'icons/maskable.svg'],
      manifest: {
        name: 'Carta Clara',
        short_name: 'Carta Clara',
        description: 'Tarot fast search y reconocimiento de cartas',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#0e0b16',
        background_color: '#0e0b16',
        icons: [
          { src: '/icons/icon.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any' },
          { src: '/icons/maskable.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}', 'data/manifest.json', 'data/cards.summary.v1.json', 'data/cards.search-index.v1.json'],
        navigateFallback: '/offline.html',
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/data/cards.detail/'),
            handler: 'CacheFirst',
            options: { cacheName: 'card-detail-json', expiration: { maxEntries: 90, maxAgeSeconds: 60 * 60 * 24 * 30 } }
          },
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/cards/thumbnails/'),
            handler: 'CacheFirst',
            options: { cacheName: 'card-thumbnails', expiration: { maxEntries: 120, maxAgeSeconds: 60 * 60 * 24 * 60 } }
          },
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/cards/full/'),
            handler: 'CacheFirst',
            options: { cacheName: 'card-full-images', expiration: { maxEntries: 40, maxAgeSeconds: 60 * 60 * 24 * 30 } }
          },
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/vision/'),
            handler: 'CacheFirst',
            options: { cacheName: 'vision-assets', expiration: { maxEntries: 180, maxAgeSeconds: 60 * 60 * 24 * 30 } }
          }
        ]
      }
    })
  ],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/unit/setup.ts'],
    include: ['tests/unit/**/*.test.ts', 'tests/unit/**/*.test.tsx'],
    globals: true
  },
  resolve: {
    alias: {
      '@': '/src',
      '@app': '/src/app',
      '@components': '/src/components',
      '@features': '/src/features',
      '@lib': '/src/lib'
    }
  }
})
