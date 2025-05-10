import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getServiceCategories } from '../../lib/api/pricingApi';
import { PlusCircle, MinusCircle, Info } from 'lucide-react';

interface ServicePackageFormProps {
  initialData?: any;
  onSubmit: (formData: any) => void;
  isLoading?: boolean;
}

const ServicePackageForm: React.FC<ServicePackageFormProps> = ({
  initialData,
  onSubmit,
  isLoading = false,
}) => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<any[]>([]);
  const [features, setFeatures] = useState<any[]>([]);
  const [warrantyPeriods, setWarrantyPeriods] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    base_price: '',
    good_tier_price: '',
    better_tier_price: '',
    best_tier_price: '',
    good_tier_description: '',
    better_tier_description: '',
    best_tier_description: '',
    duration_minutes: '',
    location_type: 'on_site',
    is_featured: false,
    is_active: true,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const categoriesData = await getServiceCategories();
        setCategories(categoriesData);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load service categories. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Initialize form with initial data if provided
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        category_id: initialData.category_id || '',
        base_price: initialData.base_price?.toString() || '',
        good_tier_price: initialData.good_tier_price?.toString() || '',
        better_tier_price: initialData.better_tier_price?.toString() || '',
        best_tier_price: initialData.best_tier_price?.toString() || '',
        good_tier_description: initialData.good_tier_description || '',
        better_tier_description: initialData.better_tier_description || '',
        best_tier_description: initialData.best_tier_description || '',
        duration_minutes: initialData.duration_minutes?.toString() || '',
        location_type: initialData.location_type || 'on_site',
        is_featured: initialData.is_featured || false,
        is_active: initialData.is_active !== false, // Default to true if not explicitly false
      });

      // Initialize features if provided
      if (initialData.features && Array.isArray(initialData.features)) {
        setFeatures(initialData.features);
      }

      // Initialize warranty periods if provided
      if (initialData.warranty_periods && Array.isArray(initialData.warranty_periods)) {
        setWarrantyPeriods(initialData.warranty_periods);
      }
    }
  }, [initialData]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  // Handle feature changes
  const handleFeatureChange = (index: number, field: string, value: any) => {
    setFeatures(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
      return updated;
    });
  };

  // Add a new feature
  const addFeature = () => {
    setFeatures(prev => [
      ...prev,
      {
        name: '',
        description: '',
        tier: 'all',
        is_included: true,
        order_index: prev.length,
      },
    ]);
  };

  // Remove a feature
  const removeFeature = (index: number) => {
    setFeatures(prev => prev.filter((_, i) => i !== index));
  };

  // Handle warranty period changes
  const handleWarrantyChange = (tier: string, field: string, value: any) => {
    setWarrantyPeriods(prev => {
      const index = prev.findIndex(w => w.tier === tier);
      
      if (index >= 0) {
        // Update existing warranty period
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          [field]: value,
        };
        return updated;
      } else {
        // Add new warranty period
        return [
          ...prev,
          {
            tier,
            [field]: value,
            duration_days: field === 'duration_days' ? value : 0,
            description: field === 'description' ? value : '',
          },
        ];
      }
    });
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert string values to appropriate types
    const processedData = {
      ...formData,
      base_price: parseFloat(formData.base_price),
      good_tier_price: formData.good_tier_price ? parseFloat(formData.good_tier_price) : null,
      better_tier_price: formData.better_tier_price ? parseFloat(formData.better_tier_price) : null,
      best_tier_price: formData.best_tier_price ? parseFloat(formData.best_tier_price) : null,
      duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : null,
      features,
      warranty_periods: warrantyPeriods.map(w => ({
        ...w,
        duration_days: parseInt(w.duration_days),
      })),
    };
    
    onSubmit(processedData);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-100 p-4 rounded-md text-red-700">
          {error}
        </div>
      )}
      
      {/* Basic Information */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Service Title*
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">
              Category*
            </label>
            <select
              id="category_id"
              name="category_id"
              value={formData.category_id}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description*
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="base_price" className="block text-sm font-medium text-gray-700 mb-1">
              Base Price*
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">$</span>
              </div>
              <input
                type="number"
                id="base_price"
                name="base_price"
                value={formData.base_price}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="duration_minutes" className="block text-sm font-medium text-gray-700 mb-1">
              Duration (minutes)
            </label>
            <input
              type="number"
              id="duration_minutes"
              name="duration_minutes"
              value={formData.duration_minutes}
              onChange={handleInputChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="location_type" className="block text-sm font-medium text-gray-700 mb-1">
              Location Type*
            </label>
            <select
              id="location_type"
              name="location_type"
              value={formData.location_type}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="on_site">On Site</option>
              <option value="remote">Remote</option>
              <option value="both">Both</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_featured"
                name="is_featured"
                checked={formData.is_featured}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="is_featured" className="ml-2 text-sm text-gray-700">
                Featured Service
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                Active
              </label>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tiered Pricing */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Tiered Pricing</h2>
        <div className="bg-blue-50 p-4 rounded-md mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <Info className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                Set up Good/Better/Best pricing tiers for your service. If you leave a tier price empty, it will be automatically calculated based on the base price.
              </p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Good Tier */}
          <div className="border border-gray-200 rounded-md p-4">
            <h3 className="font-medium text-gray-900 mb-3">Good Tier</h3>
            
            <div className="mb-4">
              <label htmlFor="good_tier_price" className="block text-sm font-medium text-gray-700 mb-1">
                Price
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">$</span>
                </div>
                <input
                  type="number"
                  id="good_tier_price"
                  name="good_tier_price"
                  value={formData.good_tier_price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  placeholder={formData.base_price}
                  className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="good_tier_description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="good_tier_description"
                name="good_tier_description"
                value={formData.good_tier_description}
                onChange={handleInputChange}
                rows={3}
                placeholder="Basic service package with essential features"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          {/* Better Tier */}
          <div className="border border-gray-200 rounded-md p-4">
            <h3 className="font-medium text-gray-900 mb-3">Better Tier</h3>
            
            <div className="mb-4">
              <label htmlFor="better_tier_price" className="block text-sm font-medium text-gray-700 mb-1">
                Price
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">$</span>
                </div>
                <input
                  type="number"
                  id="better_tier_price"
                  name="better_tier_price"
                  value={formData.better_tier_price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  placeholder={formData.good_tier_price ? (parseFloat(formData.good_tier_price) * 1.5).toFixed(2) : (parseFloat(formData.base_price || '0') * 1.5).toFixed(2)}
                  className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="better_tier_description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="better_tier_description"
                name="better_tier_description"
                value={formData.better_tier_description}
                onChange={handleInputChange}
                rows={3}
                placeholder="Enhanced service package with additional features"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          {/* Best Tier */}
          <div className="border border-gray-200 rounded-md p-4">
            <h3 className="font-medium text-gray-900 mb-3">Best Tier</h3>
            
            <div className="mb-4">
              <label htmlFor="best_tier_price" className="block text-sm font-medium text-gray-700 mb-1">
                Price
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">$</span>
                </div>
                <input
                  type="number"
                  id="best_tier_price"
                  name="best_tier_price"
                  value={formData.best_tier_price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  placeholder={formData.better_tier_price ? (parseFloat(formData.better_tier_price) * 1.3).toFixed(2) : (parseFloat(formData.base_price || '0') * 2).toFixed(2)}
                  className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="best_tier_description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="best_tier_description"
                name="best_tier_description"
                value={formData.best_tier_description}
                onChange={handleInputChange}
                rows={3}
                placeholder="Premium service package with all available features"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Features */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Features</h2>
          <button
            type="button"
            onClick={addFeature}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusCircle className="h-4 w-4 mr-1" />
            Add Feature
          </button>
        </div>
        
        {features.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-md border border-dashed border-gray-300">
            <p className="text-gray-500">No features added yet. Click "Add Feature" to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {features.map((feature, index) => (
              <div key={index} className="border border-gray-200 rounded-md p-4">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-medium text-gray-900">Feature {index + 1}</h3>
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <MinusCircle className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name*
                    </label>
                    <input
                      type="text"
                      value={feature.name}
                      onChange={(e) => handleFeatureChange(index, 'name', e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tier*
                    </label>
                    <select
                      value={feature.tier}
                      onChange={(e) => handleFeatureChange(index, 'tier', e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">All Tiers</option>
                      <option value="good">Good Tier and Above</option>
                      <option value="better">Better Tier and Above</option>
                      <option value="best">Best Tier Only</option>
                    </select>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={feature.description || ''}
                      onChange={(e) => handleFeatureChange(index, 'description', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={feature.is_included}
                      onChange={(e) => handleFeatureChange(index, 'is_included', e.target.checked)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      Included
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Warranty Periods */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Warranty Periods</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Good Tier Warranty */}
          <div className="border border-gray-200 rounded-md p-4">
            <h3 className="font-medium text-gray-900 mb-3">Good Tier Warranty</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (days)
              </label>
              <input
                type="number"
                value={warrantyPeriods.find(w => w.tier === 'good')?.duration_days || ''}
                onChange={(e) => handleWarrantyChange('good', 'duration_days', e.target.value)}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={warrantyPeriods.find(w => w.tier === 'good')?.description || ''}
                onChange={(e) => handleWarrantyChange('good', 'description', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          {/* Better Tier Warranty */}
          <div className="border border-gray-200 rounded-md p-4">
            <h3 className="font-medium text-gray-900 mb-3">Better Tier Warranty</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (days)
              </label>
              <input
                type="number"
                value={warrantyPeriods.find(w => w.tier === 'better')?.duration_days || ''}
                onChange={(e) => handleWarrantyChange('better', 'duration_days', e.target.value)}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={warrantyPeriods.find(w => w.tier === 'better')?.description || ''}
                onChange={(e) => handleWarrantyChange('better', 'description', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          {/* Best Tier Warranty */}
          <div className="border border-gray-200 rounded-md p-4">
            <h3 className="font-medium text-gray-900 mb-3">Best Tier Warranty</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (days)
              </label>
              <input
                type="number"
                value={warrantyPeriods.find(w => w.tier === 'best')?.duration_days || ''}
                onChange={(e) => handleWarrantyChange('best', 'duration_days', e.target.value)}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={warrantyPeriods.find(w => w.tier === 'best')?.description || ''}
                onChange={(e) => handleWarrantyChange('best', 'description', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className={`px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white ${
            isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          }`}
        >
          {isLoading ? 'Saving...' : initialData ? 'Update Service Package' : 'Create Service Package'}
        </button>
      </div>
    </form>
  );
};

export default ServicePackageForm;
