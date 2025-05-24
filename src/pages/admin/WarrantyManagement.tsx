import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  ChevronDown,
  MessageSquare,
  Calendar,
  User
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type { Database } from '../../lib/database.types';

type WarrantyClaim = Database['public']['Tables']['warranty_claims']['Row'] & {
  client: Database['public']['Tables']['profiles']['Row'];
  booking: Database['public']['Tables']['bookings']['Row'] & {
    service_package: Database['public']['Tables']['service_packages']['Row'] & {
      service_agent: Database['public']['Tables']['profiles']['Row'];
    };
  };
};

type ClaimStatus = 'pending' | 'reviewing' | 'approved' | 'rejected' | 'resolved';
type ClaimPriority = 'low' | 'medium' | 'high' | 'urgent';

const WarrantyManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [claims, setClaims] = useState<WarrantyClaim[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ClaimStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<ClaimPriority | 'all'>('all');
  const [selectedClaim, setSelectedClaim] = useState<WarrantyClaim | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [resolutionNote, setResolutionNote] = useState('');

  useEffect(() => {
    const fetchClaims = async () => {
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

        // Fetch warranty claims with related data
        const { data, error: fetchError } = await supabase
          .from('warranty_claims')
          .select(`
            *,
            client:profiles(*),
            booking:bookings(
              *,
              service_package:service_packages(
                *,
                service_agent:profiles(*)
              )
            )
          `)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;
        setClaims(data as WarrantyClaim[]);
      } catch (err) {
        console.error('Error fetching warranty claims:', err);
        setError(err instanceof Error ? err.message : 'Failed to load warranty claims');
      } finally {
        setLoading(false);
      }
    };

    fetchClaims();
  }, [user, navigate]);

  const handleStatusUpdate = async (claimId: string, status: ClaimStatus) => {
    try {
      const updates: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (status === 'resolved') {
        updates.resolution_date = new Date().toISOString();
        updates.resolution_notes = resolutionNote;
      }

      const { error: updateError } = await supabase
        .from('warranty_claims')
        .update(updates)
        .eq('id', claimId);

      if (updateError) throw updateError;

      // Update local state
      setClaims(prev => prev.map(claim =>
        claim.id === claimId
          ? { ...claim, ...updates }
          : claim
      ));

      setSelectedClaim(null);
      setResolutionNote('');
    } catch (err) {
      console.error('Error updating claim status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const handlePriorityUpdate = async (claimId: string, priority: ClaimPriority) => {
    try {
      const { error: updateError } = await supabase
        .from('warranty_claims')
        .update({
          priority,
          updated_at: new Date().toISOString(),
        })
        .eq('id', claimId);

      if (updateError) throw updateError;

      // Update local state
      setClaims(prev => prev.map(claim =>
        claim.id === claimId
          ? { ...claim, priority }
          : claim
      ));
    } catch (err) {
      console.error('Error updating claim priority:', err);
      setError(err instanceof Error ? err.message : 'Failed to update priority');
    }
  };

  const handleAdminNoteUpdate = async (claimId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('warranty_claims')
        .update({
          admin_notes: adminNote,
          updated_at: new Date().toISOString(),
        })
        .eq('id', claimId);

      if (updateError) throw updateError;

      // Update local state
      setClaims(prev => prev.map(claim =>
        claim.id === claimId
          ? { ...claim, admin_notes: adminNote }
          : claim
      ));

      setAdminNote('');
    } catch (err) {
      console.error('Error updating admin notes:', err);
      setError(err instanceof Error ? err.message : 'Failed to update notes');
    }
  };

  const filteredClaims = claims.filter(claim => {
    const matchesSearch =
      claim.client.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || claim.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || claim.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusBadge = (status: ClaimStatus) => {
    switch (status) {
      case 'resolved':
        return (
          <span className="flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-4 h-4 mr-1" />
            Resolved
          </span>
        );
      case 'reviewing':
        return (
          <span className="flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            <Clock className="w-4 h-4 mr-1" />
            Reviewing
          </span>
        );
      case 'approved':
        return (
          <span className="flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
            <Shield className="w-4 h-4 mr-1" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            <XCircle className="w-4 h-4 mr-1" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            <AlertTriangle className="w-4 h-4 mr-1" />
            Pending
          </span>
        );
    }
  };

  const getPriorityBadge = (priority: ClaimPriority) => {
    switch (priority) {
      case 'urgent':
        return (
          <span className="bg-red-100 text-red-800 px-2 py-1 rounded-md text-xs font-medium">
            Urgent
          </span>
        );
      case 'high':
        return (
          <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-md text-xs font-medium">
            High
          </span>
        );
      case 'medium':
        return (
          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-md text-xs font-medium">
            Medium
          </span>
        );
      default:
        return (
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-xs font-medium">
            Low
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
        <h1 className="text-2xl font-bold text-gray-900">Warranty Claims Management</h1>
        <p className="mt-1 text-sm text-gray-500">
          Review and process warranty claims from customers
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
                placeholder="Search claims..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as ClaimStatus | 'all')}
                  className="block w-full pl-10 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="reviewing">Reviewing</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="resolved">Resolved</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value as ClaimPriority | 'all')}
                  className="block w-full pl-10 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="all">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Claims List */}
        <div className="divide-y divide-gray-200">
          {filteredClaims.length === 0 ? (
            <div className="px-6 py-4 text-center text-gray-500">
              No warranty claims found
            </div>
          ) : (
            filteredClaims.map((claim) => (
              <div
                key={claim.id}
                className={`px-6 py-4 ${
                  selectedClaim?.id === claim.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        Claim #{claim.id.slice(0, 8)}
                      </h3>
                      {getStatusBadge(claim.status as ClaimStatus)}
                      {claim.priority && getPriorityBadge(claim.priority as ClaimPriority)}
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>Client: {claim.client.full_name}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4" />
                        <span>Submitted: {new Date(claim.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-700">{claim.description}</p>
                  </div>
                  <button
                    onClick={() => setSelectedClaim(
                      selectedClaim?.id === claim.id ? null : claim
                    )}
                    className="ml-4 text-sm font-medium text-blue-600 hover:text-blue-500"
                  >
                    {selectedClaim?.id === claim.id ? 'Hide Details' : 'Show Details'}
                  </button>
                </div>

                {selectedClaim?.id === claim.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="space-y-4">
                      {/* Service Details */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Service Details</h4>
                        <div className="mt-2 text-sm text-gray-600">
                          <p>Service: {claim.booking.service_package.title}</p>
                          <p>Service Agent: {claim.booking.service_package.service_agent.full_name}</p>
                          <p>Completed: {new Date(claim.booking.scheduled_date).toLocaleDateString()}</p>
                        </div>
                      </div>

                      {/* Admin Notes */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Admin Notes</h4>
                        <div className="mt-2">
                          <textarea
                            value={adminNote}
                            onChange={(e) => setAdminNote(e.target.value)}
                            placeholder="Add internal notes..."
                            rows={3}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          />
                          <button
                            onClick={() => handleAdminNoteUpdate(claim.id)}
                            className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                          >
                            <MessageSquare className="w-4 h-4 mr-1" />
                            Save Note
                          </button>
                        </div>
                      </div>

                      {/* Resolution Notes (if resolving) */}
                      {claim.status !== 'resolved' && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Resolution Notes</h4>
                          <div className="mt-2">
                            <textarea
                              value={resolutionNote}
                              onChange={(e) => setResolutionNote(e.target.value)}
                              placeholder="Add resolution details..."
                              rows={3}
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />
                          </div>
                        </div>
                      )}

                      {/* Priority Selection */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Priority</h4>
                        <div className="mt-2 flex gap-2">
                          {(['low', 'medium', 'high', 'urgent'] as ClaimPriority[]).map((priority) => (
                            <button
                              key={priority}
                              onClick={() => handlePriorityUpdate(claim.id, priority)}
                              className={`px-3 py-1 rounded-md text-sm font-medium ${
                                claim.priority === priority
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {priority.charAt(0).toUpperCase() + priority.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2">
                        {claim.status !== 'resolved' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(claim.id, 'reviewing')}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                            >
                              <Clock className="w-4 h-4 mr-1" />
                              Mark as Reviewing
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(claim.id, 'approved')}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve Claim
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(claim.id, 'rejected')}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject Claim
                            </button>
                            {claim.status === 'approved' && (
                              <button
                                onClick={() => handleStatusUpdate(claim.id, 'resolved')}
                                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                              >
                                <Shield className="w-4 h-4 mr-1" />
                                Mark as Resolved
                              </button>
                            )}
                          </>
                        )}
                      </div>
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

export default WarrantyManagement;