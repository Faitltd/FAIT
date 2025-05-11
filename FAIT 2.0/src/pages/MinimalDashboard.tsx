import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// Extremely minimal icons
const TinyCalendarIcon = () => (
  <svg className="h-2 w-2 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const TinyMessageIcon = () => (
  <svg className="h-2 w-2 text-secondary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
  </svg>
);

const TinyShieldIcon = () => (
  <svg className="h-2 w-2 text-accent-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const MinimalDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Minimal Header */}
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <span className="text-primary-600 font-bold text-sm">FAIT</span>
              <span className="text-neutral-900 font-medium text-sm ml-1">Co-op</span>
            </div>
            <div className="flex items-center space-x-3">
              <Link to="/messages" className="text-neutral-600 hover:text-primary-600">
                <svg className="h-2 w-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </Link>
              <Link to="/notifications" className="text-neutral-600 hover:text-primary-600">
                <svg className="h-2 w-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </Link>
              <div className="h-3 w-3 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium text-[8px]">
                JD
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-base font-semibold text-neutral-900">Dashboard</h1>
        
        {/* Stats */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="bg-white border border-neutral-200 rounded-md p-2">
            <div className="flex items-center">
              <div className="bg-primary-100 p-0.5 rounded-sm">
                <TinyCalendarIcon />
              </div>
              <div className="ml-1">
                <div className="text-[10px] text-neutral-500">Active Projects</div>
                <div className="text-xs font-medium">2</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-neutral-200 rounded-md p-2">
            <div className="flex items-center">
              <div className="bg-secondary-100 p-0.5 rounded-sm">
                <TinyMessageIcon />
              </div>
              <div className="ml-1">
                <div className="text-[10px] text-neutral-500">Messages</div>
                <div className="text-xs font-medium">5</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-neutral-200 rounded-md p-2">
            <div className="flex items-center">
              <div className="bg-accent-100 p-0.5 rounded-sm">
                <TinyShieldIcon />
              </div>
              <div className="ml-1">
                <div className="text-[10px] text-neutral-500">Warranties</div>
                <div className="text-xs font-medium">3</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Projects */}
        <div className="mt-6">
          <h2 className="text-sm font-medium text-neutral-900">Recent Projects</h2>
          <div className="mt-2 border border-neutral-200 rounded-md overflow-hidden">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-2 py-1 text-left text-[10px] font-medium text-neutral-500">Project</th>
                  <th className="px-2 py-1 text-left text-[10px] font-medium text-neutral-500">Status</th>
                  <th className="px-2 py-1 text-left text-[10px] font-medium text-neutral-500">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                <tr>
                  <td className="px-2 py-1 text-[10px] text-neutral-900">Kitchen Renovation</td>
                  <td className="px-2 py-1">
                    <span className="inline-flex items-center px-1 py-0.5 rounded-sm text-[8px] font-medium bg-blue-100 text-blue-800">
                      In Progress
                    </span>
                  </td>
                  <td className="px-2 py-1 text-[10px] text-neutral-500">2023-05-15</td>
                </tr>
                <tr>
                  <td className="px-2 py-1 text-[10px] text-neutral-900">Bathroom Remodel</td>
                  <td className="px-2 py-1">
                    <span className="inline-flex items-center px-1 py-0.5 rounded-sm text-[8px] font-medium bg-yellow-100 text-yellow-800">
                      Scheduled
                    </span>
                  </td>
                  <td className="px-2 py-1 text-[10px] text-neutral-500">2023-06-10</td>
                </tr>
                <tr>
                  <td className="px-2 py-1 text-[10px] text-neutral-900">Deck Installation</td>
                  <td className="px-2 py-1">
                    <span className="inline-flex items-center px-1 py-0.5 rounded-sm text-[8px] font-medium bg-green-100 text-green-800">
                      Completed
                    </span>
                  </td>
                  <td className="px-2 py-1 text-[10px] text-neutral-500">2023-04-22</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Services */}
        <div className="mt-6">
          <h2 className="text-sm font-medium text-neutral-900">Services</h2>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {['Plumbing', 'Electrical', 'Carpentry', 'Painting'].map((service, index) => (
              <Link key={index} to={`/services/${service.toLowerCase()}`} className="block">
                <div className="border border-neutral-200 rounded-md p-2 hover:border-primary-500 transition-colors">
                  <div className="flex flex-col items-center">
                    <div className="h-3 w-3 rounded-full bg-primary-100 flex items-center justify-center">
                      <svg className="h-1.5 w-1.5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <span className="mt-1 text-[10px] font-medium text-neutral-900">{service}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MinimalDashboard;
