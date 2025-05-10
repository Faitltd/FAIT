import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import LoadingSpinner from '../LoadingSpinner';

interface Bill {
  id: string;
  title: string;
  description: string;
  introducedDate: string;
  status: string;
  sponsors: string[];
  link: string;
  chamber: 'house' | 'senate';
  category: string;
}

// Mock data for legislation (since we don't have a direct API for this)
const mockLegislation: Bill[] = [
  {
    id: 'hr1234',
    title: 'Clean Energy Innovation Act',
    description: 'A bill to promote research and development in clean energy technologies and provide tax incentives for renewable energy adoption.',
    introducedDate: '2023-06-15',
    status: 'In Committee',
    sponsors: ['Rep. Jane Smith', 'Rep. John Doe'],
    link: 'https://www.congress.gov/',
    chamber: 'house',
    category: 'Environment'
  },
  {
    id: 's789',
    title: 'Affordable Housing Expansion Act',
    description: 'A bill to increase funding for affordable housing programs and provide incentives for developers to build more affordable units.',
    introducedDate: '2023-05-22',
    status: 'Passed Senate',
    sponsors: ['Sen. Robert Johnson', 'Sen. Maria Garcia'],
    link: 'https://www.congress.gov/',
    chamber: 'senate',
    category: 'Housing'
  },
  {
    id: 'hr5678',
    title: 'Small Business Relief Act',
    description: 'A bill to provide tax relief and loans to small businesses affected by economic downturns.',
    introducedDate: '2023-07-08',
    status: 'Introduced',
    sponsors: ['Rep. Michael Brown'],
    link: 'https://www.congress.gov/',
    chamber: 'house',
    category: 'Economy'
  },
  {
    id: 's456',
    title: 'Education Funding Reform Act',
    description: 'A bill to reform the funding structure for public education and increase resources for underserved communities.',
    introducedDate: '2023-04-30',
    status: 'Passed Committee',
    sponsors: ['Sen. Elizabeth Wilson', 'Sen. James Taylor', 'Sen. David Martinez'],
    link: 'https://www.congress.gov/',
    chamber: 'senate',
    category: 'Education'
  },
  {
    id: 'hr9012',
    title: 'Healthcare Access Improvement Act',
    description: 'A bill to expand access to healthcare services in rural areas and increase funding for community health centers.',
    introducedDate: '2023-08-03',
    status: 'Scheduled for Vote',
    sponsors: ['Rep. Sarah Johnson', 'Rep. Thomas Lee'],
    link: 'https://www.congress.gov/',
    chamber: 'house',
    category: 'Healthcare'
  },
  {
    id: 's321',
    title: 'Veterans Support Enhancement Act',
    description: 'A bill to improve benefits and services for veterans, including healthcare, education, and housing assistance.',
    introducedDate: '2023-07-12',
    status: 'In Committee',
    sponsors: ['Sen. Richard Adams', 'Sen. Patricia Moore'],
    link: 'https://www.congress.gov/',
    chamber: 'senate',
    category: 'Veterans'
  },
  {
    id: 'hr7654',
    title: 'Infrastructure Modernization Act',
    description: 'A bill to fund repairs and upgrades to roads, bridges, public transit, and other infrastructure projects.',
    introducedDate: '2023-05-18',
    status: 'Passed House',
    sponsors: ['Rep. Daniel White', 'Rep. Jennifer Black', 'Rep. Kevin Green'],
    link: 'https://www.congress.gov/',
    chamber: 'house',
    category: 'Infrastructure'
  },
  {
    id: 's987',
    title: 'Data Privacy Protection Act',
    description: 'A bill to strengthen data privacy regulations and give consumers more control over their personal information.',
    introducedDate: '2023-06-28',
    status: 'Introduced',
    sponsors: ['Sen. Laura Brown', 'Sen. Christopher Davis'],
    link: 'https://www.congress.gov/',
    chamber: 'senate',
    category: 'Technology'
  }
];

// Categories for filtering
const categories = [
  'All',
  'Environment',
  'Housing',
  'Economy',
  'Education',
  'Healthcare',
  'Veterans',
  'Infrastructure',
  'Technology'
];

const LegislationTracker: React.FC = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedChamber, setSelectedChamber] = useState<'all' | 'house' | 'senate'>('all');

  // Simulate API call to fetch legislation data
  useEffect(() => {
    const fetchLegislation = async () => {
      setLoading(true);
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setBills(mockLegislation);
      setLoading(false);
    };

    fetchLegislation();
  }, []);

  // Filter bills based on search term, category, and chamber
  const filteredBills = bills.filter(bill => {
    const matchesSearch = bill.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         bill.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || bill.category === selectedCategory;
    const matchesChamber = selectedChamber === 'all' || bill.chamber === selectedChamber;
    
    return matchesSearch && matchesCategory && matchesChamber;
  });

  return (
    <div className="bg-blue-50 rounded-lg p-6 shadow-lg">
      <h3 className="text-2xl font-bold text-blue-800 mb-4">Legislation Tracker</h3>
      <p className="text-gray-700 mb-6">
        Stay informed about important legislation that may affect you and your community.
        Track bills as they move through Congress and learn how they might impact your life.
      </p>
      
      {/* Search and filters */}
      <div className="mb-6 space-y-4">
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Search Legislation
          </label>
          <input
            type="text"
            id="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title or description"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Category
            </label>
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="chamber" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Chamber
            </label>
            <select
              id="chamber"
              value={selectedChamber}
              onChange={(e) => setSelectedChamber(e.target.value as 'all' | 'house' | 'senate')}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Chambers</option>
              <option value="house">House</option>
              <option value="senate">Senate</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Bills list */}
      {loading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBills.length === 0 ? (
            <p className="text-center text-gray-600 py-8">No legislation found matching your criteria.</p>
          ) : (
            filteredBills.map((bill, index) => (
              <motion.div
                key={bill.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
              >
                <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                  <div>
                    <h4 className="font-semibold text-lg text-blue-700">{bill.title}</h4>
                    <p className="text-sm text-gray-500 mb-2">
                      {bill.id.toUpperCase()} • {bill.chamber === 'house' ? 'House' : 'Senate'} • {bill.category}
                    </p>
                    <p className="text-gray-700 mb-3">{bill.description}</p>
                    <div className="mb-2">
                      <span className="font-medium text-sm text-gray-700">Sponsors: </span>
                      <span className="text-sm text-gray-600">{bill.sponsors.join(', ')}</span>
                    </div>
                    <div className="mb-2">
                      <span className="font-medium text-sm text-gray-700">Introduced: </span>
                      <span className="text-sm text-gray-600">{new Date(bill.introducedDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="mt-3 md:mt-0 md:ml-4 flex flex-col items-start">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      bill.status === 'Introduced' ? 'bg-blue-100 text-blue-800' :
                      bill.status === 'In Committee' ? 'bg-yellow-100 text-yellow-800' :
                      bill.status === 'Passed Committee' ? 'bg-indigo-100 text-indigo-800' :
                      bill.status === 'Scheduled for Vote' ? 'bg-purple-100 text-purple-800' :
                      bill.status === 'Passed House' || bill.status === 'Passed Senate' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {bill.status}
                    </span>
                    <a
                      href={bill.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 text-blue-600 hover:underline text-sm"
                    >
                      View Full Bill
                    </a>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default LegislationTracker;
