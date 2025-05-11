import React, { useState, useEffect } from 'react';
import { permitService } from '../../services/PermitService';
import { denverPermitApiService } from '../../services/DenverPermitApiService';
import type { Permit, PermitInspection } from '../../services/PermitService';

interface PermitDetailsProps {
  permit: Permit;
  onClose?: () => void;
}

const PermitDetails: React.FC<PermitDetailsProps> = ({ permit, onClose }) => {
  const [inspections, setInspections] = useState<PermitInspection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInspections = async () => {
      if (!permit.permit_number) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const inspectionData = await denverPermitApiService.getInspectionsForPermit(permit.permit_number);
        setInspections(inspectionData);
      } catch (err) {
        console.error('Error fetching inspections:', err);
        setError('Failed to load inspection data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInspections();
  }, [permit.permit_number]);

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };

  const openCityRecords = () => {
    // In a real implementation, this would open the city's permit records in a new tab
    window.open(`https://aca-prod.accela.com/DENVER/Cap/CapDetail.aspx?Module=Development&capID1=${permit.permit_number}`, '_blank');
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center bg-gray-50">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Permit {permit.permit_number}
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            {permit.permit_type} - {permit.status}
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      
      <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
        <dl className="sm:divide-y sm:divide-gray-200">
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Address</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{permit.address}</dd>
          </div>
          
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Description</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{permit.description || 'No description available'}</dd>
          </div>
          
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Issue Date</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formatDate(permit.issue_date)}</dd>
          </div>
          
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Expiration Date</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formatDate(permit.expiration_date)}</dd>
          </div>
          
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Valuation</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {permit.valuation ? `$${permit.valuation.toLocaleString()}` : 'N/A'}
            </dd>
          </div>
          
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Square Footage</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {permit.square_footage ? `${permit.square_footage.toLocaleString()} sq ft` : 'N/A'}
            </dd>
          </div>
          
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Parcel ID</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{permit.parcel_id || 'N/A'}</dd>
          </div>
        </dl>
      </div>
      
      <div className="px-4 py-5 sm:px-6 border-t border-gray-200">
        <h4 className="text-lg leading-6 font-medium text-gray-900 mb-4">Inspections</h4>
        
        {isLoading ? (
          <div className="text-center py-4">
            <svg className="animate-spin h-5 w-5 text-blue-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-2 text-sm text-gray-500">Loading inspections...</p>
          </div>
        ) : error ? (
          <div className="text-center py-4 text-red-500">{error}</div>
        ) : inspections.length === 0 ? (
          <div className="text-center py-4 text-gray-500">No inspections found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scheduled Date</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed Date</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inspector</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comments</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inspections.map((inspection) => (
                  <tr key={inspection.external_id}>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{inspection.inspection_type}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        inspection.status === 'Passed' ? 'bg-green-100 text-green-800' :
                        inspection.status === 'Failed' ? 'bg-red-100 text-red-800' :
                        inspection.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {inspection.status}
                      </span>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(inspection.scheduled_date)}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(inspection.completed_date)}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{inspection.inspector_name || 'N/A'}</td>
                    <td className="px-3 py-4 text-sm text-gray-500">{inspection.comments || 'No comments'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <div className="px-4 py-4 sm:px-6 border-t border-gray-200 flex justify-end">
        <button
          onClick={openCityRecords}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          View City Records
        </button>
      </div>
    </div>
  );
};

export default PermitDetails;
