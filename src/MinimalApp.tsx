import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/UnifiedAuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import EnhancedHome from './pages/EnhancedHome';
import Login from './pages/Login';
import Register from './pages/Register';
import AppVersionIndicator from './components/AppVersionIndicator';
// Import dashboard pages
import AdminDashboardWrapper from './pages/dashboard/AdminDashboardWrapper.jsx';
import ClientDashboardWrapper from './pages/dashboard/ClientDashboardWrapper.jsx';
import ServiceAgentDashboardWrapper from './pages/dashboard/ServiceAgentDashboardWrapper.jsx';
// Import other pages
import ProjectsPage from './pages/projects/ProjectsPage.jsx';
import ServicesPage from './pages/services/ServicesPage.jsx';
import EstimateCalculators from './pages/calculator/EstimateCalculators.tsx';
import EstimatesPage from './pages/estimates/EstimatesPage.jsx';
import WarrantyPageWrapper from './pages/warranty/WarrantyPageWrapper.jsx';

function MinimalApp() {
  // Simple layout with Navbar and Footer
  const Layout = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-grow">
        {children}
      </div>
      <Footer />
    </div>
  );

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <Layout>
                <EnhancedHome />
              </Layout>
            }
          />
          <Route
            path="/login"
            element={
              <Layout>
                <Login />
              </Layout>
            }
          />
          <Route
            path="/register"
            element={
              <Layout>
                <Register />
              </Layout>
            }
          />
          {/* Dashboard routes */}
          <Route
            path="/dashboard/admin"
            element={
              <Layout>
                <AdminDashboardWrapper />
              </Layout>
            }
          />
          <Route
            path="/dashboard/client"
            element={
              <Layout>
                <ClientDashboardWrapper />
              </Layout>
            }
          />
          <Route
            path="/dashboard/service-agent"
            element={
              <Layout>
                <ServiceAgentDashboardWrapper />
              </Layout>
            }
          />
          {/* Projects route */}
          <Route
            path="/projects"
            element={
              <Layout>
                <ProjectsPage />
              </Layout>
            }
          />
          {/* Services route */}
          <Route
            path="/services"
            element={
              <Layout>
                <ServicesPage />
              </Layout>
            }
          />
          {/* Calculator routes */}
          <Route
            path="/calculator/estimate"
            element={
              <Layout>
                <EstimateCalculators />
              </Layout>
            }
          />
          {/* Estimates route */}
          <Route
            path="/estimates"
            element={
              <Layout>
                <EstimatesPage />
              </Layout>
            }
          />
          {/* Warranty route */}
          <Route
            path="/warranty"
            element={
              <Layout>
                <WarrantyPageWrapper />
              </Layout>
            }
          />
          {/* Add more routes as needed */}
        </Routes>
        <AppVersionIndicator version="minimal" />
      </Router>
    </AuthProvider>
  );
}

export default MinimalApp;
