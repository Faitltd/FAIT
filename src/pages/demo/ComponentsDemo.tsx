import React, { useState } from 'react';
import EnhancedMapDisplay from '../../components/maps/EnhancedMapDisplay';
import ScrollRevealSections from '../../components/animations/ScrollRevealSections';
import SectionDivider from '../../components/ui/SectionDivider';
import EnhancedBookingWizard from '../../components/booking/EnhancedBookingWizard';
import AvailabilityManager from '../../components/admin/AvailabilityManager';

/**
 * Components Demo Page
 * 
 * A page that showcases all the new components implemented.
 */
const ComponentsDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'map' | 'booking' | 'availability' | 'animations'>('map');
  
  // Sample markers for the map
  const sampleMarkers = [
    {
      id: '1',
      position: { lat: 39.7392, lng: -104.9903 },
      title: 'Denver, CO'
    },
    {
      id: '2',
      position: { lat: 39.7513, lng: -104.9491 },
      title: 'City Park'
    },
    {
      id: '3',
      position: { lat: 39.7777, lng: -104.9632 },
      title: 'RiNo Art District'
    }
  ];
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="py-6 text-3xl font-bold text-gray-900">Components Demo</h1>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab('map')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'map'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Maps
          </button>
          <button
            onClick={() => setActiveTab('booking')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'booking'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Booking Wizard
          </button>
          <button
            onClick={() => setActiveTab('availability')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'availability'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Availability Manager
          </button>
          <button
            onClick={() => setActiveTab('animations')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'animations'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Animations
          </button>
        </div>
        
        {/* Map Demo */}
        {activeTab === 'map' && (
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Enhanced Map Display</h2>
              <p className="text-gray-600 mb-6">
                A robust Google Maps component that handles various edge cases and provides a better user experience.
              </p>
              
              <div className="space-y-6">
                {/* Map with markers */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Map with Markers</h3>
                  <EnhancedMapDisplay
                    markers={sampleMarkers}
                    height="400px"
                    className="rounded-lg overflow-hidden shadow-md"
                  />
                </div>
                
                {/* Map with no markers */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Map with No Markers</h3>
                  <p className="text-sm text-gray-500 mb-3">
                    The map still displays and remains interactive even when no markers are present.
                  </p>
                  <EnhancedMapDisplay
                    markers={[]}
                    height="400px"
                    className="rounded-lg overflow-hidden shadow-md"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Booking Wizard Demo */}
        {activeTab === 'booking' && (
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Enhanced Booking Wizard</h2>
              <p className="text-gray-600 mb-6">
                A step-by-step interface for scheduling services with improved validation,
                special instructions handling, and a better user experience.
              </p>
              
              <div className="mt-6">
                <p className="text-sm text-gray-500 mb-6">
                  Note: This is a demo and requires a valid servicePackageId to function properly.
                  In a real implementation, this would be provided by the route or parent component.
                </p>
                
                <EnhancedBookingWizard
                  servicePackageId="demo-service-package-id"
                  onComplete={(bookingId) => {
                    console.log('Booking completed with ID:', bookingId);
                  }}
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Availability Manager Demo */}
        {activeTab === 'availability' && (
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Availability Manager</h2>
              <p className="text-gray-600 mb-6">
                Admin interface for managing service provider availability.
                Supports recurring weekly schedules and specific date availability.
              </p>
              
              <div className="mt-6">
                <p className="text-sm text-gray-500 mb-6">
                  Note: This is a demo and requires authentication to function properly.
                  In a real implementation, this would be protected by authentication.
                </p>
                
                <AvailabilityManager />
              </div>
            </div>
          </div>
        )}
        
        {/* Animations Demo */}
        {activeTab === 'animations' && (
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Scroll Animations</h2>
              <p className="text-gray-600 mb-6">
                Scroll-activated reveal sections, parallax effects, and section dividers.
                Scroll down to see the animations in action.
              </p>
            </div>
            
            <ScrollRevealSections />
          </div>
        )}
      </main>
    </div>
  );
};

export default ComponentsDemo;
