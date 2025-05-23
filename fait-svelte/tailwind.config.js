/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      fontFamily: {
        'ivy': ['ivyPrestoHeadline', 'serif'],
        'inter': ['Inter', 'sans-serif'],
        'bricolage': ['Bricolage Grotesque', 'sans-serif'],
        'icomoon': ['icomoon', 'sans-serif']
      },
      colors: {
        'fait-blue': '#0066FF',
        'fait-dark': '#333333',
        'fait-light': '#F5F5F5',
        'fait-accent': '#FF6B00',
        'fait-green': '#0D7A5F',
        'fait-green-light': '#ECF7EF',
        'fait-green-dark': '#0A432B',
        'fait-yellow': '#F9C339',
        'fait-gray': '#595C5B',
        'fait-gray-light': '#F5F7F6'
      }
    },
  },
  plugins: [],
}
