import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['vite.svg'],
      manifest: {
        name: 'S Store MOBILE CENTRE',
        short_name: 'S Store',
        description: 'Inventory Management System',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'vite.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: 'vite.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module'
      },      workbox: {
        // Use conditional configuration based on command
        globDirectory: process.env.NODE_ENV === 'production' ? 'dist' : 'dev-dist',
        globPatterns: [
          '**/*.{js,css,html,ico,png,svg}'
        ],
        navigateFallback: 'index.html',
        navigateFallbackAllowlist: [/^\/$/,/^\/products/,/^\/quotation/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./, // Adjust this pattern based on your API URL
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 10,
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  build: {
    sourcemap: true,
  },
  server: {
    port: 5173,
  },
  // PWA Configuration
  manifest: {
    name: 'Inventory Management System',
    short_name: 'Inventory',
    description: 'Inventory and Sales Management System',
    theme_color: '#ffffff',
    icons: [
      {
        src: '/vite.svg',
        sizes: '192x192',
        type: 'image/svg+xml'
      }
    ]
  }
})
