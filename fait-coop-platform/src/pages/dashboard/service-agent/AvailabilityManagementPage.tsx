import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import ServiceAgentAvailabilityCalendar from '../../../components/availability/ServiceAgentAvailabilityCalendar';
import { Calendar, Clock, AlertCircle, CheckCircle, Info } from 'lucide-react';

const AvailabilityManagementPage: React.FC = () => {
  const { user } = useAuth();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleAvailabilityChange = () => {
    setSuccessMessage('Your availability has been updated successfully');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Manage Your Availability</h1>
        <p className="mt-1 text-sm text-gray-600">
          Set your weekly schedule and mark specific dates as unavailable.
        </p>
      </div>

      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md flex items-start">
          <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-700">{successMessage}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">Availability Calendar</h2>
          </div>
        </div>
        <div className="p-6">
          <ServiceAgentAvailabilityCalendar
            serviceAgentId={user?.id}
            onAvailabilityChange={handleAvailabilityChange}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <Info className="h-5 w-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">Availability Tips</h2>
            </div>
          </div>
          <div className="p-6">
            <ul className="space-y-4">
              <li className="flex items-start">
                <Clock className="h-5 w-5 text-gray-500 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Set Regular Hours</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Set your regular weekly hours to let clients know when you're typically available.
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <Calendar className="h-5 w-5 text-gray-500 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Block Off Dates</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Mark specific dates as unavailable for vacations, holidays, or other commitments.
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <AlertCircle className="h-5 w-5 text-gray-500 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Keep It Updated</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Regularly update your availability to avoid scheduling conflicts and cancellations.
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">Important Notes</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 rounded-md">
                <h3 className="text-sm font-medium text-yellow-800">Booking Confirmations</h3>
                <p className="mt-1 text-sm text-yellow-700">
                  When a client books a time slot, you'll receive a notification to confirm or decline the booking.
                </p>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-md">
                <h3 className="text-sm font-medium text-blue-800">Buffer Time</h3>
                <p className="mt-1 text-sm text-blue-700">
                  The system automatically adds a 30-minute buffer between bookings to give you time to travel or prepare.
                </p>
              </div>
              
              <div className="p-4 bg-green-50 rounded-md">
                <h3 className="text-sm font-medium text-green-800">Recurring Bookings</h3>
                <p className="mt-1 text-sm text-green-700">
                  Clients can book recurring services. You'll be able to confirm each instance individually.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityManagementPage;
