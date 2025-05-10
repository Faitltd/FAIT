/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'company': {
          'lightblue': '#c0e2ff',
          'lightpink': '#fd67a3',
          'lighterpink': '#fe86ec',
          'lightorange': '#ff9d7d',
        },
        // Override blue colors with company light blue
        'blue': {
          '50': '#f0f9ff',
          '100': '#e0f2fe',
          '200': '#c0e2ff', // Company light blue
          '300': '#a5d3fc',
          '400': '#8bc5f9',
          '500': '#fd67a3', // Company light pink
          '600': '#fe86ec', // Company lighter pink
          '700': '#ff9d7d', // Company light orange
          '800': '#1e40af',
          '900': '#1e3a8a',
          '950': '#172554',
        },
      },
    },
  },
  plugins: [],
};
