import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/UnifiedAuthContext';
import NotificationBell from './NotificationBell';
import MockNotificationBell from './MockNotificationBell';
import { isUsingLocalAuth } from '../lib/supabase';
import { isAdmin } from '../lib/admin';

// Import icons individually for better tree-shaking
import {
  Home,
  Search,
  Tool,
  User,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Settings,
  HelpCircle,
  MessageCircle,
  Calendar,
  Award,
  Shield,
  FileText,
  DollarSign,
  Building2,
  Gift,
  Vote
} from 'lucide-react';

const EnhancedNavbar: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNavDropdownOpen, setIsNavDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [userType, setUserType] = useState<'client' | 'service_agent' | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [visible, setVisible] = useState(true);

  // Check if user is admin and get user type
  useEffect(() => {
    const checkUserStatus = async () => {
      if (!user) {
        setIsAdminUser(false);
        setUserType(null);
        return;
      }

      try {
        // Check admin status
        const adminStatus = await isAdmin();
        setIsAdminUser(adminStatus);

        // Get user type from user metadata
        if (user.user_metadata?.user_type) {
          setUserType(user.user_metadata.user_type as 'client' | 'service_agent');
        } else if (user.email?.includes('admin')) {
          setUserType('admin');
        } else if (user.email?.includes('service')) {
          setUserType('service_agent');
        } else {
          setUserType('client');
        }
      } catch (err) {
        console.error('Error checking user status:', err);
        setIsAdminUser(false);
        setUserType('client'); // Default fallback
      }
    };

    checkUserStatus();
  }, [user]);

  // Handle scroll behavior for sticky navbar
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;

      // Set scrolled state for styling
      setIsScrolled(currentScrollPos > 10);

      // Hide/show navbar based on scroll direction
      const isScrollingDown = prevScrollPos < currentScrollPos;
      const isScrollingUp = prevScrollPos > currentScrollPos;

      // Only hide when scrolling down and not at the top
      // Always show when scrolling up
      setVisible(isScrollingUp || currentScrollPos < 50);

      setPrevScrollPos(currentScrollPos);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prevScrollPos]);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isNavDropdownOpen || isUserDropdownOpen) {
        const target = event.target as HTMLElement;
        if (!target.closest('#nav-dropdown') && !target.closest('#user-dropdown')) {
          setIsNavDropdownOpen(false);
          setIsUserDropdownOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isNavDropdownOpen, isUserDropdownOpen]);

  // Navbar animation variants
  const navbarVariants = {
    visible: { y: 0, opacity: 1 },
    hidden: { y: -100, opacity: 0 }
  };

  // Dropdown animation variants
  const dropdownVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    },
    exit: {
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white shadow-md'
          : 'bg-gradient-to-r from-company-lightblue via-company-lightpink to-company-lightorange'
      }`}
      initial="visible"
      animate={visible ? "visible" : "hidden"}
      variants={navbarVariants}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and primary navigation */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img src="/fait-logo.svg" alt="FAIT Co-Op Logo" className="h-8 w-8" />
              <span className={`ml-2 text-xl font-ivy ${isScrolled ? 'text-gray-900' : 'text-white'}`}>
                FAIT Co-Op
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:ml-8 md:flex md:space-x-6">
              <Link
                to="/"
                className={`flex items-center px-3 py-2 rounded-md text-sm font-inter font-medium transition-colors ${
                  isActive('/') && !location.pathname.startsWith('/dashboard')
                    ? `${isScrolled ? 'bg-company-lightpink text-white' : 'bg-white bg-opacity-20 text-white'}`
                    : `${isScrolled ? 'text-gray-700 hover:text-company-lightpink' : 'text-white hover:bg-white hover:bg-opacity-20'}`
                }`}
              >
                <Home className="h-4 w-4 mr-1" />
                Home
              </Link>

              <Link
                to="/services"
                className={`flex items-center px-3 py-2 rounded-md text-sm font-inter font-medium transition-colors ${
                  isActive('/services')
                    ? `${isScrolled ? 'bg-company-lightpink text-white' : 'bg-white bg-opacity-20 text-white'}`
                    : `${isScrolled ? 'text-gray-700 hover:text-company-lightpink' : 'text-white hover:bg-white hover:bg-opacity-20'}`
                }`}
              >
                <Tool className="h-4 w-4 mr-1" />
                Services
              </Link>

              <Link
                to="/help"
                className={`flex items-center px-3 py-2 rounded-md text-sm font-inter font-medium transition-colors ${
                  isActive('/help')
                    ? `${isScrolled ? 'bg-company-lightpink text-white' : 'bg-white bg-opacity-20 text-white'}`
                    : `${isScrolled ? 'text-gray-700 hover:text-company-lightpink' : 'text-white hover:bg-white hover:bg-opacity-20'}`
                }`}
              >
                <HelpCircle className="h-4 w-4 mr-1" />
                Help
              </Link>

              {/* More dropdown */}
              <div className="relative" id="nav-dropdown">
                <button
                  onClick={() => setIsNavDropdownOpen(!isNavDropdownOpen)}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-inter font-medium transition-colors ${
                    isScrolled ? 'text-gray-700 hover:text-company-lightpink' : 'text-white hover:bg-white hover:bg-opacity-20'
                  }`}
                  aria-expanded={isNavDropdownOpen}
                >
                  More
                  <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${isNavDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isNavDropdownOpen && (
                    <motion.div
                      className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      variants={dropdownVariants}
                    >
                      <div className="py-1" role="menu">
                        <Link
                          to="/estimates"
                          className="flex items-center px-4 py-2 text-sm font-inter text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsNavDropdownOpen(false)}
                        >
                          <FileText className="mr-3 h-5 w-5 text-company-lightpink" />
                          Estimates
                        </Link>
                        <Link
                          to="/warranty"
                          className="flex items-center px-4 py-2 text-sm font-inter text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsNavDropdownOpen(false)}
                        >
                          <Shield className="mr-3 h-5 w-5 text-company-lightpink" />
                          Warranties
                        </Link>
                        <Link
                          to="/community"
                          className="flex items-center px-4 py-2 text-sm font-inter text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsNavDropdownOpen(false)}
                        >
                          <MessageCircle className="mr-3 h-5 w-5 text-company-lightpink" />
                          Community
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Right side - user menu, notifications, etc. */}
          <div className="flex items-center">
            {/* Search button */}
            <button
              className={`p-2 rounded-full ${
                isScrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white hover:bg-opacity-20'
              }`}
              onClick={() => navigate('/services/search')}
            >
              <Search className="h-5 w-5" />
            </button>

            {/* User is logged in */}
            {user ? (
              <>
                {/* Notification bell */}
                <div className="ml-4">
                  {isUsingLocalAuth() ? <MockNotificationBell /> : <NotificationBell />}
                </div>

                {/* User dropdown */}
                <div className="ml-4 relative" id="user-dropdown">
                  <button
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className={`flex items-center p-1 rounded-full ${
                      isScrolled ? 'hover:bg-gray-100' : 'hover:bg-white hover:bg-opacity-20'
                    }`}
                  >
                    <span className="sr-only">Open user menu</span>
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      isScrolled ? 'bg-company-lightpink text-white' : 'bg-white text-company-lightpink'
                    }`}>
                      <User className="h-5 w-5" />
                    </div>
                  </button>

                  <AnimatePresence>
                    {isUserDropdownOpen && (
                      <motion.div
                        className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={dropdownVariants}
                      >
                        <div className="py-1" role="menu">
                          {/* Dashboard link based on user type */}
                          {isAdminUser ? (
                            <Link
                              to="/dashboard/admin"
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => setIsUserDropdownOpen(false)}
                            >
                              <DollarSign className="mr-3 h-5 w-5 text-company-lightpink" />
                              Admin Dashboard
                            </Link>
                          ) : userType === 'service_agent' ? (
                            <Link
                              to="/dashboard/service-agent"
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => setIsUserDropdownOpen(false)}
                            >
                              <Tool className="mr-3 h-5 w-5 text-company-lightpink" />
                              Service Dashboard
                            </Link>
                          ) : (
                            <Link
                              to="/dashboard/client"
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => setIsUserDropdownOpen(false)}
                            >
                              <User className="mr-3 h-5 w-5 text-company-lightpink" />
                              My Dashboard
                            </Link>
                          )}

                          <Link
                            to="/settings/profile"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setIsUserDropdownOpen(false)}
                          >
                            <Settings className="mr-3 h-5 w-5 text-company-lightpink" />
                            Settings
                          </Link>

                          <button
                            onClick={() => {
                              setIsUserDropdownOpen(false);
                              handleLogout();
                            }}
                            className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <LogOut className="mr-3 h-5 w-5 text-company-lightpink" />
                            Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              /* User is not logged in */
              <div className="flex items-center ml-4 space-x-2">
                <Link
                  to="/login"
                  className={`px-3 py-2 rounded-md text-sm font-inter font-medium ${
                    isScrolled
                      ? 'text-gray-700 hover:text-company-lightpink'
                      : 'text-white hover:bg-white hover:bg-opacity-20'
                  }`}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className={`px-4 py-2 rounded-md text-sm font-inter font-medium ${
                    isScrolled
                      ? 'bg-company-lightpink text-white hover:bg-company-lighterpink'
                      : 'bg-white text-company-lightpink hover:bg-opacity-90'
                  }`}
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="ml-4 md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`p-2 rounded-md ${
                  isScrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white hover:bg-opacity-20'
                }`}
              >
                <span className="sr-only">{isMobileMenuOpen ? 'Close menu' : 'Open menu'}</span>
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="md:hidden bg-white shadow-lg"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/"
                className="flex items-center px-3 py-2 rounded-md text-base font-inter font-medium text-gray-700 hover:bg-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Home className="h-5 w-5 mr-2 text-company-lightpink" />
                Home
              </Link>
              <Link
                to="/services"
                className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Tool className="h-5 w-5 mr-2 text-company-lightpink" />
                Services
              </Link>
              <Link
                to="/help"
                className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <HelpCircle className="h-5 w-5 mr-2 text-company-lightpink" />
                Help
              </Link>

              {/* Additional mobile menu items */}
              <Link
                to="/estimates"
                className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FileText className="h-5 w-5 mr-2 text-company-lightpink" />
                Estimates
              </Link>
              <Link
                to="/warranty"
                className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Shield className="h-5 w-5 mr-2 text-company-lightpink" />
                Warranties
              </Link>
              <Link
                to="/community"
                className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <MessageCircle className="h-5 w-5 mr-2 text-company-lightpink" />
                Community
              </Link>

              {/* User-specific mobile menu items */}
              {user ? (
                <>
                  {isAdminUser ? (
                    <Link
                      to="/dashboard/admin"
                      className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <DollarSign className="h-5 w-5 mr-2 text-company-lightpink" />
                      Admin Dashboard
                    </Link>
                  ) : userType === 'service_agent' ? (
                    <Link
                      to="/dashboard/service-agent"
                      className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Tool className="h-5 w-5 mr-2 text-company-lightpink" />
                      Service Dashboard
                    </Link>
                  ) : (
                    <Link
                      to="/dashboard/client"
                      className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <User className="h-5 w-5 mr-2 text-company-lightpink" />
                      My Dashboard
                    </Link>
                  )}
                  <Link
                    to="/settings/profile"
                    className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Settings className="h-5 w-5 mr-2 text-company-lightpink" />
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex w-full items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut className="h-5 w-5 mr-2 text-company-lightpink" />
                    Logout
                  </button>
                </>
              ) : (
                <div className="pt-4 pb-3 border-t border-gray-200">
                  <div className="flex items-center px-3">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-company-lightpink flex items-center justify-center text-white">
                        <User className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium text-gray-800">Guest User</div>
                      <div className="text-sm font-medium text-gray-500">Not logged in</div>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1">
                    <Link
                      to="/login"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default EnhancedNavbar;
