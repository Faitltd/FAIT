import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ServiceSortControlsProps {
  sortBy: 'price' | 'rating' | 'distance' | 'newest';
  sortDirection: 'asc' | 'desc';
  onSortChange: (
    sortBy: 'price' | 'rating' | 'distance' | 'newest',
    sortDirection: 'asc' | 'desc'
  ) => void;
}

const ServiceSortControls: React.FC<ServiceSortControlsProps> = ({
  sortBy,
  sortDirection,
  onSortChange
}) => {
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    
    // Parse the value (format: "price_asc", "rating_desc", etc.)
    const [newSortBy, newSortDirection] = value.split('_') as [
      'price' | 'rating' | 'distance' | 'newest',
      'asc' | 'desc'
    ];
    
    onSortChange(newSortBy, newSortDirection);
  };
  
  const getSortLabel = () => {
    switch (sortBy) {
      case 'price':
        return sortDirection === 'asc' ? 'Price: Low to High' : 'Price: High to Low';
      case 'rating':
        return sortDirection === 'asc' ? 'Rating: Low to High' : 'Rating: High to Low';
      case 'distance':
        return sortDirection === 'asc' ? 'Distance: Nearest First' : 'Distance: Farthest First';
      case 'newest':
        return sortDirection === 'asc' ? 'Date: Oldest First' : 'Date: Newest First';
      default:
        return 'Sort By';
    }
  };
  
  return (
    <div className="flex items-center">
      <label htmlFor="sort-by" className="sr-only">
        Sort by
      </label>
      <div className="relative">
        <select
          id="sort-by"
          value={`${sortBy}_${sortDirection}`}
          onChange={handleSortChange}
          className="appearance-none block w-full bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm font-medium text-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="distance_asc">Distance: Nearest First</option>
          <option value="distance_desc">Distance: Farthest First</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="rating_desc">Rating: High to Low</option>
          <option value="rating_asc">Rating: Low to High</option>
          <option value="newest_desc">Date: Newest First</option>
          <option value="newest_asc">Date: Oldest First</option>
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
          {sortDirection === 'asc' ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceSortControls;
