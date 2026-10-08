import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://astro.build/config
export default defineConfig({
  site: 'https://rzikydn.my.id',
  integrations: [react()],
  build: {
    format: 'file',
  },
  vite: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    assetsInclude: ['**/*.glb'],
    optimizeDeps: {
      include: ['embla-carousel-react'],
    },
    build: {
      target: 'es2020',
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          assetFileNames(assetInfo) {
            if (assetInfo.names && assetInfo.names.some(n => n.endsWith('.glb'))) {
              return '_astro/card.glb';
            }
            if (assetInfo.name && assetInfo.name.endsWith('.glb')) {
              return '_astro/card.glb';
            }
            return '_astro/[name].[hash][extname]';
          },
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
          },
        },
      },
    },
  },
});
