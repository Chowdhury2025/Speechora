import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 8800,
    host: true  // Allow access from other devices on the network
  },
  plugins: [
    react()
  ],
  build: {
    sourcemap: true
  }
})
