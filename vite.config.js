import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/icon-1': {
        target: 'https://api.20010522.xyz',
        changeOrigin: true,
      },
      '/icon-2': {
        target: 'https://api.20010522.xyz',
        changeOrigin: true,
      },
      '/icon-3': {
        target: 'https://api.20010522.xyz',
        changeOrigin: true,
      },
      '/icon-4': {
        target: 'https://api.20010522.xyz',
        changeOrigin: true,
      },
      '/unsplash': {
        target: 'https://api.20010522.xyz',
        changeOrigin: true,
      },
      '/bing': {
        target: 'https://api.20010522.xyz',
        changeOrigin: true,
      }
    }
  }
})