import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import SimpleTestApp from './SimpleTestApp';
import './index.css';

// Log for debugging
console.log('test-main.tsx is running');

// Get the root element
const rootElement = document.getElementById('root');

// Log for debugging
console.log('Root element:', rootElement);

if (rootElement) {
  try {
    // Clear any existing content
    rootElement.innerHTML = '';
    
    // Create root and render
    console.log('Creating React root');
    const root = createRoot(rootElement);
    
    console.log('Rendering React app');
    root.render(
      <StrictMode>
        <SimpleTestApp />
      </StrictMode>
    );
    console.log('React rendering call completed');
  } catch (error) {
    console.error('Error rendering React app:', error);
    // Fallback rendering in case of error
    rootElement.innerHTML = `
      <div style="padding: 20px; font-family: Arial, sans-serif; background-color: #ffdddd; border: 1px solid #ff0000;">
        <h1 style="color: red;">Error Rendering React App</h1>
        <p>There was an error rendering the React application.</p>
        <pre style="background-color: #f8f8f8; padding: 10px; border-radius: 5px; overflow: auto;">${error instanceof Error ? error.message : String(error)}</pre>
        ${error instanceof Error && error.stack ? `<details>
          <summary>Error Stack</summary>
          <pre style="background-color: #f8f8f8; padding: 10px; border-radius: 5px; overflow: auto;">${error.stack}</pre>
        </details>` : ''}
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
