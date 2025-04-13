import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import type { Database } from '../../../lib/database.types';
import { ArrowLeft, Plus, Edit, Eye, EyeOff } from 'lucide-react';

type ServicePackage = Database['public']['Tables']['service_packages']['Row'];

const ServiceAgentListings = () => {
  const { user } = useAuth();
  const [services, setServices] = useState<ServicePackage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        if (!user) return;

        const { data, error } = await supabase
          .from('service_packages')
          .select('*')
          .eq('service_agent_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setServices(data);
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [user]);

  const toggleServiceStatus = async (serviceId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('service_packages')
        .update({ is_active: !currentStatus })
        .eq('id', serviceId)
        .eq('service_agent_id', user?.id);

      if (error) throw error;

      // Update local state
      setServices(services.map(service =>
        service.id === serviceId
          ? { ...service, is_active: !currentStatus }
          : service
      ));
    } catch (error) {
      console.error('Error updating service status:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link to="/dashboard/service-agent" className="inline-flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Link>
        <div className="flex justify-between items-center mt-2">
          <h1 className="text-2xl font-bold text-gray-900">My Service Listings</h1>
          <Link
            to="/services/create"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create New Service
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {services.length === 0 ? (
          <div className="p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Services Listed</h3>
            <p className="text-gray-500 mb-4">
              You haven't created any service listings yet. Create your first service to start receiving bookings.
            </p>
            <Link
              to="/services/create"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Service
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {services.map((service) => (
                  <tr key={service.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{service.title}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">{service.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${service.price}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          service.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {service.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(service.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => toggleServiceStatus(service.id, service.is_active)}
                          className="text-gray-600 hover:text-gray-900"
                          title={service.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {service.is_active ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                        <Link
                          to={`/services/edit/${service.id}`}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit"
                        >
                          <Edit className="h-5 w-5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceAgentListings;
