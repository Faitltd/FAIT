import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Building2, Gift, Vote, UserCircle, Menu, X, Shield, PenTool as Tool, Settings, Search, Calendar, MessageSquare, FileText, Award, Home, DollarSign, MessageCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import NotificationBell from './NotificationBell';
import { isAdmin } from '../lib/admin';

const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [userType, setUserType] = useState<'client' | 'service_agent' | null>(null);

  // Check if user is admin and get user type
  useEffect(() => {
    const checkUserStatus = async () => {
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

        // Get user type
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;
        setUserType(profileData.user_type as 'client' | 'service_agent');
      } catch (err) {
        console.error('Error checking user status:', err);
        setIsAdminUser(false);
      }
    };

    checkUserStatus();
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img src="/fait-logo.svg" alt="FAIT Co-Op Logo" className="h-8 w-8" />
              <span className="ml-2 text-xl font-bold text-gray-900">FAIT Co-Op</span>
            </Link>
            <div className="hidden md:ml-6 md:flex md:space-x-4">
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
              <Link
                to="/forum"
                className={`text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/forum') ? 'bg-gray-100' : ''
                }`}
              >
                Community
              </Link>

              {/* Show these links only for authenticated clients */}
              {user && userType === 'client' && (
                <>
                  <Link
                    to="/dashboard/client/bookings"
                    className={`text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium ${
                      isActive('/dashboard/client/bookings') ? 'bg-gray-100' : ''
                    }`}
                  >
                    Bookings
                  </Link>
                  <Link
                    to="/dashboard/client/messages"
                    className={`text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium ${
                      isActive('/dashboard/client/messages') ? 'bg-gray-100' : ''
                    }`}
                  >
                    Messages
                  </Link>
                  <Link
                    to="/dashboard/client/warranty"
                    className={`text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium ${
                      isActive('/dashboard/client/warranty') ? 'bg-gray-100' : ''
                    }`}
                  >
                    Warranty
                  </Link>
                  <Link
                    to="/dashboard/client/enhanced"
                    className={`text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium ${
                      isActive('/dashboard/client/enhanced') ? 'bg-gray-100' : ''
                    }`}
                  >
                    Enhanced Dashboard
                  </Link>
                  <Link
                    to="/dashboard/client/referrals"
                    className={`text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium ${
                      isActive('/dashboard/client/referrals') ? 'bg-gray-100' : ''
                    }`}
                  >
                    Referrals
                  </Link>
                  <Link
                    to="/dashboard/client/points"
                    className={`text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium ${
                      isActive('/dashboard/client/points') ? 'bg-gray-100' : ''
                    }`}
                  >
                    Points
                  </Link>
                  <Link
                    to="/dashboard/client/achievements"
                    className={`text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium ${
                      isActive('/dashboard/client/achievements') ? 'bg-gray-100' : ''
                    }`}
                  >
                    Achievements
                  </Link>
                </>
              )}

              {/* Show these links only for service agents */}
              {userType === 'service_agent' && (
                <>
                  <Link
                    to="/dashboard/service-agent/listings"
                    className={`text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium ${
                      isActive('/dashboard/service-agent/listings') ? 'bg-gray-100' : ''
                    }`}
                  >
                    My Services
                  </Link>
                  <Link
                    to="/dashboard/service-agent/messages"
                    className={`text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium ${
                      isActive('/dashboard/service-agent/messages') ? 'bg-gray-100' : ''
                    }`}
                  >
                    Messages
                  </Link>
                  <Link
                    to="/dashboard/service-agent/referrals"
                    className={`text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium ${
                      isActive('/dashboard/service-agent/referrals') ? 'bg-gray-100' : ''
                    }`}
                  >
                    Grow Your Network
                  </Link>
                  <Link
                    to="/dashboard/service-agent/points"
                    className={`text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium ${
                      isActive('/dashboard/service-agent/points') ? 'bg-gray-100' : ''
                    }`}
                  >
                    Points
                  </Link>
                  <Link
                    to="/dashboard/service-agent/achievements"
                    className={`text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium ${
                      isActive('/dashboard/service-agent/achievements') ? 'bg-gray-100' : ''
                    }`}
                  >
                    Achievements
                  </Link>
                </>
              )}

              <Link
                to="/messaging/sms"
                className={`text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/messaging/sms') ? 'bg-gray-100' : ''
                }`}
              >
                SMS
              </Link>
              <Link
                to="/subscription/dashboard"
                className={`text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/subscription') ? 'bg-gray-100' : ''
                }`}
              >
                Membership
              </Link>
              {user && (
                <>
                  <Link
                    to="/points"
                    className={`text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium ${
                      isActive('/points') ? 'bg-gray-100' : ''
                    }`}
                  >
                    Points
                  </Link>
                  <Link
                    to="/governance"
                    className={`text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium ${
                      isActive('/governance') ? 'bg-gray-100' : ''
                    }`}
                  >
                    Governance
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center">
            {user ? (
              <>
                <NotificationBell />
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
                  >
                    Logout
                  </button>
                </div>
                <div className="md:hidden">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                  >
                    {isMenuOpen ? (
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
      {isMenuOpen && (
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
            >
              Services
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
            {user && (
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
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;