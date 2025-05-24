import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';

// Import common components
import { Button, Card, CardHeader, CardTitle, CardContent } from './components/common';
import { Calendar, MessageSquare, Wrench, Users, BarChart3, Settings } from 'lucide-react';

// Simple dashboard component
const ServiceAgentDashboard = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Service Agent Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Manage your upcoming and past bookings</p>
            <Button>View Bookings</Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="mr-2 h-5 w-5" />
              Messages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Communicate with clients</p>
            <Button>View Messages</Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Wrench className="mr-2 h-5 w-5" />
              Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Manage your service offerings</p>
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
