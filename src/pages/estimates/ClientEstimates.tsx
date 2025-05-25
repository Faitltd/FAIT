import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import EstimatesList from '../../components/estimates/EstimatesList';
import EstimateApproval from '../../components/estimates/EstimateApproval';
import ResponsiveLayout from '../../components/layout/ResponsiveLayout';

const ClientEstimates: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { estimateId } = useParams<{ estimateId?: string }>();
  const [showEstimateApproval, setShowEstimateApproval] = useState(!!estimateId);
  const [selectedEstimateId, setSelectedEstimateId] = useState<string | null>(estimateId || null);

  const handleViewEstimate = (estimateId: string) => {
    setShowEstimateApproval(true);
    setSelectedEstimateId(estimateId);
    navigate(`/estimates/${estimateId}`);
  };

  const handleEstimateApproved = () => {
    setShowEstimateApproval(false);
    navigate('/estimates?status=approved');
  };

  const handleEstimateRejected = () => {
    setShowEstimateApproval(false);
    navigate('/estimates?status=rejected');
  };

  const handleCloseEstimate = () => {
    setShowEstimateApproval(false);
    navigate('/estimates');
  };

  return (
    <ResponsiveLayout title="Estimates">
      {showEstimateApproval && selectedEstimateId ? (
        <EstimateApproval
          estimateId={selectedEstimateId}
          onApproved={handleEstimateApproved}
          onRejected={handleEstimateRejected}
          onClose={handleCloseEstimate}
        />
      ) : (
        <EstimatesList
          userType="client"
          onViewEstimate={handleViewEstimate}
        />
      )}
    </ResponsiveLayout>
  );
};

export default ClientEstimates;
