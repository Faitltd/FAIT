import React, { useState } from 'react';
import { TimeRange } from '../../../types/analytics.types';

interface TimeRangeSelectorProps {
  selectedRange: TimeRange;
  onRangeChange: (range: TimeRange, startDate?: string, endDate?: string) => void;
  className?: string;
}

/**
 * Component to select a time range for analytics
 */
const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({ 
  selectedRange,
  onRangeChange,
  className = ''
}) => {
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [showCustomDates, setShowCustomDates] = useState(selectedRange === 'custom');

  const handleRangeChange = (range: TimeRange) => {
    if (range === 'custom') {
      setShowCustomDates(true);
      // Only trigger the change if we have both dates
      if (customStartDate && customEndDate) {
        onRangeChange(range, customStartDate, customEndDate);
      }
    } else {
      setShowCustomDates(false);
      onRangeChange(range);
    }
  };

  const handleCustomDateChange = () => {
    if (customStartDate && customEndDate) {
      onRangeChange('custom', customStartDate, customEndDate);
    }
  };

  return (
    <div className={`bg-white shadow rounded-lg ${className}`}>
      <div className="px-4 py-5 sm:p-6">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Time Range</h3>
            <p className="mt-1 text-sm text-gray-500">
              Select a time range for the analytics data
            </p>
          </div>
        </div>
        <div className="mt-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <button
              type="button"
              className={`inline-flex items-center px-4 py-2 border ${
                selectedRange === 'today' 
                  ? 'border-blue-500 bg-blue-50 text-blue-700' 
                  : 'border-gray-300 bg-white text-gray-700'
              } text-sm font-medium rounded-md hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
              onClick={() => handleRangeChange('today')}
            >
              Today
            </button>
            <button
              type="button"
              className={`inline-flex items-center px-4 py-2 border ${
                selectedRange === 'yesterday' 
                  ? 'border-blue-500 bg-blue-50 text-blue-700' 
                  : 'border-gray-300 bg-white text-gray-700'
              } text-sm font-medium rounded-md hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
              onClick={() => handleRangeChange('yesterday')}
            >
              Yesterday
            </button>
            <button
              type="button"
              className={`inline-flex items-center px-4 py-2 border ${
                selectedRange === 'last_7_days' 
                  ? 'border-blue-500 bg-blue-50 text-blue-700' 
                  : 'border-gray-300 bg-white text-gray-700'
              } text-sm font-medium rounded-md hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
              onClick={() => handleRangeChange('last_7_days')}
            >
              Last 7 Days
            </button>
            <button
              type="button"
              className={`inline-flex items-center px-4 py-2 border ${
                selectedRange === 'last_30_days' 
                  ? 'border-blue-500 bg-blue-50 text-blue-700' 
                  : 'border-gray-300 bg-white text-gray-700'
              } text-sm font-medium rounded-md hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
              onClick={() => handleRangeChange('last_30_days')}
            >
              Last 30 Days
            </button>
            <button
              type="button"
              className={`inline-flex items-center px-4 py-2 border ${
                selectedRange === 'this_month' 
                  ? 'border-blue-500 bg-blue-50 text-blue-700' 
                  : 'border-gray-300 bg-white text-gray-700'
              } text-sm font-medium rounded-md hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
              onClick={() => handleRangeChange('this_month')}
            >
              This Month
            </button>
            <button
              type="button"
              className={`inline-flex items-center px-4 py-2 border ${
                selectedRange === 'last_month' 
                  ? 'border-blue-500 bg-blue-50 text-blue-700' 
                  : 'border-gray-300 bg-white text-gray-700'
              } text-sm font-medium rounded-md hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
              onClick={() => handleRangeChange('last_month')}
            >
              Last Month
            </button>
            <button
              type="button"
              className={`inline-flex items-center px-4 py-2 border ${
                selectedRange === 'this_year' 
                  ? 'border-blue-500 bg-blue-50 text-blue-700' 
                  : 'border-gray-300 bg-white text-gray-700'
              } text-sm font-medium rounded-md hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
              onClick={() => handleRangeChange('this_year')}
            >
              This Year
            </button>
            <button
              type="button"
              className={`inline-flex items-center px-4 py-2 border ${
                selectedRange === 'custom' 
                  ? 'border-blue-500 bg-blue-50 text-blue-700' 
                  : 'border-gray-300 bg-white text-gray-700'
              } text-sm font-medium rounded-md hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
              onClick={() => handleRangeChange('custom')}
            >
              Custom Range
            </button>
          </div>
          
          {showCustomDates && (
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="start-date" className="block text-sm font-medium text-gray-700">
                  Start Date
                </label>
                <input
                  type="date"
                  id="start-date"
                  name="start-date"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  onBlur={handleCustomDateChange}
                />
              </div>
              <div>
                <label htmlFor="end-date" className="block text-sm font-medium text-gray-700">
                  End Date
                </label>
                <input
                  type="date"
                  id="end-date"
                  name="end-date"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  onBlur={handleCustomDateChange}
                  min={customStartDate}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimeRangeSelector;
