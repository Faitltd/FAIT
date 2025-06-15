#!/usr/bin/env node

/**
 * Update Imports and References
 * This script updates import statements and references for SvelteKit
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔗 Updating imports and references...');

// Update app.css for Tailwind
const appCssPath = path.join(path.dirname(__dirname), 'src/app.css');
const appCssContent = `@tailwind base;
@tailwind components;
@tailwind utilities;

/* FAIT Custom Styles */
@layer base {
  html {
    font-family: 'Inter', system-ui, sans-serif;
  }
}

@layer components {
  .btn-primary {
    @apply bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors;
  }
  
  .btn-secondary {
    @apply bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors;
  }
  
  .card {
    @apply bg-white rounded-lg shadow-md p-6;
  }
  
  .container {
    @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
  }
}

/* Custom animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.fade-in {
  animation: fadeIn 0.5s ease-out;
}

/* Responsive utilities */
@media (max-width: 640px) {
  .container {
    @apply px-4;
  }
}`;

try {
  fs.writeFileSync(appCssPath, appCssContent);
  console.log('✅ Updated src/app.css');
} catch (error) {
  console.error('❌ Error updating app.css:', error.message);
}

// Create app.html for SvelteKit
const appHtmlPath = path.join(path.dirname(__dirname), 'src/app.html');
const appHtmlContent = `<!DOCTYPE html>
<html lang="en" %sveltekit.theme%>
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%sveltekit.assets%/favicon.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="FAIT - Professional home services cooperative platform" />
    <meta name="keywords" content="home services, handyman, cleaning, electrical, plumbing, FAIT" />
    <meta name="author" content="FAIT" />
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://itsfait.com/" />
    <meta property="og:title" content="FAIT - Home Services Cooperative" />
    <meta property="og:description" content="Professional home services delivered by our trusted cooperative network" />
    <meta property="og:image" content="https://itsfait.com/og-image.jpg" />
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content="https://itsfait.com/" />
    <meta property="twitter:title" content="FAIT - Home Services Cooperative" />
    <meta property="twitter:description" content="Professional home services delivered by our trusted cooperative network" />
    <meta property="twitter:image" content="https://itsfait.com/og-image.jpg" />
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    %sveltekit.head%
  </head>
  <body data-sveltekit-preload-data="hover" class="bg-gray-50">
    <div style="display: contents" class="app">%sveltekit.body%</div>
  </body>
</html>`;

try {
  fs.writeFileSync(appHtmlPath, appHtmlContent);
  console.log('✅ Created src/app.html');
} catch (error) {
  console.error('❌ Error creating app.html:', error.message);
}

// Update Tailwind config for SvelteKit
const tailwindConfigPath = path.join(path.dirname(__dirname), 'tailwind.config.js');
const tailwindConfigContent = `/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        'fait-blue': {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        }
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}`;

try {
  fs.writeFileSync(tailwindConfigPath, tailwindConfigContent);
  console.log('✅ Updated tailwind.config.js');
} catch (error) {
  console.error('❌ Error updating tailwind.config.js:', error.message);
}

// Create PostCSS config
const postcssConfigPath = path.join(path.dirname(__dirname), 'postcss.config.js');
const postcssConfigContent = `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`;

try {
  fs.writeFileSync(postcssConfigPath, postcssConfigContent);
  console.log('✅ Created postcss.config.js');
} catch (error) {
  console.error('❌ Error creating postcss.config.js:', error.message);
}

console.log('🎯 Import and reference updates completed');
console.log('📝 Updated CSS, HTML, and configuration files for SvelteKit');
