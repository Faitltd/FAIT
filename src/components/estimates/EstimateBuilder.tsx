import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '../../utils/formatters';
import EstimateHeader from './EstimateHeader';
import EstimateItemList from './EstimateItemList';
import EstimatePhotos from './EstimatePhotos';
import EstimateActions from './EstimateActions';
import LoadingSpinner from '../LoadingSpinner';
import { AlertCircle, CheckCircle } from 'lucide-react';

export interface EstimateItem {
  id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  sort_order: number;
}

export interface EstimatePhoto {
  id?: string;
  file_path?: string;
  file_name: string;
  file_type: string;
  file_size: number;
  public_url: string;
  description?: string;
}

export interface Estimate {
  id?: string;
  service_agent_id: string;
  client_id: string;
  original_booking_id?: string;
  title: string;
  description: string;
  total_amount: number;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'expired' | 'converted';
  expiration_date?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  items?: EstimateItem[];
  photos?: EstimatePhoto[];
}

interface EstimateBuilderProps {
  estimateId?: string;
  originalBookingId?: string;
  clientId?: string;
  onSuccess: (estimateId: string) => void;
  onCancel: () => void;
}

const EstimateBuilder: React.FC<EstimateBuilderProps> = ({
  estimateId,
  originalBookingId,
  clientId,
  onSuccess,
  onCancel
}) => {
  const { user } = useAuth();
  const [estimate, setEstimate] = useState<Estimate>({
    service_agent_id: user?.id || '',
    client_id: clientId || '',
    original_booking_id: originalBookingId,
    title: '',
    description: '',
    total_amount: 0,
    status: 'draft',
    items: [],
    photos: []
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [clientDetails, setClientDetails] = useState<any>(null);
  const [originalBooking, setOriginalBooking] = useState<any>(null);

  // Fetch existing estimate if estimateId is provided
  useEffect(() => {
    if (estimateId) {
      fetchEstimate(estimateId);
    }
    
    if (clientId) {
      fetchClientDetails(clientId);
    }
    
    if (originalBookingId) {
      fetchOriginalBooking(originalBookingId);
    }
  }, [estimateId, clientId, originalBookingId]);

  const fetchEstimate = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('estimates')
        .select(`
          *,
          items:estimate_items(*),
          photos:estimate_photos(*)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      setEstimate(data);
      
      if (data.client_id && !clientId) {
        fetchClientDetails(data.client_id);
      }
      
      if (data.original_booking_id && !originalBookingId) {
        fetchOriginalBooking(data.original_booking_id);
      }
    } catch (err) {
      console.error('Error fetching estimate:', err);
      setError(err instanceof Error ? err.message : 'Failed to load estimate');
    } finally {
      setLoading(false);
    }
  };

  const fetchClientDetails = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      setClientDetails(data);
    } catch (err) {
      console.error('Error fetching client details:', err);
    }
  };

  const fetchOriginalBooking = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          service_package:service_packages(*)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      setOriginalBooking(data);
      
      // If we have a booking but no client yet, get the client from the booking
      if (data.client_id && !clientId && !estimate.client_id) {
        setEstimate(prev => ({ ...prev, client_id: data.client_id }));
        fetchClientDetails(data.client_id);
      }
      
      // Pre-fill estimate title if it's empty
      if (!estimate.title && data.service_package?.title) {
        setEstimate(prev => ({ 
          ...prev, 
          title: `Additional work for ${data.service_package.title}`,
          description: `Additional services required beyond the original scope of work.`
        }));
      }
    } catch (err) {
      console.error('Error fetching original booking:', err);
    }
  };

  const handleEstimateChange = (field: keyof Estimate, value: any) => {
    setEstimate(prev => ({ ...prev, [field]: value }));
  };

  const handleAddItem = (item: EstimateItem) => {
    const newItems = [...(estimate.items || []), item];
    const newTotal = newItems.reduce((sum, item) => sum + item.total_price, 0);
    
    setEstimate(prev => ({
      ...prev,
      items: newItems,
      total_amount: newTotal
    }));
  };

  const handleUpdateItem = (index: number, item: EstimateItem) => {
    const newItems = [...(estimate.items || [])];
    newItems[index] = item;
    const newTotal = newItems.reduce((sum, item) => sum + item.total_price, 0);
    
    setEstimate(prev => ({
      ...prev,
      items: newItems,
      total_amount: newTotal
    }));
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...(estimate.items || [])];
    newItems.splice(index, 1);
    const newTotal = newItems.reduce((sum, item) => sum + item.total_price, 0);
    
    setEstimate(prev => ({
      ...prev,
      items: newItems,
      total_amount: newTotal
    }));
  };

  const handleAddPhotos = (newPhotos: EstimatePhoto[]) => {
    setEstimate(prev => ({
      ...prev,
      photos: [...(prev.photos || []), ...newPhotos]
    }));
  };

  const handleRemovePhoto = (index: number) => {
    const newPhotos = [...(estimate.photos || [])];
    newPhotos.splice(index, 1);
    
    setEstimate(prev => ({
      ...prev,
      photos: newPhotos
    }));
  };

  const validateEstimate = (): boolean => {
    if (!estimate.title.trim()) {
      setError('Please provide a title for the estimate');
      return false;
    }
    
    if (!estimate.description.trim()) {
      setError('Please provide a description for the estimate');
      return false;
    }
    
    if (!estimate.items || estimate.items.length === 0) {
      setError('Please add at least one item to the estimate');
      return false;
    }
    
    if (!estimate.client_id) {
      setError('Please select a client for the estimate');
      return false;
    }
    
    return true;
  };

  const saveEstimate = async (status: 'draft' | 'pending' = 'draft') => {
    if (!validateEstimate()) return;
    
    try {
      setSaving(true);
      setError(null);
      
      const estimateData = {
        service_agent_id: user?.id,
        client_id: estimate.client_id,
        original_booking_id: estimate.original_booking_id,
        title: estimate.title,
        description: estimate.description,
        total_amount: estimate.total_amount,
        status,
        expiration_date: estimate.expiration_date,
        notes: estimate.notes
      };
      
      let estimateId = estimate.id;
      
      if (estimateId) {
        // Update existing estimate
        const { error: updateError } = await supabase
          .from('estimates')
          .update(estimateData)
          .eq('id', estimateId);
        
        if (updateError) throw updateError;
      } else {
        // Create new estimate
        const { data: newEstimate, error: createError } = await supabase
          .from('estimates')
          .insert(estimateData)
          .select()
          .single();
        
        if (createError) throw createError;
        
        estimateId = newEstimate.id;
      }
      
      // Save estimate items
      if (estimate.items && estimate.items.length > 0) {
        // Delete existing items if updating
        if (estimate.id) {
          await supabase
            .from('estimate_items')
            .delete()
            .eq('estimate_id', estimateId);
        }
        
        // Insert new items
        const itemsToInsert = estimate.items.map((item, index) => ({
          estimate_id: estimateId,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
          sort_order: index
        }));
        
        const { error: itemsError } = await supabase
          .from('estimate_items')
          .insert(itemsToInsert);
        
        if (itemsError) throw itemsError;
      }
      
      // Save estimate photos
      if (estimate.photos && estimate.photos.length > 0) {
        // Filter out photos that are already saved
        const newPhotos = estimate.photos.filter(photo => !photo.id);
        
        if (newPhotos.length > 0) {
          const photosToInsert = newPhotos.map(photo => ({
            estimate_id: estimateId,
            file_path: photo.file_path,
            file_name: photo.file_name,
            file_type: photo.file_type,
            file_size: photo.file_size,
            public_url: photo.public_url,
            description: photo.description
          }));
          
          const { error: photosError } = await supabase
            .from('estimate_photos')
            .insert(photosToInsert);
          
          if (photosError) throw photosError;
        }
      }
      
      // If sending to client, create a notification
      if (status === 'pending') {
        await supabase
          .from('notifications')
          .insert({
            user_id: estimate.client_id,
            title: 'New Estimate Available',
            message: `You have received a new estimate for ${estimate.title}`,
            type: 'estimate',
            is_read: false
          });
      }
      
      setSuccess(true);
      
      // Call the success callback after a short delay to show the success message
      setTimeout(() => {
        onSuccess(estimateId!);
      }, 2000);
      
    } catch (err) {
      console.error('Error saving estimate:', err);
      setError(err instanceof Error ? err.message : 'Failed to save estimate');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-8 flex justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (success) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="text-center py-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            {estimate.status === 'pending' ? 'Estimate Sent!' : 'Estimate Saved!'}
          </h2>
          <p className="text-gray-600 mb-6">
            {estimate.status === 'pending'
              ? 'Your estimate has been sent to the client for review.'
              : 'Your estimate has been saved as a draft.'}
          </p>
          <button
            onClick={() => onSuccess(estimate.id!)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            View Estimates
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        {estimate.id ? 'Edit Estimate' : 'Create Estimate'}
      </h2>
      
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4 flex items-start">
          <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      
      <div className="space-y-8">
        <EstimateHeader
          estimate={estimate}
          clientDetails={clientDetails}
          originalBooking={originalBooking}
          onChange={handleEstimateChange}
        />
        
        <EstimateItemList
          items={estimate.items || []}
          onAddItem={handleAddItem}
          onUpdateItem={handleUpdateItem}
          onRemoveItem={handleRemoveItem}
        />
        
        <EstimatePhotos
          photos={estimate.photos || []}
          estimateId={estimate.id}
          onAddPhotos={handleAddPhotos}
          onRemovePhoto={handleRemovePhoto}
        />
        
        <EstimateActions
          estimate={estimate}
          onSave={() => saveEstimate('draft')}
          onSend={() => saveEstimate('pending')}
          onCancel={onCancel}
          saving={saving}
        />
      </div>
    </div>
  );
};

export default EstimateBuilder;
