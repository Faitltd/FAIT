import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Users, 
  CreditCard, 
  Coins, 
  Plus, 
  Minus, 
  Search, 
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Download
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  api_key: string;
  credits: number;
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface CreditTransaction {
  id: string;
  user_id: string;
  amount: number;
  type: string;
  description: string;
  stripe_session_id: string | null;
  created_at: string;
}

const CreditsAdminPage: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creditsToAdd, setCreditsToAdd] = useState(0);
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchUsers();
    }
  }, [user]);

  useEffect(() => {
    if (selectedUser) {
      fetchUserTransactions(selectedUser.id);
    }
  }, [selectedUser]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('email');

      if (error) throw error;
      
      setUsers(data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserTransactions = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('credit_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setTransactions(data || []);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      // Don't set error state here to keep the UI usable
    }
  };

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setCreditsToAdd(0);
    setAdjustmentReason('');
    setSuccessMessage(null);
  };

  const handleAdjustCredits = async () => {
    if (!selectedUser || creditsToAdd === 0 || !adjustmentReason.trim()) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Call the add_credits function
      const { data, error } = await supabase.rpc('add_credits', {
        user_id: selectedUser.id,
        credit_amount: creditsToAdd,
        transaction_type: 'admin',
        transaction_description: adjustmentReason
      });

      if (error) throw error;

      // Update the selected user's credits
      setSelectedUser({
        ...selectedUser,
        credits: selectedUser.credits + creditsToAdd
      });

      // Refresh transactions
      fetchUserTransactions(selectedUser.id);
      
      // Show success message
      setSuccessMessage(`Successfully ${creditsToAdd > 0 ? 'added' : 'removed'} ${Math.abs(creditsToAdd)} credits.`);
      
      // Reset form
      setCreditsToAdd(0);
      setAdjustmentReason('');
    } catch (err) {
      console.error('Error adjusting credits:', err);
      setError('Failed to adjust credits. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const exportTransactionsCSV = () => {
    if (!transactions.length) return;
    
    // Create CSV content
    const headers = ['ID', 'User ID', 'Amount', 'Type', 'Description', 'Stripe Session ID', 'Created At'];
    const csvRows = [headers.join(',')];
    
    transactions.forEach(tx => {
      const row = [
        tx.id,
        tx.user_id,
        tx.amount,
        tx.type,
        `"${tx.description || ''}"`, // Wrap in quotes to handle commas
        tx.stripe_session_id || '',
        tx.created_at
      ];
      csvRows.push(row.join(','));
    });
    
    const csvContent = csvRows.join('\n');
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `transactions-${selectedUser?.email.split('@')[0]}-${new Date().toISOString().split('T')[0]}.csv`);
    a.click();
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.api_key.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Credits Administration</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Users List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Users className="h-6 w-6 text-primary-500 mr-2" />
                <h2 className="text-xl font-semibold text-gray-800">Users</h2>
              </div>
              <button
                onClick={fetchUsers}
                className="text-gray-400 hover:text-gray-500"
                disabled={loading}
              >
                <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="mb-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="p-3 mb-4 bg-red-100 text-red-700 rounded-md text-sm flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                {error}
              </div>
            )}

            <div className="overflow-y-auto max-h-96">
              {loading && !users.length ? (
                <div className="flex justify-center items-center h-24">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No users found
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className={`py-3 px-2 cursor-pointer hover:bg-gray-50 ${
                        selectedUser?.id === user.id ? 'bg-primary-50' : ''
                      }`}
                      onClick={() => handleUserSelect(user)}
                    >
                      <div className="flex justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user.email}</p>
                          <p className="text-xs text-gray-500 mt-1">API Key: {user.api_key.substring(0, 10)}...</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-primary-600">{user.credits} credits</p>
                          <p className="text-xs text-gray-500 mt-1">{user.role}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* User Details and Credit Adjustment */}
        <div className="lg:col-span-2">
          {selectedUser ? (
            <>
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex items-center mb-4">
                  <Coins className="h-6 w-6 text-primary-500 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-800">Credit Management</h2>
                </div>

                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-medium text-gray-900">{selectedUser.email}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      selectedUser.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedUser.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-sm text-gray-500">Current Credits</p>
                      <p className="text-2xl font-bold text-gray-900">{selectedUser.credits}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-sm text-gray-500">Role</p>
                      <p className="text-2xl font-bold text-gray-900">{selectedUser.role}</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    <p>API Key: {selectedUser.api_key}</p>
                    <p>Created: {formatDate(selectedUser.created_at)}</p>
                    <p>Last Updated: {formatDate(selectedUser.updated_at)}</p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Adjust Credits</h3>
                  
                  {successMessage && (
                    <div className="p-3 mb-4 bg-green-100 text-green-700 rounded-md text-sm flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      {successMessage}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="creditsToAdd" className="block text-sm font-medium text-gray-700 mb-1">
                        Credits Amount
                      </label>
                      <div className="flex">
                        <button
                          type="button"
                          onClick={() => setCreditsToAdd(prev => prev - 10)}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 bg-gray-50 text-gray-500 rounded-l-md hover:bg-gray-100"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <input
                          type="number"
                          id="creditsToAdd"
                          value={creditsToAdd}
                          onChange={(e) => setCreditsToAdd(parseInt(e.target.value) || 0)}
                          className="block w-full border-gray-300 focus:ring-primary-500 focus:border-primary-500 text-center"
                        />
                        <button
                          type="button"
                          onClick={() => setCreditsToAdd(prev => prev + 10)}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 bg-gray-50 text-gray-500 rounded-r-md hover:bg-gray-100"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="adjustmentReason" className="block text-sm font-medium text-gray-700 mb-1">
                        Reason
                      </label>
                      <input
                        type="text"
                        id="adjustmentReason"
                        value={adjustmentReason}
                        onChange={(e) => setAdjustmentReason(e.target.value)}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        placeholder="e.g., Bonus credits, Refund, etc."
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleAdjustCredits}
                    disabled={loading || creditsToAdd === 0 || !adjustmentReason.trim()}
                    className={`w-full flex items-center justify-center py-2 px-4 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                      loading || creditsToAdd === 0 || !adjustmentReason.trim()
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : creditsToAdd > 0
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : creditsToAdd > 0 ? (
                      <>
                        <Plus className="h-5 w-5 mr-2" />
                        Add {creditsToAdd} Credits
                      </>
                    ) : creditsToAdd < 0 ? (
                      <>
                        <Minus className="h-5 w-5 mr-2" />
                        Remove {Math.abs(creditsToAdd)} Credits
                      </>
                    ) : (
                      'Enter Credits Amount'
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <CreditCard className="h-6 w-6 text-primary-500 mr-2" />
                    <h2 className="text-xl font-semibold text-gray-800">Transaction History</h2>
                  </div>
                  <button
                    onClick={exportTransactionsCSV}
                    disabled={!transactions.length}
                    className={`text-sm flex items-center px-3 py-1 rounded-md ${
                      !transactions.length
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
                    }`}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Export CSV
                  </button>
                </div>

                {loading && !transactions.length ? (
                  <div className="flex justify-center items-center h-24">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No transactions found
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Description
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {transactions.map((transaction) => (
                          <tr key={transaction.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(transaction.created_at)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                transaction.type === 'purchase'
                                  ? 'bg-blue-100 text-blue-800'
                                  : transaction.type === 'usage'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : transaction.type === 'admin' && transaction.amount > 0
                                      ? 'bg-green-100 text-green-800'
                                      : transaction.type === 'admin' && transaction.amount < 0
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-gray-100 text-gray-800'
                              }`}>
                                {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`font-medium ${
                                transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {transaction.amount >= 0 ? '+' : ''}{transaction.amount}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {transaction.description || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center h-64">
              <Users className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg">Select a user to manage credits</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreditsAdminPage;
