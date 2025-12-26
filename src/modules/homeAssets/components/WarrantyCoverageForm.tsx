import React, { useState } from 'react';
import type { CreateWarrantyCoverageInput } from '../types';

interface WarrantyCoverageFormProps {
  onSubmit: (values: CreateWarrantyCoverageInput) => Promise<void>;
  submitLabel?: string;
}

const coverageTypes = ['manufacturer', 'extended', 'labor', 'other'];

const WarrantyCoverageForm: React.FC<WarrantyCoverageFormProps> = ({ onSubmit, submitLabel = 'Add Coverage' }) => {
  const [values, setValues] = useState<CreateWarrantyCoverageInput>({
    coverage_type: 'manufacturer',
    provider: '',
    start_date: '',
    end_date: '',
    claim_instructions: '',
    exclusions: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateField = (field: keyof CreateWarrantyCoverageInput, value: string | null) => {
    setValues(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    try {
      setIsSubmitting(true);
      await onSubmit({
        ...values,
        provider: values.provider || null,
        start_date: values.start_date || null,
        end_date: values.end_date || null,
        claim_instructions: values.claim_instructions || null,
        exclusions: values.exclusions || null
      });
      setValues({
        coverage_type: 'manufacturer',
        provider: '',
        start_date: '',
        end_date: '',
        claim_instructions: '',
        exclusions: ''
      });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to add warranty coverage.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Coverage type</label>
          <select
            value={values.coverage_type}
            onChange={(event) => updateField('coverage_type', event.target.value)}
            className="mt-1 w-full rounded-md border-gray-300 shadow-sm"
          >
            {coverageTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Provider</label>
          <input
            type="text"
            value={values.provider || ''}
            onChange={(event) => updateField('provider', event.target.value)}
            className="mt-1 w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Start date</label>
          <input
            type="date"
            value={values.start_date || ''}
            onChange={(event) => updateField('start_date', event.target.value)}
            className="mt-1 w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">End date</label>
          <input
            type="date"
            value={values.end_date || ''}
            onChange={(event) => updateField('end_date', event.target.value)}
            className="mt-1 w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Claim instructions</label>
        <textarea
          value={values.claim_instructions || ''}
          onChange={(event) => updateField('claim_instructions', event.target.value)}
          className="mt-1 w-full rounded-md border-gray-300 shadow-sm"
          rows={2}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Exclusions</label>
        <textarea
          value={values.exclusions || ''}
          onChange={(event) => updateField('exclusions', event.target.value)}
          className="mt-1 w-full rounded-md border-gray-300 shadow-sm"
          rows={2}
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Saving...' : submitLabel}
      </button>
    </form>
  );
};

export default WarrantyCoverageForm;
