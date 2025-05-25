import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/UnifiedAuthContext';
import ParallaxBackground from '../components/ParallaxBackground';
import {
  Star,
  Clock,
  MapPin,
  DollarSign,
  Award,
  Shield,
  ThumbsUp,
  Calendar,
  CheckCircle,
  MessageCircle,
  Share2,
  Heart,
  ChevronRight,
  User,
  Briefcase,
  Tool
} from 'lucide-react';
import { formatCurrency, formatDuration, formatDate, formatRelativeTime } from '../utils/formatters';

interface ServicePackage {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: number;
  duration_unit: string;
  category: string;
  subcategory?: string;
  service_agent_id: string;
  created_at: string;
  image_url?: string;
  service_agent: {
    id: string;
    full_name: string;
    avatar_url?: string;
    zip_code?: string;
    bio?: string;
    years_experience?: number;
    verified?: boolean;
  };
  avg_rating?: number;
  review_count?: number;
  featured?: boolean;
  verified?: boolean;
  top_rated?: boolean;
  details?: string;
  included_services?: string[];
  excluded_services?: string[];
  faqs?: Array<{
    question: string;
    answer: string;
  }>;
}

interface Review {
  id: string;
  user_id: string;
  service_package_id: string;
  rating: number;
  comment: string;
  created_at: string;
  user: {
    full_name: string;
    avatar_url?: string;
  };
}

