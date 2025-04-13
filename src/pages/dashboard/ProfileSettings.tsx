import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, MapPin, Phone, Mail, Clock, Briefcase, Users, Camera } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [serviceAreas, setServiceAreas] = useState<ServiceArea[]>([]);
  const [showServiceAreaForm, setShowServiceAreaForm] = useState(false);

  const fetchServiceAreas = async () => {
    try {
      const { data, error } = await supabase
        .from('service_agent_service_areas')
        .select('*')
        .eq('service_agent_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setServiceAreas(data);
    } catch (error) {
      console.error('Error fetching service areas:', error);
    }
  };

  const fetchWorkHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('service_agent_work_history')
        .select('*')
        .eq('service_agent_id', user?.id)
        .order('start_date', { ascending: false });

      if (error) throw error;
      // setWorkHistory(data || []);
    } catch (error) {
      console.error('Error fetching work history:', error);
    }
  };

  const fetchReferences = async () => {
    try {
      const { data, error } = await supabase
        .from('service_agent_references')
        .select('*')
        .eq('service_agent_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      // setReferences(data || []);
    } catch (error) {
      console.error('Error fetching references:', error);
    }
  };

  const fetchPortfolioItems = async () => {
    try {
      const { data, error } = await supabase
        .from('service_agent_portfolio_items')
        .select('*')
        .eq('service_agent_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      // setPortfolioItems(data || []);
    } catch (error) {
      console.error('Error fetching portfolio items:', error);
    }
  };

  useEffect(() => {
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
          // Fetch service agent-specific data
          await Promise.all([
            fetchWorkHistory(),
            fetchReferences(),
            fetchPortfolioItems(),
            fetchServiceAreas(),
          ]);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

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

  // ... (previous JSX)

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      ) : (
        <>
          {/* Profile Section */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Profile Information</h2>
            </div>
            <div className="p-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <ProfilePhotoUpload userId={user?.id} existingUrl={profile?.avatar_url} />
                </div>
                <div className="ml-6 flex-1">
                  <h3 className="text-xl font-medium text-gray-900">{profile?.full_name}</h3>
                  <p className="text-sm text-gray-500 capitalize">{profile?.user_type}</p>

                  <div className="mt-4 grid grid-cols-1 gap-4">
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 text-gray-400 mr-2" />
                      <span>{profile?.email || user?.email}</span>
                    </div>
                    {profile?.phone && (
                      <div className="flex items-center">
                        <Phone className="h-5 w-5 text-gray-400 mr-2" />
                        <span>{profile?.phone}</span>
                      </div>
                    )}
                    {profile?.company_name && (
                      <div className="flex items-center">
                        <Building2 className="h-5 w-5 text-gray-400 mr-2" />
                        <span>{profile?.company_name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Service Areas Section */}
          {profile?.user_type === 'contractor' && (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
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