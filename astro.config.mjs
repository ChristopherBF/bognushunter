import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import tailwind from '@astrojs/tailwind';
import node from '@astrojs/node';

export default defineConfig({
  site: 'http://192.128.0.129:8080',
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