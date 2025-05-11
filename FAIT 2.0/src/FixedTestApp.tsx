import React, { useEffect } from 'react';

function FixedTestApp() {
  useEffect(() => {
    // Log when component mounts
    console.log('FixedTestApp component mounted');
    
    // Check if the component is actually rendering
    const rootElement = document.getElementById('root');
    if (rootElement) {
      console.log('Root element found with dimensions:', 
        rootElement.offsetWidth, 'x', rootElement.offsetHeight);
      console.log('Root element children count:', rootElement.childNodes.length);
    } else {
      console.error('Root element not found!');
    }
    
    return () => {
      console.log('FixedTestApp component unmounted');
    };
  }, []);

  // Force visible styles to overcome potential CSS issues
  const containerStyle: React.CSSProperties = {
    padding: '20px',
    backgroundColor: 'white',
    color: 'black',
    minHeight: '100vh',
    fontFamily: 'Arial, sans-serif',
    // Force visibility
    display: 'block',
    visibility: 'visible',
    opacity: 1,
    position: 'static',
    zIndex: 'auto',
    overflow: 'visible'
  };

  const headingStyle: React.CSSProperties = {
    color: 'blue',
    fontSize: '32px',
    marginBottom: '20px',
    // Force visibility
    display: 'block',
    visibility: 'visible',
    opacity: 1
  };

  const paragraphStyle: React.CSSProperties = {
    fontSize: '18px',
    lineHeight: 1.5,
    marginBottom: '20px',
    // Force visibility
    display: 'block',
    visibility: 'visible',
    opacity: 1
  };

  const buttonStyle: React.CSSProperties = {
    padding: '12px 24px',
    backgroundColor: 'green',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    marginRight: '10px',
    // Force visibility
    display: 'inline-block',
    visibility: 'visible',
    opacity: 1
  };

  const secondaryButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: 'gray'
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#f0f0f0',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px',
    // Force visibility
    display: 'block',
    visibility: 'visible',
    opacity: 1
  };

  return (
    <div style={containerStyle}>
      <h1 style={headingStyle}>
        FAIT Co-op Fixed Test Page
      </h1>
      
      <p style={paragraphStyle}>
        This is a test page with forced visibility styles to check if React is rendering correctly.
        If you can see this content, then React is working properly but there might be CSS issues.
      </p>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          style={buttonStyle}
          onClick={() => alert('Primary button clicked!')}
        >
          Primary Button
        </button>
        
        <button 
          style={secondaryButtonStyle}
          onClick={() => alert('Secondary button clicked!')}
        >
          Secondary Button
        </button>
      </div>
      
      <div style={cardStyle}>
        <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>Test Card</h2>
        <p>This is a test card component to verify styling and layout.</p>
      </div>
      
      <div>
        <p style={{ fontWeight: 'bold' }}>Browser Information:</p>
        <ul style={{ listStyleType: 'disc', paddingLeft: '20px' }}>
          <li>User Agent: {navigator.userAgent}</li>
          <li>Window Size: {window.innerWidth} x {window.innerHeight}</li>
          <li>Current Time: {new Date().toLocaleTimeString()}</li>
        </ul>
      </div>
    </div>
  );
}

export default FixedTestApp;
