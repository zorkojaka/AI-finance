/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#2563eb",
          blueDark: "#1d4ed8",
          grayLight: "#f3f4f6",
          gray: "#e5e7eb",
          grayDark: "#d1d5db",
          white: "#fff"
        }
      }
    },
  },
  plugins: [],
}
