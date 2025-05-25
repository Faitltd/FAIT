import React from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import LoadingSpinner from '../../LoadingSpinner';

interface WizardNavigationProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious: () => void;
  onComplete: () => void;
  saving: boolean;
  isLastStep: boolean;
}

/**
 * Navigation buttons for the profile setup wizard
 */
const WizardNavigation: React.FC<WizardNavigationProps> = ({
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
  onComplete,
  saving,
  isLastStep
}) => {
  return (
    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
      <button
        type="button"
        onClick={onPrevious}
        disabled={currentStep === 0 || saving}
        className={`px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center ${
          currentStep === 0 ? 'invisible' : ''
        }`}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Previous
      </button>
      
      {isLastStep ? (
        <button
          type="button"
          onClick={onComplete}
          disabled={saving}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 flex items-center"
        >
          {saving ? (
            <>
              <LoadingSpinner size="small" className="mr-2" />
              Completing...
            </>
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" />
              Complete Setup
            </>
          )}
        </button>
      ) : (
        <button
          type="button"
          onClick={onNext}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center"
        >
          {saving ? (
            <>
              <LoadingSpinner size="small" className="mr-2" />
              Saving...
            </>
          ) : (
            <>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default WizardNavigation;
