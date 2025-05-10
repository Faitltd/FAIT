import React, { useState } from 'react';
import { PageLayout } from '../modules/core/components/layout/PageLayout';
import { HandymanEstimator } from '../modules/estimation/components/estimator/HandymanEstimator';
import { RemodelingCalculator } from '../modules/estimation/components/calculator/RemodelingCalculator';
import { HandymanTaskEstimate, RemodelingEstimate } from '../modules/estimation/types/estimation';
import { Button } from '../modules/core/components/ui/Button';

/**
 * EstimationPage component for displaying estimation tools
 */
const EstimationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'handyman' | 'remodeling'>('handyman');
  const [savedEstimates, setSavedEstimates] = useState<Array<HandymanTaskEstimate | RemodelingEstimate>>([]);

  // Handle handyman estimate saved
  const handleHandymanEstimateSaved = (estimate: HandymanTaskEstimate) => {
    setSavedEstimates((prev) => [...prev, estimate]);
  };

  // Handle remodeling estimate saved
  const handleRemodelingEstimateSaved = (estimate: RemodelingEstimate) => {
    setSavedEstimates((prev) => [...prev, estimate]);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Get estimate type
  const getEstimateType = (estimate: HandymanTaskEstimate | RemodelingEstimate): string => {
    if ('taskType' in estimate) {
      return 'Handyman Task';
    } else if ('roomType' in estimate) {
      return 'Remodeling';
    }
    return 'Unknown';
  };

  // Get estimate description
  const getEstimateDescription = (estimate: HandymanTaskEstimate | RemodelingEstimate): string => {
    if ('taskType' in estimate) {
      return `${estimate.taskType.charAt(0).toUpperCase() + estimate.taskType.slice(1)}: ${estimate.description}`;
    } else if ('roomType' in estimate) {
      return `${estimate.roomType.charAt(0).toUpperCase() + estimate.roomType.slice(1)} (${estimate.squareFootage} sq ft, ${estimate.quality})`;
    }
    return '';
  };

  return (
    <PageLayout
      title="Estimation Tools"
      description="Calculate estimates for your projects"
    >
      <div className="mb-6">
        <div className="flex space-x-2">
          <Button
            variant={activeTab === 'handyman' ? 'default' : 'outline'}
            onClick={() => setActiveTab('handyman')}
          >
            Handyman Task Estimator
          </Button>
          <Button
            variant={activeTab === 'remodeling' ? 'default' : 'outline'}
            onClick={() => setActiveTab('remodeling')}
          >
            Remodeling Calculator
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {activeTab === 'handyman' ? (
            <HandymanEstimator onEstimateSaved={handleHandymanEstimateSaved} />
          ) : (
            <RemodelingCalculator onCalculate={handleRemodelingEstimateSaved} />
          )}
        </div>
        
        <div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Saved Estimates</h2>
            
            {savedEstimates.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                No saved estimates yet. Generate and save an estimate to see it here.
              </div>
            ) : (
              <div className="space-y-4">
                {savedEstimates.map((estimate, index) => (
                  <div key={index} className="border rounded-md p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm font-medium text-gray-500">
                          {getEstimateType(estimate)}
                        </div>
                        <div className="font-medium">{getEstimateDescription(estimate)}</div>
                      </div>
                      <div className="text-lg font-bold text-blue-600">
                        {formatCurrency(estimate.totalCost)}
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="border-t pt-3 mt-4">
                  <div className="flex justify-between items-center">
                    <div className="text-lg font-bold">Total:</div>
                    <div className="text-xl font-bold text-blue-600">
                      {formatCurrency(
                        savedEstimates.reduce((sum, estimate) => sum + estimate.totalCost, 0)
                      )}
                    </div>
                  </div>
                </div>
                
                <Button className="w-full mt-4">
                  Generate Detailed Estimate
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default EstimationPage;
