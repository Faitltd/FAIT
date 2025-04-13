import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../lib/database.types';
import ServicePackageForm from '../../components/ServicePackageForm';
import ReviewsList from '../../components/ReviewsList';
import ExternalReviewsForm from '../../components/ExternalReviewsForm';
import ExternalReviewsList from '../../components/ExternalReviewsList';
import ProfilePhotoUpload from '../../components/ProfilePhotoUpload';
import VerificationBadge from '../../components/VerificationBadge';
import ServiceAgentAvailability from '../../components/ServiceAgentAvailability';
import { Calendar, MessageSquare, Star, Tool, Settings, Briefcase, Clock, Shield } from 'lucide-react';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ServicePackage = Database['public']['Tables']['service_packages']['Row'];
type ServiceAgentVerification = Database['public']['Tables']['service_agent_verifications']['Row'];
type ExternalReview = Database['public']['Tables']['external_reviews']['Row'];
type Review = Database['public']['Tables']['reviews']['Row'] & {
  client: Pick<Database['public']['Tables']['profiles']['Row'], 'full_name'>;
  booking: Pick<Database['public']['Tables']['bookings']['Row'], 'id'> & {
    service_package: Pick<ServicePackage, 'title'>;
  };
};

const ServiceAgentDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [verification, setVerification] = useState<ServiceAgentVerification | null>(null);
  const [services, setServices] = useState<ServicePackage[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [externalReviews, setExternalReviews] = useState<ExternalReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [showExternalReviewForm, setShowExternalReviewForm] = useState(false);

  const fetchServices = async () => {
    try {
      const { data: servicesData, error: servicesError } = await supabase
        .from('service_packages')
        .select('*')
        .eq('service_agent_id', user?.id)
        .order('created_at', { ascending: false });

      if (servicesError) throw servicesError;
      setServices(servicesData);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select(`
          id,
          booking_id,
          client_id,
          service_package_id,
          rating,
          comment,
          created_at,
          updated_at,
          client:profiles!reviews_client_id_fkey(full_name),
          booking:bookings!reviews_booking_id_fkey(
            id,
            service_package:service_packages!bookings_service_package_id_fkey(title)
          )
        `)
        .in(
          'booking.service_package.service_agent_id',
          [user?.id || '']
        )
        .order('created_at', { ascending: false });

      if (reviewsError) throw reviewsError;
      setReviews(reviewsData as Review[]);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const fetchExternalReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('external_reviews')
        .select('*')
        .eq('service_agent_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExternalReviews(data);
    } catch (error) {
      console.error('Error fetching external reviews:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user?.id)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);

        // Fetch verification status
        const { data: verificationData, error: verificationError } = await supabase
          .from('service_agent_verifications')
          .select('*')
          .eq('service_agent_id', user?.id)
          .single();

        if (verificationError) throw verificationError;
        setVerification(verificationData);

        await Promise.all([
          fetchServices(),
          fetchReviews(),
          fetchExternalReviews()
        ]);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const handleServiceCreated = async () => {
    setShowServiceForm(false);
    await fetchServices();
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  };

  const calculateTotalReviewCount = () => {
    const platformReviews = externalReviews.reduce((sum, review) => sum + (review.review_count || 0), 0);
    return reviews.length + platformReviews;
  };

  const calculateOverallRating = () => {
    const internalRating = reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;
    const externalRatings = externalReviews.filter(review => review.rating !== null);

    if (externalRatings.length === 0 && reviews.length === 0) return 0;

    const totalRating = externalRatings.reduce((sum, review) => sum + (review.rating || 0), internalRating * reviews.length);
    return totalRating / (reviews.length + externalRatings.length);
  };

  const handlePhotoUpload = async (url: string) => {
    setProfile(prev => prev ? { ...prev, avatar_url: url } : null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <ProfilePhotoUpload
            avatarUrl={profile?.avatar_url || null}
            onUploadComplete={handlePhotoUpload}
          />
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome, {profile?.full_name}
              </h1>
              <VerificationBadge verification={verification} />
            </div>
            <p className="text-gray-600">Manage your services and service agent profile</p>
          </div>
        </div>
        <Link
          to="/settings/profile"
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Edit Profile
        </Link>
      </div>

      {/* Verification Status */}
      {!verification?.is_verified && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Verification Required</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>Please complete your verification process to start offering services.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link
          to="/dashboard/service-agent/messages"
          className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <MessageSquare className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Messages</h3>
              <p className="text-sm text-gray-500">View and respond to client messages</p>
            </div>
          </div>
        </Link>

        <Link
          to="/dashboard/service-agent/jobs"
          className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <Briefcase className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Jobs</h3>
              <p className="text-sm text-gray-500">Manage your upcoming and completed jobs</p>
            </div>
          </div>
        </Link>

        <Link
          to="/dashboard/service-agent/listings"
          className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <Tool className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Services</h3>
              <p className="text-sm text-gray-500">Manage your service listings</p>
            </div>
          </div>
        </Link>

        <Link
          to="/settings/profile"
          className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <Settings className="h-8 w-8 text-gray-600" />
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Settings</h3>
              <p className="text-sm text-gray-500">Update your profile and preferences</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm flex items-start">
          <div className="mr-4">
            <Tool className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Active Services</h3>
            <p className="text-3xl font-bold text-blue-600">
              {services.filter(s => s.is_active).length}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {services.length} total services
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm flex items-start">
          <div className="mr-4">
            <Star className="h-6 w-6 text-yellow-500" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Overall Rating</h3>
            <p className="text-3xl font-bold text-yellow-500">
              {calculateOverallRating().toFixed(1)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {calculateTotalReviewCount()} total reviews
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm flex items-start">
          <div className="mr-4">
            <Calendar className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Availability</h3>
            <p className="text-lg font-medium text-green-600">
              {/* This would ideally show actual availability count */}
              Weekly Schedule
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Set your working hours
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm flex items-start">
          <div className="mr-4">
            <Shield className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Verification</h3>
            <p className={`text-lg font-medium ${verification?.is_verified ? 'text-green-600' : 'text-yellow-600'}`}>
              {verification?.is_verified ? 'Verified' : 'Pending Verification'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {verification?.is_verified ? 'Your account is verified' : 'Complete verification to unlock all features'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* External Reviews Section */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">External Reviews</h2>
            <button
              onClick={() => setShowExternalReviewForm(true)}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Link External Reviews
            </button>
          </div>
          <div className="p-6">
            {showExternalReviewForm ? (
              <ExternalReviewsForm
                onSuccess={() => {
                  setShowExternalReviewForm(false);
                  fetchExternalReviews();
                }}
                onCancel={() => setShowExternalReviewForm(false)}
              />
            ) : externalReviews.length === 0 ? (
              <p className="text-gray-500">No external reviews linked yet</p>
            ) : (
              <ExternalReviewsList
                reviews={externalReviews}
                isOwner={true}
                onDelete={() => fetchExternalReviews()}
              />
            )}
          </div>
        </div>

        {/* Service Packages Section */}
        <div>
          {showServiceForm ? (
            <ServicePackageForm
              onSuccess={handleServiceCreated}
              onCancel={() => setShowServiceForm(false)}
            />
          ) : (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Your Service Packages</h2>
                <button
                  onClick={() => setShowServiceForm(true)}
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Add New Service
                </button>
              </div>
              <div className="divide-y divide-gray-200">
                {services.length === 0 ? (
                  <p className="px-6 py-4 text-gray-500">No service packages found</p>
                ) : (
                  services.map((service) => (
                    <div key={service.id} className="px-6 py-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">{service.title}</h4>
                          <p className="text-sm text-gray-500">${service.price}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              service.is_active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {service.is_active ? 'Active' : 'Inactive'}
                          </span>
                          <Link
                            to={`/services/edit/${service.id}`}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Edit
                          </Link>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-gray-600">{service.description}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {service.scope.map((item, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                      <div className="mt-4 flex justify-between items-center">
                        <div className="text-sm text-gray-500">
                          Duration: {service.duration || 'Not specified'}
                        </div>
                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to ${service.is_active ? 'deactivate' : 'activate'} this service?`)) {
                              // Toggle service active status
                              supabase
                                .from('service_packages')
                                .update({ is_active: !service.is_active })
                                .eq('id', service.id)
                                .then(() => fetchServices())
                                .catch(err => console.error('Error updating service:', err));
                            }
                          }}
                          className={`text-sm font-medium ${service.is_active ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}`}
                        >
                          {service.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden lg:col-span-2">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Customer Reviews</h2>
          </div>
          <div className="p-6">
            {reviews.length === 0 ? (
              <p className="text-gray-500">No reviews yet</p>
            ) : (
              <ReviewsList reviews={reviews} />
            )}
          </div>
        </div>

        {/* Availability Management Section */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-green-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Availability Management</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="mb-4 max-w-3xl text-sm text-gray-500">
              <p>Set your working hours to let clients know when you're available for bookings. You can set recurring weekly schedules or specific dates.</p>
            </div>
            <ServiceAgentAvailability />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceAgentDashboard;
