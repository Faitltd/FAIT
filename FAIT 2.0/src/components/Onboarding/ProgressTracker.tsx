import React from 'react';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { CheckCircle, Circle, AlertCircle } from 'lucide-react';

interface ProgressTrackerProps {
  showDetails?: boolean;
  className?: string;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  showDetails = true,
  className = '',
}) => {
  const { steps, status, isStepCompleted, loading, error } = useOnboarding();

  if (loading) {
    return (
      <div className={`flex justify-center items-center h-12 ${className}`}>
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-red-500 ${className}`}>
        <p>{error}</p>
      </div>
    );
  }

  if (!status) {
    return (
      <div className={`text-gray-500 ${className}`}>
        <p>No onboarding data available.</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-medium">Onboarding Progress</h3>
          <span className="text-sm font-medium text-blue-600">
            {status.percentComplete}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full"
            style={{ width: `${status.percentComplete}%` }}
          ></div>
        </div>
        <div className="mt-1 text-sm text-gray-500">
          {status.completedSteps} of {status.totalSteps} steps completed
          {status.requiredSteps > 0 && (
            <span> ({status.completedRequiredSteps} of {status.requiredSteps} required steps)</span>
          )}
        </div>
      </div>

      {/* Steps list */}
      {showDetails && (
        <div className="mt-6">
          <h4 className="text-md font-medium mb-3">Onboarding Steps</h4>
          <ul className="space-y-3">
            {steps.map((step) => {
              const completed = isStepCompleted(step.id);
              return (
                <li key={step.id} className="flex items-start">
                  <div className="flex-shrink-0 mt-0.5">
                    {completed ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : step.required ? (
                      <AlertCircle className="h-5 w-5 text-amber-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-300" />
                    )}
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${completed ? 'text-green-700' : 'text-gray-700'}`}>
                      {step.name}
                      {step.required && !completed && (
                        <span className="ml-2 text-xs font-medium text-amber-500">Required</span>
                      )}
                    </p>
                    {step.description && (
                      <p className="mt-1 text-sm text-gray-500">{step.description}</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Completion status */}
      {status.completed && (
        <div className="mt-6 p-4 bg-green-50 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Onboarding Complete</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>
                  You have completed all required onboarding steps.
                  {status.completedAt && (
                    <span className="block mt-1">
                      Completed on {new Date(status.completedAt).toLocaleDateString()}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressTracker;
