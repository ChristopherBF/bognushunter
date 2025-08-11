import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://christopherbf.github.io',
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
  // Use static output for GitHub Pages (no SSR on Pages)
  output: 'static',
  // Exclude server-only routes from the static build
  build: {
    exclude: ['/api/**', '/admin/**']
  }
});