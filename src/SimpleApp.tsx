import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';

// Import common components
import { Button, Card, CardHeader, CardTitle, CardContent } from './components/common';

// Simple dashboard component
const SimpleDashboard = () => {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Welcome to the Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">This is a simplified dashboard for testing purposes.</p>
          <Button>Test Button</Button>
        </CardContent>
      </Card>
    </div>
  );
};

// Simple app
const SimpleApp = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SimpleDashboard />} />
      </Routes>
    </BrowserRouter>
  );
};

const root = document.getElementById('root');
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <SimpleApp />
    </React.StrictMode>
  );
}

export default SimpleApp;
