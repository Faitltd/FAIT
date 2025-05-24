import React from 'react';
import { Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import type { Database } from '../lib/database.types';

type WarrantyClaim = Database['public']['Tables']['warranty_claims']['Row'] & {
  booking: Database['public']['Tables']['bookings']['Row'] & {
    service_package: Database['public']['Tables']['service_packages']['Row'];
  };
};

interface WarrantyClaimsListProps {
  claims: WarrantyClaim[];
  isContractor?: boolean;
  onStatusChange?: (claimId: string, status: string) => void;
}

const WarrantyClaimsList: React.FC<WarrantyClaimsListProps> = ({ 
  claims, 
  isContractor,
  onStatusChange 
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'resolved':
        return (
          <span className="flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-4 h-4 mr-1" />
            Resolved
          </span>
        );
      case 'reviewing':
        return (
          <span className="flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            <Clock className="w-4 h-4 mr-1" />
            Reviewing
          </span>
        );
      case 'rejected':
        return (
          <span className="flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            <XCircle className="w-4 h-4 mr-1" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            <AlertTriangle className="w-4 h-4 mr-1" />
            Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {claims.map((claim) => (
        <div
          key={claim.id}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {claim.booking.service_package.title}
                </h3>
                {getStatusBadge(claim.status)}
              </div>
              <p className="mt-2 text-sm text-gray-600">{claim.description}</p>
              <div className="mt-2 text-sm text-gray-500">
                <p>Submitted: {new Date(claim.created_at).toLocaleDateString()}</p>
                {claim.resolution_date && (
                  <p>Resolved: {new Date(claim.resolution_date).toLocaleDateString()}</p>
                )}
              </div>
            </div>
            {isContractor && onStatusChange && claim.status !== 'resolved' && (
              <div className="flex space-x-2">
                <button
                  onClick={() => onStatusChange(claim.id, 'reviewing')}
                  className="px-3 py-1 text-sm font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200"
                >
                  Review
                </button>
                <button
                  onClick={() => onStatusChange(claim.id, 'resolved')}
                  className="px-3 py-1 text-sm font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200"
                >
                  Resolve
                </button>
                <button
                  onClick={() => onStatusChange(claim.id, 'rejected')}
                  className="px-3 py-1 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
          {claim.resolution_notes && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <h4 className="text-sm font-medium text-gray-900">Resolution Notes</h4>
              <p className="mt-1 text-sm text-gray-600">{claim.resolution_notes}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default WarrantyClaimsList;