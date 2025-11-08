/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'brand-blue': '#1f2b6c',
        'brand-light': '#f4f7fb',
        'brand-accent': '#4f7df3'
      }
    }
  },
  plugins: []
};
