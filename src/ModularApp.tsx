import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import core providers
import { AuthProvider, useAuth } from './modules/core/contexts/AuthContext';

// Import pages
import ModularExample from './pages/ModularExample';
import ProjectsPage from './pages/ProjectsPage';
import BookingsPage from './pages/BookingsPage';
import LoginPage from './pages/LoginPage';
import EstimationPage from './pages/EstimationPage';
import MessagingPage from './pages/MessagingPage';
import MapsPage from './pages/MapsPage';
import WarrantyPage from './pages/WarrantyPage';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';

// Protected route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

/**
 * ModularApp component using the modular architecture
 */
const ModularApp: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/example" element={<ModularExample />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<div>Register Page</div>} />

          {/* Protected routes */}
          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <ProjectsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings"
            element={
              <ProtectedRoute>
                <BookingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/estimation"
            element={
              <ProtectedRoute>
                <EstimationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <MessagingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/maps"
            element={
              <ProtectedRoute>
                <MapsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/warranties"
            element={
              <ProtectedRoute>
                <WarrantyPage />
              </ProtectedRoute>
            }
          />

          {/* Home page */}
          <Route path="/" element={<HomePage />} />

          {/* 404 page */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default ModularApp;
