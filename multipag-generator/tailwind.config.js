/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bradesco: {
          red: '#CC0000',
          'red-dark': '#990000',
          'red-light': '#FF3333',
        },
      },
    },
  },
  plugins: [],
};

