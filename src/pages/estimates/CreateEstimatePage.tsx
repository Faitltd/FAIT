import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import ResponsiveLayout from '../../components/layout/ResponsiveLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatCurrency } from '../../utils/formatters';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  AlertTriangle,
  FileText,
  DollarSign,
  Send
} from 'lucide-react';

interface EstimateItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

const CreateEstimatePage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const [items, setItems] = useState<EstimateItem[]>([
    { id: '1', description: '', quantity: 1, unit_price: 0, total: 0 }
  ]);
  const [notes, setNotes] = useState('');
  const [validUntil, setValidUntil] = useState<string>(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30); // Default validity: 30 days
    return date.toISOString().split('T')[0];
  });
  
  useEffect(() => {
    if (!bookingId || !user) return;
    
    const fetchBooking = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get booking details
        const { data: bookingData, error: bookingError } = await supabase
          .from('bookings')
          .select(`
            *,
            client:profiles!bookings_client_id_fkey(id, full_name, email, avatar_url),
            service_agent:profiles!bookings_service_agent_id_fkey(id, full_name, email, avatar_url),
            service:service_packages(id, title, description, price)
          `)
          .eq('id', bookingId)
          .single();
        
        if (bookingError) throw bookingError;
        
        // Check if user is the service agent for this booking
        if (bookingData.service_agent_id !== user.id) {
          throw new Error('You do not have permission to create an estimate for this booking');
        }
        
        setBooking(bookingData);
      } catch (err) {
        console.error('Error fetching booking:', err);
        setError(err instanceof Error ? err.message : 'Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBooking();
  }, [bookingId, user]);
  
  const addItem = () => {
    const newId = (items.length + 1).toString();
    setItems([...items, { id: newId, description: '', quantity: 1, unit_price: 0, total: 0 }]);
  };
  
  const removeItem = (id: string) => {
    if (items.length === 1) {
      return; // Don't remove the last item
    }
    setItems(items.filter(item => item.id !== id));
  };
  
  const updateItem = (id: string, field: keyof EstimateItem, value: any) => {
    const updatedItems = items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // Recalculate total if quantity or unit_price changed
        if (field === 'quantity' || field === 'unit_price') {
          updatedItem.total = updatedItem.quantity * updatedItem.unit_price;
        }
        
        return updatedItem;
      }
      return item;
    });
    
    setItems(updatedItems);
  };
  
  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (items.some(item => !item.description.trim())) {
      setSubmitError('All items must have a description');
      return;
    }
    
    if (items.some(item => item.quantity <= 0)) {
      setSubmitError('All items must have a quantity greater than zero');
      return;
    }
    
    if (!validUntil) {
      setSubmitError('Please specify how long this estimate is valid for');
      return;
    }
    
    setSubmitting(true);
    setSubmitError(null);
    
    try {
      // Create estimate
      const { data: estimateData, error: estimateError } = await supabase
        .from('estimates')
        .insert({
          booking_id: bookingId,
          client_id: booking.client_id,
          service_agent_id: user?.id,
          subtotal: calculateSubtotal(),
          notes,
          valid_until: validUntil,
          status: 'pending'
        })
        .select()
        .single();
      
      if (estimateError) throw estimateError;
      
      // Create estimate items
      const estimateItems = items.map(item => ({
        estimate_id: estimateData.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total: item.total
      }));
      
      const { error: itemsError } = await supabase
        .from('estimate_items')
        .insert(estimateItems);
      
      if (itemsError) throw itemsError;
      
      // Navigate to estimate details
      navigate(`/estimates/${estimateData.id}`);
    } catch (err) {
      console.error('Error creating estimate:', err);
      setSubmitError(err instanceof Error ? err.message : 'Failed to create estimate');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <ResponsiveLayout>
        <div className="py-8 flex justify-center">
          <LoadingSpinner />
        </div>
      </ResponsiveLayout>
    );
  }
  
  if (error || !booking) {
    return (
      <ResponsiveLayout>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error || 'Booking not found'}</p>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard/service-agent/jobs')}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Go to Jobs
                </button>
              </div>
            </div>
          </div>
        </div>
      </ResponsiveLayout>
    );
  }
  
  return (
    <ResponsiveLayout title="Create Estimate">
      <div className="mb-6">
        <Link
          to={`/dashboard/service-agent/jobs/${bookingId}/enhanced`}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Booking
        </Link>
      </div>
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Create Estimate</h2>
              <p className="text-sm text-gray-500">
                For: {booking.service.title}
              </p>
            </div>
            <div className="mt-2 md:mt-0">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <FileText className="h-3 w-3 mr-1" />
                Draft
              </span>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          {submitError && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">There was an error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{submitError}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Client Information</h3>
            </div>
            <div className="bg-gray-50 rounded-md p-4">
              <div className="flex items-center">
                <img
                  src={booking.client.avatar_url || '/default-avatar.png'}
                  alt={booking.client.full_name}
                  className="h-10 w-10 rounded-full object-cover mr-4"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">{booking.client.full_name}</p>
                  <p className="text-xs text-gray-500">{booking.client.email}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Estimate Items</h3>
              <button
                type="button"
                onClick={addItem}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unit Price
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          placeholder="Item description"
                          required
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                          className="block w-20 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          required
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="relative rounded-md shadow-sm">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <span className="text-gray-500 sm:text-sm">$</span>
                          </div>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unit_price}
                            onChange={(e) => updateItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                            className="block w-24 rounded-md border-gray-300 pl-7 pr-3 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            required
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(item.total)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-900"
                          disabled={items.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <th
                      scope="row"
                      colSpan={3}
                      className="hidden pt-6 pl-6 pr-3 text-right text-sm font-semibold text-gray-900 sm:table-cell"
                    >
                      Subtotal
                    </th>
                    <th
                      scope="row"
                      className="pt-6 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:hidden"
                    >
                      Subtotal
                    </th>
                    <td className="pt-6 pl-3 pr-4 text-right text-sm text-gray-500 sm:pr-6 md:pr-0">
                      <span className="font-medium text-gray-900">
                        {formatCurrency(calculateSubtotal())}
                      </span>
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
          
          <div className="mb-6">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              id="notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Additional notes or terms for this estimate"
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="valid-until" className="block text-sm font-medium text-gray-700 mb-1">
              Valid Until
            </label>
            <input
              type="date"
              id="valid-until"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <Link
              to={`/dashboard/service-agent/jobs/${bookingId}/enhanced`}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <LoadingSpinner size="small" />
                  <span className="ml-2">Creating...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-1 inline" />
                  Send Estimate
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </ResponsiveLayout>
  );
};

export default CreateEstimatePage;
