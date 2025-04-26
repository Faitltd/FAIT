import React from 'react';

const EnhancedServiceAgentDashboard: React.FC = () => {
  const userEmail = localStorage.getItem('userEmail') || 'service-agent@example.com';

  // Mock data for the dashboard
  const mockData = {
    activeServices: 5,
    totalServices: 8,
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

            {/* Pending Appointments Section */}
            <div id="pending-appointments" className="px-4 py-6 sm:px-0">
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Pending Appointments
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      Appointments that need your confirmation.
                    </p>
                  </div>
                  <button onClick={() => alert('All pending appointments would display here')} className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    View All
                  </button>
                </div>
                <div className="border-t border-gray-200">
                  <div className="overflow-hidden overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Client
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Service
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date & Time
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Location
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Price
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {mockData.pendingAppointments.map((appointment) => (
                          <tr key={appointment.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {appointment.client}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {appointment.service}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {appointment.date}<br />
                              <span className="text-xs text-gray-400">{appointment.time}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {appointment.location}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {appointment.price}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button onClick={() => alert(`Appointment with ${appointment.client} for ${appointment.service} has been confirmed!`)} className="text-green-600 hover:text-green-900 mr-4">
                                Confirm
                              </button>
                              <button onClick={() => alert(`Appointment with ${appointment.client} for ${appointment.service} has been declined.`)} className="text-red-600 hover:text-red-900">
                                Decline
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages Section */}
            <div id="messages" className="px-4 py-6 sm:px-0">
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Messages
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      Communications from clients.
                    </p>
                  </div>
                  <button onClick={() => alert('All messages would display here')} className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    View All
                  </button>
                </div>
                <div className="border-t border-gray-200">
                  <ul className="divide-y divide-gray-200">
                    {mockData.messages.map((message) => (
                      <li key={message.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className={`flex-shrink-0 h-10 w-10 rounded-full ${message.unread ? 'bg-blue-100' : 'bg-gray-100'} flex items-center justify-center`}>
                              <span className={`text-sm font-medium ${message.unread ? 'text-blue-700' : 'text-gray-700'}`}>
                                {message.client.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="flex items-center">
                                <h4 className="text-sm font-medium text-gray-900">{message.client}</h4>
                                {message.unread && (
                                  <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                    New
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center">
                                <p className="text-sm font-medium text-gray-900">{message.subject}</p>
                                <span className="mx-2 text-gray-500">•</span>
                                <p className="text-sm text-gray-500">{message.date} at {message.time}</p>
                              </div>
                              <p className="mt-1 text-sm text-gray-500 truncate">{message.preview}</p>
                            </div>
                          </div>
                          <div>
                            <button onClick={() => alert(`Opening message from ${message.client}: ${message.subject}`)} className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-5 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                              Read
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Recent Bookings Section */}
            <div id="recent-bookings" className="px-4 py-6 sm:px-0">
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Recent Bookings
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      Your most recent service bookings.
                    </p>
                  </div>
                  <button onClick={() => alert('All bookings would display here')} className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    View All
                  </button>
                </div>
                <div className="border-t border-gray-200">
                  <div className="overflow-hidden overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Client
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Service
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {mockData.recentBookings.map((booking) => (
                          <tr key={booking.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {booking.client}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {booking.service}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {booking.date}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                booking.status === 'confirmed'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button onClick={() => alert('Booking details would display here')} className="text-blue-600 hover:text-blue-900">
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Section */}
            <div className="px-4 py-6 sm:px-0">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <button onClick={() => alert('Add new service interface would open here')} className="block w-full text-left">
                  <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
                    <div className="px-4 py-5 sm:p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                          <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-gray-900">Add New Service</h3>
                          <p className="text-sm text-gray-500">Create a new service listing</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>

                <a href="#pending-appointments" className="block w-full text-left">
                  <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
                    <div className="px-4 py-5 sm:p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                          <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-gray-900">Confirm Appointments</h3>
                          <p className="text-sm text-gray-500">Review and confirm pending appointments</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </a>

                <a href="#messages" className="block w-full text-left">
                  <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
                    <div className="px-4 py-5 sm:p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                          <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-gray-900">View Messages</h3>
                          <p className="text-sm text-gray-500">Check client communications</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </a>

                <a href="/dashboard/service-agent/estimates" className="block w-full text-left">
                  <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
                    <div className="px-4 py-5 sm:p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
                          <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-gray-900">Estimates</h3>
                          <p className="text-sm text-gray-500">Create and manage estimates</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </a>

                <a href="/subscription/dashboard" className="block w-full text-left">
                  <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
                    <div className="px-4 py-5 sm:p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                          <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-gray-900">Subscription</h3>
                          <p className="text-sm text-gray-500">Manage your subscription</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </a>
              </div>
            </div>

            {/* Active Services Section */}
            <div id="active-services" className="px-4 py-6 sm:px-0">
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Active Services
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      Services you currently offer to clients.
                    </p>
                  </div>
                  <button onClick={() => alert('Add new service interface would open here')} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Add New Service
                  </button>
                </div>
                <div className="border-t border-gray-200">
                  <div className="overflow-hidden overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Service Name
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Category
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Price
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            Plumbing Repair
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            Plumbing
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            $75/hour
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Active
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button onClick={() => alert('Edit service interface would open here')} className="text-blue-600 hover:text-blue-900 mr-4">
                              Edit
                            </button>
                            <button onClick={() => alert('Service would be deactivated')} className="text-red-600 hover:text-red-900">
                              Deactivate
                            </button>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            Electrical Installation
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            Electrical
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            $85/hour
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Active
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button onClick={() => alert('Edit service interface would open here')} className="text-blue-600 hover:text-blue-900 mr-4">
                              Edit
                            </button>
                            <button onClick={() => alert('Service would be deactivated')} className="text-red-600 hover:text-red-900">
                              Deactivate
                            </button>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            Kitchen Remodeling
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            Remodeling
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            $95/hour
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Active
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button onClick={() => alert('Edit service interface would open here')} className="text-blue-600 hover:text-blue-900 mr-4">
                              Edit
                            </button>
                            <button onClick={() => alert('Service would be deactivated')} className="text-red-600 hover:text-red-900">
                              Deactivate
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Earnings Section */}
            <div id="earnings" className="px-4 py-6 sm:px-0">
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Earnings Overview
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      Your financial performance summary.
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    <button className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                      This Month
                    </button>
                    <button className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200">
                      Last Month
                    </button>
                    <button className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200">
                      Year to Date
                    </button>
                  </div>
                </div>
                <div className="border-t border-gray-200">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                      <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
                        <div className="px-4 py-5 sm:p-6">
                          <dt className="text-sm font-medium text-gray-500 truncate">This Month</dt>
                          <dd className="mt-1 text-3xl font-semibold text-gray-900">${mockData.earnings.thisMonth}</dd>
                          <dd className="mt-2 text-sm text-green-600">+12% from last month</dd>
                        </div>
                      </div>
                      <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
                        <div className="px-4 py-5 sm:p-6">
                          <dt className="text-sm font-medium text-gray-500 truncate">Last Month</dt>
                          <dd className="mt-1 text-3xl font-semibold text-gray-900">${mockData.earnings.lastMonth}</dd>
                          <dd className="mt-2 text-sm text-green-600">+5% from previous month</dd>
                        </div>
                      </div>
                      <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
                        <div className="px-4 py-5 sm:p-6">
                          <dt className="text-sm font-medium text-gray-500 truncate">Pending Payments</dt>
                          <dd className="mt-1 text-3xl font-semibold text-gray-900">${mockData.earnings.pending}</dd>
                          <dd className="mt-2 text-sm text-gray-500">From 3 bookings</dd>
                        </div>
                      </div>
                    </div>
                    <div className="mt-8">
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Recent Transactions</h4>
                      <div className="overflow-hidden overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Client
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Service
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Amount
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            <tr>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                2024-06-15
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                John Doe
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                Plumbing Repair
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                $150
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                  Paid
                                </span>
                              </td>
                            </tr>
                            <tr>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                2024-06-10
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                Jane Smith
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                Electrical Installation
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                $255
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                  Paid
                                </span>
                              </td>
                            </tr>
                            <tr>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                2024-06-05
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                Robert Johnson
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                Kitchen Remodeling (Deposit)
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                $450
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                  Pending
                                </span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="px-4 py-6 sm:px-0 flex justify-center space-x-4">
              <a
                href="/"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Home
              </a>
              <a
                href="/dashboard/client"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Client Dashboard
              </a>
              <a
                href="/test-login"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Test Login
              </a>
              <a
                href="/debug"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Debug Page
              </a>
            </div>
          </div>
        </main>
      </div>
    </div>
    </>

  );
};

export default EnhancedServiceAgentDashboard;
