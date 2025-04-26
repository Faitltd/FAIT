import React from 'react';
import { Link } from 'react-router-dom';
import { X, Calendar, Clock, DollarSign, User } from 'lucide-react';
import type { Database } from '../lib/database.types';

type Booking = Database['public']['Tables']['bookings']['Row'] & {
  client: Pick<Database['public']['Tables']['profiles']['Row'], 'full_name' | 'avatar_url' | 'email' | 'phone'>;
  service_package: {
    title: string;
    price: number;
    duration: number;
    duration_unit: string;
  };
};

interface BookingDetailsPopupProps {
  booking: Booking | undefined;
  isOpen: boolean;
  onClose: () => void;
}

const BookingDetailsPopup: React.FC<BookingDetailsPopupProps> = ({ booking, isOpen, onClose }) => {
  if (!isOpen || !booking) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-medium text-gray-900">Booking Details</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-4 border-t border-gray-200 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Service</h4>
                <p className="mt-1 text-sm text-gray-900">{booking.service_package.title}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Status</h4>
                <p className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                    booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Date</h4>
                <p className="mt-1 text-sm text-gray-900 flex items-center">
                  <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                  {new Date(booking.scheduled_date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Time</h4>
                <p className="mt-1 text-sm text-gray-900 flex items-center">
                  <Clock className="h-4 w-4 text-gray-400 mr-1" />
                  {new Date(booking.scheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Price</h4>
                <p className="mt-1 text-sm text-gray-900 flex items-center">
                  <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                  ${booking.service_package.price.toFixed(2)}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Duration</h4>
                <p className="mt-1 text-sm text-gray-900">
                  {booking.service_package.duration} {booking.service_package.duration_unit}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-500">Client Information</h4>
              <div className="mt-2">
                <p className="text-sm text-gray-900 flex items-center">
                  <User className="h-4 w-4 text-gray-400 mr-1" />
                  {booking.client.full_name}
                </p>
                <p className="mt-1 text-sm text-gray-900">{booking.client.email}</p>
                {booking.client.phone && (
                  <p className="mt-1 text-sm text-gray-900">{booking.client.phone}</p>
                )}
              </div>
            </div>

            {booking.notes && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-500">Notes</h4>
                <p className="mt-1 text-sm text-gray-900">{booking.notes}</p>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Close
            </button>
            {booking.status !== 'completed' && booking.status !== 'cancelled' && (
              <Link
                to={`/dashboard/service-agent/estimate/${booking.id}`}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Create Estimate
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsPopup;
