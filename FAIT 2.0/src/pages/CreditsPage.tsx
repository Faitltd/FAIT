import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import { Coins, Clock, ArrowUpRight, ArrowDownRight, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import CreditsPurchaseForm from '../components/credits/CreditsPurchaseForm';
import SimpleCreditsForm from '../components/credits/SimpleCreditsForm';
import { creditsService, CreditTransaction, CreditBalance } from '../services/CreditsService';

const CreditsPage: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [creditBalance, setCreditBalance] = useState<CreditBalance | null>(null);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [purchaseStatus, setPurchaseStatus] = useState<string | null>(null);

  useEffect(() => {
    // Check for purchase status in URL
    const params = new URLSearchParams(location.search);
    const status = params.get('purchase');
    if (status) {
      setPurchaseStatus(status);

      // Clear the URL parameter without refreshing the page
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [location]);

  useEffect(() => {
    if (user) {
      fetchCreditsData();
    }
  }, [user]);

  const fetchCreditsData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch credit balance
      const balance = await creditsService.getCreditBalance(user.id);
      setCreditBalance(balance);

      // Fetch recent transactions
      const transactions = await creditsService.getCreditTransactions(user.id, 10);
      setTransactions(transactions);
    } catch (err) {
      console.error('Error fetching credits data:', err);
      setError('Failed to load credits data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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

  const getTransactionTypeDisplay = (type: string) => {
    switch (type) {
      case 'purchase':
        return 'Credit Purchase';
      case 'usage':
        return 'API Usage';
      case 'reward':
        return 'Reward';
      case 'admin':
        return 'Admin Adjustment';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Credits Management</h1>

      {/* Purchase Status Messages */}
      {purchaseStatus === 'success' && (
        <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-md flex items-center">
          <CheckCircle className="h-5 w-5 mr-2" />
          <span>Your purchase was successful! Credits have been added to your account.</span>
        </div>
      )}

      {purchaseStatus === 'canceled' && (
        <div className="mb-6 p-4 bg-yellow-100 text-yellow-700 rounded-md flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>Your purchase was canceled. No charges were made.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Credits Balance Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center mb-4">
              <Coins className="h-6 w-6 text-primary-500 mr-2" />
              <h2 className="text-xl font-semibold text-gray-800">Your Credits</h2>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-24">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              </div>
            ) : error ? (
              <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                {error}
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="text-5xl font-bold text-gray-900 mb-2">{creditBalance?.balance || 0}</div>
                <div className="text-gray-500">Available Credits</div>

                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-green-600 font-medium">{creditBalance?.lifetime_earned || 0}</div>
                    <div className="text-gray-500">Total Earned</div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-red-600 font-medium">{creditBalance?.lifetime_spent || 0}</div>
                    <div className="text-gray-500">Total Spent</div>
                  </div>
                </div>

                <button
                  onClick={fetchCreditsData}
                  className="mt-4 text-primary-500 hover:text-primary-600 text-sm flex items-center justify-center mx-auto"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Refresh
                </button>
              </div>
            )}
          </div>

          {/* Transaction History */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Clock className="h-6 w-6 text-primary-500 mr-2" />
                <h2 className="text-xl font-semibold text-gray-800">Recent Transactions</h2>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-24">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              </div>
            ) : error ? (
              <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                {error}
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No transactions found
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="py-3">
                    <div className="flex justify-between">
                      <div>
                        <div className="flex items-center">
                          {transaction.amount >= 0 ? (
                            <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                          )}
                          <p className="text-sm font-medium text-gray-900">
                            {getTransactionTypeDisplay(transaction.type)}
                          </p>
                        </div>
                        {transaction.description && (
                          <p className="text-xs text-gray-500 mt-1">{transaction.description}</p>
                        )}
                      </div>

                      <div className="text-right">
                        <p className={`text-sm font-medium ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.amount >= 0 ? '+' : ''}{transaction.amount}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(transaction.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Purchase Credits Form */}
        <div className="lg:col-span-2">
          <CreditsPurchaseForm />

          {/* Simple Test Form */}
          <div className="mt-6">
            <SimpleCreditsForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditsPage;
