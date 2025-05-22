/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'company': {
          'lightblue': '#3b82f6',  // Modern blue
          'lightpink': '#ec4899',  // Modern pink
          'lighterpink': '#f472b6', // Lighter pink
          'lightorange': '#f97316', // Modern orange
        },
        // Override blue colors with company light blue
        'blue': {
          '50': '#f0f9ff',
          '100': '#e0f2fe',
          '200': '#bae6fd',
          '300': '#7dd3fc',
          '400': '#38bdf8',
          '500': '#0ea5e9',
          '600': '#0284c7',
          '700': '#0369a1',
          '800': '#075985',
          '900': '#0c4a6e',
          '950': '#082f49',
        },
      },
    },
  },
  plugins: [],
};
