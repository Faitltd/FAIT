import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, Clock, MapPin, DollarSign, CreditCard, User, CheckCircle, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import EnhancedBookingCalendar from './EnhancedBookingCalendar';
import PaymentForm from './PaymentForm';
import LoadingSpinner from '../LoadingSpinner';
import { formatCurrency } from '../../utils/formatters';

interface ServicePackage {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: number;
  duration_unit: string;
  service_agent_id: string;
  service_agent?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

interface BookingFormData {
  service_package_id: string;
  scheduled_date: string;
  scheduled_time: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  notes: string;
  total_amount: number;
}

interface BookingWizardProps {
  servicePackage: ServicePackage;
  onSuccess: (bookingId: string) => void;
  onCancel: () => void;
}

const BookingWizard: React.FC<BookingWizardProps> = ({
  servicePackage,
  onSuccess,
  onCancel
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<BookingFormData>({
    service_package_id: servicePackage.id,
    scheduled_date: '',
    scheduled_time: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    notes: '',
    total_amount: servicePackage.price
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  
  // Fetch user profile on mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        
        setUserProfile(data);
        
        // Pre-fill address if available
        if (data) {
          setFormData(prev => ({
            ...prev,
            address: data.address || '',
            city: data.city || '',
            state: data.state || '',
            zip_code: data.zip_code || ''
          }));
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
      }
    };
    
    fetchUserProfile();
  }, [user]);
  
  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle date and time selection
  const handleTimeSlotSelect = (date: string, time: string) => {
    setFormData(prev => ({
      ...prev,
      scheduled_date: date,
      scheduled_time: time
    }));
  };
  
  // Move to next step
  const handleNextStep = () => {
    // Validate current step
    if (step === 1 && (!formData.scheduled_date || !formData.scheduled_time)) {
      setError('Please select a date and time');
      return;
    }
    
    if (step === 2 && (!formData.address || !formData.city || !formData.state || !formData.zip_code)) {
      setError('Please fill in all address fields');
      return;
    }
    
    setError(null);
    setStep(prev => prev + 1);
    
    // If moving to payment step, create the booking
    if (step === 2) {
      createBooking();
    }
  };
  
  // Move to previous step
  const handlePrevStep = () => {
    setError(null);
    setStep(prev => prev - 1);
  };
  
  // Create booking in the database
  const createBooking = async () => {
    if (!user) {
      setError('You must be logged in to book a service');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Create the booking
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          client_id: user.id,
          service_agent_id: servicePackage.service_agent_id,
          service_package_id: servicePackage.id,
          scheduled_date: formData.scheduled_date,
          scheduled_time: formData.scheduled_time,
          status: 'pending',
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zip_code,
          notes: formData.notes,
          price: formData.total_amount,
          payment_status: 'pending'
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setBookingId(data.id);
      
      // Create payment intent
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          booking_id: data.id,
          amount: formData.total_amount
        }),
      });
      
      const paymentData = await response.json();
      
      if (paymentData.error) {
        throw new Error(paymentData.error);
      }
      
      setClientSecret(paymentData.clientSecret);
    } catch (err) {
      console.error('Error creating booking:', err);
      setError(err instanceof Error ? err.message : 'Failed to create booking');
      setStep(2); // Go back to address step
    } finally {
      setLoading(false);
    }
  };
  
  // Handle payment success
  const handlePaymentSuccess = () => {
    setSuccess(true);
    if (bookingId) {
      onSuccess(bookingId);
    }
  };
  
  // Handle form submission (for steps 1 and 2)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleNextStep();
  };
  
  // Render step indicators
  const renderStepIndicators = () => {
    return (
      <div className="flex items-center justify-center mb-6">
        {[1, 2, 3].map((stepNumber) => (
          <React.Fragment key={stepNumber}>
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full ${
                stepNumber === step
                  ? 'bg-blue-600 text-white'
                  : stepNumber < step
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : 'bg-gray-100 text-gray-500 border border-gray-300'
              }`}
            >
              {stepNumber < step ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <span className="text-sm font-medium">{stepNumber}</span>
              )}
            </div>
            
            {stepNumber < 3 && (
              <div
                className={`w-16 h-1 ${
                  stepNumber < step ? 'bg-green-300' : 'bg-gray-200'
                }`}
              ></div>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };
  
  // If booking was successful, show success message
  if (success) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="text-center py-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Booking Successful!</h2>
          <p className="text-gray-600 mb-6">
            Your booking has been confirmed. You will receive a confirmation email shortly.
          </p>
          <button
            onClick={() => navigate('/dashboard/client/bookings')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            View My Bookings
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Book Service</h2>
      <p className="text-gray-600 mb-6">
        {servicePackage.title} - {formatCurrency(servicePackage.price)}
      </p>
      
      {renderStepIndicators()}
      
      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {/* Step 1: Date and Time Selection */}
        {step === 1 && (
          <div>
            <EnhancedBookingCalendar
              serviceAgentId={servicePackage.service_agent_id}
              serviceId={servicePackage.id}
              duration={servicePackage.duration}
              onSelectTimeSlot={handleTimeSlotSelect}
              selectedDate={formData.scheduled_date}
              selectedTime={formData.scheduled_time}
            />
            
            <div className="mt-6 flex justify-between">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              
              <button
                type="button"
                onClick={handleNextStep}
                disabled={!formData.scheduled_date || !formData.scheduled_time}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>
        )}
        
        {/* Step 2: Address Information */}
        {step === 2 && (
          <div>
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6 flex items-start">
              <Calendar className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-700">Selected Date & Time</h4>
                <p className="text-sm text-blue-600">
                  {new Date(formData.scheduled_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {formData.scheduled_time}
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Service Address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                    onChange={handleChange}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                    onChange={handleChange}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                  onChange={handleChange}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Special Instructions (Optional)
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={handleChange}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-between">
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </button>
              
              <button
                type="submit"
                disabled={loading || !formData.address || !formData.city || !formData.state || !formData.zip_code}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <LoadingSpinner size="small" className="mr-2" />
                ) : (
                  <>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </form>
      
      {/* Step 3: Payment */}
      {step === 3 && (
        <div>
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
            <h4 className="text-sm font-medium text-blue-700 mb-2">Booking Summary</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <div className="flex items-start">
                  <Calendar className="h-4 w-4 text-blue-500 mr-2 mt-0.5" />
                  <span className="text-sm text-blue-600">
                    {new Date(formData.scheduled_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
                <span className="text-sm text-blue-600">{formData.scheduled_time}</span>
              </div>
              
              <div className="flex items-start">
                <MapPin className="h-4 w-4 text-blue-500 mr-2 mt-0.5" />
                <span className="text-sm text-blue-600">
                  {formData.address}, {formData.city}, {formData.state} {formData.zip_code}
                </span>
              </div>
              
              <div className="flex justify-between pt-2 border-t border-blue-200">
                <span className="text-sm font-medium text-blue-700">Total</span>
                <span className="text-sm font-medium text-blue-700">{formatCurrency(formData.total_amount)}</span>
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner />
            </div>
          ) : clientSecret ? (
            <PaymentForm
              clientSecret={clientSecret}
              amount={formData.total_amount}
              onSuccess={handlePaymentSuccess}
              onCancel={() => setStep(2)}
            />
          ) : (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">
                There was an error setting up the payment. Please try again.
              </p>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="mt-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Go Back
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BookingWizard;
