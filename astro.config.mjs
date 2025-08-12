import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://ChristopherBF.github.io',
  base: 'bognushunter',
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
  adapter: vercel({
    imageService: true,
    webAnalytics: {
      enabled: true,
    },
  })
});