import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Sand Creek Cattle — installable, offline-first PWA.
// The service worker precaches the app shell so it opens with no signal;
// all herd data lives in IndexedDB (see src/db/db.ts), not on a server.
export default defineConfig({
  // Relative base so the built app works on GitHub Pages, Netlify, or a plain
  // static host without knowing the deploy path up front.
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'Sand Creek Cattle',
        short_name: 'Sand Creek',
        description: 'Cow-calf, breeding & AI tracker that works offline.',
        theme_color: '#001b3a',
        background_color: '#001b3a',
        display: 'standalone',
        orientation: 'portrait',
        start_url: './',
        scope: './',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        cleanupOutdatedCaches: true,
        navigateFallback: 'index.html',
      },
    }),
  ],
})
