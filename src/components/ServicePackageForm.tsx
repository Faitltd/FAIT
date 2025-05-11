import React, { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type ServicePackage = Database['public']['Tables']['service_packages']['Insert'];

interface ServicePackageFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const ServicePackageForm: React.FC<ServicePackageFormProps> = ({ onSuccess, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [scope, setScope] = useState<string[]>([]);
  const [exclusions, setExclusions] = useState<string[]>([]);
  const [scopeInput, setScopeInput] = useState('');
  const [exclusionInput, setExclusionInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddScope = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && scopeInput.trim()) {
      e.preventDefault();
      setScope([...scope, scopeInput.trim()]);
      setScopeInput('');
    }
  };

  const handleAddExclusion = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && exclusionInput.trim()) {
      e.preventDefault();
      setExclusions([...exclusions, exclusionInput.trim()]);
      setExclusionInput('');
    }
  };

  const handleRemoveScope = (index: number) => {
    setScope(scope.filter((_, i) => i !== index));
  };

  const handleRemoveExclusion = (index: number) => {
    setExclusions(exclusions.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const servicePackage = {
        title,
        description,
        price: parseFloat(price),
        duration: duration || null,
        scope,
        exclusions: exclusions.length > 0 ? exclusions : null,
        is_active: true,
        service_agent_id: user.id
      };

      const { error: insertError } = await supabase
        .from('service_packages')
        .insert(servicePackage);

      if (insertError) throw insertError;

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create service package');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Create New Service Package</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Service Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">
              Price ($)
            </label>
            <input
              type="number"
              id="price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              min="0"
              step="0.01"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
              Duration (e.g., "2 hours", "3 days")
            </label>
            <input
              type="text"
              id="duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label htmlFor="scope" className="block text-sm font-medium text-gray-700">
            Service Scope (Press Enter to add)
          </label>
          <input
            type="text"
            id="scope"
            value={scopeInput}
            onChange={(e) => setScopeInput(e.target.value)}
            onKeyDown={handleAddScope}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {scope.map((item, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-md text-sm font-medium bg-blue-100 text-blue-700"
              >
                {item}
                <button
                  type="button"
                  onClick={() => handleRemoveScope(index)}
                  className="ml-1 text-blue-600 hover:text-blue-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="exclusions" className="block text-sm font-medium text-gray-700">
            Exclusions (Press Enter to add)
          </label>
          <input
            type="text"
            id="exclusions"
            value={exclusionInput}
            onChange={(e) => setExclusionInput(e.target.value)}
            onKeyDown={handleAddExclusion}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {exclusions.map((item, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-md text-sm font-medium bg-red-100 text-red-700"
              >
                {item}
                <button
                  type="button"
                  onClick={() => handleRemoveExclusion(index)}
                  className="ml-1 text-red-600 hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </span>
            ))}
          </div>
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
            {loading ? 'Creating...' : 'Create Service Package'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ServicePackageForm;