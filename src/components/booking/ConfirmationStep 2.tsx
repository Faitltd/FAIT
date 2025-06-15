import React from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  Calendar, 
  Clock, 
  MapPin, 
  CreditCard, 
  FileText, 
  User, 
  Phone, 
  Mail, 
  Share2 
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface ConfirmationStepProps {
  bookingData: any;
  service: any;
  bookingId: string | null;
}

const ConfirmationStep: React.FC<ConfirmationStepProps> = ({ 
  bookingData, 
  service, 
  bookingId 
}) => {
  // Format date and time for display
  const formatDateTime = () => {
    if (!bookingData.date || !bookingData.time) return 'Not specified';
    
    const date = new Date(`${bookingData.date}T${bookingData.time}`);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };
  
  // Format address for display
  const formatAddress = () => {
    const { address, city, state, zip } = bookingData.location;
    if (!address || !city || !state || !zip) return 'Not specified';
    
    return `${address}, ${city}, ${state} ${zip}`;
  };
  
  // Format payment method for display
  const formatPaymentMethod = () => {
    switch (bookingData.payment.method) {
      case 'credit_card':
        return 'Credit Card';
      case 'paypal':
        return 'PayPal';
      case 'apple_pay':
        return 'Apple Pay';
      case 'google_pay':
        return 'Google Pay';
      default:
        return 'Not specified';
    }
  };
  
  // Generate a confirmation code
  const generateConfirmationCode = () => {
    if (!bookingId) return 'PENDING';
    
    // Create a confirmation code based on the booking ID
    // In a real app, this would be generated on the server
    const code = bookingId.substring(0, 8).toUpperCase();
    return `SRV-${code}`;
  };
  
  return (
    <div>
      <div className="text-center mb-8">
        <motion.div
          className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-green-100 mb-4"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <CheckCircle className="h-12 w-12 text-green-600" />
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
        <p className="text-gray-600">
          Your service request has been successfully booked. A confirmation email has been sent to your email address.
        </p>
      </div>
      
      {/* Confirmation Code */}
      <div className="bg-blue-50 rounded-md p-4 mb-6 text-center">
        <h3 className="font-medium text-blue-800 mb-1">Confirmation Code</h3>
        <div className="text-2xl font-bold text-blue-700 tracking-wider">
          {generateConfirmationCode()}
        </div>
      </div>
      
      {/* Booking Details */}
      <div className="bg-white border border-gray-200 rounded-md overflow-hidden mb-6">
        <div className="border-b border-gray-200 px-4 py-3 bg-gray-50">
          <h3 className="font-medium text-gray-900">Booking Details</h3>
        </div>
        <div className="p-4 space-y-4">
          {/* Service */}
          <div className="flex">
            <div className="flex-shrink-0 w-5 h-5 mt-1 mr-3 text-gray-400">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="font-medium text-gray-900">Service</div>
              <div className="text-gray-600">{service?.title || 'Not specified'}</div>
            </div>
          </div>
          
          {/* Date and Time */}
          <div className="flex">
            <div className="flex-shrink-0 w-5 h-5 mt-1 mr-3 text-gray-400">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <div className="font-medium text-gray-900">Date & Time</div>
              <div className="text-gray-600">{formatDateTime()}</div>
            </div>
          </div>
          
          {/* Location */}
          <div className="flex">
            <div className="flex-shrink-0 w-5 h-5 mt-1 mr-3 text-gray-400">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <div className="font-medium text-gray-900">Location</div>
              <div className="text-gray-600">{formatAddress()}</div>
            </div>
          </div>
          
          {/* Payment */}
          <div className="flex">
            <div className="flex-shrink-0 w-5 h-5 mt-1 mr-3 text-gray-400">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <div className="font-medium text-gray-900">Payment Method</div>
              <div className="text-gray-600">{formatPaymentMethod()}</div>
              <div className="font-medium text-gray-900 mt-2">Total Amount</div>
              <div className="text-gray-600">{formatCurrency(service?.price * 1.05 || 0)}</div>
            </div>
          </div>
          
          {/* Service Provider */}
          {service?.service_agent && (
            <div className="flex">
              <div className="flex-shrink-0 w-5 h-5 mt-1 mr-3 text-gray-400">
                <User className="h-5 w-5" />
              </div>
              <div>
                <div className="font-medium text-gray-900">Service Provider</div>
                <div className="text-gray-600">{service.service_agent.full_name}</div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* What's Next */}
      <div className="bg-white border border-gray-200 rounded-md overflow-hidden mb-6">
        <div className="border-b border-gray-200 px-4 py-3 bg-gray-50">
          <h3 className="font-medium text-gray-900">What's Next</h3>
        </div>
        <div className="p-4">
          <ol className="space-y-4">
            <li className="flex">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-0.5">
                <span className="text-blue-600 font-medium text-sm">1</span>
              </div>
              <div className="text-gray-600">
                You'll receive a confirmation email with all the details of your booking.
              </div>
            </li>
            <li className="flex">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-0.5">
                <span className="text-blue-600 font-medium text-sm">2</span>
              </div>
              <div className="text-gray-600">
                Your service provider will contact you before the appointment to confirm details.
              </div>
            </li>
            <li className="flex">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-0.5">
                <span className="text-blue-600 font-medium text-sm">3</span>
              </div>
              <div className="text-gray-600">
                On the day of service, your provider will arrive at the scheduled time.
              </div>
            </li>
            <li className="flex">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-0.5">
                <span className="text-blue-600 font-medium text-sm">4</span>
              </div>
              <div className="text-gray-600">
                After the service is completed, you'll be able to rate and review your experience.
              </div>
            </li>
          </ol>
        </div>
      </div>
      
      {/* Contact and Share */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 bg-white border border-gray-200 rounded-md overflow-hidden">
          <div className="border-b border-gray-200 px-4 py-3 bg-gray-50">
            <h3 className="font-medium text-gray-900">Need Help?</h3>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              <a href="tel:+18001234567" className="flex items-center text-company-lightpink hover:text-company-lighterpink">
                <Phone className="h-5 w-5 mr-2" />
                <span>1-800-123-4567</span>
              </a>
              <a href="mailto:support@example.com" className="flex items-center text-company-lightpink hover:text-company-lighterpink">
                <Mail className="h-5 w-5 mr-2" />
                <span>support@example.com</span>
              </a>
            </div>
          </div>
        </div>
        
        <div className="flex-1 bg-white border border-gray-200 rounded-md overflow-hidden">
          <div className="border-b border-gray-200 px-4 py-3 bg-gray-50">
            <h3 className="font-medium text-gray-900">Share Booking</h3>
          </div>
          <div className="p-4">
            <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Share2 className="h-5 w-5 mr-2 text-gray-400" />
              Share with others
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationStep;
