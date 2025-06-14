import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 8800,
    host: true  // Allow access from other devices on the network
  },  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Book8 Learning Platform',
        short_name: 'Book8',
        description: 'Educational platform for interactive learning',
        theme_color: '#58cc02',
        icons: [
          {
            src: '/appIcon-removebg-preview.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/appIcon-removebg-preview.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  build: {
    sourcemap: true
  }
})
