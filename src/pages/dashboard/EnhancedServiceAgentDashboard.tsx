import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import supabase from '../../utils/supabaseClient';;

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
// Using singleton Supabase client;

const EnhancedServiceAgentDashboard: React.FC = () => {
  const userEmail = localStorage.getItem('userEmail') || 'service-agent@example.com';
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock data for the dashboard
  const [mockData, setMockData] = useState({
    activeServices: 0,
    totalServices: 0,
    pendingBookings: 3,
    completedBookings: 12,
    unreadMessages: 2,
    earnings: {
      thisMonth: 1250,
      lastMonth: 980,
      pending: 450
    },
    recentBookings: [
      { id: 1, client: 'John Doe', service: 'Plumbing Repair', date: '2024-06-15', status: 'confirmed' },
      { id: 2, client: 'Jane Smith', service: 'Electrical Installation', date: '2024-06-18', status: 'pending' },
      { id: 3, client: 'Robert Johnson', service: 'Kitchen Remodeling', date: '2024-06-22', status: 'confirmed' }
    ],
    pendingAppointments: [
      { id: 101, client: 'Sarah Williams', service: 'Bathroom Renovation', date: '2024-06-25', time: '10:00 AM - 12:00 PM', location: '123 Main St, Anytown', price: '$350' },
      { id: 102, client: 'Michael Brown', service: 'Electrical Wiring', date: '2024-06-27', time: '2:00 PM - 4:00 PM', location: '456 Oak Ave, Somewhere', price: '$180' },
      { id: 103, client: 'Emily Davis', service: 'Plumbing Inspection', date: '2024-06-30', time: '9:00 AM - 10:00 AM', location: '789 Pine Rd, Elsewhere', price: '$120' }
    ],
    messages: [
      { id: 201, client: 'Sarah Williams', subject: 'Question about renovation', date: '2024-06-20', time: '2:35 PM', preview: 'Hi, I was wondering if you could provide more details about...', unread: true },
      { id: 202, client: 'Michael Brown', subject: 'Electrical service follow-up', date: '2024-06-19', time: '11:20 AM', preview: 'Thanks for the quote. I have a few questions about the timeline...', unread: true },
      { id: 203, client: 'John Doe', subject: 'Plumbing repair feedback', date: '2024-06-15', time: '4:45 PM', preview: 'I wanted to thank you for the excellent service last week...', unread: false },
      { id: 204, client: 'Emily Davis', subject: 'Scheduling inspection', date: '2024-06-10', time: '9:15 AM', preview: 'I need to reschedule the plumbing inspection we had planned...', unread: false }
    ]
  });

  useEffect(() => {
    fetchServices();
  }, []);

  // Update mockData when services change
  useEffect(() => {
    setMockData(prevData => ({
      ...prevData,
      activeServices: services.filter(s => s.is_active).length,
      totalServices: services.length
    }));
  }, [services]);

  const fetchServices = async () => {
    try {
      setLoading(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError('You must be logged in to view your services');
        setLoading(false);
        return;
      }

      // Fetch services for this service agent
      const { data, error } = await supabase
        .from('service_packages')
        .select('*')
        .eq('service_agent_id', user.id);

      if (error) throw error;

      setServices(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching services:', err);
      setError('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const toggleServiceStatus = async (serviceId, currentStatus) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError('You must be logged in to update services');
        return;
      }

      // Update the service status in the database
      const { error } = await supabase
        .from('service_packages')
        .update({ is_active: !currentStatus })
        .eq('id', serviceId)
        .eq('service_agent_id', user.id);

      if (error) throw error;

      // Update local state to reflect the change immediately
      setServices(prevServices =>
        prevServices.map(service =>
          service.id === serviceId
            ? { ...service, is_active: !currentStatus }
            : service
        )
      );

      // Update the active services count in the mock data
      setMockData(prevData => ({
        ...prevData,
        activeServices: !currentStatus
          ? prevData.activeServices + 1
          : prevData.activeServices - 1
      }));
    } catch (error) {
      console.error('Error updating service status:', error);
      setError('Failed to update service status');
    }
  };

  return (
    <>
      <div className="bg-gray-50">
        {/* Main Content */}
        <div className="py-10">
          <header>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold text-gray-900">Service Agent Dashboard</h1>
            </div>
          </header>
          <main>
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
              {/* Stats Section */}
              <div className="px-4 py-6 sm:px-0">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {/* Stat Card - Services */}
                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                          <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                          </svg>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">
                              Active Services
                            </dt>
                            <dd>
                              <div className="text-lg font-medium text-gray-900">
                                {mockData.activeServices} / {mockData.totalServices}
                              </div>
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-4 sm:px-6">
                      <div className="text-sm">
                        <a href="#active-services" className="font-medium text-blue-600 hover:text-blue-500">
                          Manage services
                          <span aria-hidden="true"> &rarr;</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Stat Card - Bookings */}
                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                          <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">
                              Pending Bookings
                            </dt>
                            <dd>
                              <div className="text-lg font-medium text-gray-900">
                                {mockData.pendingBookings}
                              </div>
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-4 sm:px-6">
                      <div className="text-sm">
                        <a href="#recent-bookings" className="font-medium text-blue-600 hover:text-blue-500">
                          View bookings
                          <span aria-hidden="true"> &rarr;</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Stat Card - Messages */}
                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                          <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                          </svg>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">
                              Unread Messages
                            </dt>
                            <dd>
                              <div className="text-lg font-medium text-gray-900">
                                {mockData.unreadMessages}
                              </div>
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-4 sm:px-6">
                      <div className="text-sm">
                        <a href="#messages" className="font-medium text-blue-600 hover:text-blue-500">
                          View messages
                          <span aria-hidden="true"> &rarr;</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Stat Card - Earnings */}
                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                          <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">
                              This Month's Earnings
                            </dt>
                            <dd>
                              <div className="text-lg font-medium text-gray-900">
                                ${mockData.earnings.thisMonth}
                              </div>
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-4 sm:px-6">
                      <div className="text-sm">
                        <a href="#earnings" className="font-medium text-blue-600 hover:text-blue-500">
                          View earnings
                          <span aria-hidden="true"> &rarr;</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rest of the dashboard content */}
              {/* ... */}
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default EnhancedServiceAgentDashboard;
