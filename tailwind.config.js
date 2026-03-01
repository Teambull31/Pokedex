/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        pokemon: {
          red: '#CC0000',
          yellow: '#FFDE00',
          blue: '#3B4CCA',
          dark: '#1a1a2e',
        },
      },
    },
  },
  plugins: [],
};
