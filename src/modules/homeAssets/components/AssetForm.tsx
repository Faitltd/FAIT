import React, { useState } from 'react';
import type { CreateAssetInput } from '../types';

interface AssetFormProps {
  initialValues?: Partial<CreateAssetInput>;
  onSubmit: (values: CreateAssetInput) => Promise<void>;
  submitLabel?: string;
}

const categoryOptions = [
  'HVAC',
  'Water Heater',
  'Dishwasher',
  'Refrigerator',
  'Washer',
  'Dryer',
  'Garage Door Opener',
  'Sump Pump',
  'Other'
];

const AssetForm: React.FC<AssetFormProps> = ({ initialValues, onSubmit, submitLabel = 'Save Asset' }) => {
  const [values, setValues] = useState<CreateAssetInput>({
    category: initialValues?.category || 'HVAC',
    display_name: initialValues?.display_name || '',
    brand: initialValues?.brand || '',
    model_number: initialValues?.model_number || '',
    serial_number: initialValues?.serial_number || '',
    install_date: initialValues?.install_date || '',
    installed_by: initialValues?.installed_by || '',
    location_in_home: initialValues?.location_in_home || '',
    status: initialValues?.status || 'active',
    warranty_start_date: initialValues?.warranty_start_date || '',
    warranty_end_date: initialValues?.warranty_end_date || '',
    service_interval_months: initialValues?.service_interval_months ?? null,
    last_service_date: initialValues?.last_service_date || '',
    notes: initialValues?.notes || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateField = (field: keyof CreateAssetInput, value: string | number | null) => {
    setValues(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    try {
      setIsSubmitting(true);
      await onSubmit({
        ...values,
        brand: values.brand || null,
        model_number: values.model_number || null,
        serial_number: values.serial_number || null,
        install_date: values.install_date || null,
        installed_by: values.installed_by || null,
        location_in_home: values.location_in_home || null,
        warranty_start_date: values.warranty_start_date || null,
        warranty_end_date: values.warranty_end_date || null,
        last_service_date: values.last_service_date || null,
        service_interval_months: values.service_interval_months || null,
        notes: values.notes || null
      });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to save asset.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select
            value={values.category}
            onChange={(event) => updateField('category', event.target.value)}
            className="mt-1 w-full rounded-md border-gray-300 shadow-sm"
          >
            {categoryOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Display name</label>
          <input
            type="text"
            value={values.display_name}
            onChange={(event) => updateField('display_name', event.target.value)}
            className="mt-1 w-full rounded-md border-gray-300 shadow-sm"
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Brand</label>
          <input
            type="text"
            value={values.brand || ''}
            onChange={(event) => updateField('brand', event.target.value)}
            className="mt-1 w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Model number</label>
          <input
            type="text"
            value={values.model_number || ''}
            onChange={(event) => updateField('model_number', event.target.value)}
            className="mt-1 w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Serial number</label>
          <input
            type="text"
            value={values.serial_number || ''}
            onChange={(event) => updateField('serial_number', event.target.value)}
            className="mt-1 w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Location in home</label>
          <input
            type="text"
            value={values.location_in_home || ''}
            onChange={(event) => updateField('location_in_home', event.target.value)}
            className="mt-1 w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">Install date</label>
          <input
            type="date"
            value={values.install_date || ''}
            onChange={(event) => updateField('install_date', event.target.value)}
            className="mt-1 w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Last service date</label>
          <input
            type="date"
            value={values.last_service_date || ''}
            onChange={(event) => updateField('last_service_date', event.target.value)}
            className="mt-1 w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Service interval (months)</label>
          <input
            type="number"
            value={values.service_interval_months || ''}
            onChange={(event) => updateField('service_interval_months', event.target.value ? Number(event.target.value) : null)}
            className="mt-1 w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Warranty start</label>
          <input
            type="date"
            value={values.warranty_start_date || ''}
            onChange={(event) => updateField('warranty_start_date', event.target.value)}
            className="mt-1 w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Warranty end</label>
          <input
            type="date"
            value={values.warranty_end_date || ''}
            onChange={(event) => updateField('warranty_end_date', event.target.value)}
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

export default AssetForm;
