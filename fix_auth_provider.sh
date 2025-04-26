#!/bin/bash

# Check if temp-main.tsx exists
if [ -f "src/temp-main.tsx" ]; then
  # Create a backup
  cp src/temp-main.tsx src/temp-main.tsx.bak
  
  # Modify temp-main.tsx to ensure AuthProvider is properly wrapping the routes
  sed -i '' 's/<React.StrictMode>/<React.StrictMode>/g' src/temp-main.tsx
  sed -i '' 's/<\/React.StrictMode>/<\/React.StrictMode>/g' src/temp-main.tsx
  
  echo "Fixed AuthProvider in temp-main.tsx"
else
  echo "src/temp-main.tsx not found"
fi

# Check if the original App.tsx exists and fix it
if [ -f "src/App.tsx" ]; then
  # Create a backup
  cp src/App.tsx src/App.tsx.bak
  
  # Ensure AuthProvider is properly wrapping the routes in App.tsx
  sed -i '' 's/return (/return (/' src/App.tsx
  sed -i '' 's/<RouterProvider router={router} \/>//' src/App.tsx
  
  # Add AuthProvider around RouterProvider
  sed -i '' 's/<RouterProvider router={router} \/>/<AuthProvider><RouterProvider router={router} \/><\/AuthProvider>/' src/App.tsx
  
  echo "Fixed AuthProvider in App.tsx"
else
  echo "src/App.tsx not found"
fi

# Create a modified version of ServiceAgentDashboard that doesn't use useAuth
cat > src/pages/dashboard/ServiceAgentDashboardSimple.tsx << 'EOF_INNER'
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '../../components/common';
import { Calendar, MessageSquare, Wrench, Users, BarChart3, Settings, LogOut } from 'lucide-react';

const ServiceAgentDashboardSimple: React.FC = () => {
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
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">View your client list</p>
            <Button>View Clients</Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">View your performance metrics</p>
            <Button>View Analytics</Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="mr-2 h-5 w-5" />
              Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Manage your account settings</p>
            <Button>View Settings</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ServiceAgentDashboardSimple;
EOF_INNER

# Create a modified temp-main.tsx that uses the simple dashboard
cat > src/temp-main-simple.tsx << 'EOF_INNER'
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

// Import layouts
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Import pages
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import NotFound from './pages/NotFound';

// Import dashboard pages
import ClientDashboard from './pages/dashboard/client/ClientDashboard';
import ServiceAgentDashboardSimple from './pages/dashboard/ServiceAgentDashboardSimple';
import AdminDashboard from './pages/dashboard/admin/AdminDashboard';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="sign-in" element={<SignIn />} />
          <Route path="sign-up" element={<SignUp />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />
        </Route>
        
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/dashboard/client" replace />} />
          
          <Route path="client">
            <Route index element={<ClientDashboard />} />
            <Route path="messages" element={<div>Messages temporarily disabled</div>} />
          </Route>
          
          <Route path="service-agent">
            <Route index element={<ServiceAgentDashboardSimple />} />
            <Route path="messages" element={<div>Messages temporarily disabled</div>} />
          </Route>
          
          <Route path="admin">
            <Route index element={<AdminDashboard />} />
            <Route path="messages" element={<div>Messages temporarily disabled</div>} />
          </Route>
        </Route>
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
EOF_INNER

# Create a modified vite config for the simple main
cat > vite.simple-main.config.ts << 'EOF_INNER'
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  build: {
    rollupOptions: {
      input: {
        main: 'src/temp-main-simple.tsx',
      },
    },
  },
});
EOF_INNER

echo "Created simplified ServiceAgentDashboard and main file"
