import React, { useState, useEffect } from 'react';

interface BusinessData {
  name?: string;
  description?: string;
  website?: string;
  yearEstablished?: string;
}

interface BusinessStepProps {
  data: BusinessData;
  onChange: (data: BusinessData) => void;
}

/**
 * Business step in the onboarding process
 */
const BusinessStep: React.FC<BusinessStepProps> = ({ data, onChange }) => {
  const [formData, setFormData] = useState<BusinessData>(data);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  useEffect(() => {
    setFormData(data);
  }, [data]);
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name?.trim()) {
      newErrors.name = 'Business name is required';
    }
    
    if (!formData.description?.trim()) {
      newErrors.description = 'Business description is required';
    }
    
    if (formData.website && !isValidUrl(formData.website)) {
      newErrors.website = 'Please enter a valid URL';
    }
    
    if (formData.yearEstablished) {
      const year = parseInt(formData.yearEstablished);
      const currentYear = new Date().getFullYear();
      
      if (isNaN(year) || year < 1900 || year > currentYear) {
        newErrors.yearEstablished = `Please enter a valid year between 1900 and ${currentYear}`;
      }
    }
    
    setErrors(newErrors);
    
    return Object.keys(newErrors).length === 0;
  };
  
  const isValidUrl = (url: string): boolean => {
    try {
      // Add http:// if missing
      const urlWithProtocol = url.startsWith('http') ? url : `http://${url}`;
      new URL(urlWithProtocol);
      return true;
    } catch (e) {
      return false;
    }
  };
  
  const handleBlur = () => {
    // Validate and update parent component
    if (validateForm()) {
      onChange(formData);
    }
  };
  
  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900">Business Information</h3>
      <p className="mt-1 text-sm text-gray-600">
        Tell us about your business so clients can learn more about your services.
      </p>
      
      <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
        <div className="sm:col-span-6">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Business Name
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                errors.name ? 'border-red-300' : ''
              }`}
            />
            {errors.name && (
              <p className="mt-2 text-sm text-red-600">{errors.name}</p>
            )}
          </div>
        </div>
        
        <div className="sm:col-span-6">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Business Description
          </label>
          <div className="mt-1">
            <textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                errors.description ? 'border-red-300' : ''
              }`}
              placeholder="Describe your business, services, and expertise..."
            />
            {errors.description && (
              <p className="mt-2 text-sm text-red-600">{errors.description}</p>
            )}
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Write a few sentences about your business, your expertise, and what makes your services unique.
          </p>
        </div>
        
        <div className="sm:col-span-4">
          <label htmlFor="website" className="block text-sm font-medium text-gray-700">
            Website (optional)
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="website"
              id="website"
              value={formData.website || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                errors.website ? 'border-red-300' : ''
              }`}
              placeholder="www.example.com"
            />
            {errors.website && (
              <p className="mt-2 text-sm text-red-600">{errors.website}</p>
            )}
          </div>
        </div>
        
        <div className="sm:col-span-2">
          <label htmlFor="yearEstablished" className="block text-sm font-medium text-gray-700">
            Year Established (optional)
          </label>
          <div className="mt-1">
            <input
              type="number"
              name="yearEstablished"
              id="yearEstablished"
              value={formData.yearEstablished || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              min="1900"
              max={new Date().getFullYear()}
              className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                errors.yearEstablished ? 'border-red-300' : ''
              }`}
              placeholder={new Date().getFullYear().toString()}
            />
            {errors.yearEstablished && (
              <p className="mt-2 text-sm text-red-600">{errors.yearEstablished}</p>
            )}
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
              A complete business profile helps build trust with potential clients.
              Be sure to highlight your expertise and what makes your services stand out.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessStep;
