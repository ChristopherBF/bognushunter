import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import tailwind from '@astrojs/tailwind';
import vercelServerLess from '@astrojs/vercel/serverless';

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
  adapter: vercelServerLess()
});