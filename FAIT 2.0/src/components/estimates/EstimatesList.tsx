import React from 'react';
import { Link } from 'react-router-dom';

interface EstimatesListProps {
  limit?: number;
  status?: 'draft' | 'sent' | 'approved' | 'rejected' | 'all';
}

const EstimatesList: React.FC<EstimatesListProps> = ({ limit = 5, status = 'all' }) => {
  // This is a placeholder component that will be implemented with real data in the future
  // For now, we'll show some sample estimates
  
  const sampleEstimates = [
    {
      id: 'est-1',
      title: 'Kitchen Renovation Estimate',
      projectTitle: 'Kitchen Renovation',
      status: 'approved',
      client: 'John Smith',
      amount: 15000,
      date: '2023-05-10',
      selectedTier: 'better'
    },
    {
      id: 'est-2',
      title: 'Bathroom Remodel Estimate',
      projectTitle: 'Bathroom Remodel',
      status: 'sent',
      client: 'Sarah Johnson',
      amount: 8500,
      date: '2023-05-25',
      selectedTier: 'good'
    },
    {
      id: 'est-3',
      title: 'Deck Construction Estimate',
      projectTitle: 'Deck Construction',
      status: 'draft',
      client: 'Michael Brown',
      amount: 12000,
      date: '2023-05-30',
      selectedTier: 'best'
    }
  ];
  
  // Filter estimates based on status if not 'all'
  const filteredEstimates = status === 'all' 
    ? sampleEstimates 
    : sampleEstimates.filter(estimate => estimate.status === status);
  
  // Limit the number of estimates shown
  const limitedEstimates = filteredEstimates.slice(0, limit);
  
  if (limitedEstimates.length === 0) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg text-center">
        <p className="text-gray-500">No estimates found with status: {status}</p>
      </div>
    );
  }
  
  return (
    <div className="overflow-hidden">
      <ul className="divide-y divide-gray-200">
        {limitedEstimates.map(estimate => (
          <li key={estimate.id} className="py-4">
            <Link to={`/dashboard/estimates/${estimate.id}`} className="block hover:bg-gray-50 transition rounded-lg p-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{estimate.title}</h3>
                  <p className="text-sm text-gray-500">Project: {estimate.projectTitle}</p>
                  <div className="mt-1 flex items-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      estimate.status === 'approved' ? 'bg-green-100 text-green-800' :
                      estimate.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                      estimate.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {estimate.status}
                    </span>
                    <span className="ml-2 text-sm text-gray-500">
                      {estimate.date}
                    </span>
                    <span className="ml-2 text-sm font-medium text-gray-900">
                      ${estimate.amount.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    Client: {estimate.client}
                  </p>
                  <p className="text-sm text-gray-500">
                    Selected tier: <span className="capitalize">{estimate.selectedTier}</span>
                  </p>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EstimatesList;
