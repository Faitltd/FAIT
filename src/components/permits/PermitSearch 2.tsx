import React, { useState } from 'react';
import { permitService } from '../../services/PermitService';
import { denverPermitApiService } from '../../services/DenverPermitApiService';
import type { Permit } from '../../services/PermitService';

interface PermitSearchProps {
  onPermitSelect: (permit: Permit) => void;
  projectId?: string;
}

const PermitSearch: React.FC<PermitSearchProps> = ({ onPermitSelect, projectId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'address' | 'permit_number'>('address');
  const [searchResults, setSearchResults] = useState<Permit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) {
      setError('Please enter a search term');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      let results: Permit[];
      
      if (searchType === 'address') {
        // Search by address
        results = await denverPermitApiService.searchPermitsByAddress(searchTerm);
      } else {
        // Search by permit number
        const permit = await denverPermitApiService.getPermitByNumber(searchTerm);
        results = permit ? [permit] : [];
      }
      
      setSearchResults(results);
      
      if (results.length === 0) {
        setError('No permits found');
      }
    } catch (err) {
      console.error('Error searching for permits:', err);
      setError('An error occurred while searching for permits');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePermitSelect = async (permit: Permit) => {
    try {
      // Save the permit to our database if it doesn't exist yet
      const savedPermit = await permitService.savePermit(permit);
      
      // If a project ID is provided, link the permit to the project
      if (projectId && savedPermit.id) {
        await permitService.linkPermitToProject(projectId, savedPermit.id);
      }
      
      // Call the onPermitSelect callback
      onPermitSelect(savedPermit);
    } catch (err) {
      console.error('Error selecting permit:', err);
      setError('An error occurred while selecting the permit');
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-4">Search for Permits</h3>
      
      <form onSubmit={handleSearch} className="mb-4">
        <div className="flex flex-col space-y-2">
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="searchType"
                value="address"
                checked={searchType === 'address'}
                onChange={() => setSearchType('address')}
                className="mr-2"
              />
              Address
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="searchType"
                value="permit_number"
                checked={searchType === 'permit_number'}
                onChange={() => setSearchType('permit_number')}
                className="mr-2"
              />
              Permit Number
            </label>
          </div>
          
          <div className="flex">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={searchType === 'address' ? "Enter address..." : "Enter permit number..."}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
            >
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>
      </form>
      
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {searchResults.length > 0 && (
        <div>
          <h4 className="text-md font-medium mb-2">Results</h4>
          <div className="max-h-60 overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permit #</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {searchResults.map((permit) => (
                  <tr key={permit.external_id || permit.permit_number}>
                    <td className="px-3 py-2 whitespace-nowrap text-sm">{permit.permit_number}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm">{permit.permit_type}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        permit.status === 'Issued' ? 'bg-green-100 text-green-800' :
                        permit.status === 'Under Review' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {permit.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm">{permit.address}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handlePermitSelect(permit)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Select
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PermitSearch;
