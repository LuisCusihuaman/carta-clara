import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [react(), tailwindcss(), VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['favicon.svg', 'icons.svg'],
    manifest: {
      name: 'Carta Clara',
      short_name: 'Carta Clara',
      description: 'Tarot fast search y reconocimiento de cartas',
      start_url: '/',
      scope: '/',
      display: 'standalone',
      orientation: 'portrait',
      theme_color: '#05040A',
      background_color: '#05040A',
      icons: [
        {
          src: '/favicon.svg',
          sizes: 'any',
          type: 'image/svg+xml',
          purpose: 'any maskable',
        },
      ],
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2,json}'],
      globIgnores: ['**/assets/opencv-*.js', '**/cards/source/**', '**/cards/full/**', '**/cards/thumb/**', '**/cards/blur/**', '**/cards/sprites/**'],
      navigateFallback: '/index.html',
      runtimeCaching: [
        {
          urlPattern: ({ request }) => request.destination === 'document',
          handler: 'NetworkFirst',
          options: {
            cacheName: 'carta-clara-pages',
          },
        },
        {
          urlPattern: ({ request }) => ['style', 'script', 'worker'].includes(request.destination),
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'carta-clara-assets',
          },
        },
        {
          urlPattern: ({ request }) => ['image', 'font'].includes(request.destination),
          handler: 'CacheFirst',
          options: {
            cacheName: 'carta-clara-media',
            expiration: {
              maxEntries: 96,
              maxAgeSeconds: 60 * 60 * 24 * 30,
            },
          },
        },
      ],
    },
  }), cloudflare()],
})
