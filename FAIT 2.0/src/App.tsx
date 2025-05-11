import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/auth/Login';
import RegisterPage from './pages/auth/RegisterPage';
import { AuthProvider } from './contexts/AuthContext';
import PaymentsPage from './pages/dashboard/PaymentsPage';
import PayoutsPage from './pages/admin/PayoutsPage';
import LandingPage from './pages/LandingPage';
import DashboardExample from './pages/DashboardExample';
import ProfessionalDashboard from './pages/ProfessionalDashboard';
import MinimalDashboard from './pages/MinimalDashboard';
import WeddingPlanningPage from './pages/WeddingPlanningPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard/payments" element={<PaymentsPage />} />
          <Route path="/admin/payouts" element={<PayoutsPage />} />
          <Route path="/dashboard" element={<MinimalDashboard />} />
          <Route path="/dashboard-professional" element={<ProfessionalDashboard />} />
          <Route path="/dashboard-example" element={<DashboardExample />} />
          <Route path="/wedding" element={<WeddingPlanningPage />} />
          {/* Add more routes as needed */}
          <Route path="/" element={<LandingPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
