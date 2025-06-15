import React from 'react';
import { ABTest } from '../../../types/analytics.types';
import { Link } from 'react-router-dom';

interface ABTestCardProps {
  test: ABTest;
  className?: string;
}

/**
 * Component to display an A/B test card
 */
const ABTestCard: React.FC<ABTestCardProps> = ({ 
  test,
  className = ''
}) => {
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Get status badge
  const getStatusBadge = () => {
    switch (test.status) {
      case 'draft':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Draft
          </span>
        );
      case 'running':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Running
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`bg-white overflow-hidden shadow rounded-lg ${className}`}>
      <div className="px-4 py-5 sm:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">{test.name}</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">{test.description}</p>
          </div>
          <div>
            {getStatusBadge()}
          </div>
        </div>
      </div>
      <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Start Date</dt>
            <dd className="mt-1 text-sm text-gray-900">{formatDate(test.start_date)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">End Date</dt>
            <dd className="mt-1 text-sm text-gray-900">{test.end_date ? formatDate(test.end_date) : 'Ongoing'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Target Metric</dt>
            <dd className="mt-1 text-sm text-gray-900">{test.target_metric}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Variants</dt>
            <dd className="mt-1 text-sm text-gray-900">{test.variants.length}</dd>
          </div>
        </dl>

        {/* Variants */}
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-500">Variants</h4>
          <ul className="mt-2 divide-y divide-gray-200">
            {test.variants.map((variant) => (
              <li key={variant.id} className="py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{variant.name}</p>
                    <p className="text-sm text-gray-500">{variant.description}</p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {variant.allocation_percentage}% allocation
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Results (if completed) */}
        {test.status === 'completed' && test.results && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-500">Results</h4>
            <div className="mt-2 bg-gray-50 p-4 rounded-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Winning Variant: {test.results.winning_variant ? 
                      test.variants.find(v => v.id === test.results.winning_variant)?.name || 'Unknown' 
                      : 'No clear winner'}
                  </p>
                  {test.results.improvement_percentage && (
                    <p className="text-sm text-gray-500">
                      {test.results.improvement_percentage > 0 ? '+' : ''}{test.results.improvement_percentage.toFixed(2)}% improvement
                    </p>
                  )}
                </div>
                {test.results.confidence_level && (
                  <div className="text-sm text-gray-500">
                    {test.results.confidence_level.toFixed(2)}% confidence
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="bg-gray-50 px-4 py-4 sm:px-6">
        <div className="flex justify-end">
          <Link
            to={`/analytics/ab-tests/${test.id}`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ABTestCard;
