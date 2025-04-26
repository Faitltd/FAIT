import React, { lazy, Suspense, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useRouteError } from 'react-router-dom';
import { supabase } from './lib/supabaseClient';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Import your components
import Home from './pages/Home';
import Loading from './components/Loading';
import NotificationBell from './components/notifications/NotificationBell';
import ErrorBoundary from './components/ErrorBoundary';
import NotFound from './components/NotFound';
import VerySimpleWarrantyClaimsPage from './pages/warranty/VerySimpleWarrantyClaimsPage';

// Auth pages
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const SignupPage = lazy(() => import('./pages/auth/SignupPage'));

// Lazy load other components
const DashboardRouter = lazy(() => import('./pages/dashboard/DashboardRouter'));
const ServiceAgentDashboard = lazy(() => import('./pages/dashboard/ServiceAgentDashboard'));
const SimpleServiceAgentMessages = lazy(() => import('./pages/dashboard/service-agent/SimpleServiceAgentMessages'));
const SimpleClientMessages = lazy(() => import('./pages/dashboard/client/SimpleClientMessages'));
const SimpleAdminMessages = lazy(() => import('./pages/dashboard/admin/SimpleAdminMessages'));
const ClientDashboard = lazy(() => import('./pages/dashboard/ClientDashboard'));
const AdminDashboard = lazy(() => import('./pages/dashboard/AdminDashboard'));
const ServiceSearchPage = lazy(() => import('./pages/services/ServiceSearchPage'));
const BookingPage = lazy(() => import('./pages/booking/BookingPage'));
const BookingConfirmationPage = lazy(() => import('./pages/booking/BookingConfirmationPage'));
const BookingDetailsPage = lazy(() => import('./pages/booking/BookingDetailsPage'));
const BookingsListPage = lazy(() => import('./pages/booking/BookingsListPage'));
const MessagingPage = lazy(() => import('./pages/messaging/MessagingPage'));
const WarrantyClaimsPage = lazy(() => import('./pages/warranty/VerySimpleWarrantyClaimsPage'));
const WarrantyClaimNewPage = lazy(() => import('./pages/warranty/WarrantyClaimNewPage'));
const WarrantyClaimDetailPage = lazy(() => import('./pages/warranty/WarrantyClaimDetailPage'));
const SubscriptionDashboard = lazy(() => import('./pages/EnhancedSubscriptionDashboard'));
const SubscriptionPlans = lazy(() => import('./pages/SubscriptionPlansStripe'));
const NotificationsPage = lazy(() => import('./pages/notifications/NotificationsPage'));
const WarrantyPage = lazy(() => import('./pages/warranty/WarrantyPage'));
const AvailabilityPage = lazy(() => import('./pages/availability/AvailabilityPage'));
const AuditLogPage = lazy(() => import('./pages/admin/AuditLogPage'));

// Supabase client is now imported from lib/supabaseClient.js

function App() {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        if (user) {
          // Get user type
          const { data: profile } = await supabase
            .from('profiles')
            .select('user_type')
            .eq('id', user.id)
            .single();

          setUserType(profile?.user_type);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);

          // Get user type
          const { data: profile } = await supabase
            .from('profiles')
            .select('user_type')
            .eq('id', session.user.id)
            .single();

          setUserType(profile?.user_type);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setUserType(null);
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return (
    <AuthProvider>
      <SubscriptionProvider>
        <Router>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Home />} errorElement={<ErrorBoundary />} />

            {/* Dashboard Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardRouter /></ProtectedRoute>} />
            <Route path="/dashboard/service-agent" element={<ProtectedRoute><ServiceAgentDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/client" element={<ProtectedRoute><ClientDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />

            {/* Subscription Routes */}
            <Route path="/subscription/dashboard" element={<SubscriptionDashboard />} />
            <Route path="/subscription/plans" element={<SubscriptionPlans />} />

            {/* Messaging Routes */}
            <Route path="/messages" element={<MessagingPage />} />
            <Route path="/messages/:conversationId" element={<MessagingPage />} />
            <Route path="/dashboard/service-agent/messages" element={<ProtectedRoute><SimpleServiceAgentMessages /></ProtectedRoute>} />

            {/* Notifications Routes */}
            <Route path="/notifications" element={<NotificationsPage />} />

            {/* Warranty Routes */}
            <Route path="/warranty" element={<ProtectedRoute><WarrantyPage /></ProtectedRoute>} />
            <Route path="/warranty/claims" element={<ProtectedRoute><VerySimpleWarrantyClaimsPage /></ProtectedRoute>} />
            <Route path="/warranty/claims/new" element={<ProtectedRoute><WarrantyClaimNewPage /></ProtectedRoute>} />
            <Route path="/warranty/claims/:claimId" element={<ProtectedRoute><WarrantyClaimDetailPage /></ProtectedRoute>} />

            {/* Availability Routes */}
            <Route path="/availability" element={<AvailabilityPage />} />

            {/* Service Routes */}
            <Route path="/services/search" element={<ServiceSearchPage />} />

            {/* Booking Routes */}
            <Route path="/book/:serviceId" element={<BookingPage />} />
            <Route path="/booking/confirmation/:bookingId" element={<BookingConfirmationPage />} />
            <Route path="/booking/:bookingId" element={<BookingDetailsPage />} />
            <Route path="/bookings" element={<BookingsListPage />} />

            {/* Messaging Routes */}
            <Route path="/messages" element={<MessagingPage />} />
            <Route path="/messages/:conversationId" element={<MessagingPage />} />

            {/* Admin Routes */}
            <Route path="/admin/audit-logs" element={<AuditLogPage />} />

            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Catch-all route for 404 errors */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        </Router>
      </SubscriptionProvider>
    </AuthProvider>
  );
}

export default App;
