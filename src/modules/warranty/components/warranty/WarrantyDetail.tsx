import React, { useState, useEffect } from 'react';
import { Warranty, WarrantyStatus, WarrantyType, WarrantyClaim } from '../../types/warranty';
import { useWarranty } from '../../hooks/useWarranty';
import { Button } from '../../../core/components/ui/Button';
import { LoadingSpinner } from '../../../core/components/common/LoadingSpinner';

export interface WarrantyDetailProps {
  warrantyId: string;
  onBack?: () => void;
  onEdit?: (warranty: Warranty) => void;
  onCreateClaim?: (warranty: Warranty) => void;
  onViewClaim?: (claim: WarrantyClaim) => void;
}

/**
 * WarrantyDetail component for displaying warranty details
 */
export const WarrantyDetail: React.FC<WarrantyDetailProps> = ({
  warrantyId,
  onBack,
  onEdit,
  onCreateClaim,
  onViewClaim,
}) => {
  const {
    warranty,
    warrantyClaims,
    isLoading,
    error,
    fetchWarranty,
    fetchWarrantyClaims,
    generateWarrantyPDF,
  } = useWarranty();

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Fetch warranty and claims on mount
  useEffect(() => {
    fetchWarranty(warrantyId);
    fetchWarrantyClaims({
      filter: {
        warrantyId,
      },
    });
  }, [fetchWarranty, fetchWarrantyClaims, warrantyId]);

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Get status badge class
  const getStatusBadgeClass = (status: WarrantyStatus): string => {
    switch (status) {
      case WarrantyStatus.ACTIVE:
        return 'bg-green-100 text-green-800';
      case WarrantyStatus.EXPIRED:
        return 'bg-red-100 text-red-800';
      case WarrantyStatus.VOIDED:
        return 'bg-gray-100 text-gray-800';
      case WarrantyStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Handle generate PDF
  const handleGeneratePDF = async () => {
    if (!warranty) return;
    
    setIsGeneratingPdf(true);
    
    try {
      const url = await generateWarrantyPDF(warranty.id);
      setPdfUrl(url);
      
      // Open PDF in new tab
      window.open(url, '_blank');
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  if (isLoading && !warranty) {
    return <LoadingSpinner size="lg" message="Loading warranty details..." />;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded mb-4">
        Error: {error}
      </div>
    );
  }

  if (!warranty) {
    return (
      <div className="p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded mb-4">
        Warranty not found
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            {onBack && (
              <Button variant="outline" size="sm" onClick={onBack} className="mr-4">
                Back
              </Button>
            )}
            <h2 className="text-xl font-semibold">{warranty.title}</h2>
          </div>
          <div className="flex space-x-2">
            {onEdit && (
              <Button variant="outline" onClick={() => onEdit(warranty)}>
                Edit
              </Button>
            )}
            <Button
              onClick={handleGeneratePDF}
              disabled={isGeneratingPdf}
            >
              {isGeneratingPdf ? <LoadingSpinner size="sm" /> : 'Generate PDF'}
            </Button>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Warranty Information</h3>
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-sm font-medium text-gray-500">Status</div>
                <div>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(
                      warranty.status
                    )}`}
                  >
                    {warranty.status}
                  </span>
                </div>
                
                <div className="text-sm font-medium text-gray-500">Type</div>
                <div className="capitalize">{warranty.type}</div>
                
                <div className="text-sm font-medium text-gray-500">Start Date</div>
                <div>{formatDate(warranty.startDate)}</div>
                
                <div className="text-sm font-medium text-gray-500">End Date</div>
                <div>{warranty.endDate ? formatDate(warranty.endDate) : 'N/A'}</div>
                
                <div className="text-sm font-medium text-gray-500">Duration</div>
                <div>{warranty.duration ? `${warranty.duration} months` : 'N/A'}</div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Client Information</h3>
            <div className="bg-gray-50 p-4 rounded-md">
              {warranty.client ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-sm font-medium text-gray-500">Name</div>
                  <div>{`${warranty.client.firstName} ${warranty.client.lastName}`}</div>
                  
                  <div className="text-sm font-medium text-gray-500">Email</div>
                  <div>{warranty.client.email}</div>
                  
                  <div className="text-sm font-medium text-gray-500">Phone</div>
                  <div>{warranty.client.phone || 'N/A'}</div>
                </div>
              ) : (
                <div className="text-gray-500">Client information not available</div>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-4">Description</h3>
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="whitespace-pre-line">{warranty.description}</p>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Covered Items</h3>
            <div className="bg-gray-50 p-4 rounded-md">
              {warranty.coveredItems.length > 0 ? (
                <ul className="list-disc list-inside space-y-1">
                  {warranty.coveredItems.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              ) : (
                <div className="text-gray-500">No covered items specified</div>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Exclusions</h3>
            <div className="bg-gray-50 p-4 rounded-md">
              {warranty.exclusions && warranty.exclusions.length > 0 ? (
                <ul className="list-disc list-inside space-y-1">
                  {warranty.exclusions.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              ) : (
                <div className="text-gray-500">No exclusions specified</div>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-4">Terms and Conditions</h3>
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="whitespace-pre-line">{warranty.terms}</p>
          </div>
        </div>
        
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Warranty Claims</h3>
            {onCreateClaim && (
              <Button onClick={() => onCreateClaim(warranty)}>Create Claim</Button>
            )}
          </div>
          
          {isLoading ? (
            <LoadingSpinner size="md" message="Loading claims..." />
          ) : warrantyClaims.length > 0 ? (
            <div className="bg-gray-50 rounded-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Title
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Issue Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Resolution Date
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {warrantyClaims.map((claim) => (
                    <tr key={claim.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{claim.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            claim.status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : claim.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : claim.status === 'in_progress'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {claim.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(claim.issueDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {claim.resolutionDate ? formatDate(claim.resolutionDate) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {onViewClaim && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onViewClaim(claim)}
                          >
                            View
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-gray-50 p-4 rounded-md text-gray-500 text-center">
              No claims have been filed for this warranty
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
