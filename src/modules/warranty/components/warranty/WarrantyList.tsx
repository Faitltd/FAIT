import React, { useState, useEffect } from 'react';
import { Warranty, WarrantyStatus, WarrantyType } from '../../types/warranty';
import { useWarranty } from '../../hooks/useWarranty';
import { Button } from '../../../core/components/ui/Button';
import { LoadingSpinner } from '../../../core/components/common/LoadingSpinner';

export interface WarrantyListProps {
  onSelectWarranty?: (warranty: Warranty) => void;
  onCreateWarranty?: () => void;
  clientId?: string;
  serviceAgentId?: string;
  projectId?: string;
}

/**
 * WarrantyList component for displaying a list of warranties
 */
export const WarrantyList: React.FC<WarrantyListProps> = ({
  onSelectWarranty,
  onCreateWarranty,
  clientId,
  serviceAgentId,
  projectId,
}) => {
  const {
    warranties,
    isLoading,
    error,
    totalWarranties,
    fetchWarranties,
  } = useWarranty();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState<WarrantyStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<WarrantyType | 'all'>('all');

  // Fetch warranties on mount and when filters change
  useEffect(() => {
    const params: any = {
      pagination: {
        page: currentPage,
        limit: itemsPerPage,
      },
      filter: {},
    };

    if (statusFilter !== 'all') {
      params.filter.status = statusFilter;
    }

    if (typeFilter !== 'all') {
      params.filter.type = typeFilter;
    }

    if (clientId) {
      params.filter.clientId = clientId;
    }

    if (serviceAgentId) {
      params.filter.serviceAgentId = serviceAgentId;
    }

    if (projectId) {
      params.filter.projectId = projectId;
    }

    fetchWarranties(params);
  }, [fetchWarranties, currentPage, itemsPerPage, statusFilter, typeFilter, clientId, serviceAgentId, projectId]);

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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

  // Get type badge class
  const getTypeBadgeClass = (type: WarrantyType): string => {
    switch (type) {
      case WarrantyType.STANDARD:
        return 'bg-blue-100 text-blue-800';
      case WarrantyType.EXTENDED:
        return 'bg-purple-100 text-purple-800';
      case WarrantyType.LIMITED:
        return 'bg-orange-100 text-orange-800';
      case WarrantyType.LIFETIME:
        return 'bg-green-100 text-green-800';
      case WarrantyType.MANUFACTURER:
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Calculate total pages
  const totalPages = Math.ceil(totalWarranties / itemsPerPage);

  if (isLoading && warranties.length === 0) {
    return <LoadingSpinner size="lg" message="Loading warranties..." />;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded mb-4">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Warranties</h2>
          {onCreateWarranty && (
            <Button onClick={onCreateWarranty}>Create Warranty</Button>
          )}
        </div>
        
        <div className="mt-4 flex flex-wrap gap-2">
          <div>
            <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as WarrantyStatus | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Statuses</option>
              <option value={WarrantyStatus.ACTIVE}>Active</option>
              <option value={WarrantyStatus.EXPIRED}>Expired</option>
              <option value={WarrantyStatus.VOIDED}>Voided</option>
              <option value={WarrantyStatus.PENDING}>Pending</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="typeFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              id="typeFilter"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as WarrantyType | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Types</option>
              <option value={WarrantyType.STANDARD}>Standard</option>
              <option value={WarrantyType.EXTENDED}>Extended</option>
              <option value={WarrantyType.LIMITED}>Limited</option>
              <option value={WarrantyType.LIFETIME}>Lifetime</option>
              <option value={WarrantyType.MANUFACTURER}>Manufacturer</option>
            </select>
          </div>
        </div>
      </div>
      
      {warranties.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-gray-500">No warranties found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
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
                  Type
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
                  Start Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  End Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Client
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {warranties.map((warranty) => (
                <tr
                  key={warranty.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => onSelectWarranty?.(warranty)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{warranty.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeBadgeClass(
                        warranty.type
                      )}`}
                    >
                      {warranty.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                        warranty.status
                      )}`}
                    >
                      {warranty.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(warranty.startDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {warranty.endDate ? formatDate(warranty.endDate) : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {warranty.client
                      ? `${warranty.client.firstName} ${warranty.client.lastName}`
                      : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectWarranty?.(warranty);
                      }}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {totalPages > 1 && (
        <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * itemsPerPage, totalWarranties)}
                </span>{' '}
                of <span className="font-medium">{totalWarranties}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  Previous
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={page === currentPage ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  Next
                </Button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
