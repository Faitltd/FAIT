import React, { lazy, Suspense, useState, useEffect } from 'react';
import { RouterProvider, createBrowserRouter, Route, Navigate, createRoutesFromElements, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { isAdmin } from './lib/admin';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import DirectLogin from './pages/DirectLogin';
import EmergencyLogin from './pages/EmergencyLogin';
import ClientDashboard from './pages/dashboard/ClientDashboard';
import ServiceAgentDashboard from './pages/dashboard/ServiceAgentDashboard';
import ProfileSettings from './pages/dashboard/ProfileSettings';
import ServicePackages from './pages/ServicePackages';
import BookService from './pages/BookService';
import PointsRewards from './pages/dashboard/PointsRewards';
import VotingDashboard from './pages/governance/VotingDashboard';
import UnauthorizedPage from './components/UnauthorizedPage';
import AuthModeSelector from './components/AuthModeSelector';
import OAuthCallback from './pages/OAuthCallback';
import CompleteProfile from './pages/CompleteProfile';
import CreateService from './pages/services/CreateService';
import EditService from './pages/services/EditService';

// Lazy load client components
const ClientBookings = lazy(() => import('./pages/dashboard/client/ClientBookings'));
const ClientBookingDetails = lazy(() => import('./pages/dashboard/client/ClientBookingDetails'));
const ClientMessages = lazy(() => import('./pages/dashboard/client/ClientMessages'));
const ClientWarranty = lazy(() => import('./pages/dashboard/client/ClientWarranty'));
const ClientWarrantyClaim = lazy(() => import('./pages/dashboard/client/ClientWarrantyClaim'));

// Lazy load service agent components
const ServiceAgentListings = lazy(() => import('./pages/dashboard/service-agent/ServiceAgentListings'));
const ServiceAgentJobs = lazy(() => import('./pages/dashboard/service-agent/ServiceAgentJobs'));
const ServiceAgentMessages = lazy(() => import('./pages/dashboard/service-agent/ServiceAgentMessages'));
const ServiceAgentPortfolio = lazy(() => import('./pages/dashboard/service-agent/ServiceAgentPortfolio'));
const ServiceAgentReviews = lazy(() => import('./pages/dashboard/service-agent/ServiceAgentReviews'));
const ServiceAgentInvite = lazy(() => import('./pages/dashboard/service-agent/ServiceAgentInvite'));

// Lazy load admin components
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const VerificationManagement = lazy(() => import('./pages/admin/VerificationManagement'));
const WarrantyManagement = lazy(() => import('./pages/admin/WarrantyManagement'));
const AdminMessages = lazy(() => import('./pages/dashboard/admin/AdminMessages'));

// Protected route wrapper with loading state
const ProtectedRoute = ({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) => {
  const { user, emergencyUser, isEmergencyMode, loading: authLoading } = useAuth();
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(adminOnly);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If we're in emergency mode, check if the emergency user has admin privileges
    if (isEmergencyMode && emergencyUser) {
      setIsAdminUser(emergencyUser.userType === 'admin');
      setCheckingAdmin(false);
      return;
    }

    // Normal Supabase auth flow
    if (!user || !adminOnly) {
      setCheckingAdmin(false);
      return;
    }

    const checkAdminStatus = async () => {
      try {
        console.log('Checking admin status for user:', user.id);
        const adminStatus = await isAdmin();
        console.log('Admin status result:', adminStatus);
        setIsAdminUser(adminStatus);
      } catch (err) {
        console.error('Error checking admin status:', err);
        setError('Failed to verify permissions');
        setIsAdminUser(false);
      } finally {
        setCheckingAdmin(false);
      }
    };

    checkAdminStatus();
  }, [user, emergencyUser, isEmergencyMode, adminOnly]);

  if (authLoading || checkingAdmin) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  // Check if we have either a regular user or an emergency user
  if (!user && !isEmergencyMode) {
    return <Navigate to="/login" replace />;
  }

  // Handle admin-only routes
  if (adminOnly) {
    if (!isAdminUser) {
      console.log('Access denied: adminOnly =', adminOnly, 'isAdminUser =', isAdminUser);
      return <UnauthorizedPage />;
    } else {
      console.log('Access granted: adminOnly =', adminOnly, 'isAdminUser =', isAdminUser);
    }
  }

  // If we're in emergency mode, check if the user type matches the route
  if (isEmergencyMode && emergencyUser) {
    // For service agent routes
    if (window.location.pathname.includes('/dashboard/service-agent') &&
        emergencyUser.userType !== 'service_agent') {
      return <UnauthorizedPage />;
    }

    // For client routes
    if (window.location.pathname.includes('/dashboard/client') &&
        emergencyUser.userType !== 'client') {
      return <UnauthorizedPage />;
    }

    // For admin routes (already checked above)
    if (window.location.pathname.includes('/dashboard/admin') &&
        emergencyUser.userType !== 'admin') {
      return <UnauthorizedPage />;
    }
  }

  return <>{children}</>;
};

// Create a layout component that includes the Navbar
const Layout = () => (
  <div className="min-h-screen bg-gray-50">
    <Navbar />
    <Outlet />
    <AuthModeSelector />
  </div>
);

