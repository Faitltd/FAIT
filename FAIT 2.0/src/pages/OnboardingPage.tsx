import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useOnboarding } from '../contexts/OnboardingContext';
import ProgressTracker from '../components/Onboarding/ProgressTracker';
import { CheckCircle, Circle, AlertCircle, ArrowRight } from 'lucide-react';

const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  const { steps, status, completeStep, isStepCompleted, loading } = useOnboarding();
  const [activeStep, setActiveStep] = useState<string | null>(null);
  const [processingStep, setProcessingStep] = useState<string | null>(null);

  // Find the next incomplete required step
  const findNextStep = () => {
    if (!steps || !steps.length) return null;
    
    // First, look for required steps that aren't completed
    const nextRequiredStep = steps
      .filter(step => step.required && !isStepCompleted(step.id))
      .sort((a, b) => a.order_index - b.order_index)[0];
      
    if (nextRequiredStep) return nextRequiredStep;
    
    // If all required steps are done, look for optional steps
    const nextOptionalStep = steps
      .filter(step => !step.required && !isStepCompleted(step.id))
      .sort((a, b) => a.order_index - b.order_index)[0];
      
    return nextOptionalStep || null;
  };
  
  const nextStep = findNextStep();

  // Handle step click
  const handleStepClick = (stepId: string) => {
    setActiveStep(activeStep === stepId ? null : stepId);
  };

  // Mark a step as complete
  const handleCompleteStep = async (stepId: string) => {
    setProcessingStep(stepId);
    try {
      await completeStep(stepId);
      setActiveStep(null);
    } catch (error) {
      console.error('Error completing step:', error);
    } finally {
      setProcessingStep(null);
    }
  };

  // Navigate to a specific step
  const navigateToStep = (stepId: string) => {
    const step = steps.find(s => s.id === stepId);
    if (!step) return;
    
    // In a real implementation, we would navigate to the appropriate page
    // based on the step name or ID. For now, we'll just simulate this.
    switch (step.name) {
      case 'Complete Profile':
        navigate('/profile/edit');
        break;
      case 'Verify Email':
        navigate('/verify-email');
        break;
      case 'Add Profile Photo':
        navigate('/profile/photo');
        break;
      case 'Add Payment Method':
        navigate('/payment/methods');
        break;
      case 'Verify Identity':
        navigate('/verification/identity');
        break;
      case 'Upload License':
        navigate('/verification/license');
        break;
      case 'Add Insurance':
        navigate('/verification/insurance');
        break;
      case 'Create Service Listings':
        navigate('/services/create');
        break;
      case 'Set Availability':
        navigate('/availability');
        break;
      case 'Sign Membership Agreement':
        navigate('/documents/membership-agreement');
        break;
      case 'Complete Orientation':
        navigate('/orientation');
        break;
      default:
        // For demo purposes, just mark the step as complete
        handleCompleteStep(stepId);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome to FAIT Co-op</h1>
        <p className="mt-2 text-lg text-gray-600">
          Let's get you set up with your {userRole} account. Follow these steps to complete your onboarding.
        </p>
      </div>

      {/* Progress tracker */}
      <div className="mb-10">
        <ProgressTracker showDetails={false} />
      </div>

      {/* Next step prompt */}
      {nextStep && (
        <div className="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-100">
          <h2 className="text-xl font-semibold text-blue-800 mb-2">Next Step: {nextStep.name}</h2>
          <p className="text-blue-700 mb-4">{nextStep.description}</p>
          <button
            onClick={() => navigateToStep(nextStep.id)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Continue <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </div>
      )}

      {/* All steps */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {steps.map((step) => {
            const isCompleted = isStepCompleted(step.id);
            const isActive = activeStep === step.id;
            
            return (
              <li key={step.id}>
                <div 
                  className={`px-4 py-4 sm:px-6 ${isActive ? 'bg-gray-50' : ''} ${isCompleted ? 'bg-green-50' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => handleStepClick(step.id)}
                      className="flex items-center text-left w-full"
                    >
                      <div className="flex-shrink-0 mr-3">
                        {isCompleted ? (
                          <CheckCircle className="h-6 w-6 text-green-500" />
                        ) : step.required ? (
                          <AlertCircle className="h-6 w-6 text-amber-500" />
                        ) : (
                          <Circle className="h-6 w-6 text-gray-300" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className={`text-lg font-medium ${isCompleted ? 'text-green-800' : 'text-gray-800'}`}>
                          {step.name}
                          {step.required && !isCompleted && (
                            <span className="ml-2 text-xs font-medium text-amber-500 align-middle">Required</span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">{step.description}</p>
                      </div>
                      <div className="ml-5 flex-shrink-0">
                        {isCompleted ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Completed
                          </span>
                        ) : (
                          <span className="text-gray-400">
                            <ArrowRight className="h-5 w-5" />
                          </span>
                        )}
                      </div>
                    </button>
                  </div>
                  
                  {/* Expanded content when step is active */}
                  {isActive && !isCompleted && (
                    <div className="mt-4 border-t border-gray-200 pt-4">
                      <p className="text-sm text-gray-600 mb-4">
                        {step.description}
                      </p>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => navigateToStep(step.id)}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          disabled={processingStep === step.id}
                        >
                          {processingStep === step.id ? 'Processing...' : 'Complete This Step'}
                        </button>
                        <button
                          onClick={() => setActiveStep(null)}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Completion message */}
      {status?.completed && (
        <div className="mt-8 p-6 bg-green-50 rounded-lg border border-green-100">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-xl font-medium text-green-800">Onboarding Complete!</h3>
              <div className="mt-2 text-base text-green-700">
                <p>
                  Congratulations! You have completed all required onboarding steps.
                  You now have full access to the FAIT Co-op platform.
                </p>
                <div className="mt-4">
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Go to Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingPage;
