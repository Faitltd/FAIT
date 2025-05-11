import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/ButtonNew';
import { Card, CardContent } from '../components/ui/CardNew';
import ProfessionalLayout from '../components/layout/ProfessionalLayout';
import FadeInView from '../components/animations/FadeInView';
import ScaleInView from '../components/animations/ScaleInView';

// Tiny icons for a professional look - sized to be proportional to text
const CalendarIcon = () => (
  <svg className="h-3 w-3 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const MessageIcon = () => (
  <svg className="h-3 w-3 text-secondary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
  </svg>
);

const ShieldIcon = () => (
  <svg className="h-3 w-3 text-accent-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const SearchIcon = () => (
  <svg className="h-3 w-3 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const ProfessionalDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Sample project data
  const projects = [
    { id: 1, title: 'Kitchen Renovation', status: 'In Progress', date: '2023-05-15', provider: 'ABC Contractors' },
    { id: 2, title: 'Bathroom Remodel', status: 'Scheduled', date: '2023-06-10', provider: 'Modern Plumbing' },
    { id: 3, title: 'Deck Installation', status: 'Completed', date: '2023-04-22', provider: 'Outdoor Living Experts' },
  ];

  // Sample messages
  const messages = [
    { id: 1, from: 'John Contractor', preview: "I'll be arriving tomorrow at 9am as scheduled...", time: '2 hours ago', unread: true },
    { id: 2, from: 'Sarah Plumber', preview: 'The parts have arrived and I can install them next...', time: '1 day ago', unread: false },
    { id: 3, from: 'Mike Electrician', preview: "Here's the quote for the additional outlets you...", time: '3 days ago', unread: false },
  ];

  return (
    <ProfessionalLayout>
      {/* Dashboard Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-2xl font-semibold text-neutral-900">My Dashboard</h1>

            {/* Tabs */}
            <div className="mt-4 border-b border-neutral-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`${
                    activeTab === 'overview'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('projects')}
                  className={`${
                    activeTab === 'projects'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Projects
                </button>
                <button
                  onClick={() => setActiveTab('messages')}
                  className={`${
                    activeTab === 'messages'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Messages
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`${
                    activeTab === 'settings'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Settings
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Welcome Card */}
            <FadeInView>
              <Card className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white">
                <CardContent>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <h2 className="text-xl font-semibold">Welcome back, Jane!</h2>
                      <p className="mt-1 text-white text-opacity-90">You have 2 active projects and 1 new message.</p>
                    </div>
                    <div className="mt-4 md:mt-0">
                      <Button variant="outline" className="bg-white text-primary-600 border-white hover:bg-white hover:bg-opacity-90">
                        Start New Project
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeInView>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ScaleInView delay={0.1}>
                <Card>
                  <CardContent>
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-primary-100 p-0.5 rounded-sm">
                        <CalendarIcon />
                      </div>
                      <div className="ml-1.5">
                        <h3 className="text-xs font-medium text-neutral-500">Active Projects</h3>
                        <p className="text-lg font-semibold text-neutral-900">2</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </ScaleInView>

              <ScaleInView delay={0.2}>
                <Card>
                  <CardContent>
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-secondary-100 p-0.5 rounded-sm">
                        <MessageIcon />
                      </div>
                      <div className="ml-1.5">
                        <h3 className="text-xs font-medium text-neutral-500">Unread Messages</h3>
                        <p className="text-lg font-semibold text-neutral-900">1</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </ScaleInView>

              <ScaleInView delay={0.3}>
                <Card>
                  <CardContent>
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-accent-100 p-0.5 rounded-sm">
                        <ShieldIcon />
                      </div>
                      <div className="ml-1.5">
                        <h3 className="text-xs font-medium text-neutral-500">Completed Projects</h3>
                        <p className="text-lg font-semibold text-neutral-900">5</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </ScaleInView>
            </div>

            {/* Recent Projects */}
            <FadeInView delay={0.4}>
              <Card>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium text-neutral-900">Recent Projects</h2>
                    <Link to="/projects" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                      View all
                    </Link>
                  </div>

                  <div className="overflow-hidden">
                    <table className="min-w-full divide-y divide-neutral-200">
                      <thead>
                        <tr>
                          <th className="px-6 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                            Project
                          </th>
                          <th className="px-6 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                            Provider
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-neutral-200">
                        {projects.map((project) => (
                          <tr key={project.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                              {project.title}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                project.status === 'In Progress'
                                  ? 'bg-blue-100 text-blue-800'
                                  : project.status === 'Completed'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {project.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                              {project.date}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                              {project.provider}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </FadeInView>

            {/* Recent Messages */}
            <FadeInView delay={0.5}>
              <Card>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium text-neutral-900">Recent Messages</h2>
                    <Link to="/messages" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                      View all
                    </Link>
                  </div>

                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div key={message.id} className="flex items-start p-4 hover:bg-neutral-50 rounded-lg transition-colors">
                        <div className="flex-shrink-0">
                          <div className="h-6 w-6 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium text-xs">
                            {message.from.charAt(0)}
                          </div>
                        </div>
                        <div className="ml-2 flex-1">
                          <div className="flex items-center justify-between">
                            <p className={`text-xs font-medium ${message.unread ? 'text-neutral-900' : 'text-neutral-600'}`}>
                              {message.from}
                              {message.unread && (
                                <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-primary-500"></span>
                              )}
                            </p>
                            <p className="text-xs text-neutral-500">{message.time}</p>
                          </div>
                          <p className="mt-0.5 text-xs text-neutral-600 truncate">{message.preview}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </FadeInView>

            {/* Find Services */}
            <FadeInView delay={0.6}>
              <Card>
                <CardContent>
                  <h2 className="text-lg font-medium text-neutral-900 mb-4">Find Services</h2>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Link to="/services/plumbing" className="group">
                      <div className="flex flex-col items-center p-4 rounded-lg border border-neutral-200 hover:border-primary-500 hover:shadow-sm transition-all">
                        <div className="h-5 w-5 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 group-hover:bg-primary-200 transition-colors">
                          <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                        </div>
                        <span className="mt-2 text-sm font-medium text-neutral-900 group-hover:text-primary-600 transition-colors">Plumbing</span>
                      </div>
                    </Link>

                    <Link to="/services/electrical" className="group">
                      <div className="flex flex-col items-center p-4 rounded-lg border border-neutral-200 hover:border-primary-500 hover:shadow-sm transition-all">
                        <div className="h-5 w-5 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 group-hover:bg-primary-200 transition-colors">
                          <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <span className="mt-2 text-sm font-medium text-neutral-900 group-hover:text-primary-600 transition-colors">Electrical</span>
                      </div>
                    </Link>

                    <Link to="/services/carpentry" className="group">
                      <div className="flex flex-col items-center p-4 rounded-lg border border-neutral-200 hover:border-primary-500 hover:shadow-sm transition-all">
                        <div className="h-5 w-5 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 group-hover:bg-primary-200 transition-colors">
                          <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        </div>
                        <span className="mt-2 text-sm font-medium text-neutral-900 group-hover:text-primary-600 transition-colors">Carpentry</span>
                      </div>
                    </Link>

                    <Link to="/services/painting" className="group">
                      <div className="flex flex-col items-center p-4 rounded-lg border border-neutral-200 hover:border-primary-500 hover:shadow-sm transition-all">
                        <div className="h-5 w-5 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 group-hover:bg-primary-200 transition-colors">
                          <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                          </svg>
                        </div>
                        <span className="mt-2 text-sm font-medium text-neutral-900 group-hover:text-primary-600 transition-colors">Painting</span>
                      </div>
                    </Link>
                  </div>

                  <div className="mt-6 text-center">
                    <Button>
                      Browse All Services
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </FadeInView>
          </div>
        )}

        {activeTab === 'projects' && (
          <div>
            <h2 className="text-xl font-semibold text-neutral-900 mb-6">My Projects</h2>
            {/* Projects content would go here */}
            <p className="text-neutral-600">Projects tab content</p>
          </div>
        )}

        {activeTab === 'messages' && (
          <div>
            <h2 className="text-xl font-semibold text-neutral-900 mb-6">My Messages</h2>
            {/* Messages content would go here */}
            <p className="text-neutral-600">Messages tab content</p>
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <h2 className="text-xl font-semibold text-neutral-900 mb-6">Account Settings</h2>
            {/* Settings content would go here */}
            <p className="text-neutral-600">Settings tab content</p>
          </div>
        )}
      </div>
    </ProfessionalLayout>
  );
};

export default ProfessionalDashboard;
