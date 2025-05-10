import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

// Import icons individually for better tree-shaking
import Building2 from 'lucide-react/dist/esm/icons/building-2';
import Gift from 'lucide-react/dist/esm/icons/gift';
import Vote from 'lucide-react/dist/esm/icons/vote';
import UserCircle from 'lucide-react/dist/esm/icons/user-circle';
import Menu from 'lucide-react/dist/esm/icons/menu';
import X from 'lucide-react/dist/esm/icons/x';
import Shield from 'lucide-react/dist/esm/icons/shield';
import PenTool from 'lucide-react/dist/esm/icons/pen-tool';
import Settings from 'lucide-react/dist/esm/icons/settings';
import Search from 'lucide-react/dist/esm/icons/search';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import MessageSquare from 'lucide-react/dist/esm/icons/message-square';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import Award from 'lucide-react/dist/esm/icons/award';
import Home from 'lucide-react/dist/esm/icons/home';
import DollarSign from 'lucide-react/dist/esm/icons/dollar-sign';
import MessageCircle from 'lucide-react/dist/esm/icons/message-circle';

// Alias PenTool as Tool to maintain compatibility with existing code
const Tool = PenTool;
import { useAuth } from '../contexts/UnifiedAuthContext';
import { supabase, isUsingLocalAuth } from '../lib/supabase';
import NotificationBell from './NotificationBell';
import MockNotificationBell from './MockNotificationBell';
import { isAdmin } from '../lib/admin';

