import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, 
  DollarSign, 
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  FileText
} from 'lucide-react';
import { DividendEligibility, DividendPayment } from '../../types/governance';
import { governanceService } from '../../services/GovernanceService';

interface DividendEligibilityTrackerProps {
  memberId: string;
  isAdmin?: boolean;
}

const DividendEligibilityTracker: React.FC<DividendEligibilityTrackerProps> = ({ 
  memberId, 
  isAdmin = false 
}) => {
  const [eligibility, setEligibility] = useState<DividendEligibility | null>(null);
  const [payments, setPayments] = useState<DividendPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdatingEligibility, setIsUpdatingEligibility] = useState(false);
  const [shares, setShares] = useState(0);
  
  // Form state for updating eligibility
  const [formData, setFormData] = useState({
    eligibility_status: 'pending',
    notes: ''
  });

  useEffect(() => {
    fetchEligibility();
    fetchPayments();
    calculateShares();
  }, [memberId]);

  const fetchEligibility = async () => {
    try {
      setLoading(true);
      const data = await governanceService.getDividendEligibility(memberId);
      setEligibility(data);
      
      if (data) {
        setFormData({
          eligibility_status: data.eligibility_status,
          notes: data.notes || ''
        });
      }
      
      setError(null);
    } catch (err) {
      setError('Failed to load dividend eligibility');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPayments = async () => {
    try {
      const data = await governanceService.getMemberDividendPayments(memberId);
      setPayments(data);
    } catch (err) {
      console.error('Failed to load dividend payments:', err);
    }
  };

  const calculateShares = async () => {
    try {
      const data = await governanceService.calculateDividendShares(memberId);
      setShares(data);
    } catch (err) {
      console.error('Failed to calculate dividend shares:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateEligibility = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAdmin) return;
    
    try {
      const updatedEligibility = await governanceService.updateDividendEligibility(
        memberId,
        formData.eligibility_status,
        formData.notes
      );

      if (updatedEligibility) {
        setEligibility(updatedEligibility);
        setIsUpdatingEligibility(false);
      }
    } catch (err) {
      console.error('Failed to update eligibility:', err);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'eligible':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'ineligible':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'eligible':
        return 'bg-green-100 text-green-800';
      case 'ineligible':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <div className="text-red-500 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Dividend Eligibility</h3>
        {isAdmin && (
          <button
            onClick={() => setIsUpdatingEligibility(true)}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Update Eligibility
          </button>
        )}
      </div>

      {isUpdatingEligibility && isAdmin && (
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <form onSubmit={handleUpdateEligibility} className="space-y-4">
            <div>
              <label htmlFor="eligibility_status" className="block text-sm font-medium text-gray-700">
                Eligibility Status
              </label>
              <select
                name="eligibility_status"
                id="eligibility_status"
                required
                value={formData.eligibility_status}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="pending">Pending</option>
                <option value="eligible">Eligible</option>
                <option value="ineligible">Ineligible</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                Notes
              </label>
              <textarea
                name="notes"
                id="notes"
                rows={3}
                value={formData.notes}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Add any notes about this eligibility status..."
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsUpdatingEligibility(false)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Update Eligibility
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start">
          <div className="mr-3">
            <DollarSign className="h-5 w-5 text-blue-500" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Dividend Shares</h4>
                <p className="mt-1 text-2xl font-bold text-gray-900">{shares}</p>
              </div>
              
              {eligibility && (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(eligibility.eligibility_status)}`}>
                  {eligibility.eligibility_status.charAt(0).toUpperCase() + eligibility.eligibility_status.slice(1)}
                </span>
              )}
            </div>
            
            {eligibility && (
              <div className="mt-2 text-xs text-gray-500 flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                <span>Last updated: {formatDate(eligibility.updated_at)}</span>
              </div>
            )}
            
            {eligibility && eligibility.notes && (
              <div className="mt-2 p-2 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-700">{eligibility.notes}</p>
              </div>
            )}
            
            <div className="mt-4">
              <h5 className="text-sm font-medium text-gray-700 mb-2">How Shares Are Calculated</h5>
              <ul className="text-xs text-gray-500 space-y-1 list-disc pl-5">
                <li>1 share per month of membership</li>
                <li>5 shares per completed project</li>
                <li>10 shares per governance role</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {payments.length > 0 && (
        <div className="p-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Dividend Payment History</h4>
          
          <div className="divide-y divide-gray-200">
            {payments.map((payment) => (
              <div key={payment.id} className="py-3">
                <div className="flex items-start">
                  <div className="mr-3">
                    {payment.payment_status === 'paid' ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : payment.payment_status === 'failed' ? (
                      <XCircle className="h-4 w-4 text-red-500" />
                    ) : (
                      <Clock className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <h5 className="text-sm font-medium text-gray-900">
                        {formatCurrency(payment.amount)}
                      </h5>
                      <span className="text-xs text-gray-500">
                        {payment.payment_date ? formatDate(payment.payment_date) : 'Pending'}
                      </span>
                    </div>
                    
                    <div className="mt-1 flex items-center text-xs text-gray-500">
                      <span>
                        Distribution: {payment.distribution?.distribution_date ? 
                          formatDate(payment.distribution.distribution_date) : 
                          'Unknown'}
                      </span>
                      {payment.payment_method && (
                        <span className="ml-2">
                          via {payment.payment_method}
                        </span>
                      )}
                    </div>
                    
                    {payment.transaction_reference && (
                      <div className="mt-1 text-xs text-gray-500">
                        Ref: {payment.transaction_reference}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DividendEligibilityTracker;
