import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { isAdmin } from '../../lib/admin';
import {
  Menu,
  X,
  Home,
  User,
  Package,
  MessageSquare,
  Calendar,
  Settings,
  Shield,
  LogOut,
  LogIn,
  BarChart,
  FileText
} from 'lucide-react';
import NotificationCenter from '../notifications/NotificationCenter';
import LoadingSpinner from '../LoadingSpinner';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ children, title }) => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [userType, setUserType] = useState<string | null>(null);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkUserType = async () => {
      if (user) {
        // Get user type from localStorage or fetch from database
        const storedUserType = localStorage.getItem('userType');
        setUserType(storedUserType);

        // Check if user is admin
        const adminStatus = await isAdmin(user.id);
        setIsAdminUser(adminStatus);
      }
      setLoading(false);
    };

    checkUserType();
  }, [user]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const getNavItems = () => {
    if (!user || loading) return [];

    const commonItems = [
      { name: 'Home', href: '/', icon: <Home className="h-5 w-5" /> }
    ];

    const clientItems = [
      { name: 'Services', href: '/services', icon: <Package className="h-5 w-5" /> },
      { name: 'Bookings', href: '/dashboard/client', icon: <Calendar className="h-5 w-5" /> },
      { name: 'Estimates', href: '/estimates', icon: <FileText className="h-5 w-5" /> },
      { name: 'Messages', href: '/messages', icon: <MessageSquare className="h-5 w-5" /> },
      { name: 'Warranties', href: '/warranty', icon: <Shield className="h-5 w-5" /> },
      { name: 'Gamification', href: '/gamification', icon: <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg> }
    ];

    const serviceAgentItems = [
      { name: 'Dashboard', href: '/dashboard/service-agent', icon: <BarChart className="h-5 w-5" /> },
      { name: 'My Services', href: '/services/manage', icon: <Package className="h-5 w-5" /> },
      { name: 'Bookings', href: '/bookings', icon: <Calendar className="h-5 w-5" /> },
      { name: 'Estimates', href: '/dashboard/service-agent/estimates', icon: <FileText className="h-5 w-5" /> },
      { name: 'Messages', href: '/messages', icon: <MessageSquare className="h-5 w-5" /> },
      { name: 'Warranties', href: '/warranty', icon: <Shield className="h-5 w-5" /> },
      { name: 'Gamification', href: '/gamification', icon: <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg> }
    ];

    const adminItems = [
      { name: 'Admin Dashboard', href: '/admin/dashboard', icon: <BarChart className="h-5 w-5" /> },
      { name: 'Users', href: '/admin/users', icon: <User className="h-5 w-5" /> },
      { name: 'Subscriptions', href: '/admin/subscriptions', icon: <Package className="h-5 w-5" /> },
      { name: 'Warranty Claims', href: '/admin/warranty-claims', icon: <Shield className="h-5 w-5" /> },
      { name: 'Analytics', href: '/analytics', icon: <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg> },
      { name: 'Gamification', href: '/gamification', icon: <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg> }
    ];

    if (isAdminUser) {
      return [...commonItems, ...adminItems];
    } else if (userType === 'service_agent' || userType === 'contractor') {
      return [...commonItems, ...serviceAgentItems];
    } else {
      return [...commonItems, ...clientItems];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and mobile menu button */}
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="text-blue-600 font-bold text-xl">
                  FAIT Co-Op
                </Link>
              </div>

              {/* Desktop navigation */}
              <nav className="hidden md:ml-6 md:flex md:space-x-8">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      location.pathname === item.href
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsMenuOpen(true)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                <span className="sr-only">Open main menu</span>
                <Menu className="block h-6 w-6" />
              </button>
            </div>

            {/* User menu and notifications */}
            <div className="hidden md:ml-6 md:flex md:items-center">
              {user ? (
                <>
                  <NotificationCenter />

                  {/* User dropdown */}
                  <div className="ml-3 relative">
                    <div>
                      <button
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <span className="sr-only">Open user menu</span>
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                          {user.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      </button>
                    </div>

                    {isUserMenuOpen && (
                      <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-50">
                        <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                          <p className="font-medium truncate">{user.email}</p>
                          <p className="text-xs text-gray-500 capitalize">{userType || 'User'}</p>
                        </div>
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          Profile Settings
                        </Link>
                        <Link
                          to="/subscription/dashboard"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          Subscription
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Sign out
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex space-x-4">
                  <Link
                    to="/login"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="fixed inset-0 z-40 flex">
              {/* Overlay */}
              <div
                className="fixed inset-0 bg-gray-600 bg-opacity-75"
                onClick={() => setIsMenuOpen(false)}
              ></div>

              {/* Menu panel */}
              <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
                <div className="absolute top-0 right-0 -mr-12 pt-2">
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  >
                    <span className="sr-only">Close sidebar</span>
                    <X className="h-6 w-6 text-white" />
                  </button>
                </div>

                <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                  <div className="flex-shrink-0 flex items-center px-4">
                    <span className="text-blue-600 font-bold text-xl">FAIT Co-Op</span>
                  </div>

                  {user ? (
                    <div className="mt-5 px-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                          {user.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-700 truncate">{user.email}</p>
                          <p className="text-xs text-gray-500 capitalize">{userType || 'User'}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-5 px-4 flex space-x-2">
                      <Link
                        to="/login"
                        className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        Sign in
                      </Link>
                      <Link
                        to="/register"
                        className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Register
                      </Link>
                    </div>
                  )}

                  <nav className="mt-5 px-2 space-y-1">
                    {navItems.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                          location.pathname === item.href
                            ? 'bg-gray-100 text-gray-900'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <span className="mr-4 h-6 w-6">{item.icon}</span>
                        {item.name}
                      </Link>
                    ))}

                    {user && (
                      <>
                        <Link
                          to="/profile"
                          className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        >
                          <Settings className="mr-4 h-6 w-6" />
                          Profile Settings
                        </Link>
                        <Link
                          to="/subscription/dashboard"
                          className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        >
                          <Package className="mr-4 h-6 w-6" />
                          Subscription
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        >
                          <LogOut className="mr-4 h-6 w-6" />
                          Sign out
                        </button>
                      </>
                    )}
                  </nav>
                </div>
              </div>

              <div className="flex-shrink-0 w-14">
                {/* Force sidebar to shrink to fit close icon */}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {title && (
            <div className="px-4 sm:px-0 mb-6">
              <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : (
            children
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-gray-500">
                &copy; {new Date().getFullYear()} FAIT Co-Op. All rights reserved.
              </p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-sm text-gray-500 hover:text-gray-900">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-900">
                Terms of Service
              </a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-900">
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ResponsiveLayout;