const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNavDropdownOpen, setIsNavDropdownOpen] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [userType, setUserType] = useState<'client' | 'service_agent' | null>(null);

  // Check if user is admin and get user type
  useEffect(() => {
    const checkUserStatus = async () => {
      // Check for standalone mode first (highest priority)
      const standaloneAuth = localStorage.getItem('standalone_auth');
      if (standaloneAuth) {
        try {
          const authData = JSON.parse(standaloneAuth);
          console.log('Found standalone auth:', authData);

          if (authData.userType === 'admin') {
            setIsAdminUser(true);
          } else {
            setIsAdminUser(false);
          }

          setUserType(authData.userType as 'client' | 'service_agent');

          // Don't add a banner here since the standalone page adds its own

          return;
        } catch (err) {
          console.error('Error parsing standalone auth:', err);
        }
      }

      // Check for direct bypass next
      const directBypassAuth = localStorage.getItem('direct_bypass_auth');
      if (directBypassAuth) {
        try {
          const authData = JSON.parse(directBypassAuth);
          console.log('Found direct bypass auth:', authData);

          if (authData.userType === 'admin') {
            setIsAdminUser(true);
          } else {
            setIsAdminUser(false);
          }

          setUserType(authData.userType as 'client' | 'service_agent');

          // Add a banner to show direct bypass is active
          const banner = document.createElement('div');
          banner.className = 'bg-black text-white text-center py-2 text-sm font-bold';
          banner.innerHTML = 'DIRECT BYPASS MODE ACTIVE';

          // Only add if it doesn't exist already
          if (!document.querySelector('.direct-bypass-banner')) {
            banner.classList.add('direct-bypass-banner');
            document.body.prepend(banner);
          }

          return;
        } catch (err) {
          console.error('Error parsing direct bypass auth:', err);
        }
      } else {
        // Remove direct bypass banner if it exists
        const directBanner = document.querySelector('.direct-bypass-banner');
        if (directBanner) {
          directBanner.remove();
        }
      }



      if (!user) {
        console.log('No user, setting isAdminUser to false');
        setIsAdminUser(false);
        setUserType(null);
        return;
      }

      console.log('Checking user status for user:', user.id);

      try {
        // Check admin status
        const adminStatus = await isAdmin();
        console.log('Admin status result:', adminStatus);
        setIsAdminUser(adminStatus);

        // Check if we're using local auth
        const isLocalAuth = localStorage.getItem('useLocalAuth') === 'true';

        if (isLocalAuth) {
          // For local auth, get user type from user metadata
          if (user.user_metadata?.user_type) {
            setUserType(user.user_metadata.user_type as 'client' | 'service_agent');
          } else if (user.email?.includes('admin')) {
            setUserType('admin');
          } else if (user.email?.includes('service')) {
            setUserType('service_agent');
          } else {
            setUserType('client');
          }
        } else {
          // For Supabase auth, get user type from profiles table
          try {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('user_type')
              .eq('id', user.id)
              .single();

            if (profileError) throw profileError;
            setUserType(profileData.user_type as 'client' | 'service_agent');
          } catch (profileErr) {
            console.error('Error fetching profile data:', profileErr);
            // Fallback to user metadata
            if (user.user_metadata?.user_type) {
              setUserType(user.user_metadata.user_type as 'client' | 'service_agent');
            } else {
              setUserType('client'); // Default to client
            }
          }
        }
      } catch (err) {
        console.error('Error checking user status:', err);
        setIsAdminUser(false);

        // Set a default user type based on email if available
        if (user.email) {
          if (user.email.includes('admin')) {
            setUserType('admin');
          } else if (user.email.includes('service')) {
            setUserType('service_agent');
          } else {
            setUserType('client');
          }
        } else {
          setUserType('client'); // Default fallback
        }
      }
    };

    checkUserStatus();
  }, [user]);

  const handleLogout = async () => {
    // Clear all auth types
    localStorage.removeItem('direct_bypass_auth');
    localStorage.removeItem('standalone_auth');

    // Sign out using our unified auth context
    await signOut();

    // Navigate to home
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <nav style={{ backgroundColor: '#c0e2ff' }} className="shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img src="/fait-logo.svg" alt="FAIT Co-Op Logo" className="h-8 w-8" />
              <span className="ml-2 text-xl font-bold text-gray-900">FAIT Co-Op</span>
            </Link>
            <div className="hidden md:ml-6 md:flex md:space-x-4">
              {/* Keep only essential links in the main header */}
              <Link
                to="/"
                className={`text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/') && !location.pathname.startsWith('/dashboard') && !location.pathname.startsWith('/services') ? 'bg-gray-100' : ''
                }`}
              >
                Home
              </Link>
              <Link
                to="/projects"
                className={`text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname.startsWith('/projects') ? 'bg-gray-100' : ''
                }`}
              >
                Projects
              </Link>
              <Link
                to="/services"
                className={`text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/services') || isActive('/services/search') ? 'bg-gray-100' : ''
                }`}
              >
                Services
              </Link>
            </div>
          </div>

          <div className="flex items-center">
            {/* Navigation dropdown menu */}
            <div className="relative mr-4 hidden md:block">
              <button
                onClick={() => setIsNavDropdownOpen(!isNavDropdownOpen)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                style={{ backgroundColor: '#c0e2ff' }}
                data-testid="more-options-button"
              >
                <span>More Options</span>
                <svg className="ml-2 -mr-0.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>

              {isNavDropdownOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1" role="menu" aria-orientation="vertical">
                    <Link
                      to="/services"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsNavDropdownOpen(false)}
                      data-testid="dropdown-link-services"
                    >
                      <Tool className="mr-3 h-5 w-5" />
                      Services
                    </Link>
                    <Link
                      to="/estimates"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsNavDropdownOpen(false)}
                      data-testid="dropdown-link-estimates"
                    >
                      <FileText className="mr-3 h-5 w-5" />
                      Estimates
                    </Link>
                    <Link
                      to="/warranty"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsNavDropdownOpen(false)}
                      data-testid="dropdown-link-warranties"
                    >
                      <Shield className="mr-3 h-5 w-5" />
                      Warranties
                    </Link>
                    <Link
                      to="/gamification"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsNavDropdownOpen(false)}
                      data-testid="dropdown-link-gamification"
                    >
                      <Award className="mr-3 h-5 w-5" />
                      Gamification
                    </Link>
                    <Link
                      to="/forum"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsNavDropdownOpen(false)}
                    >
                      <MessageCircle className="mr-3 h-5 w-5" />
                      Community
                    </Link>

                    {/* Show these links only for authenticated clients */}
                    {user && userType === 'client' && (
                      <>
                        <Link
                          to="/dashboard/client/bookings"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsNavDropdownOpen(false)}
                        >
                          <Calendar className="mr-3 h-5 w-5" />
                          Bookings
                        </Link>
                        <Link
                          to="/dashboard/client/messages"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsNavDropdownOpen(false)}
                        >
                          <MessageSquare className="mr-3 h-5 w-5" />
                          Messages
                        </Link>
                        <Link
                          to="/dashboard/client/warranty"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsNavDropdownOpen(false)}
                        >
                          <Shield className="mr-3 h-5 w-5" />
                          Warranty
                        </Link>
                      </>
                    )}

                    {/* Show these links only for service agents */}
                    {userType === 'service_agent' && (
                      <>
                        <Link
                          to="/dashboard/service-agent/listings"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsNavDropdownOpen(false)}
                        >
                          <Tool className="mr-3 h-5 w-5" />
                          My Services
                        </Link>
                        <Link
                          to="/dashboard/service-agent/messages"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsNavDropdownOpen(false)}
                        >
                          <MessageSquare className="mr-3 h-5 w-5" />
                          Messages
                        </Link>
                        <Link
                          to="/dashboard/service-agent/referrals"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsNavDropdownOpen(false)}
                        >
                          <Gift className="mr-3 h-5 w-5" />
                          Grow Your Network
                        </Link>
                      </>
                    )}

                    <Link
                      to="/messaging/sms"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsNavDropdownOpen(false)}
                    >
                      <MessageCircle className="mr-3 h-5 w-5" />
                      SMS
                    </Link>
                    <Link
                      to="/subscription/dashboard"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsNavDropdownOpen(false)}
                    >
                      <Building2 className="mr-3 h-5 w-5" />
                      Membership
                    </Link>
                    {user && (
                      <>
                        <Link
                          to="/points"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsNavDropdownOpen(false)}
                        >
                          <Award className="mr-3 h-5 w-5" />
                          Points
                        </Link>
                        <Link
                          to="/governance"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsNavDropdownOpen(false)}
                        >
                          <Vote className="mr-3 h-5 w-5" />
                          Governance
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {user || localStorage.getItem('direct_bypass_auth') || localStorage.getItem('standalone_auth') ? (
              <>
                {isUsingLocalAuth() ? <MockNotificationBell /> : <NotificationBell />}
                <div className="hidden md:ml-4 md:flex md:items-center md:space-x-4">
                  {isAdminUser ? (
                    <Link
                      to="/dashboard/admin"
                      className={`text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium ${
                        location.pathname.startsWith('/dashboard/admin') ? 'bg-gray-100' : ''
                      }`}
                    >
                      Admin Dashboard
                    </Link>
                  ) : userType === 'service_agent' ? (
                    <Link
                      to="/dashboard/service-agent"
                      className={`text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium ${
                        location.pathname.startsWith('/dashboard/service-agent') ? 'bg-gray-100' : ''
                      }`}
                    >
                      Service Agent Dashboard
                    </Link>
                  ) : (
                    <Link
                      to="/dashboard/client"
                      className={`text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium ${
                        location.pathname.startsWith('/dashboard/client') ? 'bg-gray-100' : ''
                      }`}
                    >
                      Client Dashboard
                    </Link>
                  )}
                  <Link
                    to="/settings/profile"
                    className={`text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium ${
                      location.pathname.startsWith('/settings') ? 'bg-gray-100' : ''
                    }`}
                  >
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                    data-testid="logout-button"
                  >
                    Logout
                  </button>
                </div>
                <div className="md:hidden">
                  <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                  >
                    {isMobileMenuOpen ? (
                      <X className="h-6 w-6" />
                    ) : (
                      <Menu className="h-6 w-6" />
                    )}
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  data-testid="login-button"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Join Now
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
            >
              Home
            </Link>
            <Link
              to="/projects"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
            >
              Projects
            </Link>
            <Link
              to="/services"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              data-testid="mobile-dropdown-link-services"
            >
              Services
            </Link>
            <Link
              to="/estimates"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              data-testid="mobile-dropdown-link-estimates"
            >
              Estimates
            </Link>
            <Link
              to="/warranty"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              data-testid="mobile-dropdown-link-warranties"
            >
              Warranties
            </Link>
            <Link
              to="/gamification"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              data-testid="mobile-dropdown-link-gamification"
            >
              Gamification
            </Link>
            <Link
              to="/forum"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
            >
              Community
            </Link>

            {/* Show these links only for authenticated clients */}
            {user && userType === 'client' && (
              <>
                <Link
                  to="/dashboard/client/bookings"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                >
                  Bookings
                </Link>
                <Link
                  to="/dashboard/client/messages"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                >
                  Messages
                </Link>
                <Link
                  to="/dashboard/client/warranty"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                >
                  Warranty
                </Link>
                <Link
                  to="/dashboard/client/enhanced"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                >
                  Enhanced Dashboard
                </Link>
              </>
            )}

            {/* Show these links only for service agents */}
            {userType === 'service_agent' && (
              <>
                <Link
                  to="/dashboard/service-agent/listings"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                >
                  My Services
                </Link>
                <Link
                  to="/dashboard/service-agent/messages"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                >
                  Messages
                </Link>
              </>
            )}

            <Link
              to="/messaging/sms"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
            >
              SMS
            </Link>
            <Link
              to="/subscription/dashboard"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
            >
              Membership
            </Link>
            {(user || localStorage.getItem('direct_bypass_auth') || localStorage.getItem('standalone_auth')) ? (
              <>
                <Link
                  to="/points"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                >
                  Points
                </Link>
                <Link
                  to="/governance"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                >
                  Governance
                </Link>
                {isAdminUser ? (
                  <Link
                    to="/dashboard/admin"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  >
                    Admin Dashboard
                  </Link>
                ) : userType === 'service_agent' ? (
                  <Link
                    to="/dashboard/service-agent"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  >
                    Service Agent Dashboard
                  </Link>
                ) : (
                  <Link
                    to="/dashboard/client"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  >
                    Client Dashboard
                  </Link>
                )}
                <Link
                  to="/settings/profile"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                >
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  data-testid="mobile-logout-button"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  data-testid="mobile-login-button"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;