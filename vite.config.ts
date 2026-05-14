import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '@pages':      fileURLToPath(new URL('./src/pages',      import.meta.url)),
      '@store':      fileURLToPath(new URL('./src/store',      import.meta.url)),
      '@hooks':      fileURLToPath(new URL('./src/hooks',      import.meta.url)),
      '@api':        fileURLToPath(new URL('./src/api',        import.meta.url)),
      '@assets':     fileURLToPath(new URL('./src/assets',     import.meta.url)),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://projectx-api-718606133437.us-central1.run.app',
        changeOrigin: true,
      },
    },
  },
})
