import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import NotificationBell from './notifications/NotificationBell';

// Supabase client is now imported from lib/supabaseClient.js

const MainLayout = ({ children, currentPage }) => {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        if (user) {
          // Get user type
          const { data: profile } = await supabase
            .from('profiles')
            .select('user_type')
            .eq('id', user.id)
            .single();

          setUserType(profile?.user_type);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const getNavItems = () => {
    if (userType === 'admin') {
      return [
        { name: 'Dashboard', href: '/dashboard', current: currentPage === 'dashboard' },
        { name: 'Users', href: '/admin/users', current: currentPage === 'users' },
        { name: 'Services', href: '/admin/services', current: currentPage === 'services' },
        { name: 'Bookings', href: '/admin/bookings', current: currentPage === 'bookings' },
        { name: 'Warranty Claims', href: '/admin/warranty-claims', current: currentPage === 'warranty-claims' },
        { name: 'Audit Logs', href: '/admin/audit-logs', current: currentPage === 'audit-logs' },
        { name: 'Settings', href: '/admin/settings', current: currentPage === 'settings' }
      ];
    } else if (userType === 'service_agent') {
      return [
        { name: 'Dashboard', href: '/dashboard', current: currentPage === 'dashboard' },
        { name: 'Services', href: '/services', current: currentPage === 'services' },
        { name: 'Bookings', href: '/bookings', current: currentPage === 'bookings' },
        { name: 'Messages', href: '/messages', current: currentPage === 'messages' },
        { name: 'Availability', href: '/availability', current: currentPage === 'availability' },
        { name: 'Warranty', href: '/warranty', current: currentPage === 'warranty' },
        { name: 'Warranty Claims', href: '/warranty/claims', current: currentPage === 'warranty-claims' },
        { name: 'Subscription', href: '/subscription/dashboard', current: currentPage === 'subscription' }
      ];
    } else {
      // Client
      return [
        { name: 'Dashboard', href: '/dashboard', current: currentPage === 'dashboard' },
        { name: 'Services', href: '/services', current: currentPage === 'services' || currentPage === 'search' },
        { name: 'My Bookings', href: '/bookings', current: currentPage === 'bookings' },
        { name: 'Messages', href: '/messages', current: currentPage === 'messages' },
        { name: 'Warranty', href: '/warranty', current: currentPage === 'warranty' },
        { name: 'Warranty Claims', href: '/warranty/claims', current: currentPage === 'warranty-claims' },
        { name: 'Subscription', href: '/subscription/dashboard', current: currentPage === 'subscription' }
      ];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="flex items-center">
                  <img
                    className="h-8 w-8"
                    src="/fait-logo.svg"
                    alt="FAIT Co-op"
                  />
                  <span className="ml-2 text-xl font-bold text-gray-900">FAIT Co-Op</span>
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`${
                      item.current
                        ? 'border-company-lightpink text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              {user && (
                <>
                  <Link
                    to="/notifications"
                    className="mr-4"
                  >
                    <NotificationBell />
                  </Link>

                  <div className="ml-3 relative">
                    <div>
                      <button
                        type="button"
                        className="bg-white rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        id="user-menu-button"
                        aria-expanded={isProfileMenuOpen}
                        aria-haspopup="true"
                        onClick={toggleProfileMenu}
                      >
                        <span className="sr-only">Open user menu</span>
                        <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-gray-600 font-medium">
                            {user.email?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                      </button>
                    </div>

                    {isProfileMenuOpen && (
                      <div
                        className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                        role="menu"
                        aria-orientation="vertical"
                        aria-labelledby="user-menu-button"
                        tabIndex="-1"
                      >
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          role="menuitem"
                          tabIndex="-1"
                          id="user-menu-item-0"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          Your Profile
                        </Link>
                        <Link
                          to="/subscription/dashboard"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          role="menuitem"
                          tabIndex="-1"
                          id="user-menu-item-1"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          Subscription
                        </Link>
                        <button
                          type="button"
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          role="menuitem"
                          tabIndex="-1"
                          id="user-menu-item-2"
                          onClick={handleSignOut}
                        >
                          Sign out
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}

              {!user && !loading && (
                <div className="flex space-x-4">
                  <Link
                    to="/login"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/signup"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
            <div className="-mr-2 flex items-center sm:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                aria-expanded={isMenuOpen}
                onClick={toggleMenu}
              >
                <span className="sr-only">Open main menu</span>
                <svg
                  className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
                <svg
                  className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`${isMenuOpen ? 'block' : 'hidden'} sm:hidden`}>
          <div className="pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`${
                  item.current
                    ? 'bg-company-lightblue border-company-lightpink text-gray-800'
                    : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {user && (
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                    <span className="text-gray-600 font-medium">
                      {user.email?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">
                    {user.email}
                  </div>
                  <div className="text-sm font-medium text-gray-500">
                    {userType?.charAt(0).toUpperCase() + userType?.slice(1).replace('_', ' ')}
                  </div>
                </div>
                <Link
                  to="/notifications"
                  className="ml-auto flex-shrink-0 bg-white p-1 rounded-full text-gray-400 hover:text-gray-500"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="sr-only">View notifications</span>
                  <svg
                    className="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                </Link>
              </div>
              <div className="mt-3 space-y-1">
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Your Profile
                </Link>
                <Link
                  to="/subscription/dashboard"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Subscription
                </Link>
                <button
                  type="button"
                  className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  onClick={handleSignOut}
                >
                  Sign out
                </button>
              </div>
            </div>
          )}

          {!user && !loading && (
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="space-y-1 px-4">
                <Link
                  to="/login"
                  className="block text-center px-4 py-2 text-base font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="block text-center px-4 py-2 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign up
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      <main>{children}</main>

      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
          <nav className="-mx-5 -my-2 flex flex-wrap justify-center" aria-label="Footer">
            <div className="px-5 py-2">
              <Link to="/about" className="text-base text-gray-500 hover:text-gray-900">
                About
              </Link>
            </div>
            <div className="px-5 py-2">
              <Link to="/contact" className="text-base text-gray-500 hover:text-gray-900">
                Contact
              </Link>
            </div>
            <div className="px-5 py-2">
              <Link to="/privacy" className="text-base text-gray-500 hover:text-gray-900">
                Privacy
              </Link>
            </div>
            <div className="px-5 py-2">
              <Link to="/terms" className="text-base text-gray-500 hover:text-gray-900">
                Terms
              </Link>
            </div>
          </nav>
          <p className="mt-8 text-center text-base text-gray-400">
            &copy; {new Date().getFullYear()} FAIT Co-op. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
