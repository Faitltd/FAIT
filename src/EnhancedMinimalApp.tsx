import React, { Suspense, lazy, useState, useEffect } from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  createRoutesFromElements,
  Route,
  Outlet,
  Navigate,
  Link
} from 'react-router-dom';
import PageErrorBoundary from './components/PageErrorBoundary';
import { AuthProvider, useAuth } from './contexts/UnifiedAuthContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import SystemMessageProvider from './contexts/SystemMessageContext';
import GlobalErrorBoundary from './components/GlobalErrorBoundary';
import { ToastContainer } from './components/common';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import EnhancedHomeWithAnimations from './pages/EnhancedHomeWithAnimations';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import DirectLogin from './pages/DirectLogin';
import EmergencyLogin from './pages/EmergencyLogin';
import SuperEmergencyLogin from './pages/SuperEmergencyLogin';
import CookieConsent from './components/CookieConsent';
import GoogleMapsLoader from './components/GoogleMapsLoader';
import AppVersionIndicator from './components/AppVersionIndicator';
import NavigationTestPage from './pages/NavigationTestPage';
import UnifiedLoginPage from './pages/auth/UnifiedLoginPage';
import AuthToggle from './components/AuthToggle';
import { isAdmin } from './lib/admin';
import UserManagementPage from './pages/admin/UserManagementPage';

// Lazy load calculator pages
const EstimateCalculators = lazy(() => import('./pages/calculator/EstimateCalculators.jsx'));
const SimpleRemodelingCalculator = lazy(() => import('./pages/calculator/SimpleRemodelingCalculator.jsx'));
const SimpleHandymanCalculator = lazy(() => import('./pages/calculator/SimpleHandymanCalculator.jsx'));

// Lazy load service search page
const SimpleServiceSearchPage = lazy(() => import('./pages/services/SimpleServiceSearchPage.jsx'));

// Lazy load other pages
const ProjectsPage = lazy(() => import('./pages/projects/ProjectsPage.jsx'));
const ProjectDetailPage = lazy(() => import('./pages/projects/ProjectDetailPage.jsx'));
const ServicesPage = lazy(() => import('./pages/services/ServicesPage.jsx'));
const EstimatesPage = lazy(() => import('./pages/estimates/EstimatesPage.jsx'));
const WarrantyPage = lazy(() => import('./pages/warranty/WarrantyPage.jsx'));
const GamificationPage = lazy(() => import('./pages/gamification/GamificationPage.jsx'));
const PointsPage = lazy(() => import('./pages/points/PointsPage.jsx'));
const GovernancePage = lazy(() => import('./pages/governance/GovernancePage.jsx'));
const ProfilePage = lazy(() => import('./pages/profile/ProfilePage.jsx'));
const SettingsProfilePage = lazy(() => import('./pages/settings/ProfilePage.jsx'));
const SubscriptionDashboard = lazy(() => import('./pages/subscription/SubscriptionDashboard.jsx'));

// Lazy load dashboard pages
const ServiceAgentDashboard = lazy(() => import('./pages/dashboard/ServiceAgentDashboard.jsx'));
const ServiceAgentListings = lazy(() => import('./pages/dashboard/service-agent/ServiceAgentListings.jsx'));
const SimpleServiceAgentMessages = lazy(() => import('./pages/dashboard/service-agent/SimpleServiceAgentMessages.jsx'));
const ServiceAgentReferrals = lazy(() => import('./pages/dashboard/service-agent/ServiceAgentReferrals.jsx'));

// Lazy load forum pages
const ForumPage = lazy(() => import('./pages/forum/ForumPage.jsx'));

// Lazy load messaging pages
const SimpleSMSMessagingPage = lazy(() => import('./pages/messaging/SimpleSMSMessagingPage.jsx'));

// Lazy load contact page
const ContactPage = lazy(() => import('./pages/contact/ContactPage.jsx'));

// Lazy load bookings page
const BookingsPage = lazy(() => import('./pages/bookings/BookingsPage.jsx'));

