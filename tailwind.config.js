/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf2f8',
          600: '#db2777',
          700: '#be185d',
        },
        secondary: {
          600: '#ec4899',
          700: '#db2777',
        },
        'company': {
          'lightblue': '#c0e2ff',
          'lightpink': '#fd67a3',
          'lighterpink': '#fe86ec',
          'lightorange': '#ff9d7d',
        },
        'blue': {
          '50': '#f0f9ff',
          '100': '#e0f2fe',
          '200': '#c0e2ff',
          '300': '#a5d3fc',
          '400': '#8bc5f9',
          '500': '#fd67a3',
          '600': '#fe86ec',
          '700': '#ff9d7d',
          '800': '#1e40af',
          '900': '#1e3a8a',
          '950': '#172554',
        },
      },
    },
  },
  plugins: [],
};
