import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  RefreshCw,
  Mail,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

type Subscription = {
  id: string;
  user_id: string;
  plan_name: string;
  plan_price: number;
  billing_cycle: string;
  stripe_subscription_id: string;
  active: boolean;
  start_date: string;
  end_date: string | null;
  user: {
    email: string;
    user_type: string;
    full_name: string;
  };
};

type FilterState = {
  planType: string;
  billingStatus: string;
  userType: string;
};

const SubscriptionsManagement: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    planType: '',
    billingStatus: '',
    userType: ''
  });
  const [sortField, setSortField] = useState<string>('start_date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        if (!user) {
          navigate('/login');
          return;
        }

        // Check if user is admin
        const { data: adminData, error: adminError } = await supabase
          .from('admin_users')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single();

        if (adminError || !adminData) {
          throw new Error('Unauthorized access');
        }

        // Fetch subscriptions with user data
        const { data, error: fetchError } = await supabase
          .from('subscriptions')
          .select(`
            *,
            user:profiles(email, user_type, full_name)
          `)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;
        setSubscriptions(data as Subscription[]);
        setFilteredSubscriptions(data as Subscription[]);
      } catch (err) {
        console.error('Error loading subscriptions:', err);
        setError(err instanceof Error ? err.message : 'Failed to load subscriptions');
        navigate('/admin');
      } finally {
        setLoading(false);
      }
    };

    checkAdminAccess();
  }, [user, navigate]);

  // Apply filters and search
  useEffect(() => {
    let result = [...subscriptions];

    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        sub => 
          sub.user?.email.toLowerCase().includes(term) ||
          sub.user?.full_name.toLowerCase().includes(term) ||
          sub.plan_name.toLowerCase().includes(term)
      );
    }

    // Apply filters
    if (filters.planType) {
      result = result.filter(sub => sub.plan_name === filters.planType);
    }

    if (filters.billingStatus) {
      if (filters.billingStatus === 'active') {
        result = result.filter(sub => sub.active);
      } else if (filters.billingStatus === 'inactive') {
        result = result.filter(sub => !sub.active);
      } else if (filters.billingStatus === 'failed') {
        // In a real app, you'd have a payment_failed flag or similar
        result = result.filter(sub => sub.active && sub.stripe_subscription_id.includes('failed'));
      }
    }

    if (filters.userType) {
      result = result.filter(sub => sub.user?.user_type === filters.userType);
    }

    // Apply sorting
    result.sort((a, b) => {
      let fieldA: any = a[sortField as keyof Subscription];
      let fieldB: any = b[sortField as keyof Subscription];
      
      // Handle nested fields
      if (sortField === 'user.email') {
        fieldA = a.user?.email;
        fieldB = b.user?.email;
      } else if (sortField === 'user.user_type') {
        fieldA = a.user?.user_type;
        fieldB = b.user?.user_type;
      }
      
      if (fieldA < fieldB) return sortDirection === 'asc' ? -1 : 1;
      if (fieldA > fieldB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredSubscriptions(result);
  }, [subscriptions, searchTerm, filters, sortField, sortDirection]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSendReminder = async (subscriptionId: string, email: string) => {
    try {
      // In a real app, you would call an API to send a reminder email
      alert(`Reminder would be sent to ${email}`);
      
      // You could also update a "reminder_sent" field in the database
      // const { error } = await supabase
      //   .from('subscriptions')
      //   .update({ reminder_sent: true, reminder_sent_at: new Date().toISOString() })
      //   .eq('id', subscriptionId);
      
      // if (error) throw error;
    } catch (err) {
      console.error('Error sending reminder:', err);
      setError(err instanceof Error ? err.message : 'Failed to send reminder');
    }
  };

  const handleOfferUpgrade = async (subscriptionId: string, email: string) => {
    try {
      // In a real app, you would call an API to send an upgrade offer email
      alert(`Upgrade offer would be sent to ${email}`);
    } catch (err) {
      console.error('Error sending upgrade offer:', err);
      setError(err instanceof Error ? err.message : 'Failed to send upgrade offer');
    }
  };

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // Get status badge
  const getStatusBadge = (subscription: Subscription) => {
    if (!subscription.active) {
      return (
        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
          Inactive
        </span>
      );
    }
    
    // In a real app, you'd have more status indicators
    if (subscription.stripe_subscription_id.includes('failed')) {
      return (
        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
          <AlertTriangle className="h-3 w-3 inline mr-1" />
          Payment Failed
        </span>
      );
    }
    
    return (
      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
        <CheckCircle className="h-3 w-3 inline mr-1" />
        Active
      </span>
    );
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
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">Subscriptions & Billing</h1>
        <button
          onClick={() => navigate('/admin')}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Back to Dashboard
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
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

      {/* Filters and Search */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search by email or name"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>

          <div>
            <label htmlFor="planType" className="block text-sm font-medium text-gray-700 mb-1">
              Plan Type
            </label>
            <select
              id="planType"
              name="planType"
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={filters.planType}
              onChange={handleFilterChange}
            >
              <option value="">All Plans</option>
              <option value="Free Tier">Free Tier</option>
              <option value="Pro Contractor">Pro Contractor</option>
              <option value="Business Contractor">Business Contractor</option>
              <option value="Free Homeowner">Free Homeowner</option>
              <option value="FAIT Plus">FAIT Plus</option>
              <option value="Annual Membership Fee">Co-op Membership</option>
            </select>
          </div>

          <div>
            <label htmlFor="billingStatus" className="block text-sm font-medium text-gray-700 mb-1">
              Billing Status
            </label>
            <select
              id="billingStatus"
              name="billingStatus"
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={filters.billingStatus}
              onChange={handleFilterChange}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="failed">Payment Failed</option>
            </select>
          </div>

          <div>
            <label htmlFor="userType" className="block text-sm font-medium text-gray-700 mb-1">
              User Type
            </label>
            <select
              id="userType"
              name="userType"
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={filters.userType}
              onChange={handleFilterChange}
            >
              <option value="">All Users</option>
              <option value="client">Client</option>
              <option value="service_agent">Service Agent</option>
              <option value="contractor">Contractor</option>
              <option value="homeowner">Homeowner</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('user.email')}
                >
                  <div className="flex items-center">
                    User Email
                    {sortField === 'user.email' && (
                      sortDirection === 'asc' ? 
                        <ArrowUp className="h-4 w-4 ml-1" /> : 
                        <ArrowDown className="h-4 w-4 ml-1" />
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('user.user_type')}
                >
                  <div className="flex items-center">
                    Role
                    {sortField === 'user.user_type' && (
                      sortDirection === 'asc' ? 
                        <ArrowUp className="h-4 w-4 ml-1" /> : 
                        <ArrowDown className="h-4 w-4 ml-1" />
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('plan_name')}
                >
                  <div className="flex items-center">
                    Plan
                    {sortField === 'plan_name' && (
                      sortDirection === 'asc' ? 
                        <ArrowUp className="h-4 w-4 ml-1" /> : 
                        <ArrowDown className="h-4 w-4 ml-1" />
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Billing Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('end_date')}
                >
                  <div className="flex items-center">
                    Renewal Date
                    {sortField === 'end_date' && (
                      sortDirection === 'asc' ? 
                        <ArrowUp className="h-4 w-4 ml-1" /> : 
                        <ArrowDown className="h-4 w-4 ml-1" />
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSubscriptions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    No subscriptions found
                  </td>
                </tr>
              ) : (
                filteredSubscriptions.map((subscription) => (
                  <tr key={subscription.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{subscription.user?.email}</div>
                      <div className="text-sm text-gray-500">{subscription.user?.full_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {subscription.user?.user_type.replace('_', ' ')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <CreditCard className="h-4 w-4 text-gray-400 mr-2" />
                        <div className="text-sm text-gray-900">{subscription.plan_name}</div>
                      </div>
                      <div className="text-sm text-gray-500">
                        ${subscription.plan_price}/{subscription.billing_cycle === 'annual' ? 'year' : 'month'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(subscription)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(subscription.end_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => navigate(`/admin/subscriptions/${subscription.id}`)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        View Details
                      </button>
                      {subscription.stripe_subscription_id.includes('failed') && (
                        <button
                          onClick={() => handleSendReminder(subscription.id, subscription.user?.email)}
                          className="text-yellow-600 hover:text-yellow-900 mr-3"
                        >
                          <Mail className="h-4 w-4 inline mr-1" />
                          Send Reminder
                        </button>
                      )}
                      {(subscription.plan_name === 'Free Tier' || subscription.plan_name === 'Free Homeowner') && (
                        <button
                          onClick={() => handleOfferUpgrade(subscription.id, subscription.user?.email)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <ArrowUp className="h-4 w-4 inline mr-1" />
                          Offer Upgrade
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionsManagement;
