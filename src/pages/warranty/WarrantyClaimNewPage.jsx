import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../../components/MainLayout';
import WarrantyClaimForm from '../../components/warranty/WarrantyClaimForm';

const WarrantyClaimNewPage = () => {
  const navigate = useNavigate();
  
  const handleSuccess = (claim) => {
    navigate(`/warranty/claims/${claim.id}`, { state: { success: true } });
  };
  
  const handleCancel = () => {
    navigate('/warranty/claims');
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
              <h1 className="text-3xl font-bold text-gray-900">New Warranty Claim</h1>
            </div>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <WarrantyClaimForm
                onSuccess={handleSuccess}
                onCancel={handleCancel}
              />
            </div>
          </div>
        </main>
      </div>
    </MainLayout>
  );
};

export default WarrantyClaimNewPage;
