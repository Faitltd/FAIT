import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useApi } from '../../lib/hooks/useApi';
import {
  servicePackagesApi,
  reviewsApi,
  externalReviewsApi,
  type ServicePackage,
  type Review,
  type ExternalReview,
  type ServiceAgentVerification
} from '../../lib/api';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  Button,
  Badge
} from '../../components/common';
import { Calendar, MessageSquare, Wrench, Users, BarChart3, Settings, LogOut, Briefcase, Star, Shield, Clock } from 'lucide-react';
import ServicePackageForm from '../../components/ServicePackageForm';
import ReviewsList from '../../components/ReviewsList';
import ExternalReviewsForm from '../../components/ExternalReviewsForm';
import ExternalReviewsList from '../../components/ExternalReviewsList';
import ProfilePhotoUpload from '../../components/ProfilePhotoUpload';
import VerificationBadge from '../../components/VerificationBadge';
import ServiceAgentAvailability from '../../components/ServiceAgentAvailability';
import { supabase } from '../../lib/supabase';

const ServiceAgentDashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const [verification, setVerification] = useState<ServiceAgentVerification | null>(null);
  const [services, setServices] = useState<ServicePackage[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [externalReviews, setExternalReviews] = useState<ExternalReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [showExternalReviewForm, setShowExternalReviewForm] = useState(false);

  // API hooks
  const { execute: fetchServices, isLoading: loadingServices } = useApi(
    async () => {
      if (!user) return [];
      return servicePackagesApi.getServicePackages();
    },
    {
      onSuccess: (data) => setServices(data || []),
    }
  );

  const { execute: fetchReviews, isLoading: loadingReviews } = useApi(
    async () => {
      if (!user) return [];
      return reviewsApi.getReviews(user.id);
    },
    {
      onSuccess: (data) => setReviews(data || []),
    }
  );

  const { execute: fetchExternalReviews, isLoading: loadingExternalReviews } = useApi(
    async () => {
      if (!user) return [];
      return externalReviewsApi.getExternalReviews(user.id);
    },
    {
      onSuccess: (data) => setExternalReviews(data || []),
    }
  );

  const { execute: toggleServiceActive } = useApi(
    async (serviceId: string, isActive: boolean) => {
      return servicePackagesApi.toggleServicePackageActive(serviceId, isActive);
    },
    {
      onSuccess: () => fetchServices(),
    }
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        if (!user) return;

        // Fetch verification status
        const { data: verificationData, error: verificationError } = await supabase
          .from('service_agent_verifications')
          .select('*')
          .eq('service_agent_id', user.id)
          .single();

        if (!verificationError) {
          setVerification(verificationData);
        }

        // Fetch all data in parallel
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

    fetchData();
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
    // This is handled by the ProfilePhotoUpload component
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
        <Link to="/settings/profile">
          <Button variant="outline" leftIcon={<Settings className="h-4 w-4" />}>
            Edit Profile
          </Button>
        </Link>
      </div>

      {/* Verification Alert */}
      {!verification?.is_verified && (
        <Card variant="bordered" className="mb-8 border-l-4 border-l-yellow-400 bg-yellow-50">
          <CardContent className="flex items-start p-4">
            <div className="flex-shrink-0 mr-3">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Verification Required</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>Please complete your verification process to start offering services.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-5 gap-4">
        <Link to="/dashboard/service-agent/messages" className="block">
          <Card variant="default" className="h-full hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <MessageSquare className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Messages</h3>
                  <p className="text-sm text-gray-500">View and respond to client messages</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/dashboard/service-agent/jobs" className="block">
          <Card variant="default" className="h-full hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Briefcase className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Jobs</h3>
                  <p className="text-sm text-gray-500">Manage your upcoming and completed jobs</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/dashboard/service-agent/listings" className="block">
          <Card variant="default" className="h-full hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Wrench className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Services</h3>
                  <p className="text-sm text-gray-500">Manage your service listings</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/dashboard/service-agent/referrals" className="block">
          <Card variant="default" className="h-full hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Referrals</h3>
                  <p className="text-sm text-gray-500">Invite others and earn rewards</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/settings/profile" className="block">
          <Card variant="default" className="h-full hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Settings className="h-8 w-8 text-gray-600" />
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Settings</h3>
                  <p className="text-sm text-gray-500">Update your profile and preferences</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card variant="default">
          <CardContent className="p-6 flex items-start">
            <div className="mr-4">
              <Wrench className="h-6 w-6 text-blue-600" />
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
          </CardContent>
        </Card>

        <Card variant="default">
          <CardContent className="p-6 flex items-start">
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
          </CardContent>
        </Card>

        <Card variant="default">
          <CardContent className="p-6 flex items-start">
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
          </CardContent>
        </Card>

        <Card variant="default">
          <CardContent className="p-6 flex items-start">
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
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* External Reviews Section */}
        <Card variant="default">
          <CardHeader>
            <div className="flex justify-between items-center w-full">
              <CardTitle>External Reviews</CardTitle>
              <Button
                variant="default"
                size="sm"
                onClick={() => setShowExternalReviewForm(true)}
              >
                Link External Reviews
              </Button>
            </div>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {/* Service Packages Section */}
        <div>
          {showServiceForm ? (
            <ServicePackageForm
              onSuccess={handleServiceCreated}
              onCancel={() => setShowServiceForm(false)}
            />
          ) : (
            <Card variant="default">
              <CardHeader>
                <div className="flex justify-between items-center w-full">
                  <CardTitle>Your Service Packages</CardTitle>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setShowServiceForm(true)}
                  >
                    Add New Service
                  </Button>
                </div>
              </CardHeader>
              <div className="divide-y divide-gray-200">
                {services.length === 0 ? (
                  <CardContent>
                    <p className="text-gray-500">No service packages found</p>
                  </CardContent>
                ) : (
                  services.map((service) => (
                    <div key={service.id} className="px-6 py-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">{service.title}</h4>
                          <p className="text-sm text-gray-500">${service.price}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge
                            variant={service.is_active ? 'success' : 'default'}
                          >
                            {service.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          <Link to={`/services/edit/${service.id}`}>
                            <Button variant="link" size="sm">
                              Edit
                            </Button>
                          </Link>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-gray-600">{service.description}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {service.scope.map((item, index) => (
                          <Badge
                            key={index}
                            variant="default"
                          >
                            {item}
                          </Badge>
                        ))}
                      </div>
                      <div className="mt-4 flex justify-between items-center">
                        <div className="text-sm text-gray-500">
                          Duration: {service.duration || 'Not specified'}
                        </div>
                        <Button
                          variant={service.is_active ? 'destructive' : 'success'}
                          size="sm"
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to ${service.is_active ? 'deactivate' : 'activate'} this service?`)) {
                              toggleServiceActive(service.id, !service.is_active);
                            }
                          }}
                        >
                          {service.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Reviews Section */}
        <Card variant="default" className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Customer Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            {reviews.length === 0 ? (
              <p className="text-gray-500">No reviews yet</p>
            ) : (
              <ReviewsList reviews={reviews} />
            )}
          </CardContent>
        </Card>

        {/* Availability Management Section */}
        <Card variant="default" className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-green-600 mr-2" />
              <CardTitle>Availability Management</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4 max-w-3xl text-sm text-gray-500">
              <p>Set your working hours to let clients know when you're available for bookings. You can set recurring weekly schedules or specific dates.</p>
            </div>
            <ServiceAgentAvailability />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ServiceAgentDashboard;
