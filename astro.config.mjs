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
      include: [
        'embla-carousel-react',
        'rough-notation',
        'gsap',
        'gsap/ScrollTrigger',
        'canvas-confetti',
      ],
    },
    build: {
      target: 'es2020',
      cssCodeSplit: true,
    },
  },
});