// Protected route wrapper with loading state
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-64">Verifying access...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function EnhancedMinimalApp() {
  // Layout component with Navbar and Footer
  const Layout = () => (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-grow">
        <Outlet />
      </div>
      <Footer />
      <AuthToggle />
      <CookieConsent />
    </div>
  );

  // Create routes using the new API
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route element={<Layout />} errorElement={<PageErrorBoundary />}>
        <Route
          path="/"
          element={<EnhancedHomeWithAnimations />}
        />
        <Route
          path="/login"
          element={
            <Suspense fallback={<div className="flex justify-center items-center h-64">Loading login page...</div>}>
              <UnifiedLoginPage />
            </Suspense>
          }
        />
        <Route
          path="/direct-login"
          element={<DirectLogin />}
        />
        <Route
          path="/emergency-login"
          element={<EmergencyLogin />}
        />
        <Route
          path="/super-login"
          element={<SuperEmergencyLogin />}
        />
        <Route
          path="/register"
          element={<Register />}
        />
        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        {/* Calculator Routes */}
        <Route
          path="/calculator/estimate"
          element={
            <Suspense fallback={<div className="flex justify-center items-center h-64">Loading calculator...</div>}>
              <EstimateCalculators />
            </Suspense>
          }
        />
        <Route
          path="/calculator/remodeling"
          element={
            <Suspense fallback={<div className="flex justify-center items-center h-64">Loading calculator...</div>}>
              <SimpleRemodelingCalculator />
            </Suspense>
          }
        />
        <Route
          path="/calculator/handyman"
          element={
            <Suspense fallback={<div className="flex justify-center items-center h-64">Loading calculator...</div>}>
              <SimpleHandymanCalculator />
            </Suspense>
          }
        />

        {/* Service Search Route */}
        <Route
          path="/services/search"
          element={
            <Suspense fallback={<div className="flex justify-center items-center h-64">Loading service search...</div>}>
              <SimpleServiceSearchPage />
            </Suspense>
          }
        />

        {/* Projects Routes */}
        <Route
          path="/projects"
          element={
            <Suspense fallback={<div className="flex justify-center items-center h-64">Loading projects...</div>}>
              <ProjectsPage />
            </Suspense>
          }
          errorElement={<PageErrorBoundary />}
        />
        <Route
          path="/projects/:projectId"
          element={
            <Suspense fallback={<div className="flex justify-center items-center h-64">Loading project details...</div>}>
              <ProjectDetailPage />
            </Suspense>
          }
          errorElement={<PageErrorBoundary />}
        />

        {/* Services Route */}
        <Route
          path="/services"
          element={
            <Suspense fallback={<div className="flex justify-center items-center h-64">Loading services...</div>}>
              <ServicesPage />
            </Suspense>
          }
          errorElement={<PageErrorBoundary />}
        />

        {/* Estimates Route */}
        <Route
          path="/estimates"
          element={
            <Suspense fallback={<div className="flex justify-center items-center h-64">Loading estimates...</div>}>
              <EstimatesPage />
            </Suspense>
          }
          errorElement={<PageErrorBoundary />}
        />

        {/* Warranty Route */}
        <Route
          path="/warranty"
          element={
            <Suspense fallback={<div className="flex justify-center items-center h-64">Loading warranty...</div>}>
              <WarrantyPage />
            </Suspense>
          }
          errorElement={<PageErrorBoundary />}
        />

        {/* Gamification Route */}
        <Route
          path="/gamification"
          element={
            <Suspense fallback={<div className="flex justify-center items-center h-64">Loading gamification...</div>}>
              <GamificationPage />
            </Suspense>
          }
        />

        {/* Points Route */}
        <Route
          path="/points"
          element={
            <ProtectedRoute>
              <Suspense fallback={<div className="flex justify-center items-center h-64">Loading points...</div>}>
                <PointsPage />
              </Suspense>
            </ProtectedRoute>
          }
        />

        {/* Governance Route */}
        <Route
          path="/governance"
          element={
            <ProtectedRoute>
              <Suspense fallback={<div className="flex justify-center items-center h-64">Loading governance...</div>}>
                <GovernancePage />
              </Suspense>
            </ProtectedRoute>
          }
        />

        {/* Profile Routes */}
        <Route
          path="/profile"
          element={
            <Suspense fallback={<div className="flex justify-center items-center h-64">Loading profile...</div>}>
              <ProfilePage />
            </Suspense>
          }
        />
        <Route
          path="/settings/profile"
          element={
            <ProtectedRoute>
              <Suspense fallback={<div className="flex justify-center items-center h-64">Loading profile settings...</div>}>
                <SettingsProfilePage />
              </Suspense>
            </ProtectedRoute>
          }
        />

        {/* Subscription Dashboard Route */}
        <Route
          path="/subscription/dashboard"
          element={
            <ProtectedRoute>
              <Suspense fallback={<div className="flex justify-center items-center h-64">Loading subscription dashboard...</div>}>
                <SubscriptionDashboard />
              </Suspense>
            </ProtectedRoute>
          }
        />

        {/* Admin Dashboard Route */}
        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute>
              <Suspense fallback={<div className="flex justify-center items-center h-64">Loading admin dashboard...</div>}>
                <div className="p-8">
                  <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
                  <p className="mb-4">Welcome to the admin dashboard!</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                      <h2 className="text-xl font-semibold mb-3">User Management</h2>
                      <p>Manage users and permissions</p>
                      <Link to="/dashboard/admin/users" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                        Manage Users
                      </Link>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                      <h2 className="text-xl font-semibold mb-3">Projects</h2>
                      <p>View and manage all projects</p>
                      <Link to="/projects" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                        View Projects
                      </Link>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                      <h2 className="text-xl font-semibold mb-3">Services</h2>
                      <p>Manage service listings</p>
                      <Link to="/services/manage" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                        Manage Services
                      </Link>
                    </div>
                  </div>
                </div>
              </Suspense>
            </ProtectedRoute>
          }
        />

        {/* Admin User Management Route */}
        <Route
          path="/dashboard/admin/users"
          element={
            <ProtectedRoute>
              <Suspense fallback={<div className="flex justify-center items-center h-64">Loading user management...</div>}>
                <UserManagementPage />
              </Suspense>
            </ProtectedRoute>
          }
        />

        {/* Client Dashboard Route */}
        <Route
          path="/dashboard/client"
          element={
            <ProtectedRoute>
              <Suspense fallback={<div className="flex justify-center items-center h-64">Loading client dashboard...</div>}>
                <div className="p-8">
                  <h1 className="text-3xl font-bold mb-6">Client Dashboard</h1>
                  <p className="mb-4">Welcome to your client dashboard!</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                      <h2 className="text-xl font-semibold mb-3">Projects</h2>
                      <p>View and manage your projects</p>
                      <Link to="/projects" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                        View Projects
                      </Link>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                      <h2 className="text-xl font-semibold mb-3">Bookings</h2>
                      <p>Manage your service bookings</p>
                      <Link to="/bookings" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                        View Bookings
                      </Link>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                      <h2 className="text-xl font-semibold mb-3">Messages</h2>
                      <p>Communicate with service providers</p>
                      <Link to="/messaging/sms" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                        View Messages
                      </Link>
                    </div>
                  </div>
                </div>
              </Suspense>
            </ProtectedRoute>
          }
        />

        {/* Service Agent Dashboard Routes */}
        <Route
          path="/dashboard/service-agent"
          element={
            <ProtectedRoute>
              <Suspense fallback={<div className="flex justify-center items-center h-64">Loading service agent dashboard...</div>}>
                <ServiceAgentDashboard />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/service-agent/listings"
          element={
            <ProtectedRoute>
              <Suspense fallback={<div className="flex justify-center items-center h-64">Loading service agent listings...</div>}>
                <ServiceAgentListings />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/service-agent/messages"
          element={
            <ProtectedRoute>
              <Suspense fallback={<div className="flex justify-center items-center h-64">Loading service agent messages...</div>}>
                <SimpleServiceAgentMessages />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/service-agent/referrals"
          element={
            <ProtectedRoute>
              <Suspense fallback={<div className="flex justify-center items-center h-64">Loading service agent referrals...</div>}>
                <ServiceAgentReferrals />
              </Suspense>
            </ProtectedRoute>
          }
        />

        {/* Forum Routes */}
        <Route
          path="/forum"
          element={
            <Suspense fallback={<div className="flex justify-center items-center h-64">Loading forum...</div>}>
              <ForumPage />
            </Suspense>
          }
          errorElement={<PageErrorBoundary />}
        />

        {/* Messaging Routes */}
        <Route
          path="/messaging/sms"
          element={
            <Suspense fallback={<div className="flex justify-center items-center h-64">Loading SMS messaging...</div>}>
              <SimpleSMSMessagingPage />
            </Suspense>
          }
        />

        {/* Navigation Test Route */}
        <Route
          path="/navigation-test"
          element={<NavigationTestPage />}
        />

        {/* Contact Route */}
        <Route
          path="/contact"
          element={
            <Suspense fallback={<div className="flex justify-center items-center h-64">Loading contact page...</div>}>
              <ContactPage />
            </Suspense>
          }
          errorElement={<PageErrorBoundary />}
        />

        {/* Bookings Route */}
        <Route
          path="/bookings"
          element={
            <Suspense fallback={<div className="flex justify-center items-center h-64">Loading bookings page...</div>}>
              <BookingsPage />
            </Suspense>
          }
          errorElement={<PageErrorBoundary />}
        />
      </Route>
    )
  );

  return (
    <GlobalErrorBoundary>
      <AuthProvider>
        <SubscriptionProvider>
          <SystemMessageProvider>
            {/* Preload Google Maps API */}
            <GoogleMapsLoader />
            <RouterProvider router={router} />
            <ToastContainer />
            <AppVersionIndicator version="enhanced" />
          </SystemMessageProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </GlobalErrorBoundary>
  );
}

export default EnhancedMinimalApp;
