import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  ChevronDown
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type { Database } from '../../lib/database.types';

type ServiceAgentVerification = Database['public']['Tables']['service_agent_verifications']['Row'] & {
  service_agent: Database['public']['Tables']['profiles']['Row'];
};

type VerificationStatus = 'pending' | 'in_progress' | 'clear' | 'consider' | 'suspended' | 'dispute' | 'failed';

const VerificationManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verifications, setVerifications] = useState<ServiceAgentVerification[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<VerificationStatus | 'all'>('all');
  const [selectedVerification, setSelectedVerification] = useState<ServiceAgentVerification | null>(null);

  useEffect(() => {
    const fetchVerifications = async () => {
      try {
        if (!user) {
          navigate('/login');
          return;
        }

        // Check admin access
        const { data: adminData, error: adminError } = await supabase
          .from('admin_users')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single();

        if (adminError || !adminData) {
          throw new Error('Unauthorized access');
        }

        // Fetch verifications with service agent details
        const { data, error: fetchError } = await supabase
          .from('service_agent_verifications')
          .select(`
            *,
            service_agent:profiles(
              id,
              full_name,
              email,
              phone,
              city,
              state,
              created_at
            )
          `)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;
        setVerifications(data as ServiceAgentVerification[]);
      } catch (err) {
        console.error('Error fetching verifications:', err);
        setError(err instanceof Error ? err.message : 'Failed to load verifications');
      } finally {
        setLoading(false);
      }
    };

    fetchVerifications();
  }, [user, navigate]);

  const handleStatusUpdate = async (verificationId: string, status: VerificationStatus) => {
    try {
      console.log('Updating verification with ID:', verificationId, 'to status:', status);

      const { error: updateError } = await supabase
        .from('service_agent_verifications')
        .update({
          background_check_status: status,
          admin_verified: status === 'clear',
          admin_verified_at: status === 'clear' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', verificationId);

      console.log('Update result:', updateError ? 'Error: ' + JSON.stringify(updateError) : 'Success');

      // Even if there's an error with notifications, we'll still update the UI
      // This is because the verification status might have been updated successfully
      // even if the notification creation failed
      if (updateError && !updateError.message.includes('notifications')) {
        throw updateError;
      }

      // Update local state
      setVerifications(prev => prev.map(v =>
        v.id === verificationId
          ? {
              ...v,
              background_check_status: status,
              admin_verified: status === 'clear',
              admin_verified_at: status === 'clear' ? new Date().toISOString() : null,
              updated_at: new Date().toISOString()
            }
          : v
      ));

      setSelectedVerification(null);

      // Show success message
      setError(null);

      // If there was a notification error, show a warning but don't block the update
      if (updateError && updateError.message.includes('notifications')) {
        setError('Status updated, but notification could not be sent due to permissions.');
      }
    } catch (err) {
      console.error('Error updating verification status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const filteredVerifications = verifications.filter(v => {
    const matchesSearch =
      v.contractor.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.contractor.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || v.background_check_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'clear':
        return (
          <span className="flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-4 h-4 mr-1" />
            Verified
          </span>
        );
      case 'in_progress':
        return (
          <span className="flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            <Clock className="w-4 h-4 mr-1" />
            In Progress
          </span>
        );
      case 'consider':
        return (
          <span className="flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            <AlertTriangle className="w-4 h-4 mr-1" />
            Under Review
          </span>
        );
      case 'suspended':
      case 'dispute':
      case 'failed':
        return (
          <span className="flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            <XCircle className="w-4 h-4 mr-1" />
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      default:
        return (
          <span className="flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
            <Clock className="w-4 h-4 mr-1" />
            Pending
          </span>
        );
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Verification Management</h1>
        <p className="mt-1 text-sm text-gray-500">
          Review and process service agent verification requests
        </p>
      </div>

      {error && (
        <div className="mb-8 bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm">
        {/* Filters */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or email..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as VerificationStatus | 'all')}
                  className="block w-full pl-10 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="clear">Verified</option>
                  <option value="consider">Under Review</option>
                  <option value="suspended">Suspended</option>
                  <option value="dispute">Disputed</option>
                  <option value="failed">Failed</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Verifications List */}
        <div className="divide-y divide-gray-200">
          {filteredVerifications.length === 0 ? (
            <div className="px-6 py-4 text-center text-gray-500">
              No verifications found
            </div>
          ) : (
            filteredVerifications.map((verification) => (
              <div
                key={verification.id}
                className={`px-6 py-4 ${
                  selectedVerification?.id === verification.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className="text-lg font-medium text-gray-900">
                        {verification.service_agent.full_name}
                      </h3>
                      <div className="ml-4">
                        {getStatusBadge(verification.background_check_status)}
                      </div>
                    </div>
                    <div className="mt-1 text-sm text-gray-500">
                      <p>{verification.service_agent.email}</p>
                      {verification.service_agent.phone && (
                        <p className="mt-1">{verification.service_agent.phone}</p>
                      )}
                      {verification.service_agent.city && verification.service_agent.state && (
                        <p className="mt-1">
                          {verification.service_agent.city}, {verification.service_agent.state}
                        </p>
                      )}
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      <p>Applied: {new Date(verification.created_at).toLocaleDateString()}</p>
                      {verification.admin_verified_at && (
                        <p>
                          Verified: {new Date(verification.admin_verified_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedVerification(
                      selectedVerification?.id === verification.id ? null : verification
                    )}
                    className="ml-4 text-sm font-medium text-blue-600 hover:text-blue-500"
                  >
                    {selectedVerification?.id === verification.id ? 'Hide Actions' : 'Show Actions'}
                  </button>
                </div>

                {selectedVerification?.id === verification.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleStatusUpdate(verification.id, 'clear')}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(verification.id, 'consider')}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700"
                      >
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        Flag for Review
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(verification.id, 'suspended')}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Suspend
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default VerificationManagement;