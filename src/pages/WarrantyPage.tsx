import React, { useState } from 'react';
import { PageLayout } from '../modules/core/components/layout/PageLayout';
import { WarrantyList } from '../modules/warranty/components/warranty/WarrantyList';
import { WarrantyDetail } from '../modules/warranty/components/warranty/WarrantyDetail';
import { Warranty, WarrantyClaim } from '../modules/warranty/types/warranty';
import { useAuth } from '../modules/core/contexts/AuthContext';
import { UserRole } from '../modules/core/types/common';

/**
 * WarrantyPage component for displaying and managing warranties
 */
const WarrantyPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedWarranty, setSelectedWarranty] = useState<Warranty | null>(null);
  const [selectedClaim, setSelectedClaim] = useState<WarrantyClaim | null>(null);
  const [isCreatingWarranty, setIsCreatingWarranty] = useState(false);
  const [isCreatingClaim, setIsCreatingClaim] = useState(false);
  const [isEditingWarranty, setIsEditingWarranty] = useState(false);

  // Handle warranty selection
  const handleSelectWarranty = (warranty: Warranty) => {
    setSelectedWarranty(warranty);
    setSelectedClaim(null);
    setIsCreatingWarranty(false);
    setIsCreatingClaim(false);
    setIsEditingWarranty(false);
  };

  // Handle claim selection
  const handleSelectClaim = (claim: WarrantyClaim) => {
    setSelectedClaim(claim);
    setIsCreatingWarranty(false);
    setIsCreatingClaim(false);
    setIsEditingWarranty(false);
  };

  // Handle create warranty
  const handleCreateWarranty = () => {
    setSelectedWarranty(null);
    setSelectedClaim(null);
    setIsCreatingWarranty(true);
    setIsCreatingClaim(false);
    setIsEditingWarranty(false);
  };

  // Handle create claim
  const handleCreateClaim = (warranty: Warranty) => {
    setSelectedWarranty(warranty);
    setSelectedClaim(null);
    setIsCreatingWarranty(false);
    setIsCreatingClaim(true);
    setIsEditingWarranty(false);
  };

  // Handle edit warranty
  const handleEditWarranty = (warranty: Warranty) => {
    setSelectedWarranty(warranty);
    setSelectedClaim(null);
    setIsCreatingWarranty(false);
    setIsCreatingClaim(false);
    setIsEditingWarranty(true);
  };

  // Handle back
  const handleBack = () => {
    if (selectedClaim) {
      setSelectedClaim(null);
    } else if (isCreatingWarranty || isEditingWarranty) {
      setIsCreatingWarranty(false);
      setIsEditingWarranty(false);
    } else if (isCreatingClaim) {
      setIsCreatingClaim(false);
    } else {
      setSelectedWarranty(null);
    }
  };

  // Get client ID based on user role
  const getClientId = (): string | undefined => {
    if (user?.role === UserRole.CLIENT) {
      return user.id;
    }
    return undefined;
  };

  // Get service agent ID based on user role
  const getServiceAgentId = (): string | undefined => {
    if (user?.role === UserRole.SERVICE_AGENT) {
      return user.id;
    }
    return undefined;
  };

  return (
    <PageLayout
      title="Warranties"
      description="Manage your warranties and warranty claims"
    >
      {selectedWarranty ? (
        isCreatingClaim ? (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Create Warranty Claim</h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={handleBack}
              >
                Cancel
              </button>
            </div>
            <p className="text-gray-500 mb-4">
              This feature is not yet implemented. It would allow users to create a new warranty claim.
            </p>
          </div>
        ) : isEditingWarranty ? (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit Warranty</h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={handleBack}
              >
                Cancel
              </button>
            </div>
            <p className="text-gray-500 mb-4">
              This feature is not yet implemented. It would allow users to edit an existing warranty.
            </p>
          </div>
        ) : (
          <WarrantyDetail
            warrantyId={selectedWarranty.id}
            onBack={handleBack}
            onEdit={handleEditWarranty}
            onCreateClaim={handleCreateClaim}
            onViewClaim={handleSelectClaim}
          />
        )
      ) : isCreatingWarranty ? (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Create Warranty</h2>
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={handleBack}
            >
              Cancel
            </button>
          </div>
          <p className="text-gray-500 mb-4">
            This feature is not yet implemented. It would allow users to create a new warranty.
          </p>
        </div>
      ) : selectedClaim ? (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Warranty Claim Details</h2>
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={handleBack}
            >
              Back
            </button>
          </div>
          <p className="text-gray-500 mb-4">
            This feature is not yet implemented. It would display details of a warranty claim.
          </p>
        </div>
      ) : (
        <WarrantyList
          onSelectWarranty={handleSelectWarranty}
          onCreateWarranty={handleCreateWarranty}
          clientId={getClientId()}
          serviceAgentId={getServiceAgentId()}
        />
      )}
    </PageLayout>
  );
};

export default WarrantyPage;
