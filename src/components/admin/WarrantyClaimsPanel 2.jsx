import React, { useState, useEffect } from 'react';
import supabase from '../../utils/supabaseClient';;
import { getAllWarrantyClaims, getWarrantyClaim, updateWarrantyClaim, getWarrantyAttachmentUrl } from '../../api/warrantyApi';
import { format, formatDistance } from 'date-fns';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
// Using singleton Supabase client;

const WarrantyClaimsPanel = () => {
  const [claims, setClaims] = useState([]);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState('all');
  const [resolution, setResolution] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        fetchClaims();
      }
    };

    fetchUser();
  }, []);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const data = await getAllWarrantyClaims();
      setClaims(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching warranty claims:', err);
      setError('Failed to load warranty claims');
    } finally {
      setLoading(false);
    }
  };

  const handleViewClaim = async (claimId) => {
    try {
      setLoading(true);
      const data = await getWarrantyClaim(claimId);
      setSelectedClaim(data);
      setAdminNotes(data.admin_notes || '');
      setResolution(data.resolution || '');
      setShowModal(true);
    } catch (err) {
      console.error('Error fetching warranty claim:', err);
      alert('Failed to load warranty claim details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateClaim = async (status) => {
    try {
      setSubmitting(true);

      await updateWarrantyClaim(
        selectedClaim.id,
        {
          status,
          admin_notes: adminNotes.trim(),
          ...(status === 'resolved' ? { resolution: resolution.trim() } : {})
        },
        user.id
      );

      // Refresh claims
      await fetchClaims();

      // Close modal
      setShowModal(false);
      setSelectedClaim(null);
      setAdminNotes('');
      setResolution('');

      alert(`Claim ${status === 'resolved' ? 'resolved' : 'updated'} successfully`);
    } catch (err) {
      console.error('Error updating warranty claim:', err);
      alert('Failed to update warranty claim');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenAttachment = async (attachment) => {
    try {
      const url = await getWarrantyAttachmentUrl(attachment.file_path);
      window.open(url, '_blank');
    } catch (err) {
      console.error('Error opening attachment:', err);
      alert('Failed to open attachment');
    }
  };

  const filteredClaims = filter === 'all'
    ? claims
    : claims.filter(claim => claim.status === filter);

  if (loading && !selectedClaim) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error && !selectedClaim) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Warranty Claims</h2>
        <div className="flex space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="all">All Claims</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>
          <button
            onClick={fetchClaims}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {filteredClaims.length === 0 ? (
        <div className="text-center py-8 px-4 bg-white shadow rounded-lg">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No claims found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filter === 'all'
              ? "There are no warranty claims in the system."
              : `There are no ${filter} warranty claims.`}
          </p>
        </div>
      ) : (
        <div className="flex flex-col">
          <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
              <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Claim ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Service
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Client
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Service Agent
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date Filed
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredClaims.map((claim) => (
                      <tr key={claim.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {claim.id.substring(0, 8)}...
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {claim.warranties?.services?.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {claim.client?.first_name} {claim.client?.last_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {claim.service_agent?.first_name} {claim.service_agent?.last_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {format(new Date(claim.created_at), 'MMM d, yyyy')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            claim.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            claim.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            claim.status === 'resolved' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {claim.status.charAt(0).toUpperCase() + claim.status.slice(1).replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleViewClaim(claim.id)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            View/Manage
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Claim Detail Modal */}
      {showModal && selectedClaim && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full sm:p-6">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  type="button"
                  className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={() => setShowModal(false)}
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:text-left sm:flex-grow">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                    Warranty Claim Details
                    <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      selectedClaim.status === 'pending' ? 'bg-company-lightorange text-gray-800' :
                      selectedClaim.status === 'in_progress' ? 'bg-company-lightblue text-gray-800' :
                      selectedClaim.status === 'resolved' ? 'bg-company-lightpink text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {selectedClaim.status.charAt(0).toUpperCase() + selectedClaim.status.slice(1).replace('_', ' ')}
                    </span>
                  </h3>

                  <div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <h4 className="text-sm font-medium text-gray-500">Claim Description</h4>
                      <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{selectedClaim.description}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Service</h4>
                      <p className="mt-1 text-sm text-gray-900">{selectedClaim.warranties?.services?.name}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Date Filed</h4>
                      <p className="mt-1 text-sm text-gray-900">
                        {format(new Date(selectedClaim.created_at), 'PPP')}
                        <span className="text-xs text-gray-500 ml-1">
                          ({formatDistance(new Date(selectedClaim.created_at), new Date(), { addSuffix: true })})
                        </span>
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Client</h4>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedClaim.client.first_name} {selectedClaim.client.last_name}
                      </p>
                      <p className="text-xs text-gray-500">{selectedClaim.client.email}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Service Agent</h4>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedClaim.service_agent.first_name} {selectedClaim.service_agent.last_name}
                      </p>
                      <p className="text-xs text-gray-500">{selectedClaim.service_agent.email}</p>
                    </div>

                    {selectedClaim.attachments && selectedClaim.attachments.length > 0 && (
                      <div className="sm:col-span-2">
                        <h4 className="text-sm font-medium text-gray-500">Attachments</h4>
                        <ul className="mt-2 divide-y divide-gray-200 border border-gray-200 rounded-md">
                          {selectedClaim.attachments.map((attachment) => (
                            <li key={attachment.id} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                              <div className="w-0 flex-1 flex items-center">
                                <svg className="flex-shrink-0 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                                </svg>
                                <span className="ml-2 flex-1 w-0 truncate">
                                  {attachment.file_name}
                                </span>
                              </div>
                              <div className="ml-4 flex-shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleOpenAttachment(attachment)}
                                  className="font-medium text-indigo-600 hover:text-indigo-500"
                                >
                                  View
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedClaim.status === 'resolved' && (
                      <div className="sm:col-span-2">
                        <h4 className="text-sm font-medium text-gray-500">Resolution</h4>
                        <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{selectedClaim.resolution}</p>
                        <p className="mt-1 text-xs text-gray-500">
                          Resolved by {selectedClaim.resolver?.first_name} {selectedClaim.resolver?.last_name} on {format(new Date(selectedClaim.resolved_at), 'PPP')}
                        </p>
                      </div>
                    )}

                    {selectedClaim.admin_notes && (
                      <div className="sm:col-span-2">
                        <h4 className="text-sm font-medium text-gray-500">Admin Notes</h4>
                        <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{selectedClaim.admin_notes}</p>
                      </div>
                    )}

                    <div className="sm:col-span-2">
                      <label htmlFor="admin-notes" className="block text-sm font-medium text-gray-700">
                        Admin Notes
                      </label>
                      <div className="mt-1">
                        <textarea
                          id="admin-notes"
                          name="admin-notes"
                          rows={3}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                          value={adminNotes}
                          onChange={(e) => setAdminNotes(e.target.value)}
                          placeholder="Add internal notes about this claim..."
                        />
                      </div>
                    </div>

                    {selectedClaim.status !== 'resolved' && (
                      <div className="sm:col-span-2">
                        <label htmlFor="resolution" className="block text-sm font-medium text-gray-700">
                          Resolution (required to mark as resolved)
                        </label>
                        <div className="mt-1">
                          <textarea
                            id="resolution"
                            name="resolution"
                            rows={3}
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                            value={resolution}
                            onChange={(e) => setResolution(e.target.value)}
                            placeholder="Describe how this claim was resolved..."
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                {selectedClaim.status === 'pending' && (
                  <>
                    <button
                      type="button"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                      onClick={() => handleUpdateClaim('in_progress')}
                      disabled={submitting}
                    >
                      {submitting ? 'Processing...' : 'Mark In Progress'}
                    </button>
                    <button
                      type="button"
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                      onClick={() => handleUpdateClaim('rejected')}
                      disabled={submitting}
                    >
                      Reject Claim
                    </button>
                  </>
                )}

                {selectedClaim.status === 'in_progress' && (
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => handleUpdateClaim('resolved')}
                    disabled={submitting || !resolution.trim()}
                  >
                    {submitting ? 'Processing...' : 'Mark as Resolved'}
                  </button>
                )}

                {selectedClaim.status !== 'resolved' && selectedClaim.status !== 'rejected' && (
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                    onClick={() => handleUpdateClaim(selectedClaim.status)}
                    disabled={submitting}
                  >
                    Update Notes Only
                  </button>
                )}

                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={() => setShowModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WarrantyClaimsPanel;
