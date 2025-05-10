import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { registerServiceWorker } from './utils/serviceWorkerRegistration';
import { getBestSupportedFormat, ImageFormat } from './utils/imageOptimization';
import { workerRegistry, WorkerType } from './utils/webWorkerRegistrySimple';

// Import all app versions
import SimpleTestApp from './SimpleTestApp';
import MinimalApp from './MinimalApp';
import EnhancedMinimalApp from './EnhancedMinimalApp';
import App from './App';
import ModularApp from './ModularApp';

// Initialize performance optimizations
const initializePerformanceOptimizations = async () => {
  // Register service worker
  try {
    const registration = await registerServiceWorker({
      onSuccess: (reg) => {
        console.log('Service worker registered successfully:', reg);
      },
      onError: (error) => {
        console.error('Service worker registration failed:', error);
      }
    });

    if (registration) {
      console.log('Service worker is active');
    }
  } catch (error) {
    console.error('Error registering service worker:', error);
  }

  // Initialize web workers
  try {
    if (workerRegistry.isSupported()) {
      // Preload image worker
      await workerRegistry.runTask(WorkerType.IMAGE, 'ping', {})
        .then(() => console.log('Image worker initialized'))
        .catch(err => console.error('Error initializing image worker:', err));

      // Preload data worker
      await workerRegistry.runTask(WorkerType.DATA, 'ping', {})
        .then(() => console.log('Data worker initialized'))
        .catch(err => console.error('Error initializing data worker:', err));
    } else {
      console.log('Web workers not supported in this environment');
    }
  } catch (error) {
    console.error('Error initializing web workers:', error);
  }

  // Detect best supported image format
  try {
    const bestFormat = await getBestSupportedFormat();
    console.log('Best supported image format:', bestFormat);

    // Store in localStorage for future use
    localStorage.setItem('bestImageFormat', bestFormat);
  } catch (error) {
    console.error('Error detecting best image format:', error);
    // Fallback to WebP
    localStorage.setItem('bestImageFormat', ImageFormat.WEBP);
  }
};

// Initialize performance optimizations
initializePerformanceOptimizations();

// Get the app version from URL parameters or environment variable
const urlParams = new URLSearchParams(window.location.search);
const defaultVersion = import.meta.env.VITE_APP_VERSION || 'enhanced';
const appVersion = urlParams.get('version') || defaultVersion;

// Select the app component based on the version parameter
const getAppComponent = () => {
  switch (appVersion) {
    case 'simple':
      console.log('Loading SimpleTestApp');
      return <SimpleTestApp />;
    case 'minimal':
      console.log('Loading MinimalApp');
      return <MinimalApp />;
    case 'enhanced':
      console.log('Loading EnhancedMinimalApp');
      return <EnhancedMinimalApp />;
    case 'full':
      console.log('Loading full App');
      return <App />;
    case 'modular':
      console.log('Loading ModularApp');
      return <ModularApp />;
    default:
      console.log('Loading EnhancedMinimalApp (default)');
      return <EnhancedMinimalApp />;
  }
};

// Log for debugging
console.log('main.tsx is running');
console.log('App version:', appVersion);

// Get the root element
const rootElement = document.getElementById('root');

// Log for debugging
console.log('Root element:', rootElement);

if (rootElement) {
  try {
    // Clear any existing content
    rootElement.innerHTML = '';

    // Add a version indicator that will be replaced by React
    rootElement.innerHTML = `
      <div style="padding: 20px; font-family: Arial, sans-serif; background-color: lightyellow; border: 1px solid #ccc;">
        <h2>Loading ${appVersion} App Version...</h2>
        <p>If you continue to see this message, React may not be rendering correctly.</p>
      </div>
    `;

    // Create root and render
    console.log('Creating React root');
    const root = createRoot(rootElement);

    console.log('Rendering React app');
    root.render(
      <StrictMode>
        {getAppComponent()}
      </StrictMode>
    );
    console.log('React rendering call completed');
  } catch (error) {
    console.error('Error rendering React app:', error);
    // Fallback rendering in case of error
    rootElement.innerHTML = `
      <div style="padding: 20px; font-family: Arial, sans-serif; background-color: #ffdddd; border: 1px solid #ff0000;">
        <h1 style="color: red;">Error Rendering React App</h1>
        <p>There was an error rendering the ${appVersion} application version.</p>
        <pre style="background-color: #f8f8f8; padding: 10px; border-radius: 5px; overflow: auto;">${error instanceof Error ? error.message : String(error)}</pre>
        ${error instanceof Error && error.stack ? `<details>
          <summary>Error Stack</summary>
          <pre style="background-color: #f8f8f8; padding: 10px; border-radius: 5px; overflow: auto;">${error.stack}</pre>
        </details>` : ''}
        <div style="margin-top: 20px;">
          <p>Try a different app version:</p>
          <ul>
            <li><a href="?version=simple">Simple Test App</a></li>
            <li><a href="?version=minimal">Minimal App</a></li>
            <li><a href="?version=enhanced">Enhanced Minimal App</a></li>
            <li><a href="?version=full">Full App</a></li>
            <li><a href="?version=modular">Modular App</a></li>
          </ul>
        </div>
      </div>
    `;
  }
} else {
  console.error('Root element not found');
  // Create a fallback root element
  const fallbackRoot = document.createElement('div');
  fallbackRoot.id = 'fallback-root';
  document.body.appendChild(fallbackRoot);
  fallbackRoot.innerHTML = `
    <div style="padding: 20px; font-family: Arial, sans-serif; background-color: #ffdddd; border: 1px solid #ff0000;">
      <h1 style="color: red;">Root Element Not Found</h1>
      <p>The application could not find the root element to render into.</p>
      <p>Expected element with id "root" in the DOM.</p>
    </div>
  `;
}
