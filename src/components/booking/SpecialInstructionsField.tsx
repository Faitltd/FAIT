import React, { useState } from 'react';
import { MessageSquare, Info, Check } from 'lucide-react';

interface SpecialInstructionsFieldProps {
  value: string;
  onChange: (value: string) => void;
  serviceType?: string;
  maxLength?: number;
}

/**
 * Special Instructions Field Component
 * 
 * A component for entering special instructions for a service booking.
 * Includes character count, suggestions, and validation.
 */
const SpecialInstructionsField: React.FC<SpecialInstructionsFieldProps> = ({
  value,
  onChange,
  serviceType = 'service',
  maxLength = 500
}) => {
  const [focused, setFocused] = useState(false);
  
  // Generate suggestions based on service type
  const getSuggestions = () => {
    const commonSuggestions = [
      'Please call me 10 minutes before arrival',
      'The gate code is #1234',
      'Please park in the driveway'
    ];
    
    const serviceSpecificSuggestions: Record<string, string[]> = {
      'Plumbing': [
        'The water shutoff valve is located in the basement',
        'This is a recurring issue that was previously serviced',
        'The issue is specifically with the upstairs bathroom'
      ],
      'Electrical': [
        'The circuit breaker is in the garage',
        'The issue started after a power outage',
        'I need all outlets in the kitchen checked'
      ],
      'Cleaning': [
        'Please focus on the kitchen and bathrooms',
        'I have pets, please keep doors closed',
        'Please use fragrance-free products only'
      ],
      'Landscaping': [
        'The garden tools are in the shed',
        'Please avoid using chemical fertilizers',
        'The sprinkler system needs to be checked'
      ],
      'HVAC': [
        'The thermostat is not responding correctly',
        'The system makes unusual noises when running',
        'Some rooms are much colder than others'
      ]
    };
    
    // Find the closest matching service type
    const matchingService = Object.keys(serviceSpecificSuggestions).find(
      service => serviceType.toLowerCase().includes(service.toLowerCase())
    );
    
    return matchingService
      ? [...serviceSpecificSuggestions[matchingService], ...commonSuggestions]
      : commonSuggestions;
  };
  
  const suggestions = getSuggestions();
  
  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
  };
  
  return (
    <div className="space-y-4">
      <div className={`relative border ${focused ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-300'} rounded-md transition-all`}>
        <div className="flex items-start p-3">
          <MessageSquare className="h-5 w-5 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
          <div className="flex-grow">
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder={`Add any special instructions for your ${serviceType.toLowerCase()}...`}
              className="w-full border-0 p-0 focus:ring-0 text-gray-900 placeholder-gray-400 resize-none min-h-[100px]"
              maxLength={maxLength}
            />
            <div className="flex justify-end mt-1">
              <span className={`text-xs ${value.length > maxLength * 0.8 ? 'text-amber-500' : 'text-gray-400'}`}>
                {value.length}/{maxLength}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Suggestions */}
      <div className="bg-gray-50 rounded-md p-4">
        <div className="flex items-center mb-3">
          <Info className="h-4 w-4 text-blue-500 mr-2" />
          <h4 className="text-sm font-medium text-gray-700">Suggested instructions</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className={`text-left px-3 py-2 rounded-md text-sm transition-colors ${
                value === suggestion
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center">
                {value === suggestion && <Check className="h-4 w-4 text-blue-500 mr-1.5 flex-shrink-0" />}
                <span>{suggestion}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
      
      <div className="bg-blue-50 border border-blue-100 rounded-md p-3">
        <p className="text-sm text-blue-800">
          Your special instructions help us provide better service. Please include any details that would be helpful for the service provider.
        </p>
      </div>
    </div>
  );
};

export default SpecialInstructionsField;
