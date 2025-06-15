import React from 'react';
import { CheckCircle } from 'lucide-react';

interface Step {
  title: string;
  description: string;
  skipFor?: string[];
}

interface WizardProgressProps {
  steps: Step[];
  currentStep: number;
  completedSteps: number[];
  onStepClick: (step: number) => void;
}

/**
 * Progress indicator for the profile setup wizard
 */
const WizardProgress: React.FC<WizardProgressProps> = ({
  steps,
  currentStep,
  completedSteps,
  onStepClick
}) => {
  return (
    <div className="px-6 py-4 border-b border-gray-200">
      <nav aria-label="Progress">
        <ol className="space-y-4 md:flex md:space-y-0 md:space-x-8">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.includes(index);
            const isCurrent = currentStep === index;
            
            return (
              <li key={index} className="md:flex-1">
                <button
                  type="button"
                  onClick={() => onStepClick(index)}
                  className={`group flex flex-col py-2 px-4 w-full ${
                    isCompleted || isCurrent
                      ? 'cursor-pointer'
                      : 'cursor-not-allowed opacity-50'
                  }`}
                  disabled={!isCompleted && !isCurrent}
                >
                  <span className="text-xs font-semibold tracking-wide uppercase">
                    Step {index + 1}
                  </span>
                  <span className="text-sm font-medium flex items-center">
                    {isCompleted && (
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    )}
                    {step.title}
                  </span>
                  <span className="text-xs text-gray-500">{step.description}</span>
                  
                  <span
                    className={`mt-0.5 h-0.5 w-full ${
                      isCompleted
                        ? 'bg-green-500'
                        : isCurrent
                        ? 'bg-blue-500'
                        : 'bg-gray-200'
                    }`}
                    aria-hidden="true"
                  ></span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
};

export default WizardProgress;
