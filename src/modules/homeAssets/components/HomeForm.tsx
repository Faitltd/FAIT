import React, { useState } from 'react';
import type { CreateHomeInput } from '../types';

interface HomeFormProps {
  initialValues?: Partial<CreateHomeInput>;
  onSubmit: (values: CreateHomeInput) => Promise<void>;
  submitLabel?: string;
}

const HomeForm: React.FC<HomeFormProps> = ({ initialValues, onSubmit, submitLabel = 'Save Home' }) => {
  const [values, setValues] = useState<CreateHomeInput>({
    name: initialValues?.name || '',
    address_line1: initialValues?.address_line1 || '',
    address_line2: initialValues?.address_line2 || '',
    city: initialValues?.city || '',
    state: initialValues?.state || '',
    postal_code: initialValues?.postal_code || '',
    year_built: initialValues?.year_built ?? null,
    square_feet: initialValues?.square_feet ?? null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateField = (field: keyof CreateHomeInput, value: string | number | null) => {
    setValues(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    try {
      setIsSubmitting(true);
      await onSubmit({
        ...values,
        address_line2: values.address_line2 || null,
        year_built: values.year_built || null,
        square_feet: values.square_feet || null
      });
      setValues({
        name: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        postal_code: '',
        year_built: null,
        square_feet: null
      });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to save home.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
      <div>
        <label className="block text-sm font-medium text-gray-700">Home nickname</label>
        <input
          type="text"
          value={values.name}
          onChange={(event) => updateField('name', event.target.value)}
          className="mt-1 w-full rounded-md border-gray-300 shadow-sm"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Address line 1</label>
        <input
          type="text"
          value={values.address_line1}
          onChange={(event) => updateField('address_line1', event.target.value)}
          className="mt-1 w-full rounded-md border-gray-300 shadow-sm"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Address line 2</label>
        <input
          type="text"
          value={values.address_line2 || ''}
          onChange={(event) => updateField('address_line2', event.target.value)}
          className="mt-1 w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">City</label>
          <input
            type="text"
            value={values.city}
            onChange={(event) => updateField('city', event.target.value)}
            className="mt-1 w-full rounded-md border-gray-300 shadow-sm"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">State</label>
          <input
            type="text"
            value={values.state}
            onChange={(event) => updateField('state', event.target.value)}
            className="mt-1 w-full rounded-md border-gray-300 shadow-sm"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Postal code</label>
          <input
            type="text"
            value={values.postal_code}
            onChange={(event) => updateField('postal_code', event.target.value)}
            className="mt-1 w-full rounded-md border-gray-300 shadow-sm"
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Year built</label>
          <input
            type="number"
            value={values.year_built || ''}
            onChange={(event) => updateField('year_built', event.target.value ? Number(event.target.value) : null)}
            className="mt-1 w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Square feet</label>
          <input
            type="number"
            value={values.square_feet || ''}
            onChange={(event) => updateField('square_feet', event.target.value ? Number(event.target.value) : null)}
            className="mt-1 w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
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

export default HomeForm;
