import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, MapPin, Phone, Mail, Clock, Briefcase, Users, Camera, AlertTriangle, Shield, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import EnhancedProfileForm from '../../components/profile/EnhancedProfileForm';
import ProfileCompletionTracker from '../../components/profile/ProfileCompletionTracker';
import UserActivityLog from '../../components/profile/UserActivityLog';
import LoadingSpinner from '../../components/LoadingSpinner';
import ProfilePhotoUpload from '../../components/ProfilePhotoUpload';
import VerificationBadge from '../../components/VerificationBadge';
import BackgroundCheckForm from '../../components/BackgroundCheckForm';
import WorkHistoryForm from '../../components/WorkHistoryForm';
import ReferenceForm from '../../components/ReferenceForm';
import PortfolioItemForm from '../../components/PortfolioItemForm';
import ServiceAreaForm from '../../components/ServiceAreaForm';
import ServiceAreasList from '../../components/ServiceAreasList';
import type { Database } from '../../lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ServiceAgentVerification = Database['public']['Tables']['service_agent_verifications']['Row'];
type WorkHistory = Database['public']['Tables']['service_agent_work_history']['Row'];
type Reference = Database['public']['Tables']['service_agent_references']['Row'];
type PortfolioItem = Database['public']['Tables']['service_agent_portfolio_items']['Row'];
type ServiceArea = Database['public']['Tables']['service_agent_service_areas']['Row'];

