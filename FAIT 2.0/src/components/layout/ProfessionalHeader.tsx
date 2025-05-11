import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../ui/ButtonNew';

const ProfessionalHeader: React.FC = () => {
  return (
    <header className="bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-primary-600 font-bold text-xl">FAIT</span>
              <span className="text-neutral-900 font-medium ml-1">Co-op</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link to="/services" className="text-neutral-600 hover:text-primary-600 px-3 py-2 text-sm font-medium">
              Services
            </Link>
            <Link to="/pros" className="text-neutral-600 hover:text-primary-600 px-3 py-2 text-sm font-medium">
              Find Pros
            </Link>
            <Link to="/projects" className="text-neutral-600 hover:text-primary-600 px-3 py-2 text-sm font-medium">
              Projects
            </Link>
            <Link to="/pricing" className="text-neutral-600 hover:text-primary-600 px-3 py-2 text-sm font-medium">
              Pricing
            </Link>
          </nav>

          {/* Right side buttons */}
          <div className="flex items-center space-x-4">
            <Link to="/messages" className="text-neutral-600 hover:text-primary-600">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </Link>
            <Link to="/notifications" className="text-neutral-600 hover:text-primary-600">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </Link>

            {/* Profile dropdown placeholder */}
            <div className="relative">
              <button className="flex items-center text-sm rounded-full focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-primary-500">
                <div className="h-5 w-5 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium text-xs">
                  JD
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ProfessionalHeader;
