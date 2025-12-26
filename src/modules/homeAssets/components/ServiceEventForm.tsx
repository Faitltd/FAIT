import React, { useState } from 'react';
import type { AssetWithComputed, CreateServiceEventInput } from '../types';

interface ServiceEventFormProps {
  assets?: AssetWithComputed[];
  onSubmit: (values: CreateServiceEventInput) => Promise<void>;
  submitLabel?: string;
  defaultAssetId?: string | null;
}

const eventTypes = ['maintenance', 'repair', 'inspection', 'replacement'];

const ServiceEventForm: React.FC<ServiceEventFormProps> = ({
  assets = [],
  onSubmit,
  submitLabel = 'Log Service Event',
  defaultAssetId = null
}) => {
  const [values, setValues] = useState<CreateServiceEventInput>({
    asset_id: defaultAssetId || null,
    event_type: 'maintenance',
    performed_by: '',
    event_date: new Date().toISOString().split('T')[0],
    notes: '',
    cost_cents: null,
    warranty_related: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateField = (field: keyof CreateServiceEventInput, value: string | number | boolean | null) => {
    setValues(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    try {
      setIsSubmitting(true);
      await onSubmit({
        ...values,
        performed_by: values.performed_by || null,
        notes: values.notes || null,
        cost_cents: values.cost_cents || null
      });
      setValues(prev => ({
        ...prev,
        performed_by: '',
        notes: '',
        cost_cents: null
      }));
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to log service event.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Event type</label>
          <select
            value={values.event_type}
            onChange={(event) => updateField('event_type', event.target.value)}
            className="mt-1 w-full rounded-md border-gray-300 shadow-sm"
          >
            {eventTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Event date</label>
          <input
            type="date"
            value={values.event_date}
            onChange={(event) => updateField('event_date', event.target.value)}
            className="mt-1 w-full rounded-md border-gray-300 shadow-sm"
            required
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Asset (optional)</label>
        <select
          value={values.asset_id || ''}
          onChange={(event) => updateField('asset_id', event.target.value || null)}
          className="mt-1 w-full rounded-md border-gray-300 shadow-sm"
        >
          <option value="">Home-level event</option>
          {assets.map(asset => (
            <option key={asset.id} value={asset.id}>{asset.display_name}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Performed by</label>
          <input
            type="text"
            value={values.performed_by || ''}
            onChange={(event) => updateField('performed_by', event.target.value)}
            className="mt-1 w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Cost (cents)</label>
          <input
            type="number"
            value={values.cost_cents || ''}
            onChange={(event) => updateField('cost_cents', event.target.value ? Number(event.target.value) : null)}
            className="mt-1 w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Notes</label>
        <textarea
          value={values.notes || ''}
          onChange={(event) => updateField('notes', event.target.value)}
          className="mt-1 w-full rounded-md border-gray-300 shadow-sm"
          rows={3}
        />
      </div>
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={!!values.warranty_related}
          onChange={(event) => updateField('warranty_related', event.target.checked)}
          className="h-4 w-4 text-blue-600"
        />
        <label className="ml-2 text-sm text-gray-700">Warranty related</label>
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

export default ServiceEventForm;
