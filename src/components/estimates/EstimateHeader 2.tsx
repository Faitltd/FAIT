import React from 'react';
import { Estimate } from './EstimateBuilder';
import { Calendar } from 'lucide-react';

interface EstimateHeaderProps {
  estimate: Estimate;
  clientDetails: any;
  originalBooking: any;
  onChange: (field: keyof Estimate, value: any) => void;
}

const EstimateHeader: React.FC<EstimateHeaderProps> = ({
  estimate,
  clientDetails,
  originalBooking,
  onChange
}) => {
  // Calculate default expiration date (30 days from now)
  const getDefaultExpirationDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column - Estimate details */}
        <div>
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Estimate Title*
            </label>
            <input
              type="text"
              id="title"
              value={estimate.title}
              onChange={(e) => onChange('title', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="e.g., Additional Plumbing Work"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description*
            </label>
            <textarea
              id="description"
              value={estimate.description}
              onChange={(e) => onChange('description', e.target.value)}
              rows={3}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Describe the scope of work for this estimate"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="expiration_date" className="block text-sm font-medium text-gray-700 mb-1">
              Expiration Date
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                id="expiration_date"
                value={estimate.expiration_date || getDefaultExpirationDate()}
                onChange={(e) => onChange('expiration_date', e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              The estimate will expire after this date if not approved.
            </p>
          </div>
          
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              value={estimate.notes || ''}
              onChange={(e) => onChange('notes', e.target.value)}
              rows={3}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Additional notes or terms for this estimate"
            />
          </div>
        </div>
        
        {/* Right column - Client and booking info */}
        <div>
          {clientDetails ? (
            <div className="bg-gray-50 p-4 rounded-md mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Client Information</h3>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Name:</span> {clientDetails.full_name}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Email:</span> {clientDetails.email}
                </p>
                {clientDetails.phone && (
                  <p className="text-sm">
                    <span className="font-medium">Phone:</span> {clientDetails.phone}
                  </p>
                )}
                {clientDetails.address && (
                  <p className="text-sm">
                    <span className="font-medium">Address:</span> {clientDetails.address}, {clientDetails.city}, {clientDetails.state} {clientDetails.zip_code}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 p-4 rounded-md mb-4">
              <p className="text-sm text-yellow-700">
                No client selected. Please select a client for this estimate.
              </p>
            </div>
          )}
          
          {originalBooking ? (
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Original Service</h3>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Service:</span> {originalBooking.service_package?.title || 'Custom Service'}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Booking ID:</span> {originalBooking.id.substring(0, 8)}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Date:</span> {new Date(originalBooking.scheduled_date).toLocaleDateString()}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Original Amount:</span> ${originalBooking.total_amount.toFixed(2)}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-blue-50 p-4 rounded-md">
              <p className="text-sm text-blue-700">
                This is a new estimate not associated with an existing booking.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EstimateHeader;
