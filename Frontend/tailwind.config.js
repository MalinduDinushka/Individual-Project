/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#60A5FA',
          dark: '#3B82F6',
          light: '#93C5FD'
        },
        secondary: {
          DEFAULT: '#F59E0B',
          dark: '#D97706',
          light: '#FBBF24'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    },
  },
  plugins: [],
}
