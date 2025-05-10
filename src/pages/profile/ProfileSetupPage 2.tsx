import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ProfileSetupWizard from '../../components/profile/wizard/ProfileSetupWizard';

/**
 * Page for new users to complete their profile setup
 */
const ProfileSetupPage: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if user is not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);
  
  // Redirect if profile is already completed
  useEffect(() => {
    if (profile?.profile_completed) {
      navigate('/dashboard');
    }
  }, [profile, navigate]);
  
  const handleProfileComplete = () => {
    // Redirect to the appropriate dashboard based on user type
    if (profile?.user_type === 'service_agent') {
      navigate('/dashboard/service-agent');
    } else if (profile?.user_type === 'admin') {
      navigate('/dashboard/admin');
    } else {
      navigate('/dashboard/client');
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Welcome to FAIT Co-Op</h1>
          <p className="mt-4 text-lg text-gray-600">
            Let's set up your profile to get started
          </p>
        </div>
        
        <ProfileSetupWizard onComplete={handleProfileComplete} />
      </div>
    </div>
  );
};

export default ProfileSetupPage;
