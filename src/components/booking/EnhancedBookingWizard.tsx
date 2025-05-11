import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import {
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  CreditCard,
  User,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  MessageSquare,
  Info
} from 'lucide-react';
import EnhancedBookingCalendar from './EnhancedBookingCalendar';
import FullCalendarBooking from './FullCalendarBooking';
import PaymentForm from './PaymentForm';
import LoadingSpinner from '../LoadingSpinner';
import { formatCurrency } from '../../utils/formatters';
import SpecialInstructionsField from './SpecialInstructionsField';
import BookingSummary from './BookingSummary';
import { useBookingState } from '../../hooks/useBookingState';

interface ServicePackage {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  service_agent_id: string;
  service_agent?: {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
    profile_image_url?: string;
  };
}

interface BookingFormData {
  service_package_id: string;
  client_id: string;
  scheduled_date: string;
  scheduled_time: string;
  status: string;
  total_price: number;
  payment_status: string;
  special_instructions?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
}

interface EnhancedBookingWizardProps {
  servicePackageId: string;
  onComplete?: (bookingId: string) => void;
}

/**
 * Enhanced Booking Wizard Component
 *
 * A step-by-step interface for scheduling services with improved validation,
 * special instructions handling, and a better user experience.
 */
const EnhancedBookingWizard: React.FC<EnhancedBookingWizardProps> = ({
  servicePackageId,
  onComplete
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // State for the wizard
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // State for service package
  const [servicePackage, setServicePackage] = useState<ServicePackage | null>(null);

  // State for form data
  const [formData, setFormData] = useState<BookingFormData>({
    service_package_id: servicePackageId,
    client_id: user?.id || '',
    scheduled_date: '',
    scheduled_time: '',
    status: 'pending',
    total_price: 0,
    payment_status: 'pending',
    special_instructions: '',
    address: '',
    city: '',
    state: '',
    zip_code: ''
  });

  // State for validation
  const [validations, setValidations] = useState({
    dateTime: false,
    location: false,
    payment: false
  });

  // Fetch service package data
  useEffect(() => {
    const fetchServicePackage = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('service_packages')
          .select(`
            *,
            service_agent:service_agent_id (
              id,
              full_name,
              email,
              phone,
              profile_image_url
            )
          `)
          .eq('id', servicePackageId)
          .single();

        if (error) throw error;

        if (!data) {
          throw new Error('Service package not found');
        }

        setServicePackage(data);
        setFormData(prev => ({
          ...prev,
          total_price: data.price
        }));
      } catch (err) {
        console.error('Error fetching service package:', err);
        setError('Failed to load service details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (servicePackageId) {
      fetchServicePackage();
    }
  }, [servicePackageId]);

  // Handle time slot selection
  const handleTimeSlotSelect = (date: string, time: string) => {
    setFormData(prev => ({
      ...prev,
      scheduled_date: date,
      scheduled_time: time
    }));

    setValidations(prev => ({
      ...prev,
      dateTime: true
    }));
  };

  // Handle location input
  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Validate location fields
  const validateLocation = () => {
    const { address, city, state, zip_code } = formData;
    const isValid = !!(address && city && state && zip_code);

    setValidations(prev => ({
      ...prev,
      location: isValid
    }));

    return isValid;
  };

  // Handle special instructions
  const handleSpecialInstructions = (instructions: string) => {
    setFormData(prev => ({
      ...prev,
      special_instructions: instructions
    }));
  };

  // Handle payment success
  const handlePaymentSuccess = (paymentId: string) => {
    setFormData(prev => ({
      ...prev,
      payment_status: 'paid'
    }));

    setValidations(prev => ({
      ...prev,
      payment: true
    }));
  };

  // Handle next step
  const handleNextStep = () => {
    if (step === 1 && !validations.dateTime) {
      setError('Please select a date and time for your appointment');
      return;
    }

    if (step === 2 && !validateLocation()) {
      setError('Please fill in all location fields');
      return;
    }

    if (step === 4 && !validations.payment) {
      setError('Please complete the payment process');
      return;
    }

    setError(null);
    setStep(prev => prev + 1);
  };

  // Handle previous step
  const handlePrevStep = () => {
    setError(null);
    setStep(prev => Math.max(prev - 1, 1));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError('You must be logged in to book a service');
      return;
    }

    if (!servicePackage) {
      setError('Service details not found');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // Create booking record
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          service_package_id: servicePackage.id,
          client_id: user.id,
          service_agent_id: servicePackage.service_agent_id,
          scheduled_date: formData.scheduled_date,
          scheduled_time: formData.scheduled_time,
          status: 'confirmed',
          total_price: servicePackage.price,
          payment_status: formData.payment_status,
          special_instructions: formData.special_instructions,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zip_code
        })
        .select()
        .single();

      if (error) throw error;

      setSuccess('Booking confirmed! You will receive a confirmation email shortly.');

      // Call onComplete callback if provided
      if (onComplete && data) {
        onComplete(data.id);
      } else {
        // Navigate to booking confirmation page
        setTimeout(() => {
          navigate(`/booking/confirmation/${data.id}`);
        }, 2000);
      }
    } catch (err) {
      console.error('Error creating booking:', err);
      setError('Failed to create booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Show error if service package not found
  if (!servicePackage) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-red-800 mb-2">Service Not Found</h3>
        <p className="text-gray-600 mb-4">
          The service you're looking for could not be found. Please try again or contact support.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
        <h2 className="text-2xl font-bold">Book {servicePackage.name}</h2>
        <p className="mt-1 text-blue-100">{servicePackage.description}</p>
        <div className="flex items-center mt-4">
          <DollarSign className="h-5 w-5 mr-1" />
          <span className="font-medium">{formatCurrency(servicePackage.price)}</span>
          <span className="mx-2">•</span>
          <Clock className="h-5 w-5 mr-1" />
          <span>{servicePackage.duration} minutes</span>
        </div>
      </div>

      {/* Progress steps */}
      <div className="px-6 pt-4">
        <div className="flex justify-between mb-8">
          {['Schedule', 'Location', 'Details', 'Payment', 'Confirm'].map((label, index) => {
            const stepNum = index + 1;
            const isActive = step === stepNum;
            const isCompleted = step > stepNum;

            return (
              <div key={label} className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isActive
                      ? 'bg-blue-500 text-white'
                      : isCompleted
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <span>{stepNum}</span>
                  )}
                </div>
                <span
                  className={`text-xs mt-1 ${
                    isActive ? 'text-blue-500 font-medium' : 'text-gray-500'
                  }`}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mx-6 mb-4 bg-red-50 border border-red-200 rounded-md p-3 flex items-start">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Success message */}
      {success && (
        <div className="mx-6 mb-4 bg-green-50 border border-green-200 rounded-md p-3 flex items-start">
          <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-800">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="px-6 pb-6">
          {/* Step 1: Date and Time Selection */}
          {step === 1 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Select Date & Time
              </h3>
              <div className="booking-calendar-container">
                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <Info className="h-4 w-4 text-blue-500 mr-2" />
                    <h4 className="text-sm font-medium text-blue-700">Enhanced Calendar View</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Select a date and time for your service appointment. Available slots are shown in green.
                  </p>
                </div>

                <FullCalendarBooking
                  serviceAgentId={servicePackage.service_agent_id}
                  serviceId={servicePackage.id}
                  duration={servicePackage.duration}
                  onSelectTimeSlot={handleTimeSlotSelect}
                  selectedDate={formData.scheduled_date}
                  selectedTime={formData.scheduled_time}
                />
              </div>
            </div>
          )}

          {/* Step 2: Location Information */}
          {step === 2 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Service Location
              </h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleLocationChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleLocationChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleLocationChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="zip_code" className="block text-sm font-medium text-gray-700 mb-1">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    id="zip_code"
                    name="zip_code"
                    value={formData.zip_code}
                    onChange={handleLocationChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Special Instructions */}
          {step === 3 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Special Instructions
              </h3>
              <SpecialInstructionsField
                value={formData.special_instructions || ''}
                onChange={handleSpecialInstructions}
                serviceType={servicePackage.name}
              />
            </div>
          )}

          {/* Step 4: Payment */}
          {step === 4 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Payment Information
              </h3>
              <PaymentForm
                amount={servicePackage.price}
                onSuccess={handlePaymentSuccess}
              />
            </div>
          )}

          {/* Step 5: Confirmation */}
          {step === 5 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Booking Summary
              </h3>
              <BookingSummary
                servicePackage={servicePackage}
                bookingData={formData}
              />
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between mt-8">
            {step > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={submitting}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </button>
            ) : (
              <div></div>
            )}

            {step < 5 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="flex items-center px-4 py-2 bg-blue-500 rounded-md text-white hover:bg-blue-600 transition-colors"
                disabled={submitting}
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </button>
            ) : (
              <button
                type="submit"
                className="flex items-center px-4 py-2 bg-green-500 rounded-md text-white hover:bg-green-600 transition-colors"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirm Booking
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default EnhancedBookingWizard;
