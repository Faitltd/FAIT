import React from 'react';
import { Route, Routes } from 'react-router-dom';
import CreditsPage from '../pages/CreditsPage';
import ProtectedRoute from './ProtectedRoute';

/**
 * Routes for the credits management functionality
 */
const CreditsRoutes: React.FC = () => {
  return (
    <Routes>
      <Route
        path="/credits"
        element={
          <ProtectedRoute>
            <CreditsPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default CreditsRoutes;
