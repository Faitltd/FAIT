import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import ReviewsList from '../../components/reviews/ReviewsList';
import ResponsiveLayout from '../../components/layout/ResponsiveLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { ArrowLeft, Star, AlertCircle } from 'lucide-react';

const ServiceAgentReviews: React.FC = () => {
  const { user } = useAuth();
  const { serviceAgentId } = useParams<{ serviceAgentId: string }>();
  const navigate = useNavigate();
  
  const [serviceAgent, setServiceAgent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  
  useEffect(() => {
    if (serviceAgentId) {
      fetchServiceAgent();
      if (user) {
        setIsCurrentUser(user.id === serviceAgentId);
      }
    }
  }, [serviceAgentId, user]);
  
  const fetchServiceAgent = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', serviceAgentId)
        .single();
      
      if (error) throw error;
      
      setServiceAgent(data);
    } catch (err) {
      console.error('Error fetching service agent:', err);
      setError('Failed to load service agent details');
    } finally {
      setLoading(false);
    }
  };
  
  const handleBack = () => {
    navigate(`/service-agent/${serviceAgentId}`);
  };
  
  if (loading) {
    return (
      <ResponsiveLayout>
        <div className="py-8 flex justify-center">
          <LoadingSpinner />
        </div>
      </ResponsiveLayout>
    );
  }
  
  if (error || !serviceAgent) {
    return (
      <ResponsiveLayout>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading service agent</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error || 'Service agent not found'}</p>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => navigate('/services')}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Go to Services
                </button>
              </div>
            </div>
          </div>
        </div>
      </ResponsiveLayout>
    );
  }
  
  return (
    <ResponsiveLayout title={`Reviews for ${serviceAgent.full_name}`}>
      <div className="mb-6">
        <button
          onClick={handleBack}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Profile
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="p-6">
          <div className="flex items-center">
            <img
              src={serviceAgent.avatar_url || '/default-avatar.png'}
              alt={serviceAgent.full_name}
              className="h-16 w-16 rounded-full object-cover mr-4"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{serviceAgent.full_name}</h1>
              <div className="flex items-center mt-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <Star
                      key={value}
                      className={`h-5 w-5 ${
                        value <= Math.round(serviceAgent.avg_rating || 0)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-500">
                  {serviceAgent.avg_rating ? serviceAgent.avg_rating.toFixed(1) : '0'} ({serviceAgent.review_count || 0} reviews)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <ReviewsList
        serviceAgentId={serviceAgentId}
        showFilters={true}
      />
    </ResponsiveLayout>
  );
};

export default ServiceAgentReviews;
