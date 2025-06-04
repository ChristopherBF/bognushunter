/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#FFD700',
          light: '#FFF3B0',
          dark: '#FFB800',
        },
        brown: {
          DEFAULT: '#3C1A00',
          light: '#6A3B12',
          dark: '#2A1200',
        },
        orange: {
          DEFAULT: '#FF9900',
        },
        'streamer-dark-bg': '#1A1A2E',
        'streamer-card-bg': '#16213E',
        'streamer-red-accent': '#E94560',
        'streamer-gold-accent': '#F0A500',
        'streamer-purple-accent': '#A259FF',
        'streamer-green-accent': '#50C878',
        'streamer-text-primary': '#EAEAEA',
        'streamer-text-secondary': '#A9A9A9',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 1s ease-out forwards',
      },
      fontFamily: {
        'display': ['"Oswald"', 'sans-serif'],
        'body': ['"Roboto"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
