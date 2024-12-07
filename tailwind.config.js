/** @type {import('tailwindcss').Config} */
const plugin = require('tailwindcss/plugin');

module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,ejs}",
    "./views/**/*.ejs"
  ],
  theme: {
    extend: {
      backgroundColor: {
        'primary-dark': "#111111"
      },
      colors: {
        'primary-light': "#ffffff80"
      }
    },
  },
  plugins: [
    plugin(function ({ addBase, theme }) {
      addBase({
          'body': {
              backgroundColor: theme('backgroundColor.primary-dark'),
              color: theme('colors.primary-light'),
          },
      });
  }),
  ],
}