// Create routes using the new API
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<Layout />}>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/direct-login" element={<DirectLogin />} />
      <Route path="/emergency-login" element={<EmergencyLogin />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/services" element={<ServicePackages />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      {/* Redirect from old contractor dashboard to new service agent dashboard */}
      <Route path="/dashboard/contractor" element={<Navigate to="/dashboard/service-agent" replace />} />
      <Route
        path="/book/:serviceId"
        element={
          <ProtectedRoute>
            <BookService />
          </ProtectedRoute>
        }
      />
      <Route
        path="/services/create"
        element={
          <ProtectedRoute>
            <CreateService />
          </ProtectedRoute>
        }
      />
      <Route
        path="/services/edit/:id"
        element={
          <ProtectedRoute>
            <EditService />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/client"
        element={
          <ProtectedRoute>
            <div className="container mx-auto px-4 py-8">
              <h1 className="text-2xl font-bold mb-6">Client Dashboard</h1>
              <p>Welcome to your dashboard. Use the links below to navigate:</p>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h2 className="text-lg font-medium mb-2">My Bookings</h2>
                  <p className="text-gray-600 mb-4">View and manage your service bookings</p>
                  <a href="/dashboard/client/bookings" className="text-blue-600 hover:underline">Go to Bookings</a>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h2 className="text-lg font-medium mb-2">Messages</h2>
                  <p className="text-gray-600 mb-4">Communicate with service agents</p>
                  <a href="/dashboard/client/messages" className="text-blue-600 hover:underline">Go to Messages</a>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h2 className="text-lg font-medium mb-2">Warranty Claims</h2>
                  <p className="text-gray-600 mb-4">Submit and track warranty claims</p>
                  <a href="/dashboard/client/warranty" className="text-blue-600 hover:underline">Go to Warranty</a>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h2 className="text-lg font-medium mb-2">Find Services</h2>
                  <p className="text-gray-600 mb-4">Browse available services</p>
                  <a href="/services" className="text-blue-600 hover:underline">Browse Services</a>
                </div>
              </div>
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/client/bookings"
        element={
          <ProtectedRoute>
            <Suspense fallback={<div>Loading...</div>}>
              <ClientBookings />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/client/bookings/:id"
        element={
          <ProtectedRoute>
            <Suspense fallback={<div>Loading...</div>}>
              <ClientBookingDetails />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/client/messages"
        element={
          <ProtectedRoute>
            <Suspense fallback={<div>Loading...</div>}>
              <ClientMessages />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/client/warranty"
        element={
          <ProtectedRoute>
            <Suspense fallback={<div>Loading...</div>}>
              <ClientWarranty />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/client/warranty/new"
        element={
          <ProtectedRoute>
            <Suspense fallback={<div>Loading...</div>}>
              <ClientWarrantyClaim />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/service-agent"
        element={
          <ProtectedRoute>
            <ServiceAgentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/service-agent/listings"
        element={
          <ProtectedRoute>
            <Suspense fallback={<div>Loading...</div>}>
              <ServiceAgentListings />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/service-agent/jobs"
        element={
          <ProtectedRoute>
            <Suspense fallback={<div>Loading...</div>}>
              <ServiceAgentJobs />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/service-agent/messages"
        element={
          <ProtectedRoute>
            <Suspense fallback={<div>Loading...</div>}>
              <ServiceAgentMessages />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/service-agent/portfolio"
        element={
          <ProtectedRoute>
            <Suspense fallback={<div>Loading...</div>}>
              <ServiceAgentPortfolio />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/service-agent/reviews"
        element={
          <ProtectedRoute>
            <Suspense fallback={<div>Loading...</div>}>
              <ServiceAgentReviews />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/service-agent/invite"
        element={
          <ProtectedRoute>
            <Suspense fallback={<div>Loading...</div>}>
              <ServiceAgentInvite />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/admin"
        element={
          <ProtectedRoute adminOnly>
            <Suspense fallback={<div>Loading...</div>}>
              <AdminDashboard />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/admin/verifications"
        element={
          <ProtectedRoute adminOnly>
            <Suspense fallback={<div>Loading...</div>}>
              <VerificationManagement />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/admin/warranty"
        element={
          <ProtectedRoute adminOnly>
            <Suspense fallback={<div>Loading...</div>}>
              <WarrantyManagement />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/admin/messages"
        element={
          <ProtectedRoute adminOnly>
            <Suspense fallback={<div>Loading...</div>}>
              <AdminMessages />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/points"
        element={
          <ProtectedRoute>
            <PointsRewards />
          </ProtectedRoute>
        }
      />
      <Route
        path="/governance"
        element={
          <ProtectedRoute>
            <VotingDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings/profile"
        element={
          <ProtectedRoute>
            <ProfileSettings />
          </ProtectedRoute>
        }
      />
      <Route path="/oauth-callback" element={<OAuthCallback />} />
      <Route path="/complete-profile" element={<CompleteProfile />} />
    </Route>
  ),
  {
    // Add future flags to opt-in to React Router v7 behavior
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }
  }
);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
