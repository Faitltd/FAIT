import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  currentPage?: string;
}

const CommonNavbar: React.FC<NavbarProps> = ({ currentPage = 'home' }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const userEmail = localStorage.getItem('userEmail') || '';
  const userType = localStorage.getItem('userType') || '';
  const navigate = useNavigate();

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/'); }} className="flex items-center">
                <img
                  className="h-8 w-8 mr-2"
                  src="/fait-logo.svg"
                  alt="FAIT Co-Op Logo"
                />
                <span className="text-xl font-bold text-gray-900">FAIT Co-Op</span>
              </a>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); navigate('/'); }}
                className={`${
                  currentPage === 'home'
                    ? 'border-company-lightpink text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                Home
              </a>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); navigate('/services'); }}
                className={`${
                  currentPage === 'services'
                    ? 'border-company-lightpink text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                Services
              </a>
              {userType === 'client' && (
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); navigate('/dashboard/client'); }}
                  className={`${
                    currentPage === 'client-dashboard'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Client Dashboard
                </a>
              )}
              {userType === 'service_agent' && (
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); navigate('/dashboard/service-agent'); }}
                  className={`${
                    currentPage === 'service-agent-dashboard'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Service Agent Dashboard
                </a>
              )}
              {userType === 'admin' && (
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); navigate('/dashboard/admin'); }}
                  className={`${
                    currentPage === 'admin-dashboard'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Admin Dashboard
                </a>
              )}
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); navigate('/subscription/dashboard'); }}
                className={`${
                  currentPage === 'subscription'
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                Subscription
              </a>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {userEmail ? (
              <div className="ml-3 relative group">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-800">
                      {userEmail.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="ml-2 text-sm text-gray-700">{userEmail}</span>
                </div>
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 hidden group-hover:block z-10">
                  <a href="#" onClick={(e) => { e.preventDefault(); navigate('/test-login'); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Switch Account
                  </a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={(e) => {
                    e.preventDefault();
                    localStorage.removeItem('userEmail');
                    localStorage.removeItem('userType');
                    navigate('/');
                  }}>
                    Sign Out
                  </a>
                </div>
              </div>
            ) : (
              <div>
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); navigate('/test-login'); }}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  Sign In
                </a>
              </div>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-expanded="false"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className={`${mobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg
                className={`${mobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className={`${mobileMenuOpen ? 'block' : 'hidden'} sm:hidden`}>
        <div className="pt-2 pb-3 space-y-1">
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); navigate('/'); }}
            className={`${
              currentPage === 'home'
                ? 'bg-company-lightblue border-company-lightpink text-gray-800'
                : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
            } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
          >
            Home
          </a>
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); navigate('/services'); }}
            className={`${
              currentPage === 'services'
                ? 'bg-company-lightblue border-company-lightpink text-gray-800'
                : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
            } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
          >
            Services
          </a>
          {userType === 'client' && (
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); navigate('/dashboard/client'); }}
              className={`${
                currentPage === 'client-dashboard'
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
              } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
            >
              Client Dashboard
            </a>
          )}
          {userType === 'service_agent' && (
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); navigate('/dashboard/service-agent'); }}
              className={`${
                currentPage === 'service-agent-dashboard'
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
              } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
            >
              Service Agent Dashboard
            </a>
          )}
          {userType === 'admin' && (
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); navigate('/dashboard/admin'); }}
              className={`${
                currentPage === 'admin-dashboard'
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
              } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
            >
              Admin Dashboard
            </a>
          )}
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); navigate('/subscription/dashboard'); }}
            className={`${
              currentPage === 'subscription'
                ? 'bg-blue-50 border-blue-500 text-blue-700'
                : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
            } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
          >
            Subscription
          </a>
        </div>
        <div className="pt-4 pb-3 border-t border-gray-200">
          {userEmail ? (
            <>
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-800">
                      {userEmail.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">{userEmail}</div>
                  <div className="text-sm font-medium text-gray-500">
                    {userType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); navigate('/test-login'); }}
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                >
                  Switch Account
                </a>
                <a
                  href="#"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  onClick={(e) => {
                    e.preventDefault();
                    localStorage.removeItem('userEmail');
                    localStorage.removeItem('userType');
                    navigate('/');
                  }}
                >
                  Sign Out
                </a>
              </div>
            </>
          ) : (
            <div className="mt-3 space-y-1">
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); navigate('/test-login'); }}
                className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
              >
                Sign In
              </a>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default CommonNavbar;
