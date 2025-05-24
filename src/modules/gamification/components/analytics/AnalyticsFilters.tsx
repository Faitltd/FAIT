import React, { useState } from 'react';
import { AnalyticsFilterOptions, AnalyticsTimePeriod } from '../../../../types/gamification-analytics.types';

interface AnalyticsFiltersProps {
  filters: AnalyticsFilterOptions;
  onFilterChange: (filters: AnalyticsFilterOptions) => void;
  userTypes?: string[];
  challengeCategories?: string[];
  eventTypes?: string[];
  className?: string;
}

/**
 * Component for analytics filters
 */
const AnalyticsFilters: React.FC<AnalyticsFiltersProps> = ({
  filters,
  onFilterChange,
  userTypes = ['client', 'service_agent', 'contractor', 'admin'],
  challengeCategories = ['profile', 'service', 'community', 'referral', 'verification', 'activity', 'special'],
  eventTypes = ['seasonal', 'special', 'community', 'promotional'],
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [customStartDate, setCustomStartDate] = useState(filters.startDate || '');
  const [customEndDate, setCustomEndDate] = useState(filters.endDate || '');

  // Handle time period change
  const handleTimePeriodChange = (period: AnalyticsTimePeriod) => {
    const newFilters = { ...filters, timePeriod: period };
    
    // Clear custom dates if not custom period
    if (period !== AnalyticsTimePeriod.CUSTOM) {
      newFilters.startDate = undefined;
      newFilters.endDate = undefined;
    } else {
      newFilters.startDate = customStartDate;
      newFilters.endDate = customEndDate;
    }
    
    onFilterChange(newFilters);
  };

  // Handle custom date change
  const handleCustomDateChange = () => {
    if (filters.timePeriod === AnalyticsTimePeriod.CUSTOM) {
      onFilterChange({
        ...filters,
        startDate: customStartDate,
        endDate: customEndDate
      });
    }
  };

  // Handle user type change
  const handleUserTypeChange = (userType: string | undefined) => {
    onFilterChange({
      ...filters,
      userType
    });
  };

  // Handle challenge category change
  const handleChallengeCategoryChange = (category: string | undefined) => {
    onFilterChange({
      ...filters,
      challengeCategory: category
    });
  };

  // Handle event type change
  const handleEventTypeChange = (eventType: string | undefined) => {
    onFilterChange({
      ...filters,
      eventType
    });
  };

  // Format time period for display
  const formatTimePeriod = (period: AnalyticsTimePeriod) => {
    switch (period) {
      case AnalyticsTimePeriod.DAY:
        return 'Last 24 Hours';
      case AnalyticsTimePeriod.WEEK:
        return 'Last 7 Days';
      case AnalyticsTimePeriod.MONTH:
        return 'Last 30 Days';
      case AnalyticsTimePeriod.QUARTER:
        return 'Last 3 Months';
      case AnalyticsTimePeriod.YEAR:
        return 'Last 12 Months';
      case AnalyticsTimePeriod.ALL_TIME:
        return 'All Time';
      case AnalyticsTimePeriod.CUSTOM:
        return 'Custom Range';
      default:
        return 'Select Period';
    }
  };

  return (
    <div className={`bg-white shadow sm:rounded-lg ${className}`}>
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Analytics Filters</h3>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {isExpanded ? 'Collapse Filters' : 'Expand Filters'}
          </button>
        </div>

        <div className="mt-4">
          {/* Time Period Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Time Period</label>
            <div className="mt-1 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
              {Object.values(AnalyticsTimePeriod).map((period) => (
                <button
                  key={period}
                  type="button"
                  className={`inline-flex justify-center items-center px-3 py-2 border ${
                    filters.timePeriod === period
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 bg-white text-gray-700'
                  } text-sm font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                  onClick={() => handleTimePeriodChange(period)}
                >
                  {formatTimePeriod(period)}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Date Range */}
          {filters.timePeriod === AnalyticsTimePeriod.CUSTOM && (
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="start-date" className="block text-sm font-medium text-gray-700">
                  Start Date
                </label>
                <input
                  type="date"
                  id="start-date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  onBlur={handleCustomDateChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="end-date" className="block text-sm font-medium text-gray-700">
                  End Date
                </label>
                <input
                  type="date"
                  id="end-date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  onBlur={handleCustomDateChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
          )}

          {/* Additional Filters (Expanded) */}
          {isExpanded && (
            <div className="mt-4 space-y-4">
              {/* User Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700">User Type</label>
                <div className="mt-1 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
                  <button
                    type="button"
                    className={`inline-flex justify-center items-center px-3 py-2 border ${
                      !filters.userType
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 bg-white text-gray-700'
                    } text-sm font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                    onClick={() => handleUserTypeChange(undefined)}
                  >
                    All Users
                  </button>
                  {userTypes.map((type) => (
                    <button
                      key={type}
                      type="button"
                      className={`inline-flex justify-center items-center px-3 py-2 border ${
                        filters.userType === type
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 bg-white text-gray-700'
                      } text-sm font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                      onClick={() => handleUserTypeChange(type)}
                    >
                      {type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Challenge Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Challenge Category</label>
                <div className="mt-1 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                  <button
                    type="button"
                    className={`inline-flex justify-center items-center px-3 py-2 border ${
                      !filters.challengeCategory
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 bg-white text-gray-700'
                    } text-sm font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                    onClick={() => handleChallengeCategoryChange(undefined)}
                  >
                    All Categories
                  </button>
                  {challengeCategories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      className={`inline-flex justify-center items-center px-3 py-2 border ${
                        filters.challengeCategory === category
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 bg-white text-gray-700'
                      } text-sm font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                      onClick={() => handleChallengeCategoryChange(category)}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Event Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Event Type</label>
                <div className="mt-1 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
                  <button
                    type="button"
                    className={`inline-flex justify-center items-center px-3 py-2 border ${
                      !filters.eventType
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 bg-white text-gray-700'
                    } text-sm font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                    onClick={() => handleEventTypeChange(undefined)}
                  >
                    All Events
                  </button>
                  {eventTypes.map((type) => (
                    <button
                      key={type}
                      type="button"
                      className={`inline-flex justify-center items-center px-3 py-2 border ${
                        filters.eventType === type
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 bg-white text-gray-700'
                      } text-sm font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                      onClick={() => handleEventTypeChange(type)}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsFilters;
