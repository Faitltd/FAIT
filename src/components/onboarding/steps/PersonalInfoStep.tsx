import React from 'react';

interface PersonalInfoStepProps {
  formData: {
    firstName: string;
    lastName: string;
    phone: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({ formData, onChange }) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
      <p className="text-gray-600 mb-6">
        Please provide your basic information so we can personalize your experience.
      </p>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="firstName" className="block text-gray-700 font-medium mb-2">
            First Name *
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            data-cy="onboarding-first-name"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.firstName}
            onChange={onChange}
            required
          />
        </div>
        
        <div>
          <label htmlFor="lastName" className="block text-gray-700 font-medium mb-2">
            Last Name *
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            data-cy="onboarding-last-name"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.lastName}
            onChange={onChange}
            required
          />
        </div>
        
        <div>
          <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            data-cy="onboarding-phone"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.phone}
            onChange={onChange}
            placeholder="e.g., 555-123-4567"
            required
          />
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoStep;
