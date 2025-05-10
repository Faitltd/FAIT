import React, { useState } from 'react';
// Try direct imports instead of using the index file
import { RemodelingCalculator } from '../../../remodeling-calculator/RemodelingCalculator';
import { SimpleRemodelingCalculator } from '../../../remodeling-calculator/SimpleRemodelingCalculator';

const TestRemodelingCalculator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'full' | 'simple'>('full');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
          Remodeling Calculator Test Page
        </h1>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                activeTab === 'full'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('full')}
            >
              Full Calculator
            </button>
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                activeTab === 'simple'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('simple')}
            >
              Simple Calculator
            </button>
          </div>
        </div>

        {/* Calculator Components */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {activeTab === 'full' ? (
            <RemodelingCalculator />
          ) : (
            <SimpleRemodelingCalculator />
          )}
        </div>
      </div>
    </div>
  );
};

export default TestRemodelingCalculator;
