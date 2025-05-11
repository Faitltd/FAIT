import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import WebpackBanner from './components/WebpackBanner';

// This is the webpack-specific entry point
// It's similar to main.tsx but can include webpack-specific optimizations

// Add webpack-specific code here if needed
console.log('Application started with webpack bundler');

// Lazy load the WebpackFeatures component for code splitting demo
const WebpackFeatures = React.lazy(() => import('./components/WebpackFeatures'));

// Create a wrapper component that includes the WebpackBanner and features
const WebpackApp = () => (
  <>
    <WebpackBanner />
    <div className="container mx-auto px-4 py-8">
      <React.Suspense fallback={<div>Loading webpack features...</div>}>
        <WebpackFeatures />
      </React.Suspense>
    </div>
    <App />
  </>
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WebpackApp />
  </StrictMode>
);
