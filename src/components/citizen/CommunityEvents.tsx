import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
  category: string;
  link?: string;
}

// Mock data for community events
const mockEvents: Event[] = [
  {
    id: 'event1',
    title: 'Community Clean-Up Day',
    description: 'Join your neighbors for a day of cleaning up local parks and streets. Supplies will be provided.',
    date: '2023-10-15',
    time: '9:00 AM - 1:00 PM',
    location: 'Central Park, Main Entrance',
    organizer: 'Green Community Initiative',
    category: 'Environment',
    link: 'https://example.com/cleanup'
  },
  {
    id: 'event2',
    title: 'Town Hall Meeting: Infrastructure',
    description: 'Discuss upcoming infrastructure projects with city officials and provide your input on priorities.',
    date: '2023-10-18',
    time: '6:30 PM - 8:30 PM',
    location: 'City Hall, Room 302',
    organizer: 'Mayor\'s Office',
    category: 'Government'
  },
  {
    id: 'event3',
    title: 'Voter Registration Drive',
    description: 'Get registered to vote or update your registration information. Volunteers will be available to assist.',
    date: '2023-10-22',
    time: '10:00 AM - 4:00 PM',
    location: 'Public Library, Main Branch',
    organizer: 'League of Women Voters',
    category: 'Civic Engagement',
    link: 'https://example.com/voter-drive'
  },
  {
    id: 'event4',
    title: 'Community Garden Planting Day',
    description: 'Help plant vegetables and flowers in the community garden. No experience necessary!',
    date: '2023-10-29',
    time: '10:00 AM - 2:00 PM',
    location: 'Riverside Community Garden',
    organizer: 'Urban Farming Coalition',
    category: 'Environment'
  },
  {
    id: 'event5',
    title: 'School Board Meeting',
    description: 'Monthly meeting of the school board. Public comments welcome.',
    date: '2023-11-02',
    time: '7:00 PM - 9:00 PM',
    location: 'Washington High School Auditorium',
    organizer: 'City School District',
    category: 'Education'
  },
  {
    id: 'event6',
    title: 'Neighborhood Watch Meeting',
    description: 'Learn about recent safety concerns and how to keep your neighborhood secure.',
    date: '2023-11-08',
    time: '6:00 PM - 7:30 PM',
    location: 'Community Center, Room 101',
    organizer: 'Police Department Community Outreach',
    category: 'Safety'
  },
  {
    id: 'event7',
    title: 'Food Drive for Local Pantry',
    description: 'Donate non-perishable food items to help stock the local food pantry for the holiday season.',
    date: '2023-11-12',
    time: '9:00 AM - 5:00 PM',
    location: 'Various Grocery Stores',
    organizer: 'Community Action Network',
    category: 'Charity',
    link: 'https://example.com/food-drive'
  },
  {
    id: 'event8',
    title: 'City Council Budget Hearing',
    description: 'Public hearing on the proposed city budget for the upcoming fiscal year.',
    date: '2023-11-15',
    time: '5:30 PM - 8:00 PM',
    location: 'City Hall, Council Chambers',
    organizer: 'City Council',
    category: 'Government'
  }
];

// Categories for filtering
const categories = [
  'All',
  'Environment',
  'Government',
  'Civic Engagement',
  'Education',
  'Safety',
  'Charity'
];

const CommunityEvents: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Filter events based on search term and category
  const filteredEvents = mockEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  // Sort events by date
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  return (
    <div className="bg-blue-50 rounded-lg p-6 shadow-lg">
      <h3 className="text-2xl font-bold text-blue-800 mb-4">Community Events</h3>
      <p className="text-gray-700 mb-6">
        Discover local events where you can get involved, make a difference, and connect with your community.
      </p>
      
      {/* Search and filters */}
      <div className="mb-6 space-y-4">
        <div>
          <label htmlFor="event-search" className="block text-sm font-medium text-gray-700 mb-1">
            Search Events
          </label>
          <input
            type="text"
            id="event-search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title or description"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label htmlFor="event-category" className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Category
          </label>
          <select
            id="event-category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Events list */}
      <div className="space-y-4">
        {sortedEvents.length === 0 ? (
          <p className="text-center text-gray-600 py-8">No events found matching your criteria.</p>
        ) : (
          sortedEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
            >
              <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                <div>
                  <h4 className="font-semibold text-lg text-blue-700">{event.title}</h4>
                  <p className="text-sm text-gray-500 mb-2">
                    {new Date(event.date).toLocaleDateString()} • {event.time} • {event.category}
                  </p>
                  <p className="text-gray-700 mb-3">{event.description}</p>
                  <div className="mb-2">
                    <span className="font-medium text-sm text-gray-700">Location: </span>
                    <span className="text-sm text-gray-600">{event.location}</span>
                  </div>
                  <div className="mb-2">
                    <span className="font-medium text-sm text-gray-700">Organizer: </span>
                    <span className="text-sm text-gray-600">{event.organizer}</span>
                  </div>
                </div>
                <div className="mt-3 md:mt-0 md:ml-4">
                  {event.link && (
                    <a
                      href={event.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors duration-200"
                    >
                      More Info
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
      
      {/* Add event suggestion */}
      <div className="mt-8 bg-blue-100 p-4 rounded-lg border border-blue-200">
        <h4 className="font-semibold text-lg text-blue-800 mb-2">Have an event to share?</h4>
        <p className="text-gray-700 mb-3">
          If you know of a community event that should be listed here, please let us know!
        </p>
        <button
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors duration-200"
          onClick={() => window.alert('This feature is coming soon!')}
        >
          Suggest an Event
        </button>
      </div>
    </div>
  );
};

export default CommunityEvents;