const ServiceDetailPage: React.FC = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { scrollY } = useScroll();

  // Parallax effects
  const headerParallax = useTransform(scrollY, [0, 300], [0, 100]);
  const contentParallax = useTransform(scrollY, [0, 300], [0, -30]);

  // State
  const [service, setService] = useState<ServicePackage | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Available dates (next 7 days)
  const availableDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date.toISOString().split('T')[0];
  });

  // Available time slots
  const availableTimeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  // Fetch service details
  useEffect(() => {
    const fetchServiceDetails = async () => {
      if (!serviceId) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch service details
        const { data: serviceData, error: serviceError } = await supabase
          .from('service_packages')
          .select(`
            *,
            service_agent:profiles!service_packages_service_agent_id_fkey(
              id,
              full_name,
              avatar_url,
              zip_code,
              bio,
              years_experience,
              verified
            )
          `)
          .eq('id', serviceId)
          .single();

        if (serviceError) throw serviceError;

        // Fetch reviews
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select(`
            *,
            user:profiles!reviews_user_id_fkey(
              full_name,
              avatar_url
            )
          `)
          .eq('service_package_id', serviceId)
          .order('created_at', { ascending: false })
          .limit(5);

        if (reviewsError) throw reviewsError;

        // Calculate average rating
        const ratings = reviewsData.map(review => review.rating);
        const avgRating = ratings.length > 0
          ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
          : 0;

        // Add demo data for visual enhancement
        const enhancedService = {
          ...serviceData,
          avg_rating: avgRating,
          review_count: ratings.length,
          featured: Math.random() > 0.7,
          verified: serviceData.service_agent.verified || Math.random() > 0.5,
          top_rated: avgRating >= 4.5,
          details: "This service includes a thorough assessment of your needs, professional execution with high-quality materials, and a complete cleanup after the job is done. Our experienced professionals will ensure the work meets your expectations and industry standards.",
          included_services: [
            "Initial consultation and assessment",
            "Professional service execution",
            "High-quality materials and tools",
            "Complete cleanup after service",
            "Quality check and walkthrough"
          ],
          excluded_services: [
            "Additional repairs outside the scope",
            "Removal of old materials or debris",
            "Specialized equipment rental",
            "Permits or inspections if required"
          ],
          faqs: [
            {
              question: "How long does this service typically take?",
              answer: `Most jobs are completed within ${serviceData.duration} ${serviceData.duration_unit}. However, the exact time may vary depending on the complexity and scope of your specific needs.`
            },
            {
              question: "Do I need to provide any materials?",
              answer: "No, our professionals bring all necessary tools and materials. If specialized materials are required, we'll discuss this during the initial consultation."
            },
            {
              question: "Is there a warranty for this service?",
              answer: "Yes, all our services come with a 30-day satisfaction guarantee. If you're not completely satisfied, we'll return to address any issues at no additional cost."
            },
            {
              question: "What if I need to reschedule?",
              answer: "You can reschedule up to 24 hours before your appointment without any penalty. Simply log into your account and select a new date and time."
            }
          ]
        };

        setService(enhancedService);
        setReviews(reviewsData);

        // Check if service is in user's favorites
        if (user) {
          const { data: favoriteData } = await supabase
            .from('favorites')
            .select('*')
            .eq('user_id', user.id)
            .eq('service_package_id', serviceId)
            .single();

          setIsFavorite(!!favoriteData);
        }
      } catch (err) {
        console.error('Error fetching service details:', err);
        setError('Failed to load service details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchServiceDetails();
  }, [serviceId, user]);

  // Toggle FAQ
  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  // Toggle favorite
  const toggleFavorite = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      if (isFavorite) {
        // Remove from favorites
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('service_package_id', serviceId);
      } else {
        // Add to favorites
        await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            service_package_id: serviceId
          });
      }

      setIsFavorite(!isFavorite);
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  // Handle booking
  const handleBookNow = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!selectedDate || !selectedTime) {
      alert('Please select a date and time to continue.');
      return;
    }

    navigate(`/book/${serviceId}?date=${selectedDate}&time=${selectedTime}`);
  };

  // Render stars for rating
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <Star className="h-5 w-5 text-gray-300" />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            </div>
          </div>
        );
      } else {
        stars.push(<Star key={i} className="h-5 w-5 text-gray-300" />);
      }
    }

    return stars;
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-company-lightpink"></div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen pt-20 flex flex-col items-center justify-center">
        <div className="text-red-500 mb-4">{error || 'Service not found'}</div>
        <Link
          to="/services"
          className="px-4 py-2 bg-company-lightpink text-white rounded-md hover:bg-company-lighterpink"
        >
          Browse Services
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 bg-gray-50">
      {/* Hero Section with Parallax */}
      <div className="relative h-96 overflow-hidden">
        {/* Parallax Background */}
        <motion.div
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{
            backgroundImage: `url(${service.image_url || '/images/services/default-service.jpg'})`,
            y: headerParallax,
            height: '120%',
            top: '-10%'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50"></div>
        </motion.div>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-end px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            className="max-w-7xl mx-auto w-full"
            style={{ y: contentParallax }}
          >
            {/* Category */}
            <div className="flex items-center mb-2">
              <span className="px-3 py-1 bg-company-lightpink text-white text-sm font-medium rounded-full">
                {service.category}
              </span>
              {service.subcategory && (
                <span className="ml-2 px-3 py-1 bg-white text-gray-700 text-sm font-medium rounded-full">
                  {service.subcategory}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-4xl font-bold text-white mb-4">{service.title}</h1>

            {/* Rating and Price */}
            <div className="flex flex-wrap items-center gap-6 mb-4">
              <div className="flex items-center">
                <div className="flex mr-2">
                  {renderStars(service.avg_rating || 0)}
                </div>
                <span className="text-white">
                  {service.avg_rating?.toFixed(1) || '0.0'} ({service.review_count || 0} reviews)
                </span>
              </div>

              <div className="flex items-center text-white">
                <Clock className="h-5 w-5 mr-2" />
                {formatDuration(service.duration)}
              </div>

              <div className="flex items-center text-white font-bold">
                <DollarSign className="h-5 w-5 mr-1" />
                {formatCurrency(service.price)}
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-3">
              {service.verified && (
                <div className="flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  <Shield className="h-4 w-4 mr-1" />
                  Verified
                </div>
              )}
              {service.top_rated && (
                <div className="flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                  <Award className="h-4 w-4 mr-1" />
                  Top Rated
                </div>
              )}
              {service.featured && (
                <div className="flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                  <Star className="h-4 w-4 mr-1" />
                  Featured
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Service Details */}
          <div className="lg:col-span-2">
            {/* Service Provider */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex items-center">
                <div className="h-16 w-16 rounded-full overflow-hidden mr-4">
                  <img
                    src={service.service_agent.avatar_url || '/default-avatar.png'}
                    alt={service.service_agent.full_name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{service.service_agent.full_name}</h3>
                  <div className="flex items-center mt-1">
                    {service.service_agent.verified && (
                      <div className="flex items-center text-blue-600 mr-3">
                        <Shield className="h-4 w-4 mr-1" />
                        <span className="text-sm">Verified</span>
                      </div>
                    )}
                    {service.service_agent.years_experience && (
                      <div className="flex items-center text-gray-600">
                        <Briefcase className="h-4 w-4 mr-1" />
                        <span className="text-sm">{service.service_agent.years_experience} years experience</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {service.service_agent.bio && (
                <p className="mt-4 text-gray-600">{service.service_agent.bio}</p>
              )}
              <div className="mt-4 flex justify-end">
                <Link
                  to={`/service-agent/${service.service_agent.id}`}
                  className="text-company-lightpink hover:text-company-lighterpink font-medium flex items-center"
                >
                  View Profile
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>

            {/* Service Description */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Service</h2>
              <p className="text-gray-600 mb-6">{service.description}</p>

              {service.details && (
                <p className="text-gray-600 mb-6">{service.details}</p>
              )}

              {/* What's Included */}
              {service.included_services && service.included_services.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">What's Included</h3>
                  <ul className="space-y-2">
                    {service.included_services.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-600">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* What's Not Included */}
              {service.excluded_services && service.excluded_services.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Not Included</h3>
                  <ul className="space-y-2">
                    {service.excluded_services.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <div className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5 relative">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="h-0.5 w-3 bg-red-500 rotate-45"></div>
                            <div className="h-0.5 w-3 bg-red-500 -rotate-45"></div>
                          </div>
                        </div>
                        <span className="text-gray-600">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* FAQs */}
            {service.faqs && service.faqs.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
                <div className="divide-y divide-gray-200">
                  {service.faqs.map((faq, index) => (
                    <div key={index} className="py-4">
                      <button
                        className="flex justify-between items-center w-full text-left focus:outline-none"
                        onClick={() => toggleFaq(index)}
                      >
                        <h3 className="text-lg font-medium text-gray-900">{faq.question}</h3>
                        <div className={`transform transition-transform ${openFaqIndex === index ? 'rotate-180' : ''}`}>
                          <ChevronRight className="h-5 w-5 text-gray-500" />
                        </div>
                      </button>
                      {openFaqIndex === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-2"
                        >
                          <p className="text-gray-600">{faq.answer}</p>
                        </motion.div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Reviews</h2>
                <Link
                  to={`/services/${serviceId}/reviews`}
                  className="text-company-lightpink hover:text-company-lighterpink font-medium flex items-center"
                >
                  See All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>

              {reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map(review => (
                    <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                      <div className="flex items-start">
                        <div className="h-10 w-10 rounded-full overflow-hidden mr-3">
                          <img
                            src={review.user.avatar_url || '/default-avatar.png'}
                            alt={review.user.full_name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="flex items-center">
                            <h4 className="font-medium text-gray-900">{review.user.full_name}</h4>
                            <span className="mx-2 text-gray-300">•</span>
                            <span className="text-sm text-gray-500">
                              {formatRelativeTime(new Date(review.created_at))}
                            </span>
                          </div>
                          <div className="flex mt-1 mb-2">
                            {renderStars(review.rating)}
                          </div>
                          <p className="text-gray-600">{review.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No reviews yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Booking and Actions */}
          <div>
            {/* Booking Card */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6 sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Book This Service</h3>

              {/* Date Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Date
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {availableDates.map(date => {
                    const dateObj = new Date(date);
                    const isSelected = date === selectedDate;

                    return (
                      <button
                        key={date}
                        onClick={() => setSelectedDate(date)}
                        className={`p-2 rounded-md text-center transition-colors ${
                          isSelected
                            ? 'bg-company-lightpink text-white'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        <div className="text-xs">{dateObj.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                        <div className="font-medium">{dateObj.getDate()}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Selection */}
              {selectedDate && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Time
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {availableTimeSlots.map(time => {
                      const isSelected = time === selectedTime;

                      return (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`py-2 px-3 rounded-md text-center transition-colors ${
                            isSelected
                              ? 'bg-company-lightpink text-white'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                          }`}
                        >
                          {time}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Price Summary */}
              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Service Price</span>
                  <span className="font-medium">{formatCurrency(service.price)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Service Fee</span>
                  <span className="font-medium">{formatCurrency(service.price * 0.05)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg mt-4">
                  <span>Total</span>
                  <span>{formatCurrency(service.price * 1.05)}</span>
                </div>
              </div>

              {/* Book Now Button */}
              <button
                onClick={() => navigate(`/service-request/${serviceId}?date=${selectedDate || ''}&time=${selectedTime || ''}`)}
                className="w-full py-3 px-4 bg-company-lightpink text-white rounded-md font-medium hover:bg-company-lighterpink transition-colors"
              >
                Book Now
              </button>

              {/* Action Buttons */}
              <div className="flex mt-4">
                <button
                  onClick={toggleFavorite}
                  className="flex-1 flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  <Heart className={`h-5 w-5 mr-2 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                  {isFavorite ? 'Saved' : 'Save'}
                </button>
                <button
                  className="flex-1 flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 ml-2"
                >
                  <Share2 className="h-5 w-5 mr-2 text-gray-400" />
                  Share
                </button>
              </div>

              {/* Contact Provider */}
              <div className="mt-4">
                <button
                  className="w-full flex items-center justify-center py-2 px-4 border border-company-lightpink rounded-md text-company-lightpink hover:bg-company-lightpink hover:text-white transition-colors"
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Contact Provider
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Services */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Similar Services</h2>

          {/* This would be populated with actual similar services */}
          <div className="text-center py-12">
            <p className="text-gray-500">Loading similar services...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailPage;
