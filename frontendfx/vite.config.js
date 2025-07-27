import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 8800,
    host: true  // Allow access from other devices on the network
  },
  plugins: [
    react(),
    {
      name: 'custom-workbox',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          res.setHeader('Service-Worker-Allowed', '/');
          next();
        });
      },
      config() {
        return {
          build: {
            rollupOptions: {
              output: {
                manualChunks: {
                  workbox: ['workbox-window']
                }
              }
            }
          }
        };
      }
    }
  ],
  build: {
    sourcemap: true
  }
})
