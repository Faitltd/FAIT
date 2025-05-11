import React from 'react';

interface LocationStepProps {
  formData: {
    address: string;
    city: string;
    state: string;
    zip: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const LocationStep: React.FC<LocationStepProps> = ({ formData, onChange }) => {
  // US states for dropdown
  const states = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 
    'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 
    'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 
    'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 
    'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 
    'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 
    'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Your Location</h2>
      <p className="text-gray-600 mb-6">
        Please provide your location so we can connect you with local service providers.
      </p>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="address" className="block text-gray-700 font-medium mb-2">
            Street Address *
          </label>
          <input
            type="text"
            id="address"
            name="address"
            data-cy="onboarding-address"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.address}
            onChange={onChange}
            required
          />
        </div>
        
        <div>
          <label htmlFor="city" className="block text-gray-700 font-medium mb-2">
            City *
          </label>
          <input
            type="text"
            id="city"
            name="city"
            data-cy="onboarding-city"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.city}
            onChange={onChange}
            required
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="state" className="block text-gray-700 font-medium mb-2">
              State *
            </label>
            <select
              id="state"
              name="state"
              data-cy="onboarding-state"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.state}
              onChange={onChange}
              required
            >
              <option value="">Select State</option>
              {states.map(state => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="zip" className="block text-gray-700 font-medium mb-2">
              ZIP Code *
            </label>
            <input
              type="text"
              id="zip"
              name="zip"
              data-cy="onboarding-zip"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.zip}
              onChange={onChange}
              required
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationStep;
