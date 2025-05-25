import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { onboardingService } from '../../services/OnboardingService';
import { OnboardingStep } from '../../types/verification.types';

// Import step components
import WelcomeStep from './steps/WelcomeStep';
import ProfileStep from './steps/ProfileStep';
import BusinessStep from './steps/BusinessStep';
import ServicesStep from './steps/ServicesStep';
import VerificationStep from './steps/VerificationStep';
import BackgroundCheckStep from './steps/BackgroundCheckStep';
import CompletionStep from './steps/CompletionStep';

// Import navigation components
import OnboardingProgress from './OnboardingProgress';
import OnboardingNavigation from './OnboardingNavigation';

/**
 * Service agent onboarding wizard
 */
const ServiceAgentOnboarding: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(OnboardingStep.WELCOME);
  const [completedSteps, setCompletedSteps] = useState<OnboardingStep[]>([]);
  const [onboardingData, setOnboardingData] = useState({
    profile: {},
    business: {},
    services: [],
    verification: {
      documents: []
    },
    backgroundCheck: {
      agreed: false,
      completed: false
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Define steps
  const steps = [
    { id: OnboardingStep.WELCOME, title: 'Welcome', description: 'Get started with FAIT Co-op' },
    { id: OnboardingStep.PROFILE, title: 'Profile', description: 'Your personal information' },
    { id: OnboardingStep.BUSINESS, title: 'Business', description: 'Your business details' },
    { id: OnboardingStep.SERVICES, title: 'Services', description: 'What you offer' },
    { id: OnboardingStep.VERIFICATION, title: 'Verification', description: 'Verify your credentials' },
    { id: OnboardingStep.BACKGROUND_CHECK, title: 'Background Check', description: 'Security verification' },
    { id: OnboardingStep.COMPLETION, title: 'Complete', description: 'Review and finish' }
  ];
  
  // Load existing data
  useEffect(() => {
    const loadOnboardingData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Get onboarding progress
        const progress = await onboardingService.getOnboardingProgress(user.id);
        
        if (progress) {
          setCurrentStep(progress.current_step as OnboardingStep);
          setCompletedSteps(progress.completed_steps as OnboardingStep[]);
        }
        
        // Load profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profileError) throw profileError;
        
        // Load service packages
        const { data: servicesData, error: servicesError } = await supabase
          .from('service_packages')
          .select('*')
          .eq('contractor_id', user.id);
        
        if (servicesError) throw servicesError;
        
        setOnboardingData({
          profile: profileData || {},
          business: {
            name: profileData?.business_name || '',
            description: profileData?.business_description || '',
            website: profileData?.website || '',
            yearEstablished: profileData?.year_established || ''
          },
          services: servicesData || [],
          verification: {
            documents: []
          },
          backgroundCheck: {
            agreed: false,
            completed: false
          }
        });
      } catch (error) {
        console.error('Error loading onboarding data:', error);
        setError('Failed to load your information. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    loadOnboardingData();
  }, [user]);
  
  // Handle step navigation
  const goToNextStep = async () => {
    if (!user) return;
    
    // Save current step data
    await saveCurrentStep();
    
    // Mark current step as completed
    if (!completedSteps.includes(currentStep)) {
      const updatedCompletedSteps = [...completedSteps, currentStep];
      setCompletedSteps(updatedCompletedSteps);
      
      // Update in database
      await onboardingService.completeStep(user.id, currentStep);
    }
    
    // Find next step
    const currentIndex = steps.findIndex(step => step.id === currentStep);
    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1].id;
      setCurrentStep(nextStep);
      
      // Update in database
      await onboardingService.updateCurrentStep(user.id, nextStep);
    }
  };
  
  const goToPreviousStep = async () => {
    if (!user) return;
    
    // Find previous step
    const currentIndex = steps.findIndex(step => step.id === currentStep);
    if (currentIndex > 0) {
      const previousStep = steps[currentIndex - 1].id;
      setCurrentStep(previousStep);
      
      // Update in database
      await onboardingService.updateCurrentStep(user.id, previousStep);
    }
  };
  
  const goToStep = async (step: OnboardingStep) => {
    if (!user) return;
    
    // Only allow navigation to completed steps or the next incomplete step
    if (completedSteps.includes(step) || step === currentStep) {
      setCurrentStep(step);
      
      // Update in database
      await onboardingService.updateCurrentStep(user.id, step);
    }
  };
  
  // Save current step data
  const saveCurrentStep = async () => {
    if (!user) return;
    
    try {
      setSaving(true);
      setError(null);
      
      switch (currentStep) {
        case OnboardingStep.PROFILE:
          await supabase
            .from('profiles')
            .update({
              full_name: onboardingData.profile.full_name,
              email: onboardingData.profile.email,
              phone: onboardingData.profile.phone,
              address: onboardingData.profile.address,
              city: onboardingData.profile.city,
              state: onboardingData.profile.state,
              zip_code: onboardingData.profile.zip_code
            })
            .eq('id', user.id);
          break;
          
        case OnboardingStep.BUSINESS:
          await supabase
            .from('profiles')
            .update({
              business_name: onboardingData.business.name,
              business_description: onboardingData.business.description,
              website: onboardingData.business.website,
              year_established: onboardingData.business.yearEstablished
            })
            .eq('id', user.id);
          break;
          
        // Handle other steps...
      }
    } catch (error) {
      console.error('Error saving step data:', error);
      setError('Failed to save your information. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  // Handle data changes
  const updateOnboardingData = (section: string, data: any) => {
    setOnboardingData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        ...data
      }
    }));
  };
  
  // Complete onboarding
  const completeOnboarding = async () => {
    if (!user) return;
    
    try {
      setSaving(true);
      
      // Mark onboarding as completed
      await onboardingService.completeOnboarding(user.id);
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      setError('Failed to complete onboarding. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case OnboardingStep.WELCOME:
        return (
          <WelcomeStep
            onContinue={goToNextStep}
          />
        );
      case OnboardingStep.PROFILE:
        return (
          <ProfileStep
            data={onboardingData.profile}
            onChange={(data) => updateOnboardingData('profile', data)}
          />
        );
      case OnboardingStep.BUSINESS:
        return (
          <BusinessStep
            data={onboardingData.business}
            onChange={(data) => updateOnboardingData('business', data)}
          />
        );
      case OnboardingStep.SERVICES:
        return (
          <ServicesStep
            data={onboardingData.services}
            onChange={(data) => updateOnboardingData('services', data)}
          />
        );
      case OnboardingStep.VERIFICATION:
        return (
          <VerificationStep
            data={onboardingData.verification}
            onChange={(data) => updateOnboardingData('verification', data)}
          />
        );
      case OnboardingStep.BACKGROUND_CHECK:
        return (
          <BackgroundCheckStep
            data={onboardingData.backgroundCheck}
            onChange={(data) => updateOnboardingData('backgroundCheck', data)}
          />
        );
      case OnboardingStep.COMPLETION:
        return (
          <CompletionStep
            data={onboardingData}
            onComplete={completeOnboarding}
          />
        );
      default:
        return null;
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Service Agent Onboarding</h2>
          <p className="mt-1 text-sm text-gray-600">
            Complete these steps to set up your service agent profile and start receiving bookings.
          </p>
        </div>
        
        <OnboardingProgress
          steps={steps}
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepClick={goToStep}
        />
        
        {error && (
          <div className="px-6 py-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}
        
        <div className="px-6 py-6">
          {renderStep()}
        </div>
        
        {currentStep !== OnboardingStep.WELCOME && currentStep !== OnboardingStep.COMPLETION && (
          <OnboardingNavigation
            currentStep={currentStep}
            totalSteps={steps.length}
            onNext={goToNextStep}
            onPrevious={goToPreviousStep}
            isLastStep={currentStep === OnboardingStep.COMPLETION}
            saving={saving}
          />
        )}
      </div>
    </div>
  );
};

export default ServiceAgentOnboarding;
