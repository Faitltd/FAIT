import React, { useState } from 'react';
import { Briefcase, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Specialty = Database['public']['Tables']['service_agent_specialties']['Insert'];

interface SpecialtiesFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const specialtyTypes = [
  'General Contracting',
  'Electrical',
  'Plumbing',
  'HVAC',
  'Carpentry',
  'Masonry',
  'Painting',
  'Flooring',
  'Roofing',
  'Landscaping',
  'Interior Design',
  'Kitchen & Bath',
  'Basement Finishing',
  'Home Automation',
  'Solar Installation',
  'Windows & Doors',
  'Siding',
  'Concrete Work',
  'Drywall',
  'Custom Cabinetry'
] as const;

const SpecialtiesForm: React.FC<SpecialtiesFormProps> = ({ onSuccess, onCancel }) => {
  const [specialty, setSpecialty] = useState<string>(specialtyTypes[0]);
  const [yearsExperience, setYearsExperience] = useState('');
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

      const { error: insertError } = await supabase
        .from('service_agent_specialties')
        .insert({
          service_agent_id: user.id,
          specialty,
          years_experience: parseInt(yearsExperience),
          description,
        });

      if (insertError) throw insertError;

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add specialty');
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
          <label htmlFor="specialty" className="block text-sm font-medium text-gray-700">
            Specialty
          </label>
          <select
            id="specialty"
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            {specialtyTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="yearsExperience" className="block text-sm font-medium text-gray-700">
            Years of Experience
          </label>
          <input
            type="number"
            id="yearsExperience"
            value={yearsExperience}
            onChange={(e) => setYearsExperience(e.target.value)}
            required
            min="0"
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
            rows={4}
            placeholder="Describe your experience and expertise in this specialty..."
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
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
              'Add Specialty'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SpecialtiesForm;