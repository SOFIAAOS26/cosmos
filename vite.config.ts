/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';

// COSMOS — our little universe.
// Vite + React + PWA. Mobile-first, installable, private.
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'nedi/NEDI.png'],
      manifest: {
        name: 'COSMOS — our little universe',
        short_name: 'COSMOS',
        description: 'A private little universe for two people.',
        theme_color: '#0F0F11',
        background_color: '#0F0F11',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        categories: ['lifestyle', 'personalization'],
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/icons/icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallbackDenylist: [/^\/auth/],
        runtimeCaching: [
          {
            // Supabase Storage images — cache-first for recently viewed media.
            urlPattern: ({ url }) => url.pathname.includes('/storage/v1/object/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'cosmos-media',
              expiration: { maxEntries: 120, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
});
