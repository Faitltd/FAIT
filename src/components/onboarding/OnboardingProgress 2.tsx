import React from 'react';
import { OnboardingStep } from '../../types/verification.types';

interface OnboardingProgressProps {
  steps: {
    id: OnboardingStep;
    title: string;
    description: string;
  }[];
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  onStepClick: (step: OnboardingStep) => void;
}

/**
 * Component to display onboarding progress
 */
const OnboardingProgress: React.FC<OnboardingProgressProps> = ({
  steps,
  currentStep,
  completedSteps,
  onStepClick
}) => {
  return (
    <div className="px-6 py-4 border-b border-gray-200">
      <nav aria-label="Progress">
        <ol className="space-y-4 md:flex md:space-y-0 md:space-x-8">
          {steps.map((step) => {
            const isCurrentStep = step.id === currentStep;
            const isCompleted = completedSteps.includes(step.id);
            
            return (
              <li key={step.id} className="md:flex-1">
                <button
                  onClick={() => onStepClick(step.id)}
                  className={`group flex flex-col py-2 px-4 w-full ${
                    isCompleted || isCurrentStep
                      ? 'cursor-pointer'
                      : 'cursor-not-allowed opacity-50'
                  }`}
                  disabled={!isCompleted && !isCurrentStep}
                >
                  <span className="text-xs font-semibold tracking-wide uppercase">
                    {step.title}
                  </span>
                  <span className="text-sm font-medium">
                    {step.description}
                  </span>
                  <span
                    className={`mt-2 h-0.5 w-full ${
                      isCurrentStep
                        ? 'bg-blue-600'
                        : isCompleted
                        ? 'bg-green-600'
                        : 'bg-gray-200'
                    }`}
                  />
                </button>
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
};

export default OnboardingProgress;
