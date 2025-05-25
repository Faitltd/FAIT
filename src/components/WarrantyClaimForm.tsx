import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type WarrantyClaim = Database['public']['Tables']['warranty_claims']['Insert'];
type Booking = Database['public']['Tables']['bookings']['Row'];

interface WarrantyClaimFormProps {
  booking: Booking;
  onSuccess: () => void;
  onCancel: () => void;
}

const WarrantyClaimForm: React.FC<WarrantyClaimFormProps> = ({ booking, onSuccess, onCancel }) => {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const claim: WarrantyClaim = {
        booking_id: booking.id,
        client_id: user.id,
        description,
        status: 'pending',
      };

      const { error: claimError } = await supabase
        .from('warranty_claims')
        .insert(claim);

      if (claimError) throw claimError;

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit warranty claim');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Submit Warranty Claim</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Describe the Issue
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={4}
            placeholder="Please provide detailed information about the issue..."
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : 'Submit Claim'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WarrantyClaimForm;