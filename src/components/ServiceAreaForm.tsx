import React, { useState } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type ServiceArea = Database['public']['Tables']['service_agent_service_areas']['Insert'];

interface ServiceAreaFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const ServiceAreaForm: React.FC<ServiceAreaFormProps> = ({ onSuccess, onCancel }) => {
  const [zipCode, setZipCode] = useState('');
  const [radius, setRadius] = useState<number>(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validate ZIP code format
  const validateZipCode = (zip: string): boolean => {
    // Basic US ZIP code validation (5 digits)
    return /^\d{5}$/.test(zip);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate ZIP code format
    if (!validateZipCode(zipCode)) {
      setError('Please enter a valid 5-digit ZIP code');
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // First check if this ZIP code already exists for this service agent
      const { data: existingAreas, error: checkError } = await supabase
        .from('service_agent_service_areas')
        .select('id')
        .eq('service_agent_id', user.id)
        .eq('zip_code', zipCode);

      if (checkError) throw checkError;

      if (existingAreas && existingAreas.length > 0) {
        throw new Error(`You already have a service area for ZIP code ${zipCode}. Please use a different ZIP code.`);
      }

      // If no existing area with this ZIP code, insert the new one
      const { error: insertError } = await supabase
        .from('service_agent_service_areas')
        .insert({
          service_agent_id: user.id,
          zip_code: zipCode,
          radius_miles: radius,
        });

      if (insertError) {
        console.error('Insert error:', insertError);

        // Check if it's a unique constraint violation
        if (insertError.code === '23505') {
          throw new Error(`You already have a service area for ZIP code ${zipCode}. Please use a different ZIP code.`);
        }

        throw insertError;
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add service area');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
            ZIP Code
          </label>
          <input
            type="text"
            id="zipCode"
            value={zipCode}
            onChange={(e) => {
              // Only allow digits and limit to 5 characters
              const value = e.target.value.replace(/\D/g, '').slice(0, 5);
              setZipCode(value);
            }}
            required
            maxLength={5}
            placeholder="Enter 5-digit ZIP code"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            aria-describedby="zipcode-description"
          />
          <p id="zipcode-description" className="mt-1 text-xs text-gray-500">
            Enter a valid 5-digit US ZIP code
          </p>
        </div>

        <div>
          <label htmlFor="radius" className="block text-sm font-medium text-gray-700">
            Service Radius (miles)
          </label>
          <select
            id="radius"
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value={5}>5 miles</option>
            <option value={10}>10 miles</option>
            <option value={15}>15 miles</option>
            <option value={20}>20 miles</option>
            <option value={25}>25 miles</option>
            <option value={30}>30 miles</option>
          </select>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
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
            {loading ? (
              <span className="flex items-center">
                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                Adding...
              </span>
            ) : (
              'Add Service Area'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ServiceAreaForm;