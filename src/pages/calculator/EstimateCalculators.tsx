import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calculator, Hammer, ArrowLeft } from 'lucide-react';
import SimpleRemodelingCalculator from './SimpleRemodelingCalculator';
import SimpleHandymanCalculator from './SimpleHandymanCalculator';

const EstimateCalculators: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'remodeling' | 'handyman'>('remodeling');

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Home
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 sm:p-8">
            <h1 className="text-3xl font-bold text-gray-900 text-center">Free Instant Estimate</h1>
            <p className="text-center text-gray-600 mt-4 max-w-3xl mx-auto">
              Get a ballpark estimate for your home improvement project. Choose between our remodeling calculator for larger projects or our handyman task estimator for smaller jobs.
            </p>

            {/* Tab Navigation */}
            <div className="flex justify-center mt-8 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('remodeling')}
                className={`flex items-center px-6 py-3 font-medium text-sm ${
                  activeTab === 'remodeling'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Calculator className="h-5 w-5 mr-2" />
                Remodeling Calculator
              </button>
              <button
                onClick={() => setActiveTab('handyman')}
                className={`flex items-center px-6 py-3 font-medium text-sm ${
                  activeTab === 'handyman'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Hammer className="h-5 w-5 mr-2" />
                Handyman Task Estimator
              </button>
            </div>

            {/* Calculator Content */}
            <div className="mt-8">
              {activeTab === 'remodeling' ? (
                <SimpleRemodelingCalculator />
              ) : (
                <SimpleHandymanCalculator />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EstimateCalculators;
