import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { ArrowLeft, Plus, Trash2, Send } from 'lucide-react';
import type { Database } from '../../../lib/database.types';

type Booking = Database['public']['Tables']['bookings']['Row'] & {
  client: Pick<Database['public']['Tables']['profiles']['Row'], 'full_name' | 'email'>;
  service_package: Pick<Database['public']['Tables']['service_packages']['Row'], 'title' | 'price'>;
};

type EstimateItem = {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
};

const BuildEstimate = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [items, setItems] = useState<EstimateItem[]>([
    { id: crypto.randomUUID(), description: '', quantity: 1, unit_price: 0, total: 0 }
  ]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooking = async () => {
      if (!user || !bookingId) return;

      try {
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            id,
            client_id,
            service_package_id,
            scheduled_date,
            status,
            total_amount,
            notes,
            created_at,
            updated_at,
            client:client_id(full_name, email),
            service_package:service_package_id(title, price)
          `)
          .eq('id', bookingId)
          .single();

        if (error) throw error;

        // Verify this booking belongs to a service package owned by this service agent
        const { data: servicePackage, error: packageError } = await supabase
          .from('service_packages')
          .select('service_agent_id')
          .eq('id', data.service_package_id)
          .single();

        if (packageError) throw packageError;

        if (servicePackage.service_agent_id !== user.id) {
          setError('You do not have permission to create an estimate for this booking');
          setLoading(false);
          return;
        }

        setBooking(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching booking:', error);
        setError('Error fetching booking details');
        setLoading(false);
      }
    };

    fetchBooking();
  }, [user, bookingId]);

  const addItem = () => {
    setItems([
      ...items,
      { id: crypto.randomUUID(), description: '', quantity: 1, unit_price: 0, total: 0 }
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length === 1) {
      return; // Keep at least one item
    }
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof EstimateItem, value: string | number) => {
    setItems(
      items.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          
          // Recalculate total if quantity or unit_price changed
          if (field === 'quantity' || field === 'unit_price') {
            updatedItem.total = updatedItem.quantity * updatedItem.unit_price;
          }
          
          return updatedItem;
        }
        return item;
      })
    );
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !booking) return;
    
    // Validate items
    const invalidItems = items.filter(item => !item.description || item.quantity <= 0);
    if (invalidItems.length > 0) {
      setError('Please fill in all item descriptions and ensure quantities are greater than zero');
      return;
    }
    
    setSending(true);
    setError(null);
    
    try {
      // Create the estimate
      const { data: estimate, error: estimateError } = await supabase
        .from('estimates')
        .insert({
          booking_id: bookingId,
          service_agent_id: user.id,
          client_id: booking.client_id,
          total_amount: calculateTotal(),
          notes: notes,
          status: 'pending'
        })
        .select()
        .single();
        
      if (estimateError) throw estimateError;
      
      // Add estimate items
      const estimateItems = items.map(item => ({
        estimate_id: estimate.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total: item.total
      }));
      
      const { error: itemsError } = await supabase
        .from('estimate_items')
        .insert(estimateItems);
        
      if (itemsError) throw itemsError;
      
      // Send a message to the client about the estimate
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          booking_id: bookingId,
          sender_id: user.id,
          recipient_id: booking.client_id,
          content: `I've created an estimate for additional work. Please review it in your dashboard.`,
          is_read: false
        });
        
      if (messageError) throw messageError;
      
      setSuccess('Estimate created successfully!');
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate(`/dashboard/service-agent/messages`);
      }, 2000);
      
    } catch (error) {
      console.error('Error creating estimate:', error);
      setError('Failed to create estimate. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link to="/dashboard/service-agent" className="inline-flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-800">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link to="/dashboard/service-agent/messages" className="inline-flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Messages
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Create Estimate</h1>
      </div>

      {success ? (
        <div className="bg-green-50 border border-green-200 rounded-md p-4 text-green-800">
          {success}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900">Booking Details</h2>
              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Client</p>
                  <p className="text-sm font-medium text-gray-900">{booking?.client?.full_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Service</p>
                  <p className="text-sm font-medium text-gray-900">{booking?.service_package?.title}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Original Price</p>
                  <p className="text-sm font-medium text-gray-900">${booking?.service_package?.price?.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Scheduled Date</p>
                  <p className="text-sm font-medium text-gray-900">
                    {booking?.scheduled_date ? new Date(booking.scheduled_date).toLocaleDateString() : 'Not scheduled'}
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <h2 className="text-lg font-medium text-gray-900">Additional Work Items</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Add items for additional work beyond the original service scope.
                </p>

                {error && (
                  <div className="mt-2 bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-800">
                    {error}
                  </div>
                )}

                <div className="mt-4 border border-gray-200 rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                          Quantity
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                          Unit Price
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                          Total
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {items.map((item, index) => (
                        <tr key={item.id}>
                          <td className="px-4 py-2">
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                              placeholder="Item description"
                              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              required
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              required
                            />
                          </td>
                          <td className="px-4 py-2">
                            <div className="relative rounded-md shadow-sm">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 sm:text-sm">$</span>
                              </div>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.unit_price}
                                onChange={(e) => updateItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                                className="block w-full pl-7 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                required
                              />
                            </div>
                          </td>
                          <td className="px-4 py-2">
                            <div className="text-sm font-medium text-gray-900">
                              ${item.total.toFixed(2)}
                            </div>
                          </td>
                          <td className="px-4 py-2 text-right">
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="text-red-600 hover:text-red-900"
                              disabled={items.length === 1}
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={5} className="px-4 py-2">
                          <button
                            type="button"
                            onClick={addItem}
                            className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Item
                          </button>
                        </td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td colSpan={3} className="px-4 py-2 text-right text-sm font-medium text-gray-900">
                          Total Estimate:
                        </td>
                        <td className="px-4 py-2 text-sm font-bold text-gray-900">
                          ${calculateTotal().toFixed(2)}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                  Notes
                </label>
                <textarea
                  id="notes"
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Add any additional notes or explanations for the client..."
                ></textarea>
              </div>

              <div className="flex justify-end">
                <Link
                  to="/dashboard/service-agent/messages"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={sending}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {sending ? (
                    <div className="h-5 w-5 border-t-2 border-white rounded-full animate-spin mr-2" />
                  ) : (
                    <Send className="h-5 w-5 mr-2" />
                  )}
                  Send Estimate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuildEstimate;
