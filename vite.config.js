import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import legacy from '@vitejs/plugin-legacy'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    legacy({
      targets: ['defaults', 'not IE 11', 'iOS >= 15'],
      polyfills: true,
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
  assetsInclude: ['**/*.glb'],
  build: {
    target: 'es2015',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('three') || id.includes('@react-three')) {
              return 'three';
            }
            if (id.includes('rapier')) {
              return 'physics';
            }
            if (id.includes('gsap')) {
              return 'gsap';
            }
            if (id.includes('framer-motion')) {
              return 'framer';
            }
          }
        }
      }
    }
  }
})
