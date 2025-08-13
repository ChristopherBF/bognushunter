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
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  server: {
    port: 8080,
    host: true
  }
});