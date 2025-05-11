import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  Download,
  FileText,
  XCircle,
  Search,
  Filter,
  ArrowUp,
  ArrowDown,
  CheckCircle
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

type SupplierSummary = {
  supplier_name: string;
  total_order_volume: number;
  commission_owed: number;
  commission_rate: number;
  order_count: number;
};

type SupplierOrder = {
  id: string;
  user_id: string;
  supplier_name: string;
  order_total: number;
  commission_rate: number;
  commission_earned: number;
  created_at: string;
  user: {
    email: string;
    full_name: string;
    user_type: string;
  };
};

const CommissionsManagement: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [supplierSummaries, setSupplierSummaries] = useState<SupplierSummary[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null);
  const [supplierOrders, setSupplierOrders] = useState<SupplierOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string>('total_order_volume');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [timeframe, setTimeframe] = useState<'all' | 'month' | 'quarter' | 'year'>('month');

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

        await fetchSupplierSummaries();
      } catch (err) {
        console.error('Error loading commissions:', err);
        setError(err instanceof Error ? err.message : 'Failed to load commissions');
        navigate('/admin');
      } finally {
        setLoading(false);
      }
    };

    checkAdminAccess();
  }, [user, navigate, timeframe]);

  const fetchSupplierSummaries = async () => {
    try {
      // In a real app, you would have a database function or query to calculate these summaries
      // For this example, we'll fetch all orders and calculate the summaries in JavaScript
      
      let query = supabase
        .from('supplier_orders')
        .select(`
          *,
          user:profiles(email, full_name, user_type)
        `);
      
      // Apply timeframe filter
      if (timeframe !== 'all') {
        const now = new Date();
        let startDate = new Date();
        
        if (timeframe === 'month') {
          startDate.setMonth(now.getMonth() - 1);
        } else if (timeframe === 'quarter') {
          startDate.setMonth(now.getMonth() - 3);
        } else if (timeframe === 'year') {
          startDate.setFullYear(now.getFullYear() - 1);
        }
        
        query = query.gte('created_at', startDate.toISOString());
      }
      
      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      
      // Calculate supplier summaries
      const supplierMap = new Map<string, SupplierSummary>();
      
      (data as SupplierOrder[]).forEach(order => {
        const { supplier_name, order_total, commission_rate, commission_earned } = order;
        
        if (!supplierMap.has(supplier_name)) {
          supplierMap.set(supplier_name, {
            supplier_name,
            total_order_volume: 0,
            commission_owed: 0,
            commission_rate: commission_rate,
            order_count: 0
          });
        }
        
        const summary = supplierMap.get(supplier_name)!;
        summary.total_order_volume += order_total;
        summary.commission_owed += commission_earned;
        summary.order_count += 1;
        
        // Update the map
        supplierMap.set(supplier_name, summary);
      });
      
      // Convert map to array
      const summaries = Array.from(supplierMap.values());
      setSupplierSummaries(summaries);
    } catch (err) {
      console.error('Error fetching supplier summaries:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch supplier summaries');
    }
  };

  const fetchSupplierOrders = async (supplierName: string) => {
    try {
      setOrdersLoading(true);
      
      let query = supabase
        .from('supplier_orders')
        .select(`
          *,
          user:profiles(email, full_name, user_type)
        `)
        .eq('supplier_name', supplierName);
      
      // Apply timeframe filter
      if (timeframe !== 'all') {
        const now = new Date();
        let startDate = new Date();
        
        if (timeframe === 'month') {
          startDate.setMonth(now.getMonth() - 1);
        } else if (timeframe === 'quarter') {
          startDate.setMonth(now.getMonth() - 3);
        } else if (timeframe === 'year') {
          startDate.setFullYear(now.getFullYear() - 1);
        }
        
        query = query.gte('created_at', startDate.toISOString());
      }
      
      const { data, error: fetchError } = await query.order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setSupplierOrders(data as SupplierOrder[]);
    } catch (err) {
      console.error('Error fetching supplier orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch supplier orders');
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleViewOrders = (supplierName: string) => {
    setSelectedSupplier(supplierName);
    fetchSupplierOrders(supplierName);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleTimeframeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTimeframe(e.target.value as 'all' | 'month' | 'quarter' | 'year');
  };

  const handleDownloadCSV = () => {
    try {
      // In a real app, you would generate a proper CSV file
      // For this example, we'll just create a simple CSV string
      
      const headers = ['Supplier Name', 'Total Order Volume', 'Commission Rate', 'Commission Owed', 'Order Count'];
      const rows = supplierSummaries.map(summary => [
        summary.supplier_name,
        summary.total_order_volume.toFixed(2),
        (summary.commission_rate * 100).toFixed(2) + '%',
        summary.commission_owed.toFixed(2),
        summary.order_count.toString()
      ]);
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');
      
      // Create a blob and download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `supplier_commissions_${timeframe}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error downloading CSV:', err);
      setError(err instanceof Error ? err.message : 'Failed to download CSV');
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Filter suppliers based on search term
  const filteredSuppliers = supplierSummaries
    .filter(supplier => 
      supplier.supplier_name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const fieldA = a[sortField as keyof SupplierSummary];
      const fieldB = b[sortField as keyof SupplierSummary];
      
      if (fieldA < fieldB) return sortDirection === 'asc' ? -1 : 1;
      if (fieldA > fieldB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

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
        <h1 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">Supplier Commissions</h1>
        <div className="flex space-x-4">
          <button
            onClick={handleDownloadCSV}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </button>
          <button
            onClick={() => navigate('/admin')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to Dashboard
          </button>
        </div>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search by supplier name"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>

          <div>
            <label htmlFor="timeframe" className="block text-sm font-medium text-gray-700 mb-1">
              Timeframe
            </label>
            <select
              id="timeframe"
              name="timeframe"
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={timeframe}
              onChange={handleTimeframeChange}
            >
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
              <option value="all">All Time</option>
            </select>
          </div>

          <div className="flex items-end">
            <span className="text-sm text-gray-500">
              Showing {filteredSuppliers.length} suppliers
            </span>
          </div>
        </div>
      </div>

      {/* Supplier Summaries Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('supplier_name')}
                >
                  <div className="flex items-center">
                    Supplier Name
                    {sortField === 'supplier_name' && (
                      sortDirection === 'asc' ? 
                        <ArrowUp className="h-4 w-4 ml-1" /> : 
                        <ArrowDown className="h-4 w-4 ml-1" />
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('total_order_volume')}
                >
                  <div className="flex items-center">
                    Total Order Volume
                    {sortField === 'total_order_volume' && (
                      sortDirection === 'asc' ? 
                        <ArrowUp className="h-4 w-4 ml-1" /> : 
                        <ArrowDown className="h-4 w-4 ml-1" />
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('commission_rate')}
                >
                  <div className="flex items-center">
                    Commission Rate
                    {sortField === 'commission_rate' && (
                      sortDirection === 'asc' ? 
                        <ArrowUp className="h-4 w-4 ml-1" /> : 
                        <ArrowDown className="h-4 w-4 ml-1" />
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('commission_owed')}
                >
                  <div className="flex items-center">
                    Commission Owed
                    {sortField === 'commission_owed' && (
                      sortDirection === 'asc' ? 
                        <ArrowUp className="h-4 w-4 ml-1" /> : 
                        <ArrowDown className="h-4 w-4 ml-1" />
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('order_count')}
                >
                  <div className="flex items-center">
                    Order Count
                    {sortField === 'order_count' && (
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
              {filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    No supplier data found
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map((supplier) => (
                  <tr key={supplier.supplier_name}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{supplier.supplier_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatCurrency(supplier.total_order_volume)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{(supplier.commission_rate * 100).toFixed(2)}%</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">{formatCurrency(supplier.commission_owed)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{supplier.order_count}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewOrders(supplier.supplier_name)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <FileText className="h-4 w-4 inline mr-1" />
                        View Orders
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Supplier Orders Detail */}
      {selectedSupplier && (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">
              Orders for {selectedSupplier}
            </h2>
            <button
              onClick={() => setSelectedSupplier(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>
          
          {ordersLoading ? (
            <div className="p-6 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
                      Contractor
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order Total
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Commission Rate
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Commission Earned
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {supplierOrders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                        No orders found for this supplier
                      </td>
                    </tr>
                  ) : (
                    supplierOrders.map((order) => (
                      <tr key={order.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(order.created_at)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{order.user?.full_name}</div>
                          <div className="text-sm text-gray-500">{order.user?.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatCurrency(order.order_total)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{(order.commission_rate * 100).toFixed(2)}%</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{formatCurrency(order.commission_earned)}</div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CommissionsManagement;
