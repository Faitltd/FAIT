import React from 'react';
import { Calendar, Clock, MapPin, DollarSign, MessageSquare, User } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { format, parse } from 'date-fns';

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

interface BookingData {
  scheduled_date: string;
  scheduled_time: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  special_instructions?: string;
  total_price: number;
  payment_status: string;
}

interface BookingSummaryProps {
  servicePackage: ServicePackage;
  bookingData: BookingData;
}

/**
 * Booking Summary Component
 * 
 * Displays a summary of the booking details for confirmation.
 */
const BookingSummary: React.FC<BookingSummaryProps> = ({
  servicePackage,
  bookingData
}) => {
  // Format date and time for display
  const formatDateTime = () => {
    try {
      const date = new Date(bookingData.scheduled_date);
      const formattedDate = format(date, 'EEEE, MMMM d, yyyy');
      
      // Parse time (assuming format like "14:30")
      const timeParts = bookingData.scheduled_time.split(':');
      const hours = parseInt(timeParts[0], 10);
      const minutes = parseInt(timeParts[1], 10);
      
      // Format time in 12-hour format
      const period = hours >= 12 ? 'PM' : 'AM';
      const hour12 = hours % 12 || 12;
      const formattedTime = `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
      
      return `${formattedDate} at ${formattedTime}`;
    } catch (err) {
      console.error('Error formatting date/time:', err);
      return `${bookingData.scheduled_date} at ${bookingData.scheduled_time}`;
    }
  };
  
  // Format full address
  const formatAddress = () => {
    const { address, city, state, zip_code } = bookingData;
    if (!address) return 'No address provided';
    
    return `${address}, ${city}, ${state} ${zip_code}`;
  };
  
  return (
    <div className="space-y-6">
      {/* Service details */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">Service Details</h4>
        <div className="flex items-start">
          <div className="bg-white rounded-md p-3 mr-4 shadow-sm">
            <DollarSign className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <h5 className="font-medium text-gray-900">{servicePackage.name}</h5>
            <p className="text-sm text-gray-600 mt-1">{servicePackage.description}</p>
            <div className="flex items-center mt-2">
              <span className="font-medium text-gray-900">{formatCurrency(servicePackage.price)}</span>
              <span className="mx-2 text-gray-400">•</span>
              <Clock className="h-4 w-4 text-gray-400 mr-1" />
              <span className="text-sm text-gray-600">{servicePackage.duration} minutes</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Date and time */}
      <div className="flex items-start">
        <div className="bg-gray-100 rounded-md p-2 mr-3">
          <Calendar className="h-5 w-5 text-gray-600" />
        </div>
        <div>
          <h5 className="font-medium text-gray-900">Appointment Time</h5>
          <p className="text-gray-600">{formatDateTime()}</p>
        </div>
      </div>
      
      {/* Location */}
      <div className="flex items-start">
        <div className="bg-gray-100 rounded-md p-2 mr-3">
          <MapPin className="h-5 w-5 text-gray-600" />
        </div>
        <div>
          <h5 className="font-medium text-gray-900">Service Location</h5>
          <p className="text-gray-600">{formatAddress()}</p>
        </div>
      </div>
      
      {/* Service provider */}
      {servicePackage.service_agent && (
        <div className="flex items-start">
          <div className="bg-gray-100 rounded-md p-2 mr-3">
            <User className="h-5 w-5 text-gray-600" />
          </div>
          <div>
            <h5 className="font-medium text-gray-900">Service Provider</h5>
            <p className="text-gray-600">{servicePackage.service_agent.full_name}</p>
            {servicePackage.service_agent.phone && (
              <p className="text-sm text-gray-500">{servicePackage.service_agent.phone}</p>
            )}
          </div>
        </div>
      )}
      
      {/* Special instructions */}
      {bookingData.special_instructions && (
        <div className="flex items-start">
          <div className="bg-gray-100 rounded-md p-2 mr-3">
            <MessageSquare className="h-5 w-5 text-gray-600" />
          </div>
          <div>
            <h5 className="font-medium text-gray-900">Special Instructions</h5>
            <p className="text-gray-600">{bookingData.special_instructions}</p>
          </div>
        </div>
      )}
      
      {/* Payment status */}
      <div className="border-t border-gray-200 pt-4 mt-4">
        <div className="flex justify-between items-center">
          <span className="font-medium text-gray-900">Total</span>
          <span className="font-bold text-lg">{formatCurrency(bookingData.total_price)}</span>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-sm text-gray-600">Payment Status</span>
          <span className={`text-sm font-medium px-2 py-1 rounded-full ${
            bookingData.payment_status === 'paid'
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {bookingData.payment_status === 'paid' ? 'Paid' : 'Pending'}
          </span>
        </div>
      </div>
      
      {/* Confirmation message */}
      <div className="bg-green-50 border border-green-100 rounded-md p-4 mt-6">
        <p className="text-sm text-green-800">
          Please review all details above before confirming your booking. Once confirmed, you'll receive a confirmation email with all the details.
        </p>
      </div>
    </div>
  );
};

export default BookingSummary;
