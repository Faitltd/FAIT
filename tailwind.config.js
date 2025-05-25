/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{html,js,ts,jsx,tsx,svelte}'],
  theme: {
    extend: {
      maxWidth: {
        'screen-xl': '1280px',
        'content': '1200px',
        'prose': '65ch',
      },
      fontFamily: {
        'sans': ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        'serif': ['IvyPrestoHeadline', 'ui-serif', 'Georgia', 'Cambria', 'Times New Roman', 'Times', 'serif'],
        'display': ['Bricolage Grotesque', 'Inter', 'ui-sans-serif', 'system-ui'],
        'ivy': ['IvyPrestoHeadline', 'serif'],
        'inter': ['Inter', 'sans-serif'],
        'bricolage': ['Bricolage Grotesque', 'sans-serif'],
        'icomoon': ['icomoon', 'sans-serif'],
      },
      colors: {
        'company': {
          'lightblue': '#3b82f6',  // Modern blue
          'lightpink': '#ec4899',  // Modern pink
          'lighterpink': '#f472b6', // Lighter pink
          'lightorange': '#f97316', // Modern orange
        },
        'fait': {
          'green': '#10b981',
          'green-light': '#d1fae5',
          'green-dark': '#047857',
          'blue': '#3b82f6',
          'gray': '#6b7280',
          'gray-light': '#f9fafb',
          'dark': '#1f2937',
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
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'slide-left': 'slideLeft 0.5s ease-out',
        'slide-right': 'slideRight 0.5s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
