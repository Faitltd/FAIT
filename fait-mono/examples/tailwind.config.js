const sharedConfig = require('@fait/config/tailwind.preset');

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [sharedConfig],
  // Add any app-specific tailwind configuration here
  theme: {
    extend: {
      // App-specific theme extensions
    },
  },
};