const ProfileSettings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [verification, setVerification] = useState<ServiceAgentVerification | null>(null);
  const [serviceAreas, setServiceAreas] = useState<ServiceArea[]>([]);
  const [showServiceAreaForm, setShowServiceAreaForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'activity' | 'advanced'>('profile');

  const fetchProfile = async () => {
    try {
      if (!user) return;

      // Fetch profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      if (profileData.user_type === 'service_agent') {
        // Fetch verification status
        const { data: verificationData, error: verificationError } = await supabase
          .from('service_agent_verifications')
          .select('*')
          .eq('service_agent_id', user.id)
          .maybeSingle();

        if (verificationError) throw verificationError;
        setVerification(verificationData);

        // Fetch service areas
        await fetchServiceAreas();
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchServiceAreas = async () => {
    try {
      const { data, error } = await supabase
        .from('service_agent_service_areas')
        .select('*')
        .eq('service_agent_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setServiceAreas(data || []);
    } catch (error) {
      console.error('Error fetching service areas:', error);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const handleProfileUpdate = () => {
    fetchProfile();
  };

  const handleDeleteServiceArea = async (id: string) => {
    try {
      const { error } = await supabase
        .from('service_agent_service_areas')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchServiceAreas();
    } catch (error) {
      console.error('Error deleting service area:', error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h1>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      ) : !profile ? (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-600 px-4 py-3 rounded-md">
          Profile not found. Please complete your profile setup.
          <div className="mt-2">
            <button
              onClick={() => navigate('/profile-setup')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Complete Profile Setup
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Profile Completion Status */}
          {!profile.profile_completed && (
            <div className="mb-6">
              <ProfileCompletionTracker profile={profile} />
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => navigate('/profile-setup')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Complete Profile Setup
                </button>
              </div>
            </div>
          )}

          {/* Verification Status for Service Agents */}
          {profile.user_type === 'service_agent' && (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-gray-400 mr-2" />
                  <h2 className="text-lg font-medium text-gray-900">Verification Status</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center">
                  {profile.verified ? (
                    <>
                      <div className="flex-shrink-0">
                        <span className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                          <Shield className="h-6 w-6 text-green-600" />
                        </span>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-green-800">Verified</h3>
                        <p className="text-sm text-gray-600">
                          Your account has been verified. Clients can see that you're a verified service agent.
                        </p>
                      </div>
                    </>
                  ) : verification?.status === 'pending' ? (
                    <>
                      <div className="flex-shrink-0">
                        <span className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                          <Clock className="h-6 w-6 text-yellow-600" />
                        </span>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-yellow-800">Verification Pending</h3>
                        <p className="text-sm text-gray-600">
                          Your verification is being reviewed. This usually takes 1-2 business days.
                        </p>
                      </div>
                    </>
                  ) : verification?.status === 'rejected' ? (
                    <>
                      <div className="flex-shrink-0">
                        <span className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                          <AlertTriangle className="h-6 w-6 text-red-600" />
                        </span>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-red-800">Verification Rejected</h3>
                        <p className="text-sm text-gray-600">
                          {verification.rejection_reason || 'Your verification was rejected. Please update your information and try again.'}
                        </p>
                        <button
                          onClick={() => navigate('/profile-setup')}
                          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                        >
                          Update Verification
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex-shrink-0">
                        <span className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <Shield className="h-6 w-6 text-blue-600" />
                        </span>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-blue-800">Not Verified</h3>
                        <p className="text-sm text-gray-600">
                          Get verified to build trust with clients and increase your visibility.
                        </p>
                        <button
                          onClick={() => navigate('/profile-setup')}
                          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                        >
                          Start Verification
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('profile')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'profile'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Profile
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'security'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Security
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'activity'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Activity
              </button>
              <button
                onClick={() => setActiveTab('advanced')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'advanced'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Advanced
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'profile' && (
            <EnhancedProfileForm onProfileUpdate={handleProfileUpdate} />
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Security Settings</h2>
                </div>
                <div className="p-6 space-y-6">
                  <div>
                    <h3 className="text-md font-medium text-gray-900 mb-3">Password</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Change your password to keep your account secure.
                    </p>
                    <Link
                      to="/forgot-password"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-block"
                    >
                      Change Password
                    </Link>
                  </div>

                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-md font-medium text-gray-900 mb-3">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Add an extra layer of security to your account by enabling two-factor authentication.
                    </p>
                    <button
                      onClick={() => alert('Two-factor authentication is coming soon!')}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 inline-block"
                    >
                      Coming Soon
                    </button>
                  </div>

                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-md font-medium text-gray-900 mb-3">Login Sessions</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      View and manage your active login sessions.
                    </p>
                    <button
                      onClick={() => alert('Session management is coming soon!')}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 inline-block"
                    >
                      Coming Soon
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <UserActivityLog limit={10} showFilters={true} />
          )}

          {activeTab === 'advanced' && (
            <div className="space-y-6">
              <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Advanced Settings</h2>
                </div>
                <div className="p-6 space-y-6">
                  <div>
                    <h3 className="text-md font-medium text-gray-900 mb-3">Data Export</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Download a copy of your personal data.
                    </p>
                    <button
                      onClick={() => alert('Data export is coming soon!')}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 inline-block"
                    >
                      Coming Soon
                    </button>
                  </div>

                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-md font-medium text-red-900 mb-3">Account Deactivation</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Deactivating your account will remove your profile from public view and prevent you from logging in.
                    </p>
                    <Link
                      to="/account/deactivate"
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 inline-flex items-center"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Deactivate Account
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Service Areas Section */}
          {activeTab === 'profile' && profile.user_type === 'service_agent' && (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mt-6">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                  <h2 className="text-lg font-medium text-gray-900">Service Areas</h2>
                </div>
                <button
                  onClick={() => setShowServiceAreaForm(true)}
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Add Service Area
                </button>
              </div>
              <div className="p-6">
                {showServiceAreaForm ? (
                  <ServiceAreaForm
                    onSuccess={() => {
                      setShowServiceAreaForm(false);
                      fetchServiceAreas();
                    }}
                    onCancel={() => setShowServiceAreaForm(false)}
                  />
                ) : serviceAreas.length === 0 ? (
                  <p className="text-gray-500">No service areas added yet</p>
                ) : (
                  <ServiceAreasList
                    areas={serviceAreas}
                    onDelete={handleDeleteServiceArea}
                  />
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProfileSettings;