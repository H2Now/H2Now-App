import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',

      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',

      manifest: {
        name: 'H2Now',
        short_name: 'H2Now',
        description: 'Hydration Solutions',
        theme_color: '#161616',
        background_color: '#161616',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' }
        ]
      },

      injectManifest: {
        globPatterns: [],
      }
    })
  ],
})