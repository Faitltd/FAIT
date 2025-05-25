import React, { useState } from 'react';

// Import from core module
import { Button } from '../modules/core/components/ui/Button';
import { PageLayout } from '../modules/core/components/layout/PageLayout';
import { LoadingSpinner } from '../modules/core/components/common/LoadingSpinner';
import { useMediaQuery } from '../modules/core/hooks/useMediaQuery';

// Import from project module
import { CreateProject, ProjectFormData } from '../modules/project/components/creation/CreateProject';

// Import from booking module
import { BookingWizard, BookingFormData } from '../modules/booking/components/wizard/BookingWizard';

// Import from communication module
import { MessageThread } from '../modules/communication/components/messaging/MessageThread';

// Import from estimation module
import { RemodelingCalculator, RemodelingEstimate } from '../modules/estimation/components/calculator/RemodelingCalculator';

/**
 * ModularExample page demonstrating the use of components from multiple modules
 */
const ModularExample: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'project' | 'booking' | 'messaging' | 'estimation'>('project');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  
  // Use media query hook from core module
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Handle project creation
  const handleProjectSubmit = (data: ProjectFormData) => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setResult({
        type: 'project',
        data,
      });
      setIsLoading(false);
    }, 1000);
  };

  // Handle booking completion
  const handleBookingComplete = (data: BookingFormData) => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setResult({
        type: 'booking',
        data,
      });
      setIsLoading(false);
    }, 1000);
  };

  // Handle message sending
  const handleSendMessage = async (message: string) => {
    setIsLoading(true);
    
    // Simulate API call
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setResult({
          type: 'message',
          data: { content: message },
        });
        setIsLoading(false);
        resolve();
      }, 1000);
    });
  };

  // Handle estimate calculation
  const handleCalculateEstimate = (estimate: RemodelingEstimate) => {
    setResult({
      type: 'estimate',
      data: estimate,
    });
  };

  return (
    <PageLayout
      title="Modular Architecture Example"
      description="This page demonstrates the use of components from multiple modules"
    >
      <div className="mb-6">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          <Button
            variant={activeTab === 'project' ? 'default' : 'outline'}
            onClick={() => setActiveTab('project')}
          >
            Project Creation
          </Button>
          <Button
            variant={activeTab === 'booking' ? 'default' : 'outline'}
            onClick={() => setActiveTab('booking')}
          >
            Booking Wizard
          </Button>
          <Button
            variant={activeTab === 'messaging' ? 'default' : 'outline'}
            onClick={() => setActiveTab('messaging')}
          >
            Messaging
          </Button>
          <Button
            variant={activeTab === 'estimation' ? 'default' : 'outline'}
            onClick={() => setActiveTab('estimation')}
          >
            Estimation
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          {activeTab === 'project' && (
            <CreateProject
              onSubmit={handleProjectSubmit}
              onCancel={() => console.log('Cancelled')}
            />
          )}
          
          {activeTab === 'booking' && (
            <BookingWizard
              serviceId="service-123"
              onComplete={handleBookingComplete}
              onCancel={() => console.log('Cancelled')}
            />
          )}
          
          {activeTab === 'messaging' && (
            <div className="bg-white p-6 rounded-lg shadow-md h-[500px] flex flex-col">
              <h2 className="text-xl font-bold mb-4">Message Thread</h2>
              <div className="flex-1 overflow-hidden">
                <MessageThread
                  conversationId="conversation-123"
                  onSendMessage={handleSendMessage}
                />
              </div>
            </div>
          )}
          
          {activeTab === 'estimation' && (
            <RemodelingCalculator
              onCalculate={handleCalculateEstimate}
            />
          )}
        </div>
        
        <div>
          <div className="bg-white p-6 rounded-lg shadow-md h-full">
            <h2 className="text-xl font-bold mb-4">Result</h2>
            
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <LoadingSpinner size="lg" message="Processing..." />
              </div>
            ) : result ? (
              <div>
                <div className="mb-2">
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm font-medium">
                    {result.type}
                  </span>
                </div>
                <pre className="bg-gray-50 p-4 rounded-md overflow-auto max-h-96">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="text-gray-500 flex justify-center items-center h-64">
                No result yet. Try submitting a form.
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-gray-50 rounded-md">
        <h3 className="text-lg font-semibold mb-2">Device Information</h3>
        <p>
          You are viewing this page on a {isMobile ? 'mobile' : 'desktop'} device.
        </p>
      </div>
    </PageLayout>
  );
};

export default ModularExample;
