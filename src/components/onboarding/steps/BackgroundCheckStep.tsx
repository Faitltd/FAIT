import React, { useState } from 'react';

interface BackgroundCheckData {
  agreed: boolean;
  completed: boolean;
}

interface BackgroundCheckStepProps {
  data: BackgroundCheckData;
  onChange: (data: BackgroundCheckData) => void;
}

/**
 * Background check step in the onboarding process
 * This is a placeholder component that will be implemented later
 */
const BackgroundCheckStep: React.FC<BackgroundCheckStepProps> = ({ data, onChange }) => {
  const [agreed, setAgreed] = useState(data.agreed);
  
  const handleAgreeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAgreed = e.target.checked;
    setAgreed(newAgreed);
    onChange({ ...data, agreed: newAgreed });
  };
  
  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900">Background Check</h3>
      <p className="mt-1 text-sm text-gray-600">
        Complete a background check to ensure the safety and trust of our community.
      </p>
      
      <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Background Check Information
          </h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>
              To ensure the safety and trust of our community, we require all service providers
              to complete a background check through our partner, Checkr.
            </p>
          </div>
          
          <div className="mt-4 bg-blue-50 border-l-4 border-blue-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  The background check will verify:
                </p>
                <ul className="mt-2 list-disc list-inside text-sm text-blue-700">
                  <li>Identity verification</li>
                  <li>Criminal history</li>
                  <li>Sex offender registry</li>
                  <li>Global watchlist screening</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mt-5 space-y-6">
            <div className="relative flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  checked={agreed}
                  onChange={handleAgreeChange}
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="terms" className="font-medium text-gray-700">
                  I authorize FAIT Co-Op and its partner Checkr to collect and process my
                  background check information
                </label>
                <p className="text-gray-500">
                  I understand that this may include criminal history, identity verification,
                  and other relevant searches. I acknowledge that I have read and agree to Checkr's{' '}
                  <a
                    href="https://checkr.com/privacy-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-500"
                  >
                    Privacy Policy
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-5">
            <button
              type="button"
              disabled={!agreed}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Start Background Check
            </button>
          </div>
        </div>
      </div>
      
      <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-400 p-4">
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
                The background check integration is coming soon. For now, you can continue with the onboarding process.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackgroundCheckStep;
