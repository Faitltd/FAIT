import React from 'react';

interface PreferencesStepProps {
  selectedPreferences: string[];
  onTogglePreference: (preference: string) => void;
}

const PreferencesStep: React.FC<PreferencesStepProps> = ({ 
  selectedPreferences, 
  onTogglePreference 
}) => {
  // Available service categories
  const serviceCategories = [
    {
      id: 'renovation',
      name: 'Renovation',
      description: 'Home renovations and remodeling',
      icon: '🏠'
    },
    {
      id: 'plumbing',
      name: 'Plumbing',
      description: 'Plumbing installation and repairs',
      icon: '🚿'
    },
    {
      id: 'electrical',
      name: 'Electrical',
      description: 'Electrical installation and repairs',
      icon: '⚡'
    },
    {
      id: 'hvac',
      name: 'HVAC',
      description: 'Heating, ventilation, and air conditioning',
      icon: '❄️'
    },
    {
      id: 'landscaping',
      name: 'Landscaping',
      description: 'Outdoor landscaping and gardening',
      icon: '🌱'
    },
    {
      id: 'painting',
      name: 'Painting',
      description: 'Interior and exterior painting',
      icon: '🎨'
    },
    {
      id: 'cleaning',
      name: 'Cleaning',
      description: 'Home cleaning services',
      icon: '✨'
    },
    {
      id: 'roofing',
      name: 'Roofing',
      description: 'Roof installation and repairs',
      icon: '🏡'
    }
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Your Preferences</h2>
      <p className="text-gray-600 mb-6">
        Select the types of services you're interested in. This helps us show you relevant service providers.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {serviceCategories.map(category => (
          <div
            key={category.id}
            data-cy={`preference-${category.id}`}
            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
              selectedPreferences.includes(category.id)
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50/50'
            }`}
            onClick={() => onTogglePreference(category.id)}
          >
            <div className="flex items-center">
              <div className="text-2xl mr-3">{category.icon}</div>
              <div>
                <h3 className="font-medium">{category.name}</h3>
                <p className="text-sm text-gray-600">{category.description}</p>
              </div>
              <div className="ml-auto">
                <div
                  className={`w-5 h-5 rounded-full border ${
                    selectedPreferences.includes(category.id)
                      ? 'bg-blue-500 border-blue-500'
                      : 'border-gray-400'
                  } flex items-center justify-center`}
                >
                  {selectedPreferences.includes(category.id) && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3 text-white"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PreferencesStep;
