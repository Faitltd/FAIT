import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import {
  Search,
  MapPin,
  User,
  X,
  ArrowRight,
  Loader2
} from 'lucide-react';

interface AdvancedSearchBarProps {
  initialSearchTerm?: string;
  initialZipCode?: string;
  onSearch?: (searchTerm: string, zipCode: string, searchByAgent: boolean) => void;
  fullWidth?: boolean;
  showAgentSearch?: boolean;
  autoFocus?: boolean;
  className?: string;
}

const AdvancedSearchBar: React.FC<AdvancedSearchBarProps> = ({
  initialSearchTerm = '',
  initialZipCode = '',
  onSearch,
  fullWidth = false,
  showAgentSearch = true,
  autoFocus = false,
  className = ''
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [zipCode, setZipCode] = useState(initialZipCode);
  const [searchByAgent, setSearchByAgent] = useState(false);
  const [userZipCode, setUserZipCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showRecentSearches, setShowRecentSearches] = useState(false);

  // Fetch user profile to get zip code
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('zip_code')
            .eq('id', user.id)
            .single();

          if (error) throw error;

          if (data?.zip_code) {
            setUserZipCode(data.zip_code);
            if (!initialZipCode) {
              setZipCode(data.zip_code);
            }
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
        }
      }
    };

    fetchUserProfile();
  }, [user, initialZipCode]);

  // Load recent searches from localStorage
  useEffect(() => {
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, []);

  // Save search to recent searches
  const saveSearch = (term: string) => {
    if (!term.trim()) return;

    const updatedSearches = [
      term,
      ...recentSearches.filter(s => s !== term)
    ].slice(0, 5);

    setRecentSearches(updatedSearches);
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
  };

  // Handle search submission
  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    setIsLoading(true);

    // Save search term to recent searches
    if (searchTerm) {
      saveSearch(searchTerm);
    }

    // If onSearch prop is provided, call it
    if (onSearch) {
      onSearch(searchTerm, zipCode, searchByAgent);
      setIsLoading(false);
    } else {
      // Otherwise navigate to services page with search params
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (zipCode) params.append('zip', zipCode);
      if (searchByAgent) params.append('agent', 'true');

      navigate(`/services?${params.toString()}`);
      setIsLoading(false);
    }

    setShowRecentSearches(false);
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
    setZipCode(userZipCode || '');
    setSearchByAgent(false);
  };

  // Use recent search
  const useRecentSearch = (term: string) => {
    setSearchTerm(term);
    setShowRecentSearches(false);
    setTimeout(() => handleSearch(), 100);
  };

  return (
    <div className={`${className} ${fullWidth ? 'w-full' : 'max-w-3xl mx-auto'}`}>
      <form onSubmit={handleSearch} className="relative">
        <div className="flex flex-col md:flex-row">
          {/* Search Input - FAIT Style */}
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-[#595C5B]" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setShowRecentSearches(true)}
              onBlur={() => setTimeout(() => setShowRecentSearches(false), 200)}
              placeholder="What service do you need?"
              className="block w-full pl-10 pr-10 py-4 border-0 md:rounded-l-full text-[#1A1E1D] text-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0D7A5F] focus:border-[#0D7A5F]"
              autoFocus={autoFocus}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <X className="h-5 w-5 text-gray-400 hover:text-gray-500" />
              </button>
            )}

            {/* Recent Searches Dropdown */}
            {showRecentSearches && recentSearches.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                <div className="px-3 py-2 text-xs font-medium text-[#2B4C32]">Recent Searches</div>
                {recentSearches.map((term, index) => (
                  <div
                    key={index}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                    onClick={() => useRecentSearch(term)}
                  >
                    <Search className="h-4 w-4 text-[#0D7A5F] mr-2" />
                    <span>{term}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ZIP Code Input - FAIT Style */}
          <div className="relative md:w-1/4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-[#595C5B]" />
            </div>
            <input
              type="text"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').substring(0, 5))}
              placeholder="ZIP Code"
              className="block w-full pl-10 pr-3 py-4 border-0 md:border-l md:border-[#595C5B] text-[#1A1E1D] text-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0D7A5F] focus:border-[#0D7A5F]"
            />
          </div>

          {/* Search Button - FAIT Style */}
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center justify-center px-6 py-4 border-0 md:rounded-r-full text-base font-semibold text-white bg-[#0D7A5F] hover:bg-[#0A6A4F] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0D7A5F]"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                Search
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </button>
        </div>

        {/* Search by Agent Near Me Option - FAIT Style */}
        {showAgentSearch && (
          <div className="mt-3 flex items-center">
            <input
              id="search-by-agent"
              type="checkbox"
              checked={searchByAgent}
              onChange={(e) => setSearchByAgent(e.target.checked)}
              className="h-4 w-4 text-[#0D7A5F] focus:ring-[#0D7A5F] border-gray-300 rounded"
            />
            <label htmlFor="search-by-agent" className="ml-2 block text-sm text-[#2B4C32] font-medium">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                Search for service agents near me
              </div>
            </label>
          </div>
        )}
      </form>
    </div>
  );
};

export default AdvancedSearchBar;
