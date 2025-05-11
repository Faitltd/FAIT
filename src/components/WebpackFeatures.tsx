import React, { useState, useEffect } from 'react';
import { formatFileSize, arrayUtils } from '../utils/webpack-utils';

/**
 * Component that demonstrates webpack-specific features like code splitting
 */
const WebpackFeatures: React.FC = () => {
  const [chartLibrary, setChartLibrary] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Example data to demonstrate tree-shaking
  const data = [
    { id: 1, category: 'A', value: 10 },
    { id: 2, category: 'B', value: 20 },
    { id: 3, category: 'A', value: 30 },
    { id: 4, category: 'C', value: 40 },
    { id: 5, category: 'B', value: 50 },
  ];
  
  // Using the tree-shakable utility
  const uniqueCategories = arrayUtils.unique(data.map(item => item.category));
  const groupedData = arrayUtils.groupBy(data, 'category');
  
  // Function to dynamically load the chart library
  const loadChart = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Dynamic import - this will be code-split by webpack
      const { loadChartLibrary } = await import('../utils/webpack-utils');
      const Chart = await loadChartLibrary();
      setChartLibrary(Chart);
    } catch (err) {
      console.error('Failed to load chart library:', err);
      setError('Failed to load chart library');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Webpack Features Demo</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Tree-Shaking Demo</h3>
        <div className="bg-gray-100 p-4 rounded">
          <p className="mb-2"><strong>Unique Categories:</strong> {uniqueCategories.join(', ')}</p>
          <p className="mb-2"><strong>Grouped Data:</strong></p>
          <pre className="bg-gray-800 text-white p-3 rounded text-sm overflow-x-auto">
            {JSON.stringify(groupedData, null, 2)}
          </pre>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Code Splitting Demo</h3>
        <p className="mb-4">
          Click the button below to dynamically load the Chart.js library.
          This demonstrates webpack's code splitting capability.
        </p>
        
        <button
          onClick={loadChart}
          disabled={loading || !!chartLibrary}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Loading...' : chartLibrary ? 'Chart Library Loaded' : 'Load Chart Library'}
        </button>
        
        {error && (
          <p className="mt-2 text-red-600">{error}</p>
        )}
        
        {chartLibrary && (
          <div className="mt-4 p-4 bg-green-100 text-green-800 rounded">
            <p>Chart.js library loaded successfully!</p>
            <p className="text-sm mt-1">
              This library was not included in the initial bundle, saving approximately {formatFileSize(500000)} of initial load size.
            </p>
          </div>
        )}
      </div>
      
      <div className="text-sm text-gray-600 mt-4 pt-4 border-t border-gray-200">
        <p>
          These features demonstrate webpack's capabilities for optimizing bundle size and performance.
          The code splitting feature allows large dependencies to be loaded only when needed,
          while tree-shaking removes unused code from the final bundle.
        </p>
      </div>
    </div>
  );
};

export default WebpackFeatures;
