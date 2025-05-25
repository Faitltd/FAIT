import React from 'react';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { calculateProfileCompletion, getMissingRequiredFields } from '../../utils/ProfileValidator';

interface ProfileCompletionTrackerProps {
  profile: any;
  className?: string;
}

/**
 * Component to track and display profile completion status
 */
const ProfileCompletionTracker: React.FC<ProfileCompletionTrackerProps> = ({ profile, className = '' }) => {
  const completionPercentage = calculateProfileCompletion(profile);
  const missingFields = getMissingRequiredFields(profile);
  
  // Determine status color based on completion percentage
  const getStatusColor = () => {
    if (completionPercentage < 50) return 'text-red-600';
    if (completionPercentage < 80) return 'text-yellow-600';
    return 'text-green-600';
  };
  
  // Determine background color based on completion percentage
  const getBackgroundColor = () => {
    if (completionPercentage < 50) return 'bg-red-100';
    if (completionPercentage < 80) return 'bg-yellow-100';
    return 'bg-green-100';
  };
  
  // Determine icon based on completion percentage
  const StatusIcon = () => {
    if (completionPercentage < 50) return <AlertTriangle className="h-5 w-5 text-red-600" />;
    if (completionPercentage < 80) return <Info className="h-5 w-5 text-yellow-600" />;
    return <CheckCircle className="h-5 w-5 text-green-600" />;
  };
  
  return (
    <div className={`rounded-lg overflow-hidden shadow-sm ${className}`}>
      <div className="p-4 bg-white">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-medium text-gray-900">Profile Completion</h3>
          <span className={`text-lg font-semibold ${getStatusColor()}`}>{completionPercentage}%</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className={`h-2.5 rounded-full ${getBackgroundColor()}`} 
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
        
        {missingFields.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center">
              <StatusIcon />
              <h4 className="ml-2 text-sm font-medium text-gray-700">
                {missingFields.length === 1 
                  ? '1 required field is missing' 
                  : `${missingFields.length} required fields are missing`}
              </h4>
            </div>
            <ul className="mt-2 pl-6 text-sm text-gray-600 list-disc">
              {missingFields.map((field, index) => (
                <li key={index}>{field}</li>
              ))}
            </ul>
          </div>
        )}
        
        {missingFields.length === 0 && completionPercentage < 100 && (
          <div className="mt-4 flex items-start">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="ml-2 text-sm text-blue-700">
              Your profile is looking good! Consider adding more details to complete your profile.
            </p>
          </div>
        )}
        
        {completionPercentage === 100 && (
          <div className="mt-4 flex items-start">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <p className="ml-2 text-sm text-green-700">
              Congratulations! Your profile is complete.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileCompletionTracker;
