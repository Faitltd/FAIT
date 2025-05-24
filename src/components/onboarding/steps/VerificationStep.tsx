import React from 'react';
import { Link } from 'react-router-dom';

interface VerificationStepProps {
  data: any;
  onChange: (data: any) => void;
}

/**
 * Verification step in the onboarding process
 * This is a placeholder component that will link to the full verification page
 */
const VerificationStep: React.FC<VerificationStepProps> = ({ data, onChange }) => {
  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900">Verification</h3>
      <p className="mt-1 text-sm text-gray-600">
        Verify your credentials to build trust with clients.
      </p>
      
      <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Document Verification
          </h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>
              To provide services on FAIT Co-op, you'll need to verify your identity and credentials.
              This helps build trust with clients and ensures the quality of our platform.
            </p>
          </div>
          <div className="mt-5">
            <Link
              to="/verification"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Go to Verification Page
            </Link>
          </div>
        </div>
      </div>
      
      <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
        <div className="bg-gray-50 overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Required Documents
            </h3>
            <div className="mt-2 text-sm text-gray-500">
              <ul className="list-disc pl-5 space-y-1">
                <li>Government-issued ID</li>
                <li>Business license</li>
                <li>Proof of insurance</li>
                <li>Professional certifications</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Benefits of Verification
            </h3>
            <div className="mt-2 text-sm text-gray-500">
              <ul className="list-disc pl-5 space-y-1">
                <li>Higher visibility in search results</li>
                <li>Verified badge on your profile</li>
                <li>Access to premium features</li>
                <li>Increased trust from clients</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 bg-blue-50 border-l-4 border-blue-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              You can continue with the onboarding process now and complete your verification later.
              However, you won't be able to receive bookings until your verification is approved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationStep;
