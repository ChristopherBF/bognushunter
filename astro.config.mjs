import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import tailwindcss from '@tailwindcss/vite';
import node from '@astrojs/node';

export default defineConfig({
  site: 'https://ChristopherBF.github.io',
  base: '/bognushunter/',
  integrations: [vue()],
  vite: {
    optimizeDeps: {
      include: ['vue']
    },

    plugins: [tailwindcss()]
  },
  // Keep Node.js adapter for server-side rendering
  adapter: node({
    mode: 'standalone'
  }),
  output: 'server' // Ensure server-side rendering for auth
});