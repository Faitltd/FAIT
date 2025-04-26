import React, { useState, useEffect } from 'react';

interface ProfileData {
  full_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
}

interface ProfileStepProps {
  data: ProfileData;
  onChange: (data: ProfileData) => void;
}

/**
 * Profile step in the onboarding process
 */
const ProfileStep: React.FC<ProfileStepProps> = ({ data, onChange }) => {
  const [formData, setFormData] = useState<ProfileData>(data);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  useEffect(() => {
    setFormData(data);
  }, [data]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    
    if (!formData.full_name?.trim()) {
      newErrors.full_name = 'Full name is required';
    }
    
    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    
    if (!formData.phone?.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    
    if (!formData.address?.trim()) {
      newErrors.address = 'Address is required';
    }
    
    if (!formData.city?.trim()) {
      newErrors.city = 'City is required';
    }
    
    if (!formData.state?.trim()) {
      newErrors.state = 'State is required';
    }
    
    if (!formData.zip_code?.trim()) {
      newErrors.zip_code = 'ZIP code is required';
    }
    
    setErrors(newErrors);
    
    return Object.keys(newErrors).length === 0;
  };
  
  const handleBlur = () => {
    // Validate and update parent component
    if (validateForm()) {
      onChange(formData);
    }
  };
  
  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
      <p className="mt-1 text-sm text-gray-600">
        This information will be used to contact you and display on your profile.
      </p>
      
      <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
        <div className="sm:col-span-6">
          <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
            Full Name
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="full_name"
              id="full_name"
              value={formData.full_name || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                errors.full_name ? 'border-red-300' : ''
              }`}
            />
            {errors.full_name && (
              <p className="mt-2 text-sm text-red-600">{errors.full_name}</p>
            )}
          </div>
        </div>
        
        <div className="sm:col-span-3">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email Address
          </label>
          <div className="mt-1">
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                errors.email ? 'border-red-300' : ''
              }`}
            />
            {errors.email && (
              <p className="mt-2 text-sm text-red-600">{errors.email}</p>
            )}
          </div>
        </div>
        
        <div className="sm:col-span-3">
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Phone Number
          </label>
          <div className="mt-1">
            <input
              type="tel"
              name="phone"
              id="phone"
              value={formData.phone || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                errors.phone ? 'border-red-300' : ''
              }`}
            />
            {errors.phone && (
              <p className="mt-2 text-sm text-red-600">{errors.phone}</p>
            )}
          </div>
        </div>
        
        <div className="sm:col-span-6">
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">
            Street Address
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="address"
              id="address"
              value={formData.address || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                errors.address ? 'border-red-300' : ''
              }`}
            />
            {errors.address && (
              <p className="mt-2 text-sm text-red-600">{errors.address}</p>
            )}
          </div>
        </div>
        
        <div className="sm:col-span-2">
          <label htmlFor="city" className="block text-sm font-medium text-gray-700">
            City
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="city"
              id="city"
              value={formData.city || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                errors.city ? 'border-red-300' : ''
              }`}
            />
            {errors.city && (
              <p className="mt-2 text-sm text-red-600">{errors.city}</p>
            )}
          </div>
        </div>
        
        <div className="sm:col-span-2">
          <label htmlFor="state" className="block text-sm font-medium text-gray-700">
            State
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="state"
              id="state"
              value={formData.state || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                errors.state ? 'border-red-300' : ''
              }`}
            />
            {errors.state && (
              <p className="mt-2 text-sm text-red-600">{errors.state}</p>
            )}
          </div>
        </div>
        
        <div className="sm:col-span-2">
          <label htmlFor="zip_code" className="block text-sm font-medium text-gray-700">
            ZIP Code
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="zip_code"
              id="zip_code"
              value={formData.zip_code || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                errors.zip_code ? 'border-red-300' : ''
              }`}
            />
            {errors.zip_code && (
              <p className="mt-2 text-sm text-red-600">{errors.zip_code}</p>
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
              Your contact information will be visible to clients who book your services.
              Make sure it's accurate and up-to-date.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileStep;
