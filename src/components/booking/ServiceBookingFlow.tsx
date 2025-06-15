import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/UnifiedAuthContext';
import { getSupabaseClient } from '../../utils/supabaseClient';

interface ServicePackage {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: string;
  scope: string[];
  service_agent_id: string;
  service_agent?: {
    full_name: string;
    avatar_url?: string;
    phone?: string;
  };
}

interface BookingData {
  servicePackageId: string;
  scheduledDate: string;
  scheduledTime: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  notes: string;
}

interface ServiceBookingFlowProps {
  servicePackage: ServicePackage;
  onComplete?: (bookingId: string) => void;
  onCancel?: () => void;
}

const ServiceBookingFlow: React.FC<ServiceBookingFlowProps> = ({
  servicePackage,
  onComplete,
  onCancel
}) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingData, setBookingData] = useState<BookingData>({
    servicePackageId: servicePackage.id,
    scheduledDate: '',
    scheduledTime: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    notes: ''
  });

  const steps = [
    { number: 1, title: 'Service Details', icon: CheckCircle },
    { number: 2, title: 'Schedule', icon: Calendar },
    { number: 3, title: 'Location', icon: MapPin },
    { number: 4, title: 'Payment', icon: CreditCard },
    { number: 5, title: 'Confirmation', icon: CheckCircle }
  ];

  const updateBookingData = (field: keyof BookingData, value: string) => {
    setBookingData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 2:
        return !!(bookingData.scheduledDate && bookingData.scheduledTime);
      case 3:
        return !!(bookingData.address && bookingData.city && bookingData.state && bookingData.zipCode);
      case 4:
        return true; // Payment validation would go here
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
      setError(null);
    } else {
      setError('Please fill in all required fields');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setError(null);
  };

  const submitBooking = async () => {
    if (!user) {
      setError('You must be logged in to book a service');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = await getSupabaseClient();
      
      const bookingPayload = {
        client_id: user.id,
        service_package_id: bookingData.servicePackageId,
        scheduled_date: `${bookingData.scheduledDate}T${bookingData.scheduledTime}:00`,
        status: 'pending',
        total_amount: servicePackage.price,
        notes: bookingData.notes,
        address: bookingData.address,
        city: bookingData.city,
        state: bookingData.state,
        zip_code: bookingData.zipCode
      };

      const { data, error: bookingError } = await supabase
        .from('bookings')
        .insert([bookingPayload])
        .select()
        .single();

      if (bookingError) {
        throw bookingError;
      }

      // Award points for booking
      await supabase
        .from('points_transactions')
        .insert([{
          user_id: user.id,
          points_amount: Math.floor(servicePackage.price * 0.01), // 1% of price as points
          transaction_type: 'earned',
          description: 'Booking completion bonus',
          booking_id: data.id
        }]);

      setCurrentStep(5);
      if (onComplete) {
        onComplete(data.id);
      }
    } catch (err: any) {
      console.error('Booking submission error:', err);
      setError(err.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-start space-x-4">
                {servicePackage.service_agent?.avatar_url && (
                  <img
                    src={servicePackage.service_agent.avatar_url}
                    alt={servicePackage.service_agent.full_name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">{servicePackage.title}</h3>
                  <p className="text-gray-600 mt-1">by {servicePackage.service_agent?.full_name}</p>
                  <p className="text-2xl font-bold text-blue-600 mt-2">${servicePackage.price}</p>
                  {servicePackage.duration && (
                    <p className="text-sm text-gray-500 mt-1">Duration: {servicePackage.duration}</p>
                  )}
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                <p className="text-gray-600">{servicePackage.description}</p>
              </div>

              {servicePackage.scope && servicePackage.scope.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-2">What's Included</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {servicePackage.scope.map((item, index) => (
                      <li key={index} className="text-gray-600">{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Schedule Your Service</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Date *
                </label>
                <input
                  type="date"
                  value={bookingData.scheduledDate}
                  onChange={(e) => updateBookingData('scheduledDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Time *
                </label>
                <select
                  value={bookingData.scheduledTime}
                  onChange={(e) => updateBookingData('scheduledTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a time</option>
                  <option value="08:00">8:00 AM</option>
                  <option value="09:00">9:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="12:00">12:00 PM</option>
                  <option value="13:00">1:00 PM</option>
                  <option value="14:00">2:00 PM</option>
                  <option value="15:00">3:00 PM</option>
                  <option value="16:00">4:00 PM</option>
                  <option value="17:00">5:00 PM</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Service Location</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address *
                </label>
                <input
                  type="text"
                  value={bookingData.address}
                  onChange={(e) => updateBookingData('address', e.target.value)}
                  placeholder="123 Main Street"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    value={bookingData.city}
                    onChange={(e) => updateBookingData('city', e.target.value)}
                    placeholder="Denver"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <select
                    value={bookingData.state}
                    onChange={(e) => updateBookingData('state', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select State</option>
                    <option value="CO">Colorado</option>
                    <option value="CA">California</option>
                    <option value="TX">Texas</option>
                    <option value="NY">New York</option>
                    {/* Add more states as needed */}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP Code *
                  </label>
                  <input
                    type="text"
                    value={bookingData.zipCode}
                    onChange={(e) => updateBookingData('zipCode', e.target.value)}
                    placeholder="80202"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Instructions (Optional)
                </label>
                <textarea
                  value={bookingData.notes}
                  onChange={(e) => updateBookingData('notes', e.target.value)}
                  placeholder="Any special instructions or notes for the service agent..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Payment Information</h3>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-blue-600 mr-2" />
                <p className="text-blue-800">
                  Payment will be processed after the service is completed to your satisfaction.
                </p>
              </div>
            </div>
            
            <div className="bg-white border rounded-lg p-6">
              <h4 className="font-medium text-gray-900 mb-4">Order Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">{servicePackage.title}</span>
                  <span className="font-medium">${servicePackage.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Service Fee</span>
                  <span className="font-medium">$0.00</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>${servicePackage.price}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">Booking Confirmed!</h3>
              <p className="text-gray-600">
                Your service has been booked successfully. The service agent will contact you soon to confirm the details.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6 text-left">
              <h4 className="font-medium text-gray-900 mb-3">Booking Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Service:</span>
                  <span>{servicePackage.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span>{new Date(bookingData.scheduledDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span>{bookingData.scheduledTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Location:</span>
                  <span>{bookingData.address}, {bookingData.city}, {bookingData.state}</span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className={`
                flex items-center justify-center w-10 h-10 rounded-full border-2 
                ${currentStep >= step.number 
                  ? 'bg-blue-600 border-blue-600 text-white' 
                  : 'border-gray-300 text-gray-500'
                }
              `}>
                {currentStep > step.number ? (
                  <CheckCircle className="h-6 w-6" />
                ) : (
                  <span className="text-sm font-medium">{step.number}</span>
                )}
              </div>
              
              {index < steps.length - 1 && (
                <div className={`
                  w-full h-1 mx-4 
                  ${currentStep > step.number ? 'bg-blue-600' : 'bg-gray-300'}
                `} />
              )}
            </div>
          ))}
        </div>
        
        <div className="flex justify-between mt-2">
          {steps.map((step) => (
            <div key={step.number} className="text-xs text-gray-600 text-center">
              {step.title}
            </div>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Step Content */}
      <div className="mb-8">
        {renderStepContent()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <div>
          {currentStep > 1 && currentStep < 5 && (
            <button
              onClick={prevStep}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Previous
            </button>
          )}
          
          {currentStep === 5 && onCancel && (
            <button
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Close
            </button>
          )}
        </div>

        <div>
          {currentStep < 4 && (
            <button
              onClick={nextStep}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Next
            </button>
          )}
          
          {currentStep === 4 && (
            <button
              onClick={submitBooking}
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Confirm Booking'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceBookingFlow;
