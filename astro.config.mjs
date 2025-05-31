import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://ChristopherBF.github.io',
  base: '/bognushunter/',
  integrations: [vue()],
  vite: {
    optimizeDeps: {
      include: ['vue']
    },

    plugins: [tailwindcss()]
  }
});