import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { X, Plus } from 'lucide-react';

interface ServiceFormProps {
  serviceId?: string; // Optional - if provided, we're editing an existing service
  onSuccess?: () => void;
}

interface ServiceData {
  title: string;
  description: string;
  price: number;
  duration: string;
  scope: string[];
  exclusions: string[];
  is_active: boolean;
  trade: string;
}

// List of available trades
const TRADES = [
  "Demolition & Disposal",
  "Electrical",
  "Plumbing",
  "Carpentry / Framing",
  "Window Installation",
  "Flooring",
  "Insulation",
  "Tile",
  "Shower Glass Installation",
  "Drywall",
  "Painting",
  "Storage Solutions",
  "HVAC",
  "Roofing",
  "Siding",
  "Deck Building",
  "Cabinetry",
  "Countertop Installation",
  "Appliance Installation",
  "Lighting & Fixtures",
  "Door Installation",
  "Custom Closets & Shelving",
  "Smart Home Integration",
  "Permitting & Inspection Services",
  "Finish Carpentry",
  "Waterproofing",
  "Soundproofing",
  "Fireplace Installation",
  "Accessibility Modifications",
  "Garage Doors"
];

const ServiceForm: React.FC<ServiceFormProps> = ({ serviceId, onSuccess }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [durationValue, setDurationValue] = useState('');
  const [durationUnit, setDurationUnit] = useState('hours');
  const [scope, setScope] = useState<string[]>(['']);
  const [exclusions, setExclusions] = useState<string[]>(['']);
  const [isActive, setIsActive] = useState(true);
  const [trade, setTrade] = useState('');

  // Fetch service data if editing
  useEffect(() => {
    const fetchService = async () => {
      if (!serviceId) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('service_packages')
          .select('*')
          .eq('id', serviceId)
          .single();

        if (error) throw error;

        // Check if the service belongs to the current user
        if (data.service_agent_id !== user?.id) {
          navigate('/unauthorized');
          return;
        }

        // Populate form fields
        setTitle(data.title || '');
        setDescription(data.description || '');
        setPrice(data.price?.toString() || '');
        setTrade(data.trade || '');

        // Parse duration string (e.g., "2 hours" or "3 days")
        if (data.duration) {
          const durationParts = data.duration.split(' ');
          if (durationParts.length === 2) {
            setDurationValue(durationParts[0]);
            setDurationUnit(durationParts[1].toLowerCase().endsWith('s')
              ? durationParts[1].toLowerCase()
              : durationParts[1].toLowerCase() + 's');
          } else {
            setDurationValue('');
            setDurationUnit('hours');
          }
        }

        setScope(data.scope?.length ? data.scope : ['']);
        setExclusions(data.exclusions?.length ? data.exclusions : ['']);
        setIsActive(data.is_active);
      } catch (err) {
        console.error('Error fetching service:', err);
        setError('Failed to load service data');
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [serviceId, user, navigate]);

  // Handle scope items
  const handleScopeChange = (index: number, value: string) => {
    const newScope = [...scope];
    newScope[index] = value;
    setScope(newScope);
  };

  const addScopeItem = () => {
    setScope([...scope, '']);
  };

  const removeScopeItem = (index: number) => {
    if (scope.length === 1) return;
    const newScope = [...scope];
    newScope.splice(index, 1);
    setScope(newScope);
  };

  // Handle exclusion items
  const handleExclusionChange = (index: number, value: string) => {
    const newExclusions = [...exclusions];
    newExclusions[index] = value;
    setExclusions(newExclusions);
  };

  const addExclusionItem = () => {
    setExclusions([...exclusions, '']);
  };

  const removeExclusionItem = (index: number) => {
    if (exclusions.length === 1) return;
    const newExclusions = [...exclusions];
    newExclusions.splice(index, 1);
    setExclusions(newExclusions);
  };

  // Form validation
  const validateForm = () => {
    if (!title.trim()) return 'Title is required';
    if (!description.trim()) return 'Description is required';
    if (!price || isNaN(Number(price)) || Number(price) <= 0) return 'Valid price is required';
    if (!durationValue || isNaN(Number(durationValue)) || Number(durationValue) <= 0) return 'Valid duration value is required';
    if (!scope[0].trim()) return 'At least one scope item is required';
    if (!trade) return 'Trade category is required';

    return null;
  };

  // Format duration string
  const formatDuration = () => {
    return `${durationValue} ${durationUnit}`;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Filter out empty items
      const filteredScope = scope.filter(item => item.trim());
      const filteredExclusions = exclusions.filter(item => item.trim());

      const serviceData: ServiceData = {
        title,
        description,
        price: Number(price),
        duration: formatDuration(),
        scope: filteredScope,
        exclusions: filteredExclusions,
        is_active: isActive,
        trade
      };

      if (serviceId) {
        // Update existing service
        const { error } = await supabase
          .from('service_packages')
          .update(serviceData)
          .eq('id', serviceId);

        if (error) throw error;

        setSuccess('Service updated successfully!');
      } else {
        // Create new service
        const { error } = await supabase
          .from('service_packages')
          .insert({
            ...serviceData,
            service_agent_id: user?.id
          });

        if (error) throw error;

        setSuccess('Service created successfully!');
      }

      // Clear form or redirect
      if (onSuccess) {
        onSuccess();
      } else {
        // Wait a moment to show success message before redirecting
        setTimeout(() => {
          navigate('/services');
        }, 1500);
      }
    } catch (err) {
      console.error('Error saving service:', err);
      setError(err instanceof Error ? err.message : 'Failed to save service');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">
          {serviceId ? 'Edit Service' : 'Create New Service'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm">
            {success}
          </div>
        )}

        <div className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Service Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            />
          </div>

          {/* Trade Selection */}
          <div>
            <label htmlFor="trade" className="block text-sm font-medium text-gray-700 mb-1">
              Trade Category
            </label>
            <select
              id="trade"
              value={trade}
              onChange={(e) => setTrade(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            >
              <option value="">Select a trade category</option>
              {TRADES.map((tradeName) => (
                <option key={tradeName} value={tradeName}>
                  {tradeName}
                </option>
              ))}
            </select>
          </div>

          {/* Price and Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Price ($)
              </label>
              <input
                type="number"
                id="price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min="0"
                step="1"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                Duration
              </label>
              <div className="flex space-x-2">
                <div className="flex-1">
                  <input
                    type="number"
                    id="durationValue"
                    value={durationValue}
                    onChange={(e) => setDurationValue(e.target.value)}
                    min="1"
                    step="1"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    required
                    placeholder="e.g., 2"
                  />
                </div>
                <div className="w-1/2">
                  <select
                    id="durationUnit"
                    value={durationUnit}
                    onChange={(e) => setDurationUnit(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="minutes">Minutes</option>
                    <option value="hours">Hours</option>
                    <option value="days">Days</option>
                    <option value="weeks">Weeks</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Scope */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What's Included
            </label>
            <div className="space-y-2">
              {scope.map((item, index) => (
                <div key={`scope-${index}`} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleScopeChange(index, e.target.value)}
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="e.g., Initial consultation"
                    required={index === 0}
                  />
                  <button
                    type="button"
                    onClick={() => removeScopeItem(index)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                    disabled={scope.length === 1}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addScopeItem}
                className="mt-2 inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </button>
            </div>
          </div>

          {/* Exclusions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What's Not Included (Optional)
            </label>
            <div className="space-y-2">
              {exclusions.map((item, index) => (
                <div key={`exclusion-${index}`} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleExclusionChange(index, e.target.value)}
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="e.g., Materials not included"
                  />
                  <button
                    type="button"
                    onClick={() => removeExclusionItem(index)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                    disabled={exclusions.length === 1}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addExclusionItem}
                className="mt-2 inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </button>
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center">
            <input
              id="is_active"
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
              Service is active and available for booking
            </label>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/services')}
              className="mr-3 px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : serviceId ? 'Update Service' : 'Create Service'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ServiceForm;
