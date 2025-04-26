import React, { useState } from 'react';

const ServiceSearchFilters = ({
  zipCode,
  setZipCode,
  category,
  setCategory,
  searchTerm,
  setSearchTerm,
  radius,
  setRadius,
  priceMin,
  setPriceMin,
  priceMax,
  setPriceMax,
  ratingMin,
  setRatingMin,
  onSearch
}) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [error, setError] = useState('');
  
  const categories = [
    { id: '', name: 'All Categories' },
    { id: 'plumbing', name: 'Plumbing' },
    { id: 'electrical', name: 'Electrical' },
    { id: 'hvac', name: 'HVAC' },
    { id: 'carpentry', name: 'Carpentry' },
    { id: 'painting', name: 'Painting' },
    { id: 'landscaping', name: 'Landscaping' },
    { id: 'cleaning', name: 'Cleaning' },
    { id: 'roofing', name: 'Roofing' },
    { id: 'flooring', name: 'Flooring' },
    { id: 'general', name: 'General Contracting' }
  ];
  
  const radiusOptions = [
    { value: 5, label: '5 miles' },
    { value: 10, label: '10 miles' },
    { value: 25, label: '25 miles' },
    { value: 50, label: '50 miles' },
    { value: 100, label: '100 miles' }
  ];
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate zip code if provided
    if (zipCode && !/^\d{5}(-\d{4})?$/.test(zipCode)) {
      setError('Please enter a valid 5-digit zip code');
      return;
    }
    
    // Validate price range
    if (priceMin > priceMax) {
      setError('Minimum price cannot be greater than maximum price');
      return;
    }
    
    setError('');
    onSearch();
  };
  
  const handleClearFilters = () => {
    setZipCode('');
    setCategory('');
    setSearchTerm('');
    setRadius(25);
    setPriceMin(0);
    setPriceMax(1000);
    setRatingMin(0);
    setIsAdvancedOpen(false);
    
    // Trigger search with cleared filters
    setTimeout(onSearch, 0);
  };
  
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            {/* Search Term */}
            <div className="sm:col-span-2">
              <label htmlFor="search-term" className="block text-sm font-medium text-gray-700">
                Search
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  id="search-term"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            {/* ZIP Code */}
            <div className="sm:col-span-2">
              <label htmlFor="zip-code" className="block text-sm font-medium text-gray-700">
                ZIP Code
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  id="zip-code"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter ZIP code"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                />
              </div>
            </div>
            
            {/* Category */}
            <div className="sm:col-span-2">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <div className="mt-1">
                <select
                  id="category"
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          {/* Advanced Filters Toggle */}
          <div className="mt-4">
            <button
              type="button"
              className="text-sm text-blue-600 hover:text-blue-500 focus:outline-none focus:underline"
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            >
              {isAdvancedOpen ? 'Hide advanced filters' : 'Show advanced filters'}
            </button>
          </div>
          
          {/* Advanced Filters */}
          {isAdvancedOpen && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                {/* Radius */}
                <div className="sm:col-span-2">
                  <label htmlFor="radius" className="block text-sm font-medium text-gray-700">
                    Search Radius
                  </label>
                  <div className="mt-1">
                    <select
                      id="radius"
                      className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      value={radius}
                      onChange={(e) => setRadius(parseInt(e.target.value, 10))}
                    >
                      {radiusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {/* Price Range */}
                <div className="sm:col-span-2">
                  <label htmlFor="price-min" className="block text-sm font-medium text-gray-700">
                    Price Range
                  </label>
                  <div className="mt-1 flex space-x-2">
                    <div className="relative rounded-md shadow-sm flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        id="price-min"
                        className="block w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Min"
                        min="0"
                        value={priceMin}
                        onChange={(e) => setPriceMin(parseInt(e.target.value, 10) || 0)}
                      />
                    </div>
                    <div className="relative rounded-md shadow-sm flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        id="price-max"
                        className="block w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Max"
                        min="0"
                        value={priceMax}
                        onChange={(e) => setPriceMax(parseInt(e.target.value, 10) || 0)}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Minimum Rating */}
                <div className="sm:col-span-2">
                  <label htmlFor="rating-min" className="block text-sm font-medium text-gray-700">
                    Minimum Rating
                  </label>
                  <div className="mt-1">
                    <select
                      id="rating-min"
                      className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      value={ratingMin}
                      onChange={(e) => setRatingMin(parseInt(e.target.value, 10))}
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
          
          {/* Action Buttons */}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={handleClearFilters}
            >
              Clear Filters
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceSearchFilters;
