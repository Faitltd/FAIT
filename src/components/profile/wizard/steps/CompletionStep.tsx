import React from 'react';
import { CheckCircle, User, MapPin, Briefcase, Shield } from 'lucide-react';
import { calculateProfileCompletion } from '../../../../utils/ProfileValidator';
import LoadingSpinner from '../../../LoadingSpinner';

interface CompletionStepProps {
  profile: any;
  onComplete: () => void;
  saving: boolean;
}

/**
 * Final completion step in the profile setup wizard
 */
const CompletionStep: React.FC<CompletionStepProps> = ({ profile, onComplete, saving }) => {
  const completionPercentage = calculateProfileCompletion(profile);
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
        <h3 className="mt-2 text-lg font-medium text-gray-900">Profile Setup Complete!</h3>
        <p className="mt-1 text-sm text-gray-600">
          Your profile is {completionPercentage}% complete. You can always update your information later.
        </p>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Profile Summary</h4>
        
        <div className="space-y-4">
          {/* Basic Info */}
          <div className="flex items-start">
            <User className="h-5 w-5 text-gray-500 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="text-sm font-medium text-gray-700">Basic Information</h5>
              <p className="text-sm text-gray-600">
                {profile.full_name}
                {profile.email && ` • ${profile.email}`}
                {profile.phone && ` • ${profile.phone}`}
              </p>
            </div>
          </div>
          
          {/* Address */}
          <div className="flex items-start">
            <MapPin className="h-5 w-5 text-gray-500 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="text-sm font-medium text-gray-700">Address</h5>
              <p className="text-sm text-gray-600">
                {profile.address}
                {profile.city && `, ${profile.city}`}
                {profile.state && `, ${profile.state}`}
                {profile.zip_code && ` ${profile.zip_code}`}
              </p>
            </div>
          </div>
          
          {/* Business Info (for service agents only) */}
          {profile.user_type === 'service_agent' && (
            <div className="flex items-start">
              <Briefcase className="h-5 w-5 text-gray-500 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="text-sm font-medium text-gray-700">Business Information</h5>
                <p className="text-sm text-gray-600">
                  {profile.business_name}
                  {profile.license_type && ` • ${profile.license_type}`}
                  {profile.license_number && ` • License #${profile.license_number}`}
                </p>
              </div>
            </div>
          )}
          
          {/* Verification Status (for service agents only) */}
          {profile.user_type === 'service_agent' && (
            <div className="flex items-start">
              <Shield className="h-5 w-5 text-gray-500 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="text-sm font-medium text-gray-700">Verification Status</h5>
                <p className="text-sm text-gray-600">
                  {profile.verification_submitted
                    ? 'Verification documents submitted. Pending review.'
                    : 'Verification not started.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <h4 className="text-sm font-medium text-blue-800">What's Next?</h4>
        <ul className="mt-2 pl-5 text-sm text-blue-700 list-disc space-y-1">
          {profile.user_type === 'client' && (
            <>
              <li>Browse available services in your area</li>
              <li>Book services from verified service agents</li>
              <li>Manage your bookings and leave reviews</li>
            </>
          )}
          {profile.user_type === 'service_agent' && (
            <>
              <li>Create service listings to showcase your offerings</li>
              <li>Set your availability for bookings</li>
              <li>Manage incoming booking requests</li>
              <li>Complete your verification process (if not already done)</li>
            </>
          )}
          <li>Update your profile information at any time</li>
        </ul>
      </div>
      
      <div className="flex justify-center">
        <button
          type="button"
          onClick={onComplete}
          disabled={saving}
          className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 flex items-center"
        >
          {saving ? (
            <>
              <LoadingSpinner size="small" className="mr-2" />
              Completing...
            </>
          ) : (
            'Go to Dashboard'
          )}
        </button>
      </div>
    </div>
  );
};

export default CompletionStep;
