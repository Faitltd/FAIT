import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, Clock, MapPin, DollarSign, CreditCard, AlertCircle, CheckCircle, Info } from 'lucide-react';
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

interface TimeSlot {
  date: string;
  time: string;
  duration: number;
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

interface EnhancedBookingFormProps {
  servicePackage: ServicePackage;
  onSuccess: (bookingId: string) => void;
  onCancel: () => void;
}

const EnhancedBookingForm: React.FC<EnhancedBookingFormProps> = ({
  servicePackage,
  onSuccess,
  onCancel
}) => {
  const { user } = useAuth();
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
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [step, setStep] = useState(1);

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0];

  // Fetch user profile on component mount
  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchAvailableDates();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;

      setUserProfile(data);
      
      // Pre-fill address fields if available
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

  const fetchAvailableDates = async () => {
    try {
      setLoading(true);
      
      // Get the next 30 days
      const dates = [];
      const now = new Date();
      
      for (let i = 0; i < 30; i++) {
        const date = new Date(now);
        date.setDate(now.getDate() + i);
        dates.push(date.toISOString().split('T')[0]);
      }
      
      setAvailableDates(dates);
    } catch (err) {
      console.error('Error fetching available dates:', err);
      setError('Failed to load available dates');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableTimeSlots = async (date: string) => {
    try {
      setCheckingAvailability(true);
      
      // Call the available-slots function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/available-slots?serviceAgentId=${servicePackage.service_agent_id}&startDate=${date}&endDate=${date}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch available time slots');
      }
      
      const { data } = await response.json();
      
      // Filter slots for the selected date
      const slotsForDate = data.filter((slot: TimeSlot) => slot.date === date);
      
      setAvailableTimeSlots(slotsForDate);
    } catch (err) {
      console.error('Error fetching available time slots:', err);
      setError('Failed to load available times');
      setAvailableTimeSlots([]);
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    setFormData(prev => ({ ...prev, scheduled_date: selectedDate, scheduled_time: '' }));
    fetchAvailableTimeSlots(selectedDate);
  };

  const handleTimeChange = (time: string) => {
    setFormData(prev => ({ ...prev, scheduled_time: time }));
  };

  const validateStep1 = () => {
    if (!formData.scheduled_date) {
      setError('Please select a date');
      return false;
    }
    
    if (!formData.scheduled_time) {
      setError('Please select a time');
      return false;
    }
    
    setError(null);
    return true;
  };

  const validateStep2 = () => {
    if (!formData.address) {
      setError('Please enter your address');
      return false;
    }
    
    if (!formData.city) {
      setError('Please enter your city');
      return false;
    }
    
    if (!formData.state) {
      setError('Please enter your state');
      return false;
    }
    
    if (!formData.zip_code) {
      setError('Please enter your ZIP code');
      return false;
    }
    
    // Validate ZIP code format
    const zipCodeRegex = /^\d{5}(-\d{4})?$/;
    if (!zipCodeRegex.test(formData.zip_code)) {
      setError('Please enter a valid 5-digit ZIP code');
      return false;
    }
    
    setError(null);
    return true;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    setStep(prev => Math.max(1, prev - 1));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to book a service');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Call the create_booking function
      const { data, error } = await supabase.rpc('create_booking', {
        client_id: user.id,
        service_package_id: formData.service_package_id,
        scheduled_date: `${formData.scheduled_date}T${formData.scheduled_time}:00`,
        total_amount: formData.total_amount,
        notes: formData.notes,
        status: 'pending'
      });
      
      if (error) throw error;
      
      // Update user's address if it has changed
      if (
        userProfile &&
        (userProfile.address !== formData.address ||
         userProfile.city !== formData.city ||
         userProfile.state !== formData.state ||
         userProfile.zip_code !== formData.zip_code)
      ) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zip_code: formData.zip_code
          })
          .eq('id', user.id);
        
        if (updateError) {
          console.error('Error updating user profile:', updateError);
        }
      }
      
      // Create notification for service agent
      await supabase
        .from('notifications')
        .insert({
          user_id: servicePackage.service_agent_id,
          title: 'New Booking Request',
          message: `You have a new booking request for ${servicePackage.title}`,
          type: 'booking',
          is_read: false
        });
      
