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
