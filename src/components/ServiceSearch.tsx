import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Search, MapPin, Filter, Star, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import type { Database } from '../lib/database.types';

// List of available trades (same as in ServiceForm)
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

type ServicePackage = Database['public']['Tables']['service_packages']['Row'] & {
  profiles: Pick<Database['public']['Tables']['profiles']['Row'], 'full_name' | 'zip_code'>;
  avg_rating?: number;
  review_count?: number;
  distance?: number; // For distance calculation
};

type ServiceSearchProps = {
  userZipCode?: string;
};

type SortField = 'price' | 'distance' | 'rating';
type SortDirection = 'asc' | 'desc';

const ServiceSearch: React.FC<ServiceSearchProps> = ({ userZipCode }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [zipCode, setZipCode] = useState(userZipCode || '');
  const [radius, setRadius] = useState<number>(25);
  const [trade, setTrade] = useState<string>('');
  const [services, setServices] = useState<ServicePackage[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);

  // Sorting state
  const [sortField, setSortField] = useState<SortField>('distance');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Toggle sort direction or change sort field
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default direction
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Get sort icon based on current sort state
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
    }
    return sortDirection === 'asc'
      ? <ArrowUp className="h-4 w-4 text-blue-600" />
      : <ArrowDown className="h-4 w-4 text-blue-600" />;
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!zipCode && !searchTerm && !trade) {
      return;
    }

    setLoading(true);
    setSearchPerformed(true);

    try {
      // Start building the query
      let query = supabase
        .from('service_packages')
        .select(`
          *,
          profiles(full_name, zip_code),
          avg_rating:reviews(rating),
          review_count:reviews(count)
        `)
        .eq('is_active', true);

      // Add search term filter if provided
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      // Add trade filter if provided
      if (trade) {
        query = query.eq('trade', trade);
      }

      // Execute the query
      const { data, error } = await query;

      if (error) throw error;

      // Filter by zip code proximity if provided
      // Note: This is a simplified approach. In a real app, you'd use a geolocation service
      let filteredServices = data as ServicePackage[];

      if (zipCode) {
        // Simple filtering based on zip code prefix (first 3 digits)
        // This is a very basic approximation and should be replaced with proper geo-distance calculation
        const zipPrefix = zipCode.substring(0, 3);
        filteredServices = filteredServices.filter(service => {
          const serviceZip = service.profiles?.zip_code;
          return serviceZip && serviceZip.startsWith(zipPrefix);
        });

        // Add a distance property (simplified for demo purposes)
        filteredServices = filteredServices.map(service => {
          const serviceZip = service.profiles?.zip_code || '';
          // Very simplified distance calculation - just for demonstration
          // In a real app, you would use a proper geolocation service
          const distance = serviceZip && zipCode
            ? Math.abs(parseInt(serviceZip.substring(0, 5)) - parseInt(zipCode.substring(0, 5))) / 100
            : 999; // Default high distance if no zip code

          return {
            ...service,
            distance
          };
        });
      }

      // Calculate average rating for each service
      filteredServices = filteredServices.map(service => {
        const ratings = service.avg_rating as unknown as { rating: number }[];
        const count = service.review_count as unknown as { count: number }[];

        const avgRating = ratings && ratings.length > 0
          ? ratings.reduce((sum, item) => sum + (item.rating || 0), 0) / ratings.length
          : 0;

        const reviewCount = count && count.length > 0 ? count[0].count : 0;

        return {
          ...service,
          avg_rating: avgRating,
          review_count: reviewCount
        };
      });

      // Sort the services based on the selected sort field and direction
      filteredServices.sort((a, b) => {
        let comparison = 0;

        if (sortField === 'price') {
          comparison = (a.price || 0) - (b.price || 0);
        } else if (sortField === 'distance') {
          comparison = (a.distance || 999) - (b.distance || 999);
        } else if (sortField === 'rating') {
          comparison = (b.avg_rating || 0) - (a.avg_rating || 0); // Higher ratings first
        }

        // Reverse for descending order
        return sortDirection === 'asc' ? comparison : -comparison;
      });

      setServices(filteredServices);
    } catch (error) {
      console.error('Error searching services:', error);
    } finally {
      setLoading(false);
    }
  };

  // If user has a zip code, perform search on mount
  useEffect(() => {
    if (userZipCode) {
      handleSearch();
    }
  }, [userZipCode]);

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Find Services Near You</h2>
      </div>

      <div className="p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="search"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                ZIP Code
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="zipCode"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter ZIP code"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  pattern="[0-9]{5}"
                  title="Five digit ZIP code"
                />
              </div>
            </div>

            <div>
              <label htmlFor="trade" className="block text-sm font-medium text-gray-700 mb-1">
                Trade
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  id="trade"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={trade}
                  onChange={(e) => setTrade(e.target.value)}
                >
                  <option value="">All Trades</option>
                  {TRADES.map((tradeName) => (
                    <option key={tradeName} value={tradeName}>
                      {tradeName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Search Services
            </button>
          </div>
        </form>
      </div>

      <div className="border-t border-gray-200">
        {loading ? (
          <div className="p-6 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : searchPerformed ? (
          services.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trade
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('price')}
                    >
                      <div className="flex items-center">
                        Price {getSortIcon('price')}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('distance')}
                    >
                      <div className="flex items-center">
                        Distance {getSortIcon('distance')}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('rating')}
                    >
                      <div className="flex items-center">
                        Rating {getSortIcon('rating')}
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {services.map((service) => (
                    <tr key={service.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{service.title}</div>
                            <div className="text-sm text-gray-500">
                              {service.profiles?.full_name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{service.trade || 'Not specified'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">${service.price}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {service.distance ? `${service.distance.toFixed(1)} mi` : 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {service.profiles?.zip_code || 'No ZIP'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {service.avg_rating !== undefined ? (
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400" />
                            <span className="ml-1 text-sm text-gray-600">
                              {service.avg_rating.toFixed(1)}
                            </span>
                            <span className="ml-1 text-xs text-gray-500">
                              ({service.review_count})
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">No ratings</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          to={`/book/${service.id}`}
                          className="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1 rounded-md"
                        >
                          Book
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center">
              <p className="text-gray-500">No services found matching your criteria.</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your search or ZIP code.</p>
            </div>
          )
        ) : (
          <div className="p-6 text-center">
            <p className="text-gray-500">Enter your search criteria above to find services.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceSearch;
