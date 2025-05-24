import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabaseClient';
import { validateProfile } from '../../../utils/ProfileValidator';
import LoadingSpinner from '../../LoadingSpinner';

// Import step components
import BasicInfoStep from './steps/BasicInfoStep';
import AddressStep from './steps/AddressStep';
import BusinessInfoStep from './steps/BusinessInfoStep';
import VerificationStep from './steps/VerificationStep';
import CompletionStep from './steps/CompletionStep';

// Import wizard navigation
import WizardNavigation from './WizardNavigation';
import WizardProgress from './WizardProgress';

interface ProfileSetupWizardProps {
  onComplete?: () => void;
}

/**
 * A step-by-step wizard for new users to complete their profiles
 */
const ProfileSetupWizard: React.FC<ProfileSetupWizardProps> = ({ onComplete }) => {
  const { user, profile: authProfile } = useAuth();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  
  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Use existing profile from auth context if available
        if (authProfile) {
          setProfile(authProfile);
          
          // Determine which steps are already completed
          const completed: number[] = [];
          
          // Step 0: Basic Info
          if (authProfile.full_name && authProfile.email && authProfile.phone) {
            completed.push(0);
          }
          
          // Step 1: Address
          if (authProfile.address && authProfile.city && authProfile.state && authProfile.zip_code) {
            completed.push(1);
          }
          
          // Step 2: Business Info (for service agents only)
          if (authProfile.user_type !== 'service_agent' || 
              (authProfile.business_name && authProfile.license_number)) {
            completed.push(2);
          }
          
          // Step 3: Verification (for service agents only)
          if (authProfile.user_type !== 'service_agent' || authProfile.verification_submitted) {
            completed.push(3);
          }
          
          setCompletedSteps(completed);
          
          // Set the current step to the first incomplete step
          for (let i = 0; i <= 4; i++) {
            if (!completed.includes(i)) {
              setCurrentStep(i);
              break;
            }
          }
          
          return;
        }
        
        // Otherwise fetch from database
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        
        setProfile(data);
        
        // Determine which steps are already completed
        const completed: number[] = [];
        
        // Step 0: Basic Info
        if (data.full_name && data.email && data.phone) {
          completed.push(0);
        }
        
        // Step 1: Address
        if (data.address && data.city && data.state && data.zip_code) {
          completed.push(1);
        }
        
        // Step 2: Business Info (for service agents only)
        if (data.user_type !== 'service_agent' || 
            (data.business_name && data.license_number)) {
          completed.push(2);
        }
        
        // Step 3: Verification (for service agents only)
        if (data.user_type !== 'service_agent' || data.verification_submitted) {
          completed.push(3);
        }
        
        setCompletedSteps(completed);
        
        // Set the current step to the first incomplete step
        for (let i = 0; i <= 4; i++) {
          if (!completed.includes(i)) {
            setCurrentStep(i);
            break;
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [user, authProfile]);
  
  // Handle form field changes
  const handleChange = (name: string, value: any) => {
    setProfile(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Handle step navigation
  const goToNextStep = async () => {
    // Validate current step
    let isValid = true;
    const newErrors: Record<string, string> = {};
    
    switch (currentStep) {
      case 0: // Basic Info
        if (!profile.full_name) {
          newErrors.full_name = 'Full name is required';
          isValid = false;
        }
        if (!profile.email) {
          newErrors.email = 'Email is required';
          isValid = false;
        }
        if (!profile.phone) {
          newErrors.phone = 'Phone number is required';
          isValid = false;
        }
        break;
      
      case 1: // Address
        if (!profile.address) {
          newErrors.address = 'Address is required';
          isValid = false;
        }
        if (!profile.city) {
          newErrors.city = 'City is required';
          isValid = false;
        }
        if (!profile.state) {
          newErrors.state = 'State is required';
          isValid = false;
        }
        if (!profile.zip_code) {
          newErrors.zip_code = 'ZIP code is required';
          isValid = false;
        }
        break;
      
      case 2: // Business Info (for service agents only)
        if (profile.user_type === 'service_agent') {
          if (!profile.business_name) {
            newErrors.business_name = 'Business name is required';
            isValid = false;
          }
          if (!profile.license_number) {
            newErrors.license_number = 'License number is required';
            isValid = false;
          }
        }
        break;
      
      case 3: // Verification (for service agents only)
        // No validation needed, just mark as submitted
        if (profile.user_type === 'service_agent') {
          handleChange('verification_submitted', true);
        }
        break;
    }
    
    if (!isValid) {
      setErrors(newErrors);
      return;
    }
    
    // Save progress
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('profiles')
        .update(profile)
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Mark step as completed
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps(prev => [...prev, currentStep]);
      }
      
      // Move to next step
      setCurrentStep(prev => prev + 1);
    } catch (error) {
      console.error('Error saving profile:', error);
      setErrors({ _general: 'Failed to save profile. Please try again.' });
    } finally {
      setSaving(false);
    }
  };
  
  const goToPreviousStep = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };
  
  const goToStep = (step: number) => {
    // Only allow going to completed steps or the current step
    if (completedSteps.includes(step) || step === currentStep) {
      setCurrentStep(step);
    }
  };
  
  // Handle wizard completion
  const handleComplete = async () => {
    try {
      setSaving(true);
      
      // Validate the entire profile
      const validation = validateProfile(profile);
      if (!validation.success) {
        setErrors(validation.errors || {});
        return;
      }
      
      // Update profile with completion status
      const { error } = await supabase
        .from('profiles')
        .update({
          ...profile,
          profile_completed: true,
          profile_completed_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Call onComplete callback if provided
      if (onComplete) {
        onComplete();
      } else {
        // Navigate to dashboard
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error completing profile setup:', error);
      setErrors({ _general: 'Failed to complete profile setup. Please try again.' });
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }
  
  if (!profile) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">Failed to load profile. Please try again.</p>
        <button
          onClick={() => navigate(0)}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Reload
        </button>
      </div>
    );
  }
  
  // Define the steps
  const steps = [
    { title: 'Basic Info', description: 'Your personal information' },
    { title: 'Address', description: 'Where you are located' },
    { title: 'Business Info', description: 'Your business details', skipFor: ['client', 'admin'] },
    { title: 'Verification', description: 'Verify your credentials', skipFor: ['client', 'admin'] },
    { title: 'Complete', description: 'Review and finish' }
  ];
  
  // Filter steps based on user type
  const filteredSteps = steps.filter(step => 
    !step.skipFor || !step.skipFor.includes(profile.user_type)
  );
  
  // Render the current step
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <BasicInfoStep
            profile={profile}
            onChange={handleChange}
            errors={errors}
          />
        );
      case 1:
        return (
          <AddressStep
            profile={profile}
            onChange={handleChange}
            errors={errors}
          />
        );
      case 2:
        // Skip business info step for non-service agents
        if (profile.user_type !== 'service_agent') {
          setCurrentStep(3);
          return null;
        }
        return (
          <BusinessInfoStep
            profile={profile}
            onChange={handleChange}
            errors={errors}
          />
        );
      case 3:
        // Skip verification step for non-service agents
        if (profile.user_type !== 'service_agent') {
          setCurrentStep(4);
          return null;
        }
        return (
          <VerificationStep
            profile={profile}
            onChange={handleChange}
            errors={errors}
          />
        );
      case 4:
        return (
          <CompletionStep
            profile={profile}
            onComplete={handleComplete}
            saving={saving}
          />
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Complete Your Profile</h2>
          <p className="mt-1 text-sm text-gray-600">
            Please complete the following steps to set up your profile.
          </p>
        </div>
        
        <WizardProgress
          steps={filteredSteps}
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepClick={goToStep}
        />
        
        {errors._general && (
          <div className="px-6 py-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700">{errors._general}</p>
            </div>
          </div>
        )}
        
        <div className="px-6 py-4">
          {renderStep()}
        </div>
        
        <WizardNavigation
          currentStep={currentStep}
          totalSteps={filteredSteps.length}
          onNext={goToNextStep}
          onPrevious={goToPreviousStep}
          onComplete={handleComplete}
          saving={saving}
          isLastStep={currentStep === filteredSteps.length - 1}
        />
      </div>
    </div>
  );
};

export default ProfileSetupWizard;
