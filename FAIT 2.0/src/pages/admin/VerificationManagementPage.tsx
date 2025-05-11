import React from 'react';
import VerificationManagement from '../../components/admin/VerificationManagement';

const VerificationManagementPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Verification Management</h1>
      <VerificationManagement />
    </div>
  );
};

export default VerificationManagementPage;
