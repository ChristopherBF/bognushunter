import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import tailwind from '@astrojs/tailwind';
import node from '@astrojs/node';

export default defineConfig({
  site: 'https://ChristopherBF.github.io',
  // Ensure base path works locally and on GitHub Pages (must start and end with '/')
  base: '/bognushunter/',
  integrations: [
    vue(),
    tailwind()
  ],
  vite: {
    optimizeDeps: {
      include: ['vue']
    }
  },
  adapter: node({
    mode: 'standalone',
  }),
  output: 'server'
});