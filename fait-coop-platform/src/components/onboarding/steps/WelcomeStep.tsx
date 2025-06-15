import React from 'react';

interface WelcomeStepProps {
  onContinue: () => void;
}

/**
 * Welcome step in the onboarding process
 */
const WelcomeStep: React.FC<WelcomeStepProps> = ({ onContinue }) => {
  return (
    <div className="text-center">
      <svg
        className="mx-auto h-16 w-16 text-blue-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
        />
      </svg>
      <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
        Welcome to FAIT Co-op!
      </h2>
      <p className="mt-2 text-sm text-gray-600">
        Let's get your service agent profile set up so you can start receiving bookings.
      </p>
      
      <div className="mt-8 bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900">
          What you'll need to complete this process:
        </h3>
        <ul className="mt-4 text-left space-y-4">
          <li className="flex">
            <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <span className="font-medium">Personal Information</span>
              <p className="text-sm text-gray-500">Your contact details and address</p>
            </div>
          </li>
          <li className="flex">
            <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <span className="font-medium">Business Information</span>
              <p className="text-sm text-gray-500">Your business name, description, and website</p>
            </div>
          </li>
          <li className="flex">
            <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <span className="font-medium">Service Details</span>
              <p className="text-sm text-gray-500">Information about the services you offer</p>
            </div>
          </li>
          <li className="flex">
            <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <span className="font-medium">Verification Documents</span>
              <p className="text-sm text-gray-500">Professional license, insurance, and identification</p>
            </div>
          </li>
        </ul>
      </div>
      
      <div className="mt-8">
        <p className="text-sm text-gray-600 mb-4">
          This process takes about 10-15 minutes to complete. You can save your progress and come back later.
        </p>
        <button
          type="button"
          onClick={onContinue}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Get Started
          <svg className="ml-2 -mr-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default WelcomeStep;
