import React from 'react';
import { TimeSeriesData } from '../../../../types/gamification-analytics.types';

interface TimeSeriesChartProps {
  data: TimeSeriesData[];
  title: string;
  description?: string;
  yAxisLabel?: string;
  isLoading?: boolean;
  className?: string;
}

/**
 * Component to display time series data chart
 */
const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({
  data,
  title,
  description,
  yAxisLabel = 'Value',
  isLoading = false,
  className = ''
}) => {
  // Group data by category if it exists
  const groupedData: Record<string, TimeSeriesData[]> = {};
  
  data.forEach(item => {
    const category = item.category || 'default';
    if (!groupedData[category]) {
      groupedData[category] = [];
    }
    groupedData[category].push(item);
  });
  
  // Get all unique dates
  const allDates = [...new Set(data.map(item => item.date))].sort();
  
  // Get max value for scaling
  const maxValue = Math.max(...data.map(item => item.value), 1);
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };
  
  // Get color for category
  const getColorForCategory = (category: string, index: number) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-indigo-500',
      'bg-pink-500',
      'bg-teal-500'
    ];
    
    if (category === 'default') {
      return 'bg-blue-500';
    }
    
    return colors[index % colors.length];
  };
  
  // Get height percentage based on value
  const getHeightPercentage = (value: number) => {
    return (value / maxValue) * 100;
  };

  return (
    <div className={`bg-white shadow overflow-hidden sm:rounded-lg ${className}`}>
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
        {description && (
          <p className="mt-1 max-w-2xl text-sm text-gray-500">{description}</p>
        )}
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          {data.length === 0 ? (
            <div className="flex justify-center items-center h-64 text-gray-500">
              No data available
            </div>
          ) : (
            <>
              {/* Chart */}
              <div className="relative h-64">
                {/* Y-axis label */}
                <div className="absolute -left-6 top-1/2 transform -rotate-90 -translate-y-1/2 text-xs text-gray-500">
                  {yAxisLabel}
                </div>
                
                {/* Y-axis ticks */}
                <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-gray-500">
                  <div>{maxValue.toLocaleString()}</div>
                  <div>{Math.round(maxValue * 0.75).toLocaleString()}</div>
                  <div>{Math.round(maxValue * 0.5).toLocaleString()}</div>
                  <div>{Math.round(maxValue * 0.25).toLocaleString()}</div>
                  <div>0</div>
                </div>
                
                {/* Chart area */}
                <div className="absolute left-12 right-0 top-0 bottom-0">
                  {/* Grid lines */}
                  <div className="absolute left-0 right-0 top-0 bottom-0 grid grid-cols-1 grid-rows-4">
                    <div className="border-b border-gray-200"></div>
                    <div className="border-b border-gray-200"></div>
                    <div className="border-b border-gray-200"></div>
                    <div className="border-b border-gray-200"></div>
                  </div>
                  
                  {/* Bars */}
                  <div className="absolute left-0 right-0 top-0 bottom-0 flex items-end">
                    {Object.keys(groupedData).length > 1 ? (
                      // Stacked bars for multiple categories
                      <div className="flex-1 flex justify-between items-end">
                        {allDates.map((date, dateIndex) => (
                          <div key={date} className="flex flex-col-reverse items-center">
                            <div className="text-xs text-gray-500 mt-1">{formatDate(date)}</div>
                            <div className="w-6 flex flex-col-reverse">
                              {Object.entries(groupedData).map(([category, items], categoryIndex) => {
                                const item = items.find(i => i.date === date);
                                if (!item) return null;
                                
                                return (
                                  <div
                                    key={category}
                                    className={`w-full ${getColorForCategory(category, categoryIndex)}`}
                                    style={{ height: `${getHeightPercentage(item.value)}%` }}
                                    title={`${category}: ${item.value.toLocaleString()}`}
                                  ></div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      // Simple bars for single category
                      <div className="flex-1 flex justify-between items-end">
                        {data.map((item, index) => (
                          <div key={index} className="flex flex-col items-center">
                            <div 
                              className="w-6 bg-blue-500"
                              style={{ height: `${getHeightPercentage(item.value)}%` }}
                              title={`${item.value.toLocaleString()}`}
                            ></div>
                            <div className="text-xs text-gray-500 mt-1">{formatDate(item.date)}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Legend */}
              {Object.keys(groupedData).length > 1 && (
                <div className="mt-6 flex flex-wrap gap-4">
                  {Object.entries(groupedData).map(([category, _], index) => (
                    <div key={category} className="flex items-center">
                      <div className={`w-3 h-3 rounded-sm ${getColorForCategory(category, index)} mr-1`}></div>
                      <span className="text-xs text-gray-700">
                        {category === 'default' ? 'Value' : category}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default TimeSeriesChart;
