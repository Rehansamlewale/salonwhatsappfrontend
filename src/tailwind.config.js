/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '475px',
      },
      colors: {
        primary: {
          50: '#f5f7ff',
          100: '#ebf0ff',
          200: '#d6ddff',
          300: '#b3c2ff',
          400: '#8a9eff',
          500: '#667eea',
          600: '#5a67d8',
          700: '#764ba2',
          800: '#5a3a7a',
          900: '#3d2852',
        },
        secondary: {
          400: '#fbb6ce',
          500: '#f093fb',
          600: '#f5576c',
          700: '#e53e3e',
        },
      },
    },
  },
  plugins: [],
}
