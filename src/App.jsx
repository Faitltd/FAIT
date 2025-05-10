import React, { Suspense, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useRouteError } from 'react-router-dom';
import { supabase } from './lib/supabaseClient';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppVersionIndicator from './components/AppVersionIndicator';
import { lazyLoad } from './utils/advancedLazyLoading';
import { registerServiceWorker } from './utils/serviceWorkerRegistration';

// Import your components
import Home from './pages/Home';
import Loading from './components/Loading';
import NotificationBell from './components/notifications/NotificationBell';
import ErrorBoundary from './components/ErrorBoundary';
import NotFound from './components/NotFound';
// VerySimpleWarrantyClaimsPage is already lazy loaded as WarrantyClaimsPage

// Register service worker
registerServiceWorker({
  onSuccess: (registration) => {
    console.log('Service worker registered successfully:', registration);
  },
  onError: (error) => {
    console.error('Service worker registration failed:', error);
  }
});

// Auth pages - preload these for faster login/signup experience
const LoginPage = lazyLoad(() => import('./pages/auth/LoginPage'), {
  name: 'LoginPage',
  preload: true
});
const SignupPage = lazyLoad(() => import('./pages/auth/SignupPage'), {
  name: 'SignupPage',
  preload: true
});

// Dashboard components - these are critical for logged-in users
const DashboardRouter = lazyLoad(() => import('./pages/dashboard/DashboardRouter'), {
  name: 'DashboardRouter'
});
const ServiceAgentDashboard = lazyLoad(() => import('./pages/dashboard/ServiceAgentDashboard'), {
  name: 'ServiceAgentDashboard'
});
const ClientDashboard = lazyLoad(() => import('./pages/dashboard/ClientDashboard'), {
  name: 'ClientDashboard'
});
const AdminDashboard = lazyLoad(() => import('./pages/dashboard/AdminDashboard'), {
  name: 'AdminDashboard'
});

// Messaging components
const ServiceAgentMessages = lazyLoad(() => import('./pages/dashboard/service-agent/ServiceAgentMessages'), {
  name: 'ServiceAgentMessages'
});
const SimpleClientMessages = lazyLoad(() => import('./pages/dashboard/client/SimpleClientMessages'), {
  name: 'SimpleClientMessages'
});
const SimpleAdminMessages = lazyLoad(() => import('./pages/dashboard/admin/SimpleAdminMessages'), {
  name: 'SimpleAdminMessages'
});
const MessagingPage = lazyLoad(() => import('./pages/messaging/MessagingPage'), {
  name: 'MessagingPage'
});

// Service and booking components
const ServiceSearchPage = lazyLoad(() => import('./pages/services/ServiceSearchPage'), {
  name: 'ServiceSearchPage'
});
const BookingPage = lazyLoad(() => import('./pages/booking/BookingPage'), {
  name: 'BookingPage'
});
const BookingConfirmationPage = lazyLoad(() => import('./pages/booking/BookingConfirmationPage'), {
  name: 'BookingConfirmationPage'
});
const BookingDetailsPage = lazyLoad(() => import('./pages/booking/BookingDetailsPage'), {
  name: 'BookingDetailsPage'
});
const BookingsListPage = lazyLoad(() => import('./pages/booking/BookingsListPage'), {
  name: 'BookingsListPage'
});

// Warranty components
const WarrantyClaimsPage = lazyLoad(() => import('./pages/warranty/VerySimpleWarrantyClaimsPage'), {
  name: 'WarrantyClaimsPage'
});
const WarrantyClaimNewPage = lazyLoad(() => import('./pages/warranty/WarrantyClaimNewPage'), {
  name: 'WarrantyClaimNewPage'
});
const WarrantyClaimDetailPage = lazyLoad(() => import('./pages/warranty/WarrantyClaimDetailPage'), {
  name: 'WarrantyClaimDetailPage'
});
const WarrantyPage = lazyLoad(() => import('./pages/warranty/WarrantyPage'), {
  name: 'WarrantyPage'
});

// Subscription components
const SubscriptionDashboard = lazyLoad(() => import('./pages/EnhancedSubscriptionDashboard'), {
  name: 'SubscriptionDashboard'
});
const SubscriptionPlans = lazyLoad(() => import('./pages/SubscriptionPlansStripe'), {
  name: 'SubscriptionPlans'
});

// Other components
const NotificationsPage = lazyLoad(() => import('./pages/notifications/NotificationsPage'), {
  name: 'NotificationsPage'
});
const AvailabilityPage = lazyLoad(() => import('./pages/availability/AvailabilityPage'), {
  name: 'AvailabilityPage'
});
const AuditLogPage = lazyLoad(() => import('./pages/admin/AuditLogPage'), {
  name: 'AuditLogPage'
});

// Calculator pages
const RemodelingCalculator = lazyLoad(() => import('./pages/calculator/RemodelingCalculator'), {
  name: 'RemodelingCalculator'
});
const HandymanTaskEstimator = lazyLoad(() => import('./pages/calculator/HandymanTaskEstimator'), {
  name: 'HandymanTaskEstimator'
});
const EstimateCalculators = lazyLoad(() => import('./pages/calculator/EstimateCalculators'), {
  name: 'EstimateCalculators'
});

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
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-screen">
            <Loading />
          </div>
        }>
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
            <Route path="/dashboard/service-agent/messages" element={<ProtectedRoute><ServiceAgentMessages /></ProtectedRoute>} />

            {/* Notifications Routes */}
            <Route path="/notifications" element={<NotificationsPage />} />

            {/* Warranty Routes */}
            <Route path="/warranty" element={<ProtectedRoute><WarrantyPage /></ProtectedRoute>} />
            <Route path="/warranty/claims" element={<ProtectedRoute><WarrantyClaimsPage /></ProtectedRoute>} />
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

            {/* Calculator Routes */}
            <Route path="/calculator/remodeling" element={<RemodelingCalculator />} />
            <Route path="/calculator/handyman" element={<HandymanTaskEstimator />} />
            <Route path="/calculator/estimate" element={<EstimateCalculators />} />

            {/* Admin Routes */}
            <Route path="/admin/audit-logs" element={<AuditLogPage />} />

            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Catch-all route for 404 errors */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <AppVersionIndicator version="full" />
        </Router>
      </SubscriptionProvider>
    </AuthProvider>
  );
}

export default App;
