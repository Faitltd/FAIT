import React from 'react';

const TestPage: React.FC = () => {
  return (
    <div style={{ 
      padding: '40px', 
      maxWidth: '800px', 
      margin: '0 auto', 
      fontFamily: 'Arial, sans-serif' 
    }}>
      <h1 style={{ color: '#333', fontSize: '24px', marginBottom: '20px' }}>
        Test Page - If you can see this, basic routing is working
      </h1>
      
      <div style={{ marginBottom: '20px', padding: '20px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
        <p style={{ marginBottom: '10px' }}>This is a simple test page with no dependencies on other components.</p>
        <p>Click the links below to navigate:</p>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <a 
          href="/" 
          style={{ 
            padding: '10px 15px', 
            backgroundColor: '#4299e1', 
            color: 'white', 
            textDecoration: 'none', 
            borderRadius: '5px',
            textAlign: 'center'
          }}
        >
          Go to Home
        </a>
        
        <a 
          href="/test-login" 
          style={{ 
            padding: '10px 15px', 
            backgroundColor: '#48bb78', 
            color: 'white', 
            textDecoration: 'none', 
            borderRadius: '5px',
            textAlign: 'center'
          }}
        >
          Go to Test Login
        </a>
        
        <a 
          href="/debug" 
          style={{ 
            padding: '10px 15px', 
            backgroundColor: '#ed8936', 
            color: 'white', 
            textDecoration: 'none', 
            borderRadius: '5px',
            textAlign: 'center'
          }}
        >
          Go to Debug Page
        </a>
      </div>
    </div>
  );
};

export default TestPage;
