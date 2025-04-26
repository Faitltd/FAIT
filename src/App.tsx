import React, { lazy, Suspense, useState, useEffect } from 'react';
import { RouterProvider, createBrowserRouter, Route, Navigate, createRoutesFromElements, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { isAdmin } from './lib/admin';
import { ToastContainer, ErrorBoundary as CommonErrorBoundary } from './components/common';
// Removed Navbar import
import LandingPage from './pages/LandingPage';
import StaticHome from './pages/StaticHome';
import TestPage from './pages/TestPage';
import EnhancedHome from './pages/EnhancedHome';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';

// Import verification and onboarding components
const VerificationPage = lazy(() => import('./pages/verification/VerificationPage'));
const ServiceAgentOnboarding = lazy(() => import('./components/onboarding/ServiceAgentOnboarding'));
import ResetPassword from './pages/ResetPassword';
import BypassLoginPage from './pages/auth/BypassLoginPage';
import ProjectPermitsPage from './pages/ProjectPermitsPage';
import ProjectDetailsPage from './pages/ProjectDetailsPage';
import ProjectsListPage from './pages/ProjectsListPage';
import ProjectCreatePage from './pages/ProjectCreatePage';
import ProjectIssuesPage from './pages/ProjectIssuesPage';
import ProjectEstimatesPage from './pages/ProjectEstimatesPage';
import ServiceAgentDashboardPage from './views/service-agent/ServiceAgentDashboard';
import VerificationReviewPage from './views/admin/VerificationReviewPage';
import ClientReferralDashboard from './views/client/ReferralDashboard';
import ServiceAgentReferralDashboard from './views/service-agent/ReferralDashboard';
import PointsDashboard from './views/shared/PointsDashboard';
import AchievementsDashboard from './views/shared/AchievementsDashboard';
import ForumHome from './views/forum/ForumHome';
import CategoryView from './views/forum/CategoryView';
import ThreadView from './views/forum/ThreadView';
import NewThreadView from './views/forum/NewThreadView';
import SearchView from './views/forum/SearchView';
import AnalyticsDashboard from './views/analytics/AnalyticsDashboard';
import ABTestsView from './views/analytics/ABTestsView';
import UserMetricsView from './views/analytics/UserMetricsView';
import GamificationDashboard from './views/gamification/GamificationDashboard';
import ChallengesView from './views/gamification/ChallengesView';
import EventsView from './views/gamification/EventsView';
import GamificationAnalytics from './views/gamification/GamificationAnalytics';
import UserEngagementProfile from './views/gamification/UserEngagementProfile';
import ClientDashboard from './pages/dashboard/ClientDashboard';
import EnhancedClientDashboard from './pages/dashboard/EnhancedClientDashboard';
import ServiceAgentDashboard from './pages/dashboard/EnhancedServiceAgentDashboard';
import ProfileSettings from './pages/dashboard/ProfileSettings';
import ServicePackages from './pages/EnhancedServicePackages';
import BookService from './pages/BookService';
import PointsRewards from './pages/dashboard/PointsRewards';
import VotingDashboard from './pages/governance/VotingDashboard';
import UnauthorizedPage from './components/UnauthorizedPage';
import AuthModeSelector from './components/AuthModeSelector';
import OAuthCallback from './pages/OAuthCallback';
import CompleteProfile from './pages/CompleteProfile';
import CreateService from './pages/services/CreateService';
import EditService from './pages/services/EditService';
import GlobalErrorBoundary from './components/GlobalErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import NotFoundRedirect from './components/NotFoundRedirect';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CookieConsent from './components/CookieConsent';

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
const BuildEstimate = lazy(() => import('./pages/dashboard/service-agent/BuildEstimate'));
const AvailabilityManagementPage = lazy(() => import('./pages/dashboard/service-agent/AvailabilityManagementPage'));
const BookingManagementPage = lazy(() => import('./pages/dashboard/service-agent/BookingManagementPage'));

// Lazy load admin components
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const VerificationManagement = lazy(() => import('./pages/admin/VerificationManagement'));
const NewVerificationManagement = lazy(() => import('./pages/admin/NewVerificationManagement'));
const WarrantyManagement = lazy(() => import('./pages/admin/WarrantyManagement'));
const AdminMessages = lazy(() => import('./pages/dashboard/admin/AdminMessages'));
const DataImportExportPage = lazy(() => import('./pages/admin/DataImportExportPage'));

// Lazy load pricing and monetization admin components
const SubscriptionsManagement = lazy(() => import('./pages/admin/SubscriptionsManagement'));
const CommissionsManagement = lazy(() => import('./pages/admin/CommissionsManagement'));
const PricingControls = lazy(() => import('./pages/admin/PricingControls'));

// Lazy load subscription components
const SubscriptionManagement = lazy(() => import('./pages/SubscriptionManagement'));
const SubscriptionDashboard = lazy(() => import('./pages/EnhancedSubscriptionDashboard'));
const SubscriptionPlans = lazy(() => import('./pages/SubscriptionPlans'));
const TestLogin = lazy(() => import('./pages/EnhancedTestLogin'));
const DebugPage = lazy(() => import('./pages/DebugPage'));

// Lazy load estimate components
const ServiceAgentEstimates = lazy(() => import('./pages/estimates/ServiceAgentEstimates'));
const ClientEstimates = lazy(() => import('./pages/estimates/ClientEstimates'));
const EstimateDetails = lazy(() => import('./pages/estimates/EstimateDetails'));

// Lazy load enhanced service search
const EnhancedServiceSearchPage = lazy(() => import('./pages/services/EnhancedServiceSearchPage'));

// Lazy load reviews components
const ServiceReviews = lazy(() => import('./pages/reviews/ServiceReviews'));
const ServiceAgentReviewsPage = lazy(() => import('./pages/reviews/ServiceAgentReviews'));

// Lazy load legal pages
const TermsOfService = lazy(() => import('./pages/legal/TermsOfService'));
const PrivacyPolicy = lazy(() => import('./pages/legal/PrivacyPolicy'));
const CookiePolicy = lazy(() => import('./pages/legal/CookiePolicy'));

// Lazy load documentation pages
const UserGuide = lazy(() => import('./pages/docs/UserGuide'));

// Lazy load messaging pages
const SMSMessagingPage = lazy(() => import('./pages/messaging/SMSMessagingPage'));

// Lazy load enhanced booking details
const EnhancedBookingDetailsPage = lazy(() => import('./pages/booking/EnhancedBookingDetailsPage'));
const BookingConfirmationPage = lazy(() => import('./pages/booking/BookingConfirmationPage'));

// Lazy load profile pages
const ProfileSetupPage = lazy(() => import('./pages/profile/ProfileSetupPage'));
const AccountDeactivationPage = lazy(() => import('./pages/profile/AccountDeactivationPage'));
const AccountDeactivatedPage = lazy(() => import('./pages/profile/AccountDeactivatedPage'));

// Lazy load estimates
const CreateEstimatePage = lazy(() => import('./pages/estimates/CreateEstimatePage'));

// Protected route wrapper with loading state
const ProtectedRoute = ({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) => {
  const { user, loading: authLoading } = useAuth();
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(adminOnly);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If not admin-only or no user, no need to check admin status
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
  }, [user, adminOnly]);

  if (authLoading || checkingAdmin) {
    return <LoadingSpinner fullScreen message="Verifying access..." />;
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  // Check if user is logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Handle admin-only routes
  if (adminOnly && !isAdminUser) {
    console.log('Access denied: adminOnly =', adminOnly, 'isAdminUser =', isAdminUser);
    return <UnauthorizedPage />;
  }

  return <>{children}</>;
};

// Create a layout component with the Navbar and Footer
const Layout = () => (
  <div className="min-h-screen bg-gray-50 flex flex-col">
    <Navbar />
    <div className="flex-grow">
      <Outlet />
    </div>
    <Footer />
    <AuthModeSelector />
    <CookieConsent />
  </div>
);

// Create routes using the new API
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<Layout />} errorElement={<CommonErrorBoundary />}>
      <Route path="/" element={<EnhancedHome />} />
      <Route path="/login" element={<Login />} />
      <Route path="/bypass-login" element={<BypassLoginPage />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/services" element={<ServicePackages />} />
      <Route path="/services/search" element={<Suspense fallback={<LoadingSpinner />}><EnhancedServiceSearchPage /></Suspense>} />
      <Route path="/services/:serviceId/reviews" element={<Suspense fallback={<LoadingSpinner />}><ServiceReviews /></Suspense>} />
      <Route path="/service-agent/:serviceAgentId/reviews" element={<Suspense fallback={<LoadingSpinner />}><ServiceAgentReviewsPage /></Suspense>} />
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
            <ClientDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/client/enhanced"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <EnhancedClientDashboard />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/client/bookings"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <ClientBookings />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/client/bookings/:id"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <ClientBookingDetails />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/client/bookings/:bookingId/enhanced"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <EnhancedBookingDetailsPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/client/messages"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <ClientMessages />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/client/warranty"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <ClientWarranty />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/client/warranty/new"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <ClientWarrantyClaim />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/client/referrals"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <ClientReferralDashboard />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/client/points"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <PointsDashboard />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/client/achievements"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <AchievementsDashboard />
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
            <Suspense fallback={<LoadingSpinner />}>
              <ServiceAgentListings />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/service-agent/jobs"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <ServiceAgentJobs />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/service-agent/jobs/:bookingId/enhanced"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <EnhancedBookingDetailsPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/estimates/create/:bookingId"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <CreateEstimatePage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/booking/confirmation/:bookingId"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <BookingConfirmationPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/service-agent/messages"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <ServiceAgentMessages />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/service-agent/portfolio"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <ServiceAgentPortfolio />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/service-agent/verification"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <ServiceAgentDashboardPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/service-agent/referrals"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <ServiceAgentReferralDashboard />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/service-agent/points"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <PointsDashboard />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/service-agent/achievements"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <AchievementsDashboard />
            </Suspense>
          </ProtectedRoute>
        }
      />

      {/* Forum Routes */}
      <Route
        path="/forum"
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <ForumHome />
          </Suspense>
        }
      />
      <Route
        path="/forum/category/:slug"
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <CategoryView />
          </Suspense>
        }
      />
      <Route
        path="/forum/category/:categorySlug/new"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <NewThreadView />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/forum/thread/:slug"
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <ThreadView />
          </Suspense>
        }
      />
      <Route
        path="/forum/search"
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <SearchView />
          </Suspense>
        }
      />

      {/* Analytics Routes */}
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <AnalyticsDashboard />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics/ab-tests"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <ABTestsView />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics/user-metrics"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <UserMetricsView />
            </Suspense>
          </ProtectedRoute>
        }
      />

      {/* Gamification Routes */}
      <Route
        path="/gamification"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <GamificationDashboard />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/gamification/challenges"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <ChallengesView />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/gamification/events"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <EventsView />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/gamification/analytics"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <GamificationAnalytics />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/gamification/user/:userId"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <UserEngagementProfile />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/service-agent/reviews"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <ServiceAgentReviews />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/service-agent/invite"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <ServiceAgentInvite />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/service-agent/availability"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <AvailabilityManagementPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/service-agent/bookings"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <BookingManagementPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/service-agent/bookings/:bookingId"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <EnhancedBookingDetailsPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <ProjectsListPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/create"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <ProjectCreatePage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/:projectId"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <ProjectDetailsPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/:projectId/permits"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <ProjectPermitsPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/:projectId/issues"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <ProjectIssuesPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/:projectId/estimates"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <ProjectEstimatesPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/admin"
        element={
          <ProtectedRoute adminOnly>
            <Suspense fallback={<LoadingSpinner />}>
              <AdminDashboard />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/admin/verifications"
        element={
          <ProtectedRoute adminOnly>
            <Suspense fallback={<LoadingSpinner />}>
              <NewVerificationManagement />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/admin/old-verifications"
        element={
          <ProtectedRoute adminOnly>
            <Suspense fallback={<LoadingSpinner />}>
              <VerificationManagement />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/admin/warranty"
        element={
          <ProtectedRoute adminOnly>
            <Suspense fallback={<LoadingSpinner />}>
              <WarrantyManagement />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/admin/messages"
        element={
          <ProtectedRoute adminOnly>
            <Suspense fallback={<LoadingSpinner />}>
              <AdminMessages />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/admin/subscriptions"
        element={
          <ProtectedRoute adminOnly>
            <Suspense fallback={<LoadingSpinner />}>
              <SubscriptionsManagement />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/admin/commissions"
        element={
          <ProtectedRoute adminOnly>
            <Suspense fallback={<LoadingSpinner />}>
              <CommissionsManagement />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/admin/pricing"
        element={
          <ProtectedRoute adminOnly>
            <Suspense fallback={<LoadingSpinner />}>
              <PricingControls />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/admin/data-import-export"
        element={
          <ProtectedRoute adminOnly>
            <Suspense fallback={<LoadingSpinner />}>
              <DataImportExportPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/admin/verification"
        element={
          <ProtectedRoute adminOnly>
            <Suspense fallback={<LoadingSpinner />}>
              <VerificationReviewPage />
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
      <Route
        path="/subscription"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <SubscriptionManagement />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/subscription/dashboard"
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <SubscriptionDashboard />
          </Suspense>
        }
      />
      <Route
        path="/subscription/plans"
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <SubscriptionPlans />
          </Suspense>
        }
      />
      <Route path="/oauth-callback" element={<OAuthCallback />} />
      <Route path="/complete-profile" element={<CompleteProfile />} />
      <Route path="/profile-setup" element={<Suspense fallback={<LoadingSpinner />}><ProfileSetupPage /></Suspense>} />
      <Route path="/account/deactivate" element={<Suspense fallback={<LoadingSpinner />}><AccountDeactivationPage /></Suspense>} />
      <Route path="/account-deactivated" element={<Suspense fallback={<LoadingSpinner />}><AccountDeactivatedPage /></Suspense>} />
      <Route path="/test-login" element={<TestLogin />} />
      <Route path="/debug" element={<DebugPage />} />
      <Route path="/test-page" element={<TestPage />} />

      {/* Verification Routes */}
      <Route
        path="/verification"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <VerificationPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/verification/start"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <VerificationPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/verification/status"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <VerificationPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/verification/resubmit"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <VerificationPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/verification/renew"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <VerificationPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/verification/details"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <VerificationPage />
            </Suspense>
          </ProtectedRoute>
        }
      />

      {/* Onboarding Routes */}
      <Route
        path="/onboarding/service-agent"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <ServiceAgentOnboarding />
            </Suspense>
          </ProtectedRoute>
        }
      />

      {/* Legal pages */}
      <Route path="/terms-of-service" element={<Suspense fallback={<LoadingSpinner />}><TermsOfService /></Suspense>} />
      <Route path="/privacy-policy" element={<Suspense fallback={<LoadingSpinner />}><PrivacyPolicy /></Suspense>} />
      <Route path="/cookie-policy" element={<Suspense fallback={<LoadingSpinner />}><CookiePolicy /></Suspense>} />

      {/* Documentation pages */}
      <Route path="/user-guide" element={<Suspense fallback={<LoadingSpinner />}><UserGuide /></Suspense>} />

      {/* Messaging pages */}
      <Route
        path="/messaging/sms"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <SMSMessagingPage />
            </Suspense>
          </ProtectedRoute>
        }
      />

      {/* Redirect routes for old paths */}
      <Route path="/bookings" element={<NotFoundRedirect />} />
      <Route path="/warranty" element={<NotFoundRedirect />} />
      <Route path="/warranty/claims" element={<NotFoundRedirect />} />
      <Route path="/messages" element={<NotFoundRedirect />} />
      <Route path="/contractor" element={<NotFoundRedirect />} />
      <Route path="/contractor/jobs" element={<NotFoundRedirect />} />
      <Route path="/contractor/listings" element={<NotFoundRedirect />} />
      <Route path="/contractor/messages" element={<NotFoundRedirect />} />

      {/* Estimate routes */}
      <Route
        path="/estimates"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <ClientEstimates />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/estimates/:estimateId"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <EstimateDetails />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/service-agent/estimates"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <ServiceAgentEstimates />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/service-agent/estimate/:bookingId"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <BuildEstimate />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/estimates/create"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <ServiceAgentEstimates />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/estimates/create/:bookingId"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <ServiceAgentEstimates />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/estimates/edit/:estimateId"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <ServiceAgentEstimates />
            </Suspense>
          </ProtectedRoute>
        }
      />
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

// Import providers
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import SystemMessageProvider from './contexts/SystemMessageContext';

function App() {
  return (
    <GlobalErrorBoundary>
      <AuthProvider>
        <SubscriptionProvider>
          <SystemMessageProvider>
            <RouterProvider router={router} />
            <ToastContainer />
          </SystemMessageProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </GlobalErrorBoundary>
  );
}

export default App;