      setSuccess(true);
      
      // Call onSuccess with the booking ID
      setTimeout(() => {
        onSuccess(data);
      }, 2000);
    } catch (err) {
      console.error('Error creating booking:', err);
      setError(err instanceof Error ? err.message : 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  if (success) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="text-center py-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Booking Successful!</h2>
          <p className="text-gray-600 mb-6">
            Your booking request has been submitted and is awaiting confirmation.
          </p>
          <button
            onClick={() => onSuccess(formData.service_package_id)}
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
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Book Service</h2>
      
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              1
            </div>
            <span className="text-xs mt-1">Date & Time</span>
          </div>
          <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              2
            </div>
            <span className="text-xs mt-1">Location</span>
          </div>
          <div className={`flex-1 h-1 mx-2 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              3
            </div>
            <span className="text-xs mt-1">Confirm</span>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4 flex items-start">
          <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {/* Step 1: Date and Time Selection */}
        {step === 1 && (
          <div>
            <div className="mb-6">
              <label htmlFor="scheduled_date" className="block text-sm font-medium text-gray-700 mb-1">
                Select Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  id="scheduled_date"
                  name="scheduled_date"
                  min={today}
                  value={formData.scheduled_date}
                  onChange={handleDateChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
            
            {formData.scheduled_date && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Time
                </label>
                {checkingAvailability ? (
                  <div className="py-4 flex justify-center">
                    <LoadingSpinner size="small" />
                  </div>
                ) : availableTimeSlots.length === 0 ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 flex items-start">
                    <Info className="h-5 w-5 text-yellow-500 mr-3 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-yellow-700">
                      No available time slots for this date. Please select another date.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {availableTimeSlots.map((slot) => (
                      <button
                        key={slot.time}
                        type="button"
                        onClick={() => handleTimeChange(slot.time)}
                        className={`py-2 px-4 border rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                          formData.scheduled_time === slot.time
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {formatTime(slot.time)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                disabled={!formData.scheduled_date || !formData.scheduled_time}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
        
        {/* Step 2: Location Information */}
        {step === 2 && (
          <div>
            <div className="mb-4">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Street Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="123 Main St"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Anytown"
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
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="CA"
                  required
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label htmlFor="zip_code" className="block text-sm font-medium text-gray-700 mb-1">
                ZIP Code
              </label>
              <input
                type="text"
                id="zip_code"
                name="zip_code"
                value={formData.zip_code}
                onChange={handleInputChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="12345"
                required
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Special Instructions (Optional)
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Any special instructions or details about the service location..."
              />
            </div>
            
            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Next
              </button>
            </div>
          </div>
        )}
        
        {/* Step 3: Review and Confirm */}
        {step === 3 && (
          <div>
            <div className="bg-gray-50 rounded-md p-4 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Booking Summary</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Date & Time</p>
                      <p className="text-sm text-gray-600">
                        {new Date(formData.scheduled_date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                      <p className="text-sm text-gray-600">{formatTime(formData.scheduled_time)}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                </div>
                
                <div className="flex justify-between">
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Service Location</p>
                      <p className="text-sm text-gray-600">{formData.address}</p>
                      <p className="text-sm text-gray-600">{formData.city}, {formData.state} {formData.zip_code}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                </div>
                
                <div className="flex justify-between">
                  <div className="flex items-start">
                    <DollarSign className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Service Details</p>
                      <p className="text-sm text-gray-600">{servicePackage.title}</p>
                      <p className="text-sm text-gray-600">
                        {servicePackage.duration} {servicePackage.duration_unit}
                      </p>
                    </div>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency(servicePackage.price)}
                  </p>
                </div>
                
                {formData.notes && (
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-700">Special Instructions</p>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{formData.notes}</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-blue-50 rounded-md p-4 mb-6">
              <div className="flex items-start">
                <Info className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-700">Payment Information</p>
                  <p className="text-sm text-blue-600">
                    Payment will be collected after the service agent confirms your booking.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="small" />
                    <span className="ml-2">Processing...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Confirm Booking
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default EnhancedBookingForm;
