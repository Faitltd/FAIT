import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Star, MapPin, Navigation } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { ServicePackage } from '../../pages/services/EnhancedServiceSearchPage';
import ServiceCard from './ServiceCard';

interface ServiceSearchResultsProps {
  services: ServicePackage[];
  viewMode: 'grid' | 'list';
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onGetDirections?: (serviceId: string) => void;
}

const ServiceSearchResults: React.FC<ServiceSearchResultsProps> = ({
  services,
  viewMode,
  page,
  totalPages,
  onPageChange,
  onGetDirections
}) => {
  // Helper function to render star ratings
  const renderStars = (rating: number, serviceId: string, reviewCount: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= Math.round(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <Link to={`/services/${serviceId}/reviews`} className="ml-1 text-sm text-gray-600 hover:text-blue-600">
          {rating.toFixed(1)}
          <span className="ml-1 text-xs text-gray-500">
            ({reviewCount})
          </span>
        </Link>
      </div>
    );
  };

  // Render grid view
  const renderGridView = () => {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            onGetDirections={onGetDirections}
          />
        ))}
      </div>
    );
  };

  // Render list view
  const renderListView = () => {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Service
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Provider
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rating
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {services.map((service) => (
              <tr key={service.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-md overflow-hidden">
                      {service.image_url ? (
                        <img
                          src={service.image_url}
                          alt={service.title}
                          className="h-10 w-10 object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 flex items-center justify-center bg-gray-100">
                          <span className="text-gray-500 text-xs">No img</span>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{service.title}</div>
                      <div className="text-sm text-gray-500">
                        {service.category}
                        {service.subcategory && ` › ${service.subcategory}`}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8">
                      <img
                        className="h-8 w-8 rounded-full"
                        src={service.service_agent.avatar_url || '/default-avatar.png'}
                        alt=""
                      />
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">
                        {service.service_agent.full_name}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>
                      {service.service_agent.zip_code || 'N/A'}
                      {service.distance !== undefined && ` (${service.distance.toFixed(1)} mi)`}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {formatCurrency(service.price)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col items-center">
                    {renderStars(service.avg_rating, service.id, service.review_count)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex space-x-2 justify-end">
                    <Link
                      to={`/book/${service.id}`}
                      className="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1 rounded-md"
                    >
                      Book
                    </Link>
                    {onGetDirections && (
                      <button
                        onClick={() => onGetDirections(service.id)}
                        className="text-gray-600 hover:text-gray-900 bg-gray-100 px-3 py-1 rounded-md flex items-center"
                      >
                        <Navigation className="h-3 w-3 mr-1" />
                        Directions
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Render pagination
  const renderPagination = () => {
    return (
      <div className="mt-6 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
        <div className="flex flex-1 justify-between sm:hidden">
          <button
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1}
            className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
              page === 1
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            Previous
          </button>
          <button
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
              page === totalPages
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing page <span className="font-medium">{page}</span> of{' '}
              <span className="font-medium">{totalPages}</span>
            </p>
          </div>
          <div>
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              <button
                onClick={() => onPageChange(Math.max(1, page - 1))}
                disabled={page === 1}
                className={`relative inline-flex items-center rounded-l-md px-2 py-2 ${
                  page === 1
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-400 hover:bg-gray-50'
                } ring-1 ring-inset ring-gray-300 focus:outline-offset-0`}
              >
                <span className="sr-only">Previous</span>
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>

              {/* Page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Show pages around the current page
                let pageNum;
                if (totalPages <= 5) {
                  // If 5 or fewer pages, show all
                  pageNum = i + 1;
                } else if (page <= 3) {
                  // If near the start, show first 5 pages
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  // If near the end, show last 5 pages
                  pageNum = totalPages - 4 + i;
                } else {
                  // Otherwise show 2 pages before and after current page
                  pageNum = page - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                      page === pageNum
                        ? 'z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                        : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className={`relative inline-flex items-center rounded-r-md px-2 py-2 ${
                  page === totalPages
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-400 hover:bg-gray-50'
                } ring-1 ring-inset ring-gray-300 focus:outline-offset-0`}
              >
                <span className="sr-only">Next</span>
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {viewMode === 'grid' ? renderGridView() : renderListView()}
      {totalPages > 1 && renderPagination()}
    </div>
  );
};

export default ServiceSearchResults;
