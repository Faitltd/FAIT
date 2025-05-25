import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// Mock data for the service agent dashboard
const MOCK_DATA = {
  serviceAgent: {
    name: 'Service Agent',
    email: 'service@itsfait.com',
    joinedDate: '2023-01-15',
    rating: 4.8,
    completedJobs: 42,
    activeJobs: 3
  },
  recentJobs: [
    { id: 1, title: 'Bathroom Renovation', client: 'John Smith', status: 'In Progress', date: '2025-04-20' },
    { id: 2, title: 'Kitchen Remodeling', client: 'Sarah Johnson', status: 'Scheduled', date: '2025-04-30' },
    { id: 3, title: 'Roof Repair', client: 'Michael Brown', status: 'Completed', date: '2025-04-15' }
  ],
  notifications: [
    { id: 1, message: 'New job request from David Wilson', date: '2025-04-27', read: false },
    { id: 2, message: 'Job #1042 has been confirmed', date: '2025-04-26', read: true },
    { id: 3, message: 'You have a new review', date: '2025-04-25', read: true }
  ]
};

const StandaloneServiceAgent = () => {
  const [data, setData] = useState(MOCK_DATA);
  
  // Set up the standalone mode
  useEffect(() => {
    // Store auth info in localStorage
    localStorage.setItem('standalone_auth', JSON.stringify({
      email: 'service@itsfait.com',
      userType: 'service_agent',
      isStandaloneMode: true
    }));
    
    // Add a banner to show standalone mode is active
    const banner = document.createElement('div');
    banner.className = 'bg-purple-700 text-white text-center py-2 text-sm font-bold';
    banner.innerHTML = 'STANDALONE MODE - NO DATABASE CONNECTION';
    
    // Only add if it doesn't exist already
    if (!document.querySelector('.standalone-banner')) {
      banner.classList.add('standalone-banner');
      document.body.prepend(banner);
    }
    
    return () => {
      // Clean up banner when component unmounts
      const banner = document.querySelector('.standalone-banner');
      if (banner) {
        banner.remove();
      }
    };
  }, []);
  
  // Mark a notification as read
  const markAsRead = (id: number) => {
    setData(prevData => ({
      ...prevData,
      notifications: prevData.notifications.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    }));
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Service Agent Dashboard</h1>
          <p className="text-gray-600">Welcome back, {data.serviceAgent.name}</p>
        </div>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-900 mb-2">Profile Overview</h2>
            <div className="flex items-center mb-4">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-4">
                {data.serviceAgent.name.charAt(0)}
              </div>
              <div>
                <p className="font-medium">{data.serviceAgent.name}</p>
                <p className="text-sm text-gray-500">{data.serviceAgent.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Rating</p>
                <p className="font-medium">{data.serviceAgent.rating}/5</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Member Since</p>
                <p className="font-medium">{data.serviceAgent.joinedDate}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-900 mb-2">Job Statistics</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Completed Jobs</p>
                <p className="text-2xl font-bold text-blue-600">{data.serviceAgent.completedJobs}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Jobs</p>
                <p className="text-2xl font-bold text-green-600">{data.serviceAgent.activeJobs}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-900 mb-2">Quick Actions</h2>
            <div className="space-y-2">
              <button className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700">
                Create New Estimate
              </button>
              <button className="w-full py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700">
                View Calendar
              </button>
              <button className="w-full py-2 px-4 bg-purple-600 text-white rounded hover:bg-purple-700">
                Manage Services
              </button>
            </div>
          </div>
        </div>
        
        {/* Recent Jobs */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Recent Jobs</h2>
            <button className="text-blue-600 hover:text-blue-800">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.recentJobs.map(job => (
                  <tr key={job.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{job.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{job.client}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${job.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                          job.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 
                          'bg-yellow-100 text-yellow-800'}`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {job.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">View</button>
                      <button className="text-green-600 hover:text-green-900">Update</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Notifications */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Notifications</h2>
            <button className="text-blue-600 hover:text-blue-800">Mark All as Read</button>
          </div>
          <div className="space-y-4">
            {data.notifications.map(notification => (
              <div 
                key={notification.id} 
                className={`p-4 rounded-lg ${notification.read ? 'bg-gray-50' : 'bg-blue-50 border-l-4 border-blue-500'}`}
              >
                <div className="flex justify-between">
                  <p className={`text-sm ${notification.read ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                    {notification.message}
                  </p>
                  {!notification.read && (
                    <button 
                      onClick={() => markAsRead(notification.id)}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">{notification.date}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StandaloneServiceAgent;
