import React, { useState } from 'react';
import { Button } from '../../../core/components/ui/Button';

export interface BookingWizardProps {
  serviceId: string;
  onComplete?: (bookingData: BookingFormData) => void;
  onCancel?: () => void;
}

export interface BookingFormData {
  serviceId: string;
  date: string;
  time: string;
  address: string;
  zipCode: string;
  notes: string;
}

/**
 * BookingWizard component for booking services
 */
export const BookingWizard: React.FC<BookingWizardProps> = ({
  serviceId,
  onComplete,
  onCancel,
}) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<BookingFormData>({
    serviceId,
    date: '',
    time: '',
    address: '',
    zipCode: '',
    notes: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNext = () => {
    if (step === 1 && (!formData.date || !formData.time)) {
      setError('Please select a date and time');
      return;
    }
    
    if (step === 2 && (!formData.address || !formData.zipCode)) {
      setError('Please enter your address and ZIP code');
      return;
    }
    
    setError(null);
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Submit booking
      onComplete?.(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              1
            </div>
            <div className={`h-1 w-12 ${
              step >= 2 ? 'bg-blue-600' : 'bg-gray-200'
            }`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              2
            </div>
            <div className={`h-1 w-12 ${
              step >= 3 ? 'bg-blue-600' : 'bg-gray-200'
            }`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              3
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Step {step} of 3
          </div>
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <div>
            <h2 className="text-xl font-bold mb-4">Select Date and Time</h2>
            
            <div className="mb-4">
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                Time *
              </label>
              <select
                id="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a time</option>
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
        )}
        
        {step === 2 && (
          <div>
            <h2 className="text-xl font-bold mb-4">Enter Location</h2>
            
            <div className="mb-4">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Address *
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                ZIP Code *
              </label>
              <input
                type="text"
                id="zipCode"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
        )}
        
        {step === 3 && (
          <div>
            <h2 className="text-xl font-bold mb-4">Additional Information</h2>
            
            <div className="mb-6">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Special Instructions
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Booking Summary</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-gray-600">Date:</div>
                  <div>{formData.date}</div>
                  <div className="text-gray-600">Time:</div>
                  <div>{formData.time}</div>
                  <div className="text-gray-600">Address:</div>
                  <div>{formData.address}</div>
                  <div className="text-gray-600">ZIP Code:</div>
                  <div>{formData.zipCode}</div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-between">
          {step > 1 ? (
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={isLoading}
            >
              Back
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          )}
          
          {step < 3 ? (
            <Button
              type="button"
              onClick={handleNext}
              disabled={isLoading}
            >
              Next
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Booking...' : 'Complete Booking'}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};
