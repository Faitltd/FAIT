import React from 'react';

function TestApp() {
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: 'white', 
      color: 'black', 
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: 'blue', fontSize: '32px', marginBottom: '20px' }}>
        FAIT Co-op Test Page
      </h1>
      
      <p style={{ fontSize: '18px', lineHeight: '1.5', marginBottom: '20px' }}>
        This is a test page to check if React is rendering correctly. If you can see this content,
        then React is working properly.
      </p>
      
      <div style={{ marginBottom: '20px' }}>
        <button style={{ 
          padding: '12px 24px', 
          backgroundColor: 'green', 
          color: 'white', 
          border: 'none', 
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: 'bold',
          marginRight: '10px'
        }}>
          Primary Button
        </button>
        
        <button style={{ 
          padding: '12px 24px', 
          backgroundColor: 'gray', 
          color: 'white', 
          border: 'none', 
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '16px'
        }}>
          Secondary Button
        </button>
      </div>
      
      <div style={{
        backgroundColor: '#f0f0f0',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
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

export default TestApp;
