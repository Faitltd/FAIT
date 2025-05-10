import React from 'react';

interface DisputesListProps {
  limit?: number;
  status?: 'open' | 'resolved' | 'all';
}

const DisputesList: React.FC<DisputesListProps> = ({ limit = 5, status = 'all' }) => {
  return (
    <div className="p-4 bg-gray-50 rounded-lg text-center">
      <p className="text-gray-500">This component is a placeholder and will be implemented in a future update.</p>
      <p className="text-sm text-gray-400 mt-2">Will display a list of disputes with status: {status}</p>
    </div>
  );
};

export default DisputesList;
