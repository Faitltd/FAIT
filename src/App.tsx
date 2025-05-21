import React, { lazy, Suspense, useState, useEffect } from 'react';
import { RouterProvider, createBrowserRouter, Route, Navigate, createRoutesFromElements, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/UnifiedAuthContext';
import { isAdmin } from './lib/admin';
import { ToastContainer, ErrorBoundary as CommonErrorBoundary } from './components/common';
// Removed Navbar import
import LandingPage from './pages/LandingPage';
import StaticHome from './pages/StaticHome';
import TestPage from './pages/TestPage';
import TestServicesPage from './pages/TestServicesPage';
import ImprovedServicePackages from './pages/ImprovedServicePackages';
import DebugServicePackages from './pages/DebugServicePackages';
import TestDebugPage from './pages/TestDebugPage';
import EnhancedHome from './pages/EnhancedHome';
import EnhancedHomeWithAnimations from './pages/EnhancedHomeWithAnimations';
import EnhancedAboutWithParallax from './pages/EnhancedAboutWithParallax';
import EnhancedServicesWithParallax from './pages/EnhancedServicesWithParallax';
import FAITLocal from './pages/FAITLocal';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import DirectBypass from './pages/DirectBypass';
import StandaloneServiceAgent from './pages/StandaloneServiceAgent';
import DirectLogin from './pages/DirectLogin';
import DiagnosticLogin from './pages/DiagnosticLogin';
import AdminBypassLogin from './pages/AdminBypassLogin';
import UnifiedLoginPage from './pages/auth/UnifiedLoginPage';
import ComponentsDemo from './pages/demo/ComponentsDemo';
import AnimationsDemo from './pages/AnimationsDemo';
import ScrollRevealDemo from './pages/ScrollRevealDemo';
import MobileOptimizationDemo from './pages/MobileOptimizationDemo';
import PerformanceOptimizationDemo from './pages/PerformanceOptimizationDemo';
import AnimationDemo from './components/demo/AnimationDemo';
import AnimationDemoRoute from './components/demo/AnimationDemoRoute';
import { ProjectsPage, ProjectDetailsPage, CreateProjectPage } from './pages/projects';
import BookingTest from './pages/BookingTest';
import AnimationTest from './pages/AnimationTest';
import SimpleAnimationDemo from './pages/SimpleAnimationDemo';
import AuthExample from './pages/AuthExample';
import PerformanceDemo from './pages/demo/PerformanceDemo';

// Import verification and onboarding components
const VerificationPage = lazy(() => import('./pages/verification/VerificationPage'));
const ServiceAgentOnboarding = lazy(() => import('./components/onboarding/ServiceAgentOnboarding'));
import ResetPassword from './pages/ResetPassword';
import BypassLoginPage from './pages/auth/BypassLoginPage';
import ProjectPermitsPage from './pages/ProjectPermitsPage';
// ProjectDetailsPage is already imported from './pages/projects'
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
import DirectAuthToggle from './components/DirectAuthToggle';
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
import MainLayout from './components/MainLayout';

// Lazy load client components
const ClientBookings = lazy(() => import('./pages/dashboard/client/ClientBookings'));
const ClientBookingDetails = lazy(() => import('./pages/dashboard/client/ClientBookingDetails'));
const ClientMessages = lazy(() => import('./pages/dashboard/client/ClientMessages'));
const ClientWarranty = lazy(() => import('./pages/dashboard/client/ClientWarranty'));
const ClientWarrantyClaim = lazy(() => import('./pages/dashboard/client/ClientWarrantyClaim'));

// Lazy load test components
const DirectMapTest = lazy(() => import('./pages/DirectMapTest'));

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
const ActiveServices = lazy(() => import('./pages/dashboard/service-agent/ActiveServices'));

// Lazy load services pages
const AllServicesPage = lazy(() => import('./pages/services/AllServicesPage'));
const ManageServicesPage = lazy(() => import('./pages/services/ManageServicesPage'));

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
const TestAuthCredentials = lazy(() => import('./pages/TestAuthCredentials'));
const TestLocalAuth = lazy(() => import('./pages/TestLocalAuth'));
const DebugPage = lazy(() => import('./pages/DebugPage'));
const GoogleMapsTestPage = lazy(() => import('./pages/GoogleMapsTestPage'));

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
const MessagesPage = lazy(() => import('./pages/messages/MessagesPage'));

// Lazy load enhanced booking details
const EnhancedBookingDetailsPage = lazy(() => import('./pages/booking/EnhancedBookingDetailsPage'));
const BookingConfirmationPage = lazy(() => import('./pages/booking/BookingConfirmationPage'));
const BookingsPage = lazy(() => import('./pages/bookings/BookingsPage'));

// Lazy load calculator
const RemodelingCalculator = lazy(() => import('./pages/calculator/RemodelingCalculator'));
const HandymanCalculator = lazy(() => import('./pages/calculator/HandymanCalculator'));
const TestRemodelingCalculator = lazy(() => import('./pages/calculator/TestRemodelingCalculator'));
const SimpleTestCalculator = lazy(() => import('./pages/calculator/SimpleTestCalculator'));
// Import EstimateCalculators directly
import EstimateCalculators from './pages/calculator/EstimateCalculators';

// Lazy load profile pages
const ProfileSetupPage = lazy(() => import('./pages/profile/ProfileSetupPage'));
const AccountDeactivationPage = lazy(() => import('./pages/profile/AccountDeactivationPage'));
const AccountDeactivatedPage = lazy(() => import('./pages/profile/AccountDeactivatedPage'));

// Lazy load estimates
const CreateEstimatePage = lazy(() => import('./pages/estimates/CreateEstimatePage'));

// We're now using the unified auth context

// Protected route wrapper with loading state
const ProtectedRoute = ({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) => {
  const { user, loading, userType } = useAuth();
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(adminOnly);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If not admin-only or no user, no need to check admin status
    if (!user || !adminOnly) {
      setCheckingAdmin(false);
      return;
    }

    // If user type is admin, no need to check further
    if (userType === 'admin') {
      setIsAdminUser(true);
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
  }, [user, adminOnly, userType]);

  if (loading || checkingAdmin) {
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
  if (adminOnly && userType !== 'admin' && !isAdminUser) {
    console.log('Access denied: adminOnly =', adminOnly, 'userType =', userType);
    return <UnauthorizedPage />;
  }

  return <>{children}</>;
};

// Import the AuthToggle component
import AuthToggle from './components/AuthToggle';

// Create a layout component with MainLayout
const Layout = () => (
  <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#c0e2ff' }}>
    <div className="flex-grow">
      <Outlet />
    </div>
    <AuthToggle />
    <CookieConsent />
  </div>
);

// Create routes using the new API
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<Layout />} errorElement={<CommonErrorBoundary />}>
      <Route path="/" element={<MainLayout currentPage="home"><EnhancedHomeWithAnimations /></MainLayout>} />
      <Route path="/home/original" element={<MainLayout currentPage="home"><EnhancedHome /></MainLayout>} />
      <Route path="/enhanced-about" element={<MainLayout currentPage="about"><EnhancedAboutWithParallax /></MainLayout>} />
      <Route path="/enhanced-services" element={<MainLayout currentPage="services"><EnhancedServicesWithParallax /></MainLayout>} />
      <Route path="/local" element={<MainLayout currentPage="local"><FAITLocal /></MainLayout>} />
      <Route path="/login" element={<MainLayout currentPage="login"><React.Suspense fallback={<LoadingSpinner />}><UnifiedLoginPage /></React.Suspense></MainLayout>} />
      <Route path="/direct-bypass" element={<DirectBypass />} />
      <Route path="/standalone-service-agent" element={<StandaloneServiceAgent />} />
      <Route path="/bypass-login" element={<BypassLoginPage />} />
      <Route path="/direct-login" element={<DirectLogin />} />
      <Route path="/diagnostic-login" element={<DiagnosticLogin />} />
      <Route path="/admin-bypass" element={<AdminBypassLogin />} />
      <Route path="/register" element={<MainLayout currentPage="register"><Register /></MainLayout>} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/services" element={<Suspense fallback={<LoadingSpinner />}><MainLayout currentPage="services"><ImprovedServicePackages /></MainLayout></Suspense>} />
      <Route path="/services/debug" element={<Suspense fallback={<LoadingSpinner />}><DebugServicePackages /></Suspense>} />
      <Route path="/services/debug-test" element={<TestDebugPage />} />
      <Route path="/services/search" element={<Suspense fallback={<LoadingSpinner />}><MainLayout currentPage="services"><EnhancedServiceSearchPage /></MainLayout></Suspense>} />
      <Route path="/services/:serviceId/reviews" element={<Suspense fallback={<LoadingSpinner />}><ServiceReviews /></Suspense>} />
      <Route path="/service-agent/:serviceAgentId/reviews" element={<Suspense fallback={<LoadingSpinner />}><ServiceAgentReviewsPage /></Suspense>} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      {/* Test routes */}
      <Route path="/test/booking/:serviceId?" element={<BookingTest />} />
      <Route path="/test/animations" element={<AnimationTest />} />
      <Route path="/demo/animations" element={<React.Suspense fallback={<LoadingSpinner />}><AnimationDemo /></React.Suspense>} />
      <Route path="/demo/animations-new/*" element={<React.Suspense fallback={<LoadingSpinner />}><AnimationDemoRoute /></React.Suspense>} />
      <Route path="/demo/simple-animations" element={<SimpleAnimationDemo />} />
      <Route path="/demo/auth" element={<MainLayout currentPage="demo"><AuthExample /></MainLayout>} />
      <Route path="/demo/performance" element={<MainLayout currentPage="demo"><PerformanceDemo /></MainLayout>} />
      {/* Redirect from old contractor dashboard to new service agent dashboard */}
      <Route path="/dashboard/contractor" element={<Navigate to="/dashboard/service-agent" replace />} />
      <Route
        path="/book/:serviceId"
        element={
          <ProtectedRoute>
            <MainLayout currentPage="bookings">
              <BookService />
            </MainLayout>
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
            <MainLayout currentPage="dashboard">
              <ClientDashboard />
            </MainLayout>
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
            <MainLayout currentPage="dashboard">
              <ServiceAgentDashboard />
            </MainLayout>
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
        path="/messages"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <MessagesPage />
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
        path="/dashboard/service-agent/active-services"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <ActiveServices />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/services/all"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <AllServicesPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/services/manage"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <ManageServicesPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/bookings"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <BookingsPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/calculator/remodeling"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <RemodelingCalculator />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/calculator/handyman"
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <HandymanCalculator />
          </Suspense>
        }
      />
      <Route
        path="/calculator/test"
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <TestRemodelingCalculator />
          </Suspense>
        }
      />
      <Route
        path="/calculator/simple-test"
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <SimpleTestCalculator />
          </Suspense>
        }
      />
      <Route
        path="/calculator/estimate"
        element={
          <MainLayout currentPage="services">
            {console.log('Rendering EstimateCalculators route - with MainLayout')}
            <EstimateCalculators />
          </MainLayout>
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
      <Route path="/test-auth-credentials" element={<Suspense fallback={<LoadingSpinner />}><TestAuthCredentials /></Suspense>} />
      <Route path="/test-local-auth" element={<Suspense fallback={<LoadingSpinner />}><TestLocalAuth /></Suspense>} />
      <Route path="/debug" element={<DebugPage />} />
      <Route path="/test-page" element={<TestPage />} />
      <Route path="/test-maps" element={<Suspense fallback={<LoadingSpinner />}><GoogleMapsTestPage /></Suspense>} />
      <Route path="/direct-map-test" element={<Suspense fallback={<LoadingSpinner />}><DirectMapTest /></Suspense>} />
      <Route path="/components-demo" element={<ComponentsDemo />} />
      <Route path="/scroll-reveal" element={<ScrollRevealDemo />} />
      <Route path="/animations-demo" element={<AnimationsDemo />} />
      <Route path="/mobile-demo" element={<MobileOptimizationDemo />} />
      <Route path="/performance-demo" element={<PerformanceOptimizationDemo />} />

      {/* Project Routes */}
      <Route path="/projects/:projectId/edit" element={<CreateProjectPage />} />

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
      <Route path="/warranty" element={<Navigate to="/dashboard/client/warranty" replace />} />
      <Route path="/warranty/claims" element={<Navigate to="/dashboard/client/warranty" replace />} />
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
import GoogleMapsLoader from './components/GoogleMapsLoader';
import SessionManager from './components/auth/SessionManager';

function App() {
  return (
    <GlobalErrorBoundary>
      <AuthProvider>
        <SubscriptionProvider>
          <SystemMessageProvider>
            {/* Session management for auto-refresh and timeout warnings */}
            <SessionManager
              warningTime={5 * 60 * 1000}  // Show warning 5 minutes before expiry
              autoRefreshTime={10 * 60 * 1000}  // Auto-refresh 10 minutes before expiry
            >
              {/* Preload Google Maps API */}
              <GoogleMapsLoader />
              <RouterProvider router={router} />
              <ToastContainer />
            </SessionManager>
          </SystemMessageProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </GlobalErrorBoundary>
  );
}

export default App;
