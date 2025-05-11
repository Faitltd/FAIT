import React from 'react';
import { Briefcase, Globe, FileText, Shield } from 'lucide-react';
import { isValidUrl, isValidTaxId, isValidLicenseNumber } from '../../../../utils/validators';

interface BusinessInfoStepProps {
  profile: any;
  onChange: (name: string, value: any) => void;
  errors: Record<string, string>;
}

/**
 * Business information step in the profile setup wizard (for service agents only)
 */
const BusinessInfoStep: React.FC<BusinessInfoStepProps> = ({ profile, onChange, errors }) => {
  // Skip this step if not a service agent
  if (profile.user_type !== 'service_agent') {
    return null;
  }
  
  // Validate website URL on blur
  const validateWebsite = (value: string) => {
    if (value && !isValidUrl(value)) {
      onChange('website_error', 'Please enter a valid URL (e.g., https://example.com)');
    } else {
      onChange('website_error', '');
    }
  };
  
  // Validate tax ID on blur
  const validateTaxId = (value: string) => {
    if (value && !isValidTaxId(value)) {
      onChange('tax_id_error', 'Please enter a valid Tax ID (e.g., 12-3456789 or 123456789)');
    } else {
      onChange('tax_id_error', '');
    }
  };
  
  // License types for dropdown
  const licenseTypes = [
    'General Contractor',
    'Plumber',
    'Electrician',
    'HVAC Technician',
    'Carpenter',
    'Painter',
    'Landscaper',
    'Roofer',
    'Handyman',
    'Other'
  ];
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Business Information</h3>
        <p className="mt-1 text-sm text-gray-600">
          Tell us about your business. This information helps build trust with clients.
        </p>
      </div>
      
      {/* Business Name */}
      <div>
        <label htmlFor="business_name" className="block text-sm font-medium text-gray-700">
          Business Name
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Briefcase className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            id="business_name"
            name="business_name"
            value={profile.business_name || ''}
            onChange={(e) => onChange('business_name', e.target.value)}
            className={`block w-full pl-10 pr-3 py-2 border ${
              errors.business_name ? 'border-red-300' : 'border-gray-300'
            } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            placeholder="Your Business Name"
          />
        </div>
        {errors.business_name && (
          <p className="mt-1 text-sm text-red-600">{errors.business_name}</p>
        )}
      </div>
      
      {/* Website */}
      <div>
        <label htmlFor="website" className="block text-sm font-medium text-gray-700">
          Website (Optional)
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Globe className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="url"
            id="website"
            name="website"
            value={profile.website || ''}
            onChange={(e) => onChange('website', e.target.value)}
            onBlur={(e) => validateWebsite(e.target.value)}
            className={`block w-full pl-10 pr-3 py-2 border ${
              errors.website || profile.website_error ? 'border-red-300' : 'border-gray-300'
            } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            placeholder="https://example.com"
          />
        </div>
        {(errors.website || profile.website_error) && (
          <p className="mt-1 text-sm text-red-600">
            {errors.website || profile.website_error}
          </p>
        )}
      </div>
      
      {/* License Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="license_type" className="block text-sm font-medium text-gray-700">
            License Type
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Shield className="h-5 w-5 text-gray-400" />
            </div>
            <select
              id="license_type"
              name="license_type"
              value={profile.license_type || ''}
              onChange={(e) => onChange('license_type', e.target.value)}
              className={`block w-full pl-10 pr-3 py-2 border ${
                errors.license_type ? 'border-red-300' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            >
              <option value="">Select a license type</option>
              {licenseTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          {errors.license_type && (
            <p className="mt-1 text-sm text-red-600">{errors.license_type}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="license_number" className="block text-sm font-medium text-gray-700">
            License Number
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FileText className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="license_number"
              name="license_number"
              value={profile.license_number || ''}
              onChange={(e) => onChange('license_number', e.target.value)}
              className={`block w-full pl-10 pr-3 py-2 border ${
                errors.license_number ? 'border-red-300' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              placeholder="License Number"
            />
          </div>
          {errors.license_number && (
            <p className="mt-1 text-sm text-red-600">{errors.license_number}</p>
          )}
        </div>
      </div>
      
      {/* Insurance Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="insurance_provider" className="block text-sm font-medium text-gray-700">
            Insurance Provider (Optional)
          </label>
          <input
            type="text"
            id="insurance_provider"
            name="insurance_provider"
            value={profile.insurance_provider || ''}
            onChange={(e) => onChange('insurance_provider', e.target.value)}
            className={`block w-full px-3 py-2 border ${
              errors.insurance_provider ? 'border-red-300' : 'border-gray-300'
            } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            placeholder="Insurance Provider"
          />
          {errors.insurance_provider && (
            <p className="mt-1 text-sm text-red-600">{errors.insurance_provider}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="insurance_policy_number" className="block text-sm font-medium text-gray-700">
            Insurance Policy Number (Optional)
          </label>
          <input
            type="text"
            id="insurance_policy_number"
            name="insurance_policy_number"
            value={profile.insurance_policy_number || ''}
            onChange={(e) => onChange('insurance_policy_number', e.target.value)}
            className={`block w-full px-3 py-2 border ${
              errors.insurance_policy_number ? 'border-red-300' : 'border-gray-300'
            } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            placeholder="Policy Number"
          />
          {errors.insurance_policy_number && (
            <p className="mt-1 text-sm text-red-600">{errors.insurance_policy_number}</p>
          )}
        </div>
      </div>
      
      {/* Tax ID */}
      <div>
        <label htmlFor="tax_id" className="block text-sm font-medium text-gray-700">
          Tax ID (EIN) (Optional)
        </label>
        <input
          type="text"
          id="tax_id"
          name="tax_id"
          value={profile.tax_id || ''}
          onChange={(e) => onChange('tax_id', e.target.value)}
          onBlur={(e) => validateTaxId(e.target.value)}
          className={`block w-full px-3 py-2 border ${
            errors.tax_id || profile.tax_id_error ? 'border-red-300' : 'border-gray-300'
          } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
          placeholder="XX-XXXXXXX"
        />
        {(errors.tax_id || profile.tax_id_error) && (
          <p className="mt-1 text-sm text-red-600">
            {errors.tax_id || profile.tax_id_error}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Your Tax ID is required for payment processing and tax reporting.
        </p>
      </div>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <p className="text-sm text-yellow-700">
          Your business information will be verified as part of our service agent verification process.
          Please ensure all information is accurate and up-to-date.
        </p>
      </div>
    </div>
  );
};

export default BusinessInfoStep;
