import React, { useEffect, useState } from 'react';
import { Shield, Clock, User, Home, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

type Warranty = {
  id: string;
  project_id: string;
  homeowner_id: string;
  service_agent_id: string;
  warranty_type: string;
  start_date: string;
  end_date: string;
  created_at: string;
  homeowner: {
    full_name: string;
    email: string;
  };
  service_agent: {
    full_name: string;
    email: string;
  };
};

interface WarrantyStatusProps {
  userType: 'homeowner' | 'client' | 'service_agent';
}

const WarrantyStatus: React.FC<WarrantyStatusProps> = ({ userType }) => {
  const { user } = useAuth();
  const [warranties, setWarranties] = useState<Warranty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isHomeowner = userType === 'homeowner' || userType === 'client';

  useEffect(() => {
    if (!user) return;

    const fetchWarranties = async () => {
      try {
        setLoading(true);
        setError(null);

        // Determine which field to filter on based on user type
        const filterField = isHomeowner ? 'homeowner_id' : 'service_agent_id';

        const { data, error: fetchError } = await supabase
          .from('warranties')
          .select(`
            *,
            homeowner:profiles!homeowner_id(full_name, email),
            service_agent:profiles!service_agent_id(full_name, email)
          `)
          .eq(filterField, user.id)
          .order('end_date', { ascending: false });

        if (fetchError) throw fetchError;
        setWarranties(data as Warranty[]);
      } catch (err) {
        console.error('Error fetching warranties:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch warranties');
      } finally {
        setLoading(false);
      }
    };

    fetchWarranties();
  }, [user, isHomeowner]);

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Check if warranty is active
  const isWarrantyActive = (endDate: string) => {
    return new Date(endDate) >= new Date();
  };

  // Get days remaining in warranty
  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Get warranty type display name
  const getWarrantyTypeDisplay = (type: string) => {
    switch (type) {
      case '1yr':
        return '1 Year Standard';
      case '2yr':
        return '2 Year Extended';
      case '3yr-extended':
        return '3 Year Premium';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
        Error loading warranties: {error}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">
          {isHomeowner ? 'Your Warranties' : 'Warranties You Provide'}
        </h2>
      </div>

      <div className="p-6">
        {warranties.length === 0 ? (
          <div className="text-center py-8">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No Warranties Found</h3>
            <p className="text-gray-500">
              {isHomeowner
                ? 'You don\'t have any active warranties. Completed projects will appear here.'
                : 'You haven\'t provided any warranties yet. Completed projects will appear here.'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {warranties.map((warranty) => (
              <div
                key={warranty.id}
                className={`border rounded-lg p-4 ${
                  isWarrantyActive(warranty.end_date)
                    ? 'border-green-200 bg-green-50'
                    : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
                  <div className="mb-2 md:mb-0">
                    <div className="flex items-center">
                      <Shield
                        className={`h-5 w-5 mr-2 ${
                          isWarrantyActive(warranty.end_date) ? 'text-green-600' : 'text-red-600'
                        }`}
                      />
                      <h3 className="text-lg font-medium text-gray-900">
                        {getWarrantyTypeDisplay(warranty.warranty_type)} Warranty
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Project ID: {warranty.project_id}</p>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      isWarrantyActive(warranty.end_date)
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {isWarrantyActive(warranty.end_date)
                      ? `Active (${getDaysRemaining(warranty.end_date)} days remaining)`
                      : 'Expired'}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-gray-500">Start Date</div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-gray-900">{formatDate(warranty.start_date)}</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-500">End Date</div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-gray-900">{formatDate(warranty.end_date)}</span>
                    </div>
                  </div>

                  {isHomeowner ? (
                    <div>
                      <div className="text-sm text-gray-500">Contractor</div>
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-gray-900">{warranty.contractor?.full_name}</span>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-sm text-gray-500">Homeowner</div>
                      <div className="flex items-center">
                        <Home className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-gray-900">{warranty.homeowner?.full_name}</span>
                      </div>
                    </div>
                  )}
                </div>

                {!isWarrantyActive(warranty.end_date) && (
                  <div className="mt-4 bg-red-100 border-l-4 border-red-500 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <AlertTriangle className="h-5 w-5 text-red-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-700">
                          This warranty has expired. It was valid until {formatDate(warranty.end_date)}.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WarrantyStatus;
