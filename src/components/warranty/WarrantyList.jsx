import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { getUserWarranties, getServiceAgentWarranties } from '../../api/warrantyApi';
import { format, isAfter } from 'date-fns';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const WarrantyList = ({ onSelectWarranty }) => {
  const [warranties, setWarranties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        // Get user type
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', user.id)
          .single();
        
        setUserType(profile?.user_type);
        
        // Fetch warranties based on user type
        if (profile?.user_type === 'service_agent') {
          fetchServiceAgentWarranties(user.id);
        } else {
          fetchUserWarranties(user.id);
        }
      }
    };
    
    fetchUser();
  }, []);

  const fetchUserWarranties = async (userId) => {
    try {
      setLoading(true);
      const data = await getUserWarranties(userId);
      setWarranties(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching warranties:', err);
      setError('Failed to load warranties');
    } finally {
      setLoading(false);
    }
  };

  const fetchServiceAgentWarranties = async (userId) => {
    try {
      setLoading(true);
      const data = await getServiceAgentWarranties(userId);
      setWarranties(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching warranties:', err);
      setError('Failed to load warranties');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        {error}
      </div>
    );
  }

  if (warranties.length === 0) {
    return (
      <div className="text-center py-8 px-4">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No warranties</h3>
        <p className="mt-1 text-sm text-gray-500">
          {userType === 'service_agent'
            ? "You don't have any active warranties for your services."
            : "You don't have any active warranties for your bookings."}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
              Service
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              {userType === 'service_agent' ? 'Client' : 'Service Agent'}
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Warranty Type
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Expiration
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Status
            </th>
            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {warranties.map((warranty) => {
            const isExpired = !isAfter(new Date(warranty.end_date), new Date());
            const statusClass = 
              warranty.status === 'active' && !isExpired
                ? 'bg-green-100 text-green-800'
                : warranty.status === 'active' && isExpired
                ? 'bg-red-100 text-red-800'
                : 'bg-gray-100 text-gray-800';
            
            return (
              <tr key={warranty.id}>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                  {warranty.services.name}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {userType === 'service_agent'
                    ? `${warranty.client.first_name} ${warranty.client.last_name}`
                    : `${warranty.service_agent.first_name} ${warranty.service_agent.last_name}`}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {warranty.warranty_types.name}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {format(new Date(warranty.end_date), 'MMM d, yyyy')}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${statusClass}`}>
                    {warranty.status === 'active' && !isExpired
                      ? 'Active'
                      : warranty.status === 'active' && isExpired
                      ? 'Expired'
                      : warranty.status.charAt(0).toUpperCase() + warranty.status.slice(1)}
                  </span>
                </td>
                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                  <button
                    onClick={() => onSelectWarranty(warranty.id)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    View<span className="sr-only">, {warranty.services.name}</span>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default WarrantyList;
