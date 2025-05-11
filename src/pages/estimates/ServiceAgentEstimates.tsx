import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import EstimatesList from '../../components/estimates/EstimatesList';
import EstimateBuilder from '../../components/estimates/EstimateBuilder';
import ResponsiveLayout from '../../components/layout/ResponsiveLayout';

const ServiceAgentEstimates: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { bookingId } = useParams<{ bookingId?: string }>();
  const [showEstimateBuilder, setShowEstimateBuilder] = useState(!!bookingId);
  const [selectedEstimateId, setSelectedEstimateId] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);

  const handleCreateEstimate = (bookingId?: string, clientId?: string) => {
    setShowEstimateBuilder(true);
    setSelectedEstimateId(null);
    if (bookingId) {
      // If creating from a booking, we'll pass the booking ID
      navigate(`/estimates/create/${bookingId}`);
    } else {
      // Otherwise, just show the estimate builder
      navigate('/estimates/create');
    }
    if (clientId) {
      setClientId(clientId);
    }
  };

  const handleEditEstimate = (estimateId: string) => {
    setShowEstimateBuilder(true);
    setSelectedEstimateId(estimateId);
    navigate(`/estimates/edit/${estimateId}`);
  };

  const handleViewEstimate = (estimateId: string) => {
    navigate(`/estimates/${estimateId}`);
  };

  const handleEstimateSuccess = (estimateId: string) => {
    setShowEstimateBuilder(false);
    navigate('/estimates');
  };

  const handleCancelEstimate = () => {
    setShowEstimateBuilder(false);
    navigate('/estimates');
  };

  return (
    <ResponsiveLayout title="Estimates">
      {showEstimateBuilder ? (
        <EstimateBuilder
          estimateId={selectedEstimateId || undefined}
          originalBookingId={bookingId}
          clientId={clientId || undefined}
          onSuccess={handleEstimateSuccess}
          onCancel={handleCancelEstimate}
        />
      ) : (
        <EstimatesList
          userType="service_agent"
          onCreateEstimate={() => handleCreateEstimate()}
          onViewEstimate={handleViewEstimate}
          onEditEstimate={handleEditEstimate}
        />
      )}
    </ResponsiveLayout>
  );
};

export default ServiceAgentEstimates;
