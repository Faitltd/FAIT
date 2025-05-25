import React from 'react';
import ClientVerificationProcess from '../../components/verification/ClientVerificationProcess';

const ClientVerificationPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Client Verification</h1>
        <p className="mt-2 text-lg text-gray-600">
          Complete the verification process to unlock all features and build trust with service providers.
        </p>
      </div>
      
      <ClientVerificationProcess />
    </div>
  );
};

export default ClientVerificationPage;
