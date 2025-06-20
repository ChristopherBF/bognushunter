import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom', // for Vue component testing
    globals: true,
    // You can add more vitest config here
  }
})