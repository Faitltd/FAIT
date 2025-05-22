import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/UnifiedAuthContext';
import {
  Calendar,
  Clock,
  MapPin,
  CreditCard,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  FileText
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

// Import step components
import DateTimeStep from '../components/booking/DateTimeStep';
import PaymentStep from '../components/booking/PaymentStep';
import ConfirmationStep from '../components/booking/ConfirmationStep';

// Import remaining step components
import LocationStep from '../components/booking/LocationStep';
import DetailsStep from '../components/booking/DetailsStep';

// Define interfaces
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
  };
}

interface BookingData {
  date: string;
  time: string;
  location: {
    address: string;
    city: string;
    state: string;
    zip: string;
    type: 'home' | 'work' | 'other';
  };
  details: {
    description: string;
    special_instructions: string;
    photos: string[];
  };
  payment: {
    method: 'credit_card' | 'paypal' | 'apple_pay' | 'google_pay';
    card_number?: string;
    expiry?: string;
    cvv?: string;
    save_payment?: boolean;
  };
}

const ServiceRequestWizard: React.FC = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Parse query parameters
  const queryParams = new URLSearchParams(location.search);
  const initialDate = queryParams.get('date') || '';
  const initialTime = queryParams.get('time') || '';

  // State
  const [currentStep, setCurrentStep] = useState(0);
  const [service, setService] = useState<ServicePackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingData, setBookingData] = useState<BookingData>({
    date: initialDate,
    time: initialTime,
    location: {
      address: '',
      city: '',
      state: '',
      zip: '',
      type: 'home'
    },
    details: {
      description: '',
      special_instructions: '',
      photos: []
    },
    payment: {
      method: 'credit_card'
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);

  // Steps configuration
  const steps = [
    {
      title: 'Date & Time',
      icon: <Calendar className="h-5 w-5" />,
      isComplete: () => !!bookingData.date && !!bookingData.time
    },
    {
      title: 'Location',
      icon: <MapPin className="h-5 w-5" />,
      isComplete: () => !!bookingData.location.address && !!bookingData.location.zip
    },
    {
      title: 'Details',
      icon: <FileText className="h-5 w-5" />,
      isComplete: () => true // Optional step
    },
    {
      title: 'Payment',
      icon: <CreditCard className="h-5 w-5" />,
      isComplete: () => !!bookingData.payment.method
    },
    {
      title: 'Confirmation',
      icon: <CheckCircle className="h-5 w-5" />,
      isComplete: () => bookingComplete
    }
  ];

  // Fetch service details
  useEffect(() => {
    const fetchServiceDetails = async () => {
      if (!serviceId) return;

      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('service_packages')
          .select(`
            *,
            service_agent:profiles!service_packages_service_agent_id_fkey(
              id,
              full_name,
              avatar_url,
              zip_code
            )
          `)
          .eq('id', serviceId)
          .single();

        if (error) throw error;

        setService(data);

        // Pre-fill location data if user has a profile
        if (user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('address, city, state, zip_code')
            .eq('id', user.id)
            .single();

          if (profileData) {
            setBookingData(prev => ({
              ...prev,
              location: {
                ...prev.location,
                address: profileData.address || '',
                city: profileData.city || '',
                state: profileData.state || '',
                zip: profileData.zip_code || ''
              }
            }));
          }
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

  // Update booking data
  const updateBookingData = (step: keyof BookingData, data: any) => {
    setBookingData(prev => ({
      ...prev,
      [step]: {
        ...prev[step],
        ...data
      }
    }));
  };

  // Navigate to next step
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      if (steps[currentStep].isComplete()) {
        setCurrentStep(currentStep + 1);
        window.scrollTo(0, 0);
      } else {
        // Show validation error
        setError('Please complete all required fields before proceeding.');
      }
    }
  };

  // Navigate to previous step
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setError(null);
      window.scrollTo(0, 0);
    }
  };

  // Submit booking
  const submitBooking = async () => {
    if (!user || !service) return;

    try {
      setIsSubmitting(true);
      setError(null);

      // Create booking record
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          service_package_id: service.id,
          service_agent_id: service.service_agent_id,
          booking_date: bookingData.date,
          booking_time: bookingData.time,
          address: bookingData.location.address,
          city: bookingData.location.city,
          state: bookingData.location.state,
          zip_code: bookingData.location.zip,
          description: bookingData.details.description,
          special_instructions: bookingData.details.special_instructions,
          status: 'pending',
          payment_status: 'pending',
          total_amount: service.price,
          payment_method: bookingData.payment.method
        })
        .select()
        .single();

      if (error) throw error;

      // Upload photos if any
      if (bookingData.details.photos.length > 0) {
        // Photo upload logic would go here
      }

      // Process payment
      // Payment processing logic would go here

      setBookingId(data.id);
      setBookingComplete(true);
      nextStep();
    } catch (err) {
      console.error('Error submitting booking:', err);
      setError('Failed to submit booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle final confirmation
  const handleConfirmation = () => {
    if (bookingId) {
      navigate(`/booking/confirmation/${bookingId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-company-lightpink"></div>
      </div>
    );
  }

  if (error && !service) {
    return (
      <div className="min-h-screen pt-20 flex flex-col items-center justify-center">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={() => navigate('/services')}
          className="px-4 py-2 bg-company-lightpink text-white rounded-md hover:bg-company-lighterpink"
        >
          Browse Services
        </button>
      </div>
    );
  }

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, x: 100 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -100 }
  };

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Service Summary */}
        {service && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-start">
              <div className="h-16 w-16 rounded-lg overflow-hidden mr-4 flex-shrink-0">
                <img
                  src={service.image_url || '/images/services/default-service.jpg'}
                  alt={service.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{service.title}</h1>
                <p className="text-gray-600 mt-1">{service.description}</p>
                <div className="flex items-center mt-2">
                  <span className="font-bold text-company-lightpink">{formatCurrency(service.price)}</span>
                  <span className="mx-2 text-gray-300">•</span>
                  <span className="text-gray-600">{service.duration} {service.duration_unit}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="hidden sm:flex items-center justify-center">
            {steps.map((step, index) => (
              <React.Fragment key={index}>
                {/* Step */}
                <div
                  className={`flex flex-col items-center ${
                    index <= currentStep ? 'text-company-lightpink' : 'text-gray-400'
                  }`}
                >
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      index < currentStep
                        ? 'bg-company-lightpink text-white'
                        : index === currentStep
                          ? 'border-2 border-company-lightpink text-company-lightpink'
                          : 'border-2 border-gray-200 text-gray-400'
                    }`}
                  >
                    {index < currentStep ? (
                      <CheckCircle className="h-6 w-6" />
                    ) : (
                      step.icon
                    )}
                  </div>
                  <span className="mt-2 text-sm font-medium">{step.title}</span>
                </div>

                {/* Connector */}
                {index < steps.length - 1 && (
                  <div
                    className={`w-12 h-1 mx-2 ${
                      index < currentStep ? 'bg-company-lightpink' : 'bg-gray-200'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Mobile Progress */}
          <div className="sm:hidden">
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className={`p-2 rounded-full ${
                  currentStep === 0 ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="text-center">
                <div className="text-sm text-gray-500">Step {currentStep + 1} of {steps.length}</div>
                <div className="font-medium text-gray-900">{steps[currentStep].title}</div>
              </div>
              <button
                onClick={nextStep}
                disabled={currentStep === steps.length - 1 || !steps[currentStep].isComplete()}
                className={`p-2 rounded-full ${
                  currentStep === steps.length - 1 || !steps[currentStep].isComplete()
                    ? 'text-gray-300'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-company-lightpink h-2.5 rounded-full"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-md bg-red-50 border border-red-200">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        )}

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={{ type: 'tween', duration: 0.3 }}
            >
              {/* Render the appropriate step content based on currentStep */}
              {currentStep === 0 && (
                <DateTimeStep
                  bookingData={bookingData}
                  updateBookingData={updateBookingData}
                  service={service}
                />
              )}

              {currentStep === 1 && (
                <LocationStep
                  bookingData={bookingData}
                  updateBookingData={updateBookingData}
                  service={service}
                />
              )}

              {currentStep === 2 && (
                <DetailsStep
                  bookingData={bookingData}
                  updateBookingData={updateBookingData}
                  service={service}
                />
              )}

              {currentStep === 3 && (
                <PaymentStep
                  bookingData={bookingData}
                  updateBookingData={updateBookingData}
                  service={service}
                />
              )}

              {currentStep === 4 && (
                <ConfirmationStep
                  bookingData={bookingData}
                  service={service}
                  bookingId={bookingId}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`px-6 py-3 rounded-md flex items-center ${
              currentStep === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <ChevronLeft className="h-5 w-5 mr-2" />
            Back
          </button>

          {currentStep < steps.length - 1 ? (
            <button
              onClick={nextStep}
              disabled={!steps[currentStep].isComplete()}
              className={`px-6 py-3 rounded-md flex items-center ${
                !steps[currentStep].isComplete()
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-company-lightpink text-white hover:bg-company-lighterpink'
              }`}
            >
              Next
              <ChevronRight className="h-5 w-5 ml-2" />
            </button>
          ) : currentStep === steps.length - 1 && !bookingComplete ? (
            <button
              onClick={submitBooking}
              disabled={isSubmitting}
              className="px-6 py-3 bg-company-lightpink text-white rounded-md hover:bg-company-lighterpink flex items-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  Complete Booking
                  <CheckCircle className="h-5 w-5 ml-2" />
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleConfirmation}
              className="px-6 py-3 bg-company-lightpink text-white rounded-md hover:bg-company-lighterpink"
            >
              View Booking Details
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceRequestWizard;
