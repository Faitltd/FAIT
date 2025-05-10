import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import ReviewsList from '../../components/reviews/ReviewsList';
import ReviewForm from '../../components/reviews/ReviewForm';
import ResponsiveLayout from '../../components/layout/ResponsiveLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { ArrowLeft, Star, AlertCircle } from 'lucide-react';

const ServiceReviews: React.FC = () => {
  const { user } = useAuth();
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  
  const [service, setService] = useState<any>(null);
  const [serviceAgent, setServiceAgent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [userHasReviewed, setUserHasReviewed] = useState(false);
  const [userHasBooked, setUserHasBooked] = useState(false);
  
  useEffect(() => {
    if (serviceId) {
      fetchService();
      if (user) {
        checkUserReviewStatus();
        checkUserBookingStatus();
      }
    }
  }, [serviceId, user]);
  
  const fetchService = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('service_packages')
        .select(`
          *,
          service_agent:profiles!service_packages_service_agent_id_fkey(*)
        `)
        .eq('id', serviceId)
        .single();
      
      if (error) throw error;
      
      setService(data);
      setServiceAgent(data.service_agent);
    } catch (err) {
      console.error('Error fetching service:', err);
      setError('Failed to load service details');
    } finally {
      setLoading(false);
    }
  };
  
  const checkUserReviewStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('id')
        .eq('service_package_id', serviceId)
        .eq('client_id', user?.id)
        .maybeSingle();
      
      if (error) throw error;
      
      setUserHasReviewed(!!data);
    } catch (err) {
      console.error('Error checking user review status:', err);
    }
  };
  
  const checkUserBookingStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('id')
        .eq('service_package_id', serviceId)
        .eq('client_id', user?.id)
        .eq('status', 'completed')
        .maybeSingle();
      
      if (error) throw error;
      
      setUserHasBooked(!!data);
    } catch (err) {
      console.error('Error checking user booking status:', err);
    }
  };
  
  const handleWriteReview = () => {
    setShowReviewForm(true);
  };
  
  const handleReviewSuccess = () => {
    setShowReviewForm(false);
    setUserHasReviewed(true);
    fetchService(); // Refresh service data to update ratings
  };
  
  const handleCancelReview = () => {
    setShowReviewForm(false);
  };
  
  const handleBack = () => {
    navigate(`/services/${serviceId}`);
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
  
  if (error || !service) {
    return (
      <ResponsiveLayout>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading service</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error || 'Service not found'}</p>
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
    <ResponsiveLayout title={`Reviews for ${service.title}`}>
      <div className="mb-6">
        <button
          onClick={handleBack}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Service
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{service.title}</h1>
              <div className="flex items-center mt-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <Star
                      key={value}
                      className={`h-5 w-5 ${
                        value <= Math.round(service.avg_rating || 0)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-500">
                  {service.avg_rating ? service.avg_rating.toFixed(1) : '0'} ({service.review_count || 0} reviews)
                </span>
              </div>
            </div>
            
            {user && !showReviewForm && (
              <div className="mt-4 md:mt-0">
                {userHasReviewed ? (
                  <div className="text-sm text-gray-500">
                    You've already reviewed this service
                  </div>
                ) : userHasBooked ? (
                  <button
                    onClick={handleWriteReview}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Write a Review
                  </button>
                ) : (
                  <div className="text-sm text-gray-500">
                    Book and complete this service to leave a review
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {showReviewForm ? (
        <ReviewForm
          servicePackageId={serviceId!}
          serviceAgentId={serviceAgent.id}
          onSuccess={handleReviewSuccess}
          onCancel={handleCancelReview}
        />
      ) : (
        <ReviewsList
          servicePackageId={serviceId}
          showFilters={true}
        />
      )}
    </ResponsiveLayout>
  );
};

export default ServiceReviews;
