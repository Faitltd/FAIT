import React from 'react';
import AppVersionIndicator from './components/AppVersionIndicator';

function SimpleTestApp() {
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

      <div style={{
        padding: '15px',
        backgroundColor: '#f0f0f0',
        borderRadius: '5px',
        marginBottom: '20px'
      }}>
        <h2 style={{ color: '#333', fontSize: '24px', marginBottom: '10px' }}>
          Test Login Form
        </h2>

        <form style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Email:
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Password:
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
            />
          </div>

          <button
            type="button"
            style={{
              backgroundColor: '#4CAF50',
              color: 'white',
              padding: '10px 15px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
              marginTop: '10px'
            }}
          >
            Sign In
          </button>
        </form>
      </div>

      <div>
        <h2 style={{ color: '#333', fontSize: '24px', marginBottom: '10px' }}>
          Test Credentials
        </h2>
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          <li style={{ padding: '5px 0' }}>Admin: admin@itsfait.com / admin123</li>
          <li style={{ padding: '5px 0' }}>Client: client@itsfait.com / client123</li>
          <li style={{ padding: '5px 0' }}>Service Agent: service@itsfait.com / service123</li>
        </ul>
      </div>

      <AppVersionIndicator version="simple" />
    </div>
  );
}

export default SimpleTestApp;
