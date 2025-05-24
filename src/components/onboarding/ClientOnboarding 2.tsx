import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

// Step components
import PersonalInfoStep from './steps/PersonalInfoStep';
import LocationStep from './steps/LocationStep';
import PreferencesStep from './steps/PreferencesStep';
import NotificationsStep from './steps/NotificationsStep';

const ClientOnboarding: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    preferences: [] as string[],
    notificationPreferences: {
      email: true,
      sms: false,
      push: false
    }
  });
  
  useEffect(() => {
    // Check if user is authenticated
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Check if onboarding is already completed
    const checkOnboardingStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('user_id', user.id)
          .single();
          
        if (error) throw error;
        
        if (data?.onboarding_completed) {
          navigate('/dashboard');
        }
      } catch (err) {
        console.error('Error checking onboarding status:', err);
      }
    };
    
    checkOnboardingStatus();
  }, [user, navigate]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    
    if (name.startsWith('notification-')) {
      const notificationType = name.replace('notification-', '');
      setFormData(prev => ({
        ...prev,
        notificationPreferences: {
          ...prev.notificationPreferences,
          [notificationType]: checked
        }
      }));
    }
  };
  
  const handlePreferenceToggle = (preference: string) => {
    setFormData(prev => {
      const preferences = [...prev.preferences];
      
      if (preferences.includes(preference)) {
        return {
          ...prev,
          preferences: preferences.filter(p => p !== preference)
        };
      } else {
        return {
          ...prev,
          preferences: [...preferences, preference]
        };
      }
    });
  };
  
  const handleNext = () => {
    // Validate current step
    if (currentStep === 1) {
      if (!formData.firstName || !formData.lastName || !formData.phone) {
        setError('Please fill in all required fields');
        return;
      }
    } else if (currentStep === 2) {
      if (!formData.address || !formData.city || !formData.state || !formData.zip) {
        setError('Please fill in all required fields');
        return;
      }
    } else if (currentStep === 3) {
      if (formData.preferences.length === 0) {
        setError('Please select at least one preference');
        return;
      }
    }
    
    setError(null);
    setCurrentStep(prev => prev + 1);
  };
  
  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
    setError(null);
  };
  
  const handleComplete = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Update user profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          first_name: formData.firstName,
          last_name: formData.lastName,
          full_name: `${formData.firstName} ${formData.lastName}`,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
          preferences: formData.preferences,
          notification_preferences: formData.notificationPreferences,
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);
        
      if (updateError) throw updateError;
      
      // Create onboarding progress record
      const { error: progressError } = await supabase
        .from('onboarding_progress')
        .insert({
          user_id: user.id,
          current_step: 'completed',
          completed_steps: ['personal_info', 'location', 'preferences', 'notifications'],
          is_completed: true,
          completed_at: new Date().toISOString()
        });
        
      if (progressError) throw progressError;
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Error completing onboarding:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while saving your information');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Welcome to FAIT Co-op</h1>
      
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map(step => (
            <div 
              key={step} 
              className={`flex items-center justify-center w-10 h-10 rounded-full ${
                currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}
            >
              {step}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-sm">
          <span>Personal Info</span>
          <span>Location</span>
          <span>Preferences</span>
          <span>Notifications</span>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      {/* Step content */}
      <div className="mb-6">
        {currentStep === 1 && (
          <PersonalInfoStep 
            formData={formData} 
            onChange={handleInputChange} 
          />
        )}
        
        {currentStep === 2 && (
          <LocationStep 
            formData={formData} 
            onChange={handleInputChange} 
          />
        )}
        
        {currentStep === 3 && (
          <PreferencesStep 
            selectedPreferences={formData.preferences} 
            onTogglePreference={handlePreferenceToggle} 
          />
        )}
        
        {currentStep === 4 && (
          <NotificationsStep 
            notificationPreferences={formData.notificationPreferences} 
            onChange={handleCheckboxChange} 
          />
        )}
      </div>
      
      {/* Navigation buttons */}
      <div className="flex justify-between">
        {currentStep > 1 ? (
          <button
            type="button"
            onClick={handleBack}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Back
          </button>
        ) : (
          <div></div>
        )}
        
        {currentStep < 4 ? (
          <button
            type="button"
            data-cy="onboarding-next"
            onClick={handleNext}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            data-cy="onboarding-complete"
            onClick={handleComplete}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Completing...' : 'Complete Setup'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ClientOnboarding;
