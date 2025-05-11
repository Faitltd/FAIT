import React from 'react';

interface PunchlistItemsProps {
  limit?: number;
  status?: 'pending' | 'in_progress' | 'completed' | 'all';
}

const PunchlistItems: React.FC<PunchlistItemsProps> = ({ limit = 5, status = 'all' }) => {
  return (
    <div className="p-4 bg-gray-50 rounded-lg text-center">
      <p className="text-gray-500">This component is a placeholder and will be implemented in a future update.</p>
      <p className="text-sm text-gray-400 mt-2">Will display a list of punchlist items with status: {status}</p>
    </div>
  );
};

export default PunchlistItems;
