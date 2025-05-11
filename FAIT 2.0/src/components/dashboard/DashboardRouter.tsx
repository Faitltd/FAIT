import React from 'react';
import { Navigate } from 'react-router-dom';
import { useFAIT } from '../../contexts/FAITContext';
import { UserRole } from '../../types/UserRoles';

// Import dashboard components
import ClientDashboard from './ClientDashboard';
import ContractorDashboard from './ContractorDashboard';
import AdminDashboard from './AdminDashboard';
import AllyDashboard from './AllyDashboard';
import Dashboard from '../../pages/Dashboard';

const DashboardRouter: React.FC = () => {
  const { userRole, isLoading, error } = useFAIT();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-lg font-semibold text-red-700 mb-2">Error Loading Dashboard</h2>
        <p className="text-red-600">{error}</p>
        <p className="mt-4">
          Please try refreshing the page or contact support if the problem persists.
        </p>
      </div>
    );
  }

  // Redirect to login if no user role is found
  if (!userRole) {
    return <Navigate to="/login" replace />;
  }

  // Use the animated Dashboard component instead of role-specific dashboards
  return <Dashboard />;

  // Commented out the role-specific dashboard routing for now
  /*
  switch (userRole) {
    case UserRole.CLIENT:
      return <ClientDashboard />;

    case UserRole.CONTRACTOR:
      return <ContractorDashboard />;

    case UserRole.ADMIN:
      return <AdminDashboard />;

    case UserRole.ALLY:
      return <AllyDashboard />;

    default:
      // Fallback to client dashboard if role is unknown
      return <ClientDashboard />;
  }
  */
};

export default DashboardRouter;
