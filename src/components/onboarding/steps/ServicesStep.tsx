import React from 'react';

interface ServicesStepProps {
  data: any[];
  onChange: (data: any[]) => void;
}

/**
 * Services step in the onboarding process
 * This is a placeholder component that will be implemented later
 */
const ServicesStep: React.FC<ServicesStepProps> = ({ data, onChange }) => {
  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900">Your Services</h3>
      <p className="mt-1 text-sm text-gray-600">
        Define the services you offer to clients.
      </p>
      
      <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Coming Soon</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                The services configuration feature is coming soon. For now, you can continue with the onboarding process.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6">
        <p className="text-sm text-gray-500">
          You'll be able to add and manage your services after completing the onboarding process.
        </p>
      </div>
    </div>
  );
};

export default ServicesStep;
