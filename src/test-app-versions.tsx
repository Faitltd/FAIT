import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

// Import all app versions
import SimpleTestApp from './SimpleTestApp';
import MinimalApp from './MinimalApp';
import EnhancedMinimalApp from './EnhancedMinimalApp';
import App from './App';

// Get the app version from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const appVersion = urlParams.get('version') || 'simple';

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
    default:
      console.log('Loading SimpleTestApp (default)');
      return <SimpleTestApp />;
  }
};

// Get the root element
const rootElement = document.getElementById('root');

// Log for debugging
console.log('test-app-versions.tsx is running');
console.log('App version:', appVersion);
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
