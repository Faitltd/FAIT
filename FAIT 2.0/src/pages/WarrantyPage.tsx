import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Warranty, WarrantyClaim } from '../types/warranty';
import { warrantyService } from '../services/WarrantyService';
import ResponsiveLayout from '../components/layout/ResponsiveLayout';
import WarrantyEligibilityTracker from '../components/warranty/WarrantyEligibilityTracker';
import WarrantyClaimForm from '../components/warranty/WarrantyClaimForm';
import WarrantyClaimsList from '../components/warranty/WarrantyClaimsList';

const WarrantyPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuth();
  const [isShowingClaimForm, setIsShowingClaimForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'eligibility' | 'claims'>('eligibility');
  const [isContractor, setIsContractor] = useState(false);

  useEffect(() => {
    // Check if user is a contractor
    if (user && user.user_role === 'contractor') {
      setIsContractor(true);
    }
  }, [user]);

  const handleClaimSubmitted = (claim: WarrantyClaim) => {
    setIsShowingClaimForm(false);
    setActiveTab('claims');
  };

  return (
    <ResponsiveLayout title="Warranty Management">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <Link
              to={`/projects/${projectId}`}
              className="flex items-center text-blue-600 hover:text-blue-900 mb-2"
            >
              <svg className="h-5 w-5 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Project
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Warranty Management</h1>
            <p className="text-gray-500">Manage warranties and warranty claims for this project.</p>
          </div>
          {!isContractor && !isShowingClaimForm && (
            <button
              onClick={() => setIsShowingClaimForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Submit Warranty Claim
            </button>
          )}
        </div>
      </div>

      {isShowingClaimForm && (
        <div className="mb-6">
          <WarrantyClaimForm 
            warrantyId="placeholder-warranty-id" // This would need to be replaced with the actual warranty ID
            onClaimSubmitted={handleClaimSubmitted}
            onCancel={() => setIsShowingClaimForm(false)}
          />
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('eligibility')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'eligibility'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Warranty Eligibility
            </button>
            <button
              onClick={() => setActiveTab('claims')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'claims'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Warranty Claims
            </button>
          </nav>
        </div>
        
        <div className="p-4">
          {activeTab === 'eligibility' && (
            <WarrantyEligibilityTracker 
              projectId={projectId || ''} 
              isEditable={isContractor} 
            />
          )}
          
          {activeTab === 'claims' && (
            <WarrantyClaimsList 
              warrantyId="placeholder-warranty-id" // This would need to be replaced with the actual warranty ID
              isContractor={isContractor} 
            />
          )}
        </div>
      </div>
    </ResponsiveLayout>
  );
};

export default WarrantyPage;
