/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff5f5',
          100: '#ffe3e3',
          200: '#ffc9c9',
          300: '#ffa8a8',
          400: '#ff8787',
          500: '#E52323',
          600: '#c91b1b',
          700: '#a81313',
          800: '#8c0c0c',
          900: '#6e0707',
        },
      }
    },
  },
  plugins: [],
}
