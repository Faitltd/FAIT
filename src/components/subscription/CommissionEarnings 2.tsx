import React, { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, Calendar, FileText } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

type CommissionTransaction = {
  id: string;
  supplier_order_id: string;
  commission_amount: number;
  paid_out: boolean;
  payout_date: string | null;
  created_at: string;
  supplier_order: {
    supplier_name: string;
    order_total: number;
  };
};

const CommissionEarnings: React.FC = () => {
  const { user } = useAuth();
  const [commissions, setCommissions] = useState<CommissionTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<'month' | 'quarter' | 'year' | 'all'>('month');

  useEffect(() => {
    if (!user) return;

    const fetchCommissions = async () => {
      try {
        setLoading(true);
        setError(null);

        let query = supabase
          .from('commission_transactions')
          .select(`
            *,
            supplier_order:supplier_orders(supplier_name, order_total)
          `)
          .eq('contractor_id', user.id)
          .order('created_at', { ascending: false });

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
        setCommissions(data as CommissionTransaction[]);
      } catch (err) {
        console.error('Error fetching commissions:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch commissions');
      } finally {
        setLoading(false);
      }
    };

    fetchCommissions();
  }, [user, timeframe]);

  // Calculate total earnings
  const totalEarnings = commissions.reduce((sum, commission) => sum + commission.commission_amount, 0);
  
  // Calculate paid out earnings
  const paidOutEarnings = commissions
    .filter(commission => commission.paid_out)
    .reduce((sum, commission) => sum + commission.commission_amount, 0);
  
  // Calculate pending earnings
  const pendingEarnings = totalEarnings - paidOutEarnings;

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
        Error loading commissions: {error}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Commission Earnings</h2>
          <select
            className="block w-40 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as 'month' | 'quarter' | 'year' | 'all')}
          >
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      <div className="p-6">
        {commissions.length === 0 ? (
          <div className="text-center py-8">
            <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No Commission Earnings</h3>
            <p className="text-gray-500">
              You haven't earned any commissions yet. Place orders with our partner suppliers to earn commissions.
            </p>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <DollarSign className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="text-sm font-medium text-blue-900">Total Earnings</h3>
                </div>
                <div className="text-2xl font-bold text-blue-900">{formatCurrency(totalEarnings)}</div>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                  <h3 className="text-sm font-medium text-green-900">Paid Out</h3>
                </div>
                <div className="text-2xl font-bold text-green-900">{formatCurrency(paidOutEarnings)}</div>
              </div>

              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Calendar className="h-5 w-5 text-yellow-600 mr-2" />
                  <h3 className="text-sm font-medium text-yellow-900">Pending</h3>
                </div>
                <div className="text-2xl font-bold text-yellow-900">{formatCurrency(pendingEarnings)}</div>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Supplier
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order Total
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Commission
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {commissions.map((commission) => (
                    <tr key={commission.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(commission.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 text-gray-400 mr-2" />
                          <div className="text-sm font-medium text-gray-900">
                            {commission.supplier_order?.supplier_name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(commission.supplier_order?.order_total || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(commission.commission_amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {commission.paid_out ? (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Paid {commission.payout_date && `(${formatDate(commission.payout_date)})`}
                          </span>
                        ) : (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CommissionEarnings;
