import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/bing-api': {
        target: 'https://www.bing.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/bing-api/, '')
      },
      '/icon-api-iowen': {
        target: 'https://api.iowen.cn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/icon-api-iowen/, '/favicon/get')
      },
      '/icon-api-horse': {
        target: 'https://icon.horse',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/icon-api-horse/, '/icon')
      },
      '/icon-api-kongfandong': {
        target: 'https://kongfandong.cn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/icon-api-kongfandong/, '/api/icon')
      },
      '/unsplash-api': {
        target: 'https://api.unsplash.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/unsplash-api/, '')
      }
    }
  }
})