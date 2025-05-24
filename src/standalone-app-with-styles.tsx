import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Simple components with inline styles
const Button = ({ children }: { children: React.ReactNode }) => (
  <button
    style={{
      backgroundColor: '#3182ce',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      padding: '8px 16px',
      fontSize: '14px',
      cursor: 'pointer',
    }}
  >
    {children}
  </button>
);

const Card = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '16px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      backgroundColor: 'white',
    }}
  >
    {children}
  </div>
);

const CardHeader = ({ children }: { children: React.ReactNode }) => (
  <div style={{ marginBottom: '12px' }}>{children}</div>
);

const CardTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>{children}</h3>
);

const CardContent = ({ children }: { children: React.ReactNode }) => (
  <div style={{ color: '#4a5568' }}>{children}</div>
);

// Simple dashboard component
const ServiceAgentDashboard = () => {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>
        Service Agent Dashboard
      </h1>
      
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '16px',
      }}>
        <Card>
          <CardHeader>
            <CardTitle>Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <p style={{ marginBottom: '16px' }}>Manage your upcoming and past bookings</p>
            <Button>View Bookings</Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <p style={{ marginBottom: '16px' }}>Communicate with clients</p>
            <Button>View Messages</Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Services</CardTitle>
          </CardHeader>
          <CardContent>
            <p style={{ marginBottom: '16px' }}>Manage your service offerings</p>
            <Button>Manage Services</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Simple app
const StandaloneApp = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ServiceAgentDashboard />} />
      </Routes>
    </BrowserRouter>
  );
};

// Check if the root element exists
const root = document.getElementById('root');
if (root) {
  console.log('Root element found, rendering app');
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <StandaloneApp />
    </React.StrictMode>
  );
} else {
  console.error('Root element not found!');
  // Create a root element if it doesn't exist
  const newRoot = document.createElement('div');
  newRoot.id = 'root';
  document.body.appendChild(newRoot);
  console.log('Created new root element, rendering app');
  ReactDOM.createRoot(newRoot).render(
    <React.StrictMode>
      <StandaloneApp />
    </React.StrictMode>
  );
}

export default StandaloneApp;
