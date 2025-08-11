import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import tailwind from '@astrojs/tailwind';
import node from '@astrojs/node';

export default defineConfig({
  site: 'https://ChristopherBF.github.io',
  base: 'bognushunter',
  integrations: [
    vue({ appEntrypoint: '/src/pages/admin' }),
    tailwind()
  ],
  vite: {
    optimizeDeps: {
      include: ['vue']
    }
  },
  // Keep Node.js adapter for server-side rendering
  adapter: node({
    mode: 'standalone'
  }),
  output: 'server' // Ensure server-side rendering for auth
});