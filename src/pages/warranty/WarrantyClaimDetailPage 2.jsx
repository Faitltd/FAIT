import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import MainLayout from '../../components/MainLayout';
import WarrantyClaimDetail from '../../components/warranty/WarrantyClaimDetail';

const WarrantyClaimDetailPage = () => {
  const { claimId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  // Check for success message in location state
  useEffect(() => {
    if (location.state?.success) {
      setShowSuccessMessage(true);
      
      // Clear success message after 5 seconds
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [location.state]);
  
  const handleUpdate = () => {
    // Show success message when claim is updated
    setShowSuccessMessage(true);
    
    // Clear success message after 5 seconds
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 5000);
  };
  
  return (
    <MainLayout currentPage="warranty">
      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <Link
                to="/warranty/claims"
                className="inline-flex items-center mr-4 text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                <svg className="h-5 w-5 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Claims
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Warranty Claim Details</h1>
            </div>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              {/* Success Message */}
              {showSuccessMessage && (
                <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
                  {location.state?.success
                    ? 'Warranty claim submitted successfully!'
                    : 'Warranty claim updated successfully!'}
                </div>
              )}
              
              <WarrantyClaimDetail
                claimId={claimId}
                onUpdate={handleUpdate}
              />
            </div>
          </div>
        </main>
      </div>
    </MainLayout>
  );
};

export default WarrantyClaimDetailPage;
