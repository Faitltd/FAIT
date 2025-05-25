import React, { useState, useEffect } from 'react';
import { permitService } from '../../services/PermitService';
import type { Permit, PermitInspection } from '../../services/PermitService';
import { denverPermitApiService } from '../../services/DenverPermitApiService';
import PermitSearch from './PermitSearch';
import PermitDetails from './PermitDetails';
import PermitTimeline from './PermitTimeline';
import PermitNotifications from './PermitNotifications';

interface PermitDashboardProps {
  projectId?: string;
}

const PermitDashboard: React.FC<PermitDashboardProps> = ({ projectId }) => {
  const [permits, setPermits] = useState<Permit[]>([]);
  const [selectedPermit, setSelectedPermit] = useState<Permit | null>(null);
  const [inspections, setInspections] = useState<PermitInspection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'list' | 'search' | 'details'>('list');

  useEffect(() => {
    if (projectId) {
      fetchProjectPermits();
    }
  }, [projectId]);

  useEffect(() => {
    if (selectedPermit?.permit_number) {
      fetchInspections(selectedPermit.permit_number);
    }
  }, [selectedPermit]);

  const fetchProjectPermits = async () => {
    if (!projectId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const projectPermits = await permitService.getPermitsForProject(projectId);
      setPermits(projectPermits);
      
      if (projectPermits.length > 0 && !selectedPermit) {
        setSelectedPermit(projectPermits[0]);
      }
    } catch (err) {
      console.error('Error fetching project permits:', err);
      setError('Failed to load permits for this project');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInspections = async (permitNumber: string) => {
    try {
      const inspectionData = await denverPermitApiService.getInspectionsForPermit(permitNumber);
      setInspections(inspectionData);
    } catch (err) {
      console.error('Error fetching inspections:', err);
    }
  };

  const handlePermitSelect = (permit: Permit) => {
    setSelectedPermit(permit);
    setView('details');
  };

  const handlePermitIdSelect = async (permitId: string) => {
    try {
      // Find the permit in the existing list
      const existingPermit = permits.find(p => p.id === permitId);
      
      if (existingPermit) {
        setSelectedPermit(existingPermit);
      } else {
        // Fetch the permit if not in the list
        const { data } = await permitService.getPermitById(permitId);
        if (data) {
          setSelectedPermit(data as Permit);
        }
      }
      
      setView('details');
    } catch (err) {
      console.error('Error selecting permit:', err);
    }
  };

  const handleAddPermit = () => {
    setView('search');
  };

  const handleBackToList = () => {
    setView('list');
    setSelectedPermit(null);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-center py-8">
          <svg className="animate-spin h-8 w-8 text-blue-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-gray-500">Loading permits...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-8 text-red-500">
          <p>{error}</p>
          <button
            onClick={fetchProjectPermits}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Retry
          </button>
        </div>
      );
    }

    if (view === 'search') {
      return (
        <div>
          <div className="mb-4">
            <button
              onClick={handleBackToList}
              className="flex items-center text-blue-600 hover:text-blue-900"
            >
              <svg className="h-5 w-5 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Permits
            </button>
          </div>
          <PermitSearch
            onPermitSelect={(permit) => {
              handlePermitSelect(permit);
              fetchProjectPermits(); // Refresh the list after adding a permit
            }}
            projectId={projectId}
          />
        </div>
      );
    }

    if (view === 'details' && selectedPermit) {
      return (
        <div>
          <div className="mb-4">
            <button
              onClick={handleBackToList}
              className="flex items-center text-blue-600 hover:text-blue-900"
            >
              <svg className="h-5 w-5 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Permits
            </button>
          </div>
          <PermitDetails permit={selectedPermit} />
        </div>
      );
    }

    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Project Permits</h3>
          {projectId && (
            <button
              onClick={handleAddPermit}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Permit
            </button>
          )}
        </div>
        
        {permits.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No permits found</h3>
            <p className="text-gray-500 mb-4">
              {projectId
                ? 'This project does not have any permits linked to it yet.'
                : 'Select a project to view its permits.'}
            </p>
            {projectId && (
              <button
                onClick={handleAddPermit}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Search for Permits
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {permits.map((permit) => (
                <li key={permit.id || permit.permit_number} className="px-4 py-4 hover:bg-gray-50 cursor-pointer" onClick={() => handlePermitSelect(permit)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                        permit.status === 'Issued' ? 'bg-green-100 text-green-800' :
                        permit.status === 'Under Review' ? 'bg-yellow-100 text-yellow-800' :
                        permit.status === 'Expired' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {permit.permit_type} Permit #{permit.permit_number}
                        </div>
                        <div className="text-sm text-gray-500">
                          {permit.address}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        permit.status === 'Issued' ? 'bg-green-100 text-green-800' :
                        permit.status === 'Under Review' ? 'bg-yellow-100 text-yellow-800' :
                        permit.status === 'Expired' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {permit.status}
                      </span>
                      <svg className="ml-2 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {permits.length > 0 && (
          <div className="mt-6">
            <PermitTimeline permits={permits} inspections={inspections} />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        {renderContent()}
      </div>
      
      <div>
        <PermitNotifications 
          onSelectPermit={handlePermitIdSelect}
          limit={5}
        />
      </div>
    </div>
  );
};

export default PermitDashboard;
