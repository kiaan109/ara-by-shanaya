/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: { 400: '#efc85a', 500: '#d4991a', 600: '#b87d14' },
        luxury: { black: '#0a0a0a', dark: '#111111', card: '#1a1a1a', border: '#2a2a2a' },
      },
    },
  },
  plugins: [],
};
