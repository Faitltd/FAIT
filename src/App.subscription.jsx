import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SubscriptionProvider } from './contexts/SubscriptionContext';

// Import your components
import Home from './pages/Home';
import Loading from './components/Loading';

// Lazy load other components
const ServiceAgentDashboard = lazy(() => import('./pages/dashboard/EnhancedServiceAgentDashboard'));
const ClientDashboard = lazy(() => import('./pages/dashboard/ClientDashboard'));
const AdminDashboard = lazy(() => import('./pages/dashboard/AdminDashboard'));
const SubscriptionDashboard = lazy(() => import('./pages/EnhancedSubscriptionDashboard'));
const SubscriptionPlans = lazy(() => import('./pages/SubscriptionPlansStripe'));

function App() {
  return (
    <SubscriptionProvider>
      <Router>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard/service-agent" element={<ServiceAgentDashboard />} />
            <Route path="/dashboard/client" element={<ClientDashboard />} />
            <Route path="/dashboard/admin" element={<AdminDashboard />} />
            <Route path="/subscription/dashboard" element={<SubscriptionDashboard />} />
            <Route path="/subscription/plans" element={<SubscriptionPlans />} />
            {/* Add other routes as needed */}
          </Routes>
        </Suspense>
      </Router>
    </SubscriptionProvider>
  );
}

export default App;
