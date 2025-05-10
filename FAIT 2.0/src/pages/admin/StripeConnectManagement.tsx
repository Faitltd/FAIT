import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { stripeConnectService } from '../../services/StripeConnectService';
import { toast } from 'react-toastify';

const StripeConnectManagement: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [contractors, setContractors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [accountDetails, setAccountDetails] = useState<any | null>(null);
  const [accountBalance, setAccountBalance] = useState<any | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    fetchContractors();
  }, [isAdmin]);

  const fetchContractors = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .in('user_role', ['contractor', 'service_agent'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContractors(data || []);
    } catch (error) {
      console.error('Error fetching contractors:', error);
      toast.error('Failed to load contractors');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateConnectAccount = async (userId: string) => {
    try {
      const contractor = contractors.find(c => c.id === userId);
      if (!contractor) return;

      const result = await stripeConnectService.createConnectAccount(userId, {
        country: 'US', // Default to US
        email: contractor.email || '',
        business_type: 'individual'
      });

      if (result.success) {
        toast.success('Stripe Connect account created successfully');
        fetchContractors(); // Refresh the list
      } else {
        toast.info(result.message);
      }
    } catch (error) {
      console.error('Error creating Stripe Connect account:', error);
      toast.error('Failed to create Stripe Connect account');
    }
  };

  const handleCreateAccountLink = async (userId: string) => {
    try {
      const result = await stripeConnectService.createAccountLink(userId, {
        return_url: `${window.location.origin}/admin/stripe-connect?success=true&userId=${userId}`,
        refresh_url: `${window.location.origin}/admin/stripe-connect?refresh=true&userId=${userId}`,
        type: 'account_onboarding'
      });

      if (result.success && result.url) {
        window.open(result.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating account link:', error);
      toast.error('Failed to create account link');
    }
  };

  const handleViewDetails = async (userId: string) => {
    try {
      setSelectedUser(userId);
      setLoadingDetails(true);
      
      // Get account details
      const detailsResult = await stripeConnectService.getAccountDetails(userId);
      if (detailsResult.success) {
        setAccountDetails(detailsResult.account);
      }
      
      // Get account balance
      const balanceResult = await stripeConnectService.getAccountBalance(userId);
      if (balanceResult.success) {
        setAccountBalance(balanceResult.balance);
      }
    } catch (error) {
      console.error('Error fetching account details:', error);
      toast.error('Failed to fetch account details');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCreatePayout = async (userId: string, amount: number) => {
    try {
      const result = await stripeConnectService.createPayout(userId, {
        amount,
        currency: 'usd'
      });

      if (result.success) {
        toast.success('Payout created successfully');
        handleViewDetails(userId); // Refresh details
      }
    } catch (error) {
      console.error('Error creating payout:', error);
      toast.error('Failed to create payout');
    }
  };

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>You do not have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Stripe Connect Management</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contractors List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Contractors</h2>
              </div>
              
              <div className="overflow-y-auto max-h-[600px]">
                {loading ? (
                  <div className="p-4 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-2 text-gray-500">Loading contractors...</p>
                  </div>
                ) : contractors.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No contractors found
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {contractors.map((contractor) => (
                      <li 
                        key={contractor.id} 
                        className={`p-4 hover:bg-gray-50 cursor-pointer ${selectedUser === contractor.id ? 'bg-blue-50' : ''}`}
                        onClick={() => contractor.stripe_connect_id ? handleViewDetails(contractor.id) : null}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-900">{contractor.full_name}</p>
                            <p className="text-sm text-gray-500">{contractor.email}</p>
                            <p className="text-xs text-gray-400 mt-1">{contractor.user_role}</p>
                          </div>
                          
                          <div>
                            {contractor.stripe_connect_id ? (
                              <div className="flex flex-col items-end">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Connected
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCreateAccountLink(contractor.id);
                                  }}
                                  className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                                >
                                  Update Account
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCreateConnectAccount(contractor.id);
                                }}
                                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              >
                                Create Account
                              </button>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
          
          {/* Account Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Account Details</h2>
              </div>
              
              <div className="p-4">
                {!selectedUser ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Select a contractor to view their Stripe Connect account details</p>
                  </div>
                ) : loadingDetails ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-2 text-gray-500">Loading account details...</p>
                  </div>
                ) : !accountDetails ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No account details found</p>
                  </div>
                ) : (
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Account Status</h3>
                        <div className="flex items-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            accountDetails.details_submitted 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {accountDetails.details_submitted ? 'Complete' : 'Incomplete'}
                          </span>
                          {accountDetails.charges_enabled && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Charges Enabled
                            </span>
                          )}
                          {accountDetails.payouts_enabled && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              Payouts Enabled
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {accountBalance && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h3 className="text-sm font-medium text-gray-500 mb-2">Available Balance</h3>
                          <div>
                            {accountBalance.available.map((balance: any) => (
                              <p key={balance.currency} className="text-xl font-semibold text-gray-900">
                                {(balance.amount / 100).toLocaleString('en-US', {
                                  style: 'currency',
                                  currency: balance.currency.toUpperCase()
                                })}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Account Information</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                          <div className="col-span-1">
                            <dt className="text-xs text-gray-500">Account ID</dt>
                            <dd className="text-sm text-gray-900">{accountDetails.id}</dd>
                          </div>
                          <div className="col-span-1">
                            <dt className="text-xs text-gray-500">Business Type</dt>
                            <dd className="text-sm text-gray-900 capitalize">{accountDetails.business_type}</dd>
                          </div>
                          <div className="col-span-1">
                            <dt className="text-xs text-gray-500">Country</dt>
                            <dd className="text-sm text-gray-900">{accountDetails.country}</dd>
                          </div>
                          <div className="col-span-1">
                            <dt className="text-xs text-gray-500">Created</dt>
                            <dd className="text-sm text-gray-900">
                              {new Date(accountDetails.created * 1000).toLocaleDateString()}
                            </dd>
                          </div>
                        </dl>
                      </div>
                    </div>
                    
                    {accountDetails.payouts_enabled && accountBalance && accountBalance.available.some((b: any) => b.amount > 0) && (
                      <div className="mb-6">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Create Payout</h3>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <button
                              onClick={() => handleCreatePayout(selectedUser, accountBalance.available[0].amount / 100)}
                              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                              Payout Full Balance
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {accountDetails.requirements && (
                      <div className="mb-6">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Requirements</h3>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          {accountDetails.requirements.currently_due.length > 0 && (
                            <div className="mb-4">
                              <h4 className="text-xs font-medium text-red-500 mb-1">Currently Due</h4>
                              <ul className="list-disc list-inside text-sm text-gray-700">
                                {accountDetails.requirements.currently_due.map((req: string) => (
                                  <li key={req}>{req.replace(/_/g, ' ')}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {accountDetails.requirements.eventually_due.length > 0 && (
                            <div>
                              <h4 className="text-xs font-medium text-yellow-500 mb-1">Eventually Due</h4>
                              <ul className="list-disc list-inside text-sm text-gray-700">
                                {accountDetails.requirements.eventually_due.map((req: string) => (
                                  <li key={req}>{req.replace(/_/g, ' ')}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {accountDetails.requirements.currently_due.length === 0 && 
                           accountDetails.requirements.eventually_due.length === 0 && (
                            <p className="text-sm text-green-600">All requirements satisfied</p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleCreateAccountLink(selectedUser)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Update Account
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default StripeConnectManagement;
