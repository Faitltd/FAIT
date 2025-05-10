import React, { useState } from 'react';
import { Search, Filter, ChevronDown, ChevronUp } from 'lucide-react';

interface FilterState {
  searchTerm: string;
  zipCode: string;
  category: string;
  subcategory: string;
  priceMin: number;
  priceMax: number;
  ratingMin: number;
  radius: number;
  sortBy: 'price' | 'rating' | 'distance' | 'newest';
  sortDirection: 'asc' | 'desc';
  viewMode: 'grid' | 'list' | 'map';
  page: number;
}

interface ServiceSearchFiltersProps {
  filters: FilterState;
  categories: { name: string; subcategories: string[] }[];
  onFilterChange: (name: keyof FilterState, value: any) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
}

const ServiceSearchFilters: React.FC<ServiceSearchFiltersProps> = ({
  filters,
  categories,
  onFilterChange,
  showFilters,
  setShowFilters
}) => {
  const [error, setError] = useState<string | null>(null);
  
  const radiusOptions = [
    { value: 5, label: '5 miles' },
    { value: 10, label: '10 miles' },
    { value: 25, label: '25 miles' },
    { value: 50, label: '50 miles' },
    { value: 100, label: '100 miles' }
  ];
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate zip code if provided
    if (filters.zipCode && !/^\d{5}(-\d{4})?$/.test(filters.zipCode)) {
      setError('Please enter a valid 5-digit zip code');
      return;
    }
    
    // Validate price range
    if (filters.priceMin > filters.priceMax) {
      setError('Minimum price cannot be greater than maximum price');
      return;
    }
    
    setError(null);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Convert to appropriate type
    let typedValue: any = value;
    if (type === 'number') {
      typedValue = value === '' ? 0 : Number(value);
    }
    
    onFilterChange(name as keyof FilterState, typedValue);
  };
  
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const category = e.target.value;
    onFilterChange('category', category);
    onFilterChange('subcategory', ''); // Reset subcategory when category changes
  };
  
  const getSubcategories = () => {
    const category = categories.find(c => c.name === filters.category);
    return category ? category.subcategories : [];
  };
  
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
          {/* Search Term */}
          <div className="relative flex-1 mb-4 md:mb-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              name="searchTerm"
              value={filters.searchTerm}
              onChange={handleInputChange}
              placeholder="Search services..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          
          {/* Zip Code */}
          <div className="mb-4 md:mb-0 md:w-32">
            <input
              type="text"
              name="zipCode"
              value={filters.zipCode}
              onChange={handleInputChange}
              placeholder="Zip Code"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              maxLength={5}
            />
          </div>
          
          {/* Category */}
          <div className="mb-4 md:mb-0 md:w-48">
            <select
              name="category"
              value={filters.category}
              onChange={handleCategoryChange}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.name} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Advanced Filters Toggle */}
          <div className="mb-4 md:mb-0">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {showFilters ? (
                <ChevronUp className="h-4 w-4 ml-2" />
              ) : (
                <ChevronDown className="h-4 w-4 ml-2" />
              )}
            </button>
          </div>
        </div>
        
        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              {/* Subcategory */}
              {filters.category && getSubcategories().length > 0 && (
                <div className="sm:col-span-2">
                  <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700">
                    Subcategory
                  </label>
                  <div className="mt-1">
                    <select
                      id="subcategory"
                      name="subcategory"
                      value={filters.subcategory}
                      onChange={handleInputChange}
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                      <option value="">All Subcategories</option>
                      {getSubcategories().map((subcategory) => (
                        <option key={subcategory} value={subcategory}>
                          {subcategory}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
              
              {/* Price Range */}
              <div className="sm:col-span-2">
                <label htmlFor="price-range" className="block text-sm font-medium text-gray-700">
                  Price Range
                </label>
                <div className="mt-1 flex space-x-2">
                  <div className="relative rounded-md shadow-sm flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      name="priceMin"
                      id="price-min"
                      value={filters.priceMin}
                      onChange={handleInputChange}
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-3 sm:text-sm border-gray-300 rounded-md"
                      placeholder="Min"
                      min="0"
                    />
                  </div>
                  <div className="relative rounded-md shadow-sm flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      name="priceMax"
                      id="price-max"
                      value={filters.priceMax}
                      onChange={handleInputChange}
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-3 sm:text-sm border-gray-300 rounded-md"
                      placeholder="Max"
                      min="0"
                    />
                  </div>
                </div>
              </div>
              
              {/* Radius */}
              <div className="sm:col-span-2">
                <label htmlFor="radius" className="block text-sm font-medium text-gray-700">
                  Search Radius
                </label>
                <div className="mt-1">
                  <select
                    id="radius"
                    name="radius"
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    value={filters.radius}
                    onChange={handleInputChange}
                  >
                    {radiusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Minimum Rating */}
              <div className="sm:col-span-2">
                <label htmlFor="ratingMin" className="block text-sm font-medium text-gray-700">
                  Minimum Rating
                </label>
                <div className="mt-1">
                  <select
                    id="ratingMin"
                    name="ratingMin"
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    value={filters.ratingMin}
                    onChange={handleInputChange}
                  >
                    <option value="0">Any Rating</option>
                    <option value="3">3+ Stars</option>
                    <option value="4">4+ Stars</option>
                    <option value="5">5 Stars</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Error Message */}
        {error && (
          <div className="mt-4 text-sm text-red-600">
            {error}
          </div>
        )}
      </form>
    </div>
  );
};

export default ServiceSearchFilters;
