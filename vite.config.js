import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/recette-cuisine/',
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
})