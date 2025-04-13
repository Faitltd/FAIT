import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Building2, Gift, Vote, UserCircle, Menu, X, Shield, PenTool as Tool, Settings } from 'lucide-react';
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

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">FAIT Co-Op</span>
            </Link>
            <div className="hidden md:ml-6 md:flex md:space-x-4">
              <Link
                to="/services"
                className={`text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/services') ? 'bg-gray-100' : ''
                }`}
              >
                <span className="flex items-center">
                  <Tool className="h-4 w-4 mr-1" />
                  Services
                </span>
              </Link>
              {user && (
                <>
                  <Link
                    to="/points"
                    className={`text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium ${
                      isActive('/points') ? 'bg-gray-100' : ''
                    }`}
                  >
                    <span className="flex items-center">
                      <Gift className="h-4 w-4 mr-1" />
                      Points & Rewards
                    </span>
                  </Link>
                  <Link
                    to="/governance"
                    className={`text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium ${
                      isActive('/governance') ? 'bg-gray-100' : ''
                    }`}
                  >
                    <span className="flex items-center">
                      <Vote className="h-4 w-4 mr-1" />
                      Governance
                    </span>
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
                      <span className="flex items-center">
                        <Shield className="h-4 w-4 mr-1" />
                        Admin Dashboard
                      </span>
                    </Link>
                  ) : userType === 'service_agent' ? (
                    <Link
                      to="/dashboard/service-agent"
                      className={`text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium ${
                        location.pathname.startsWith('/dashboard/service-agent') ? 'bg-gray-100' : ''
                      }`}
                    >
                      <span className="flex items-center">
                        <Tool className="h-4 w-4 mr-1" />
                        Service Agent Dashboard
                      </span>
                    </Link>
                  ) : (
                    <Link
                      to="/dashboard/client"
                      className={`text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium ${
                        location.pathname.startsWith('/dashboard/client') ? 'bg-gray-100' : ''
                      }`}
                    >
                      <span className="flex items-center">
                        <UserCircle className="h-4 w-4 mr-1" />
                        Client Dashboard
                      </span>
                    </Link>
                  )}
                  <Link
                    to="/settings/profile"
                    className={`text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium ${
                      location.pathname.startsWith('/settings') ? 'bg-gray-100' : ''
                    }`}
                  >
                    <span className="flex items-center">
                      <Settings className="h-4 w-4 mr-1" />
                      Settings
                    </span>
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
              to="/services"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
            >
              <span className="flex items-center">
                <Tool className="h-5 w-5 mr-2" />
                Services
              </span>
            </Link>
            {user && (
              <>
                <Link
                  to="/points"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                >
                  <span className="flex items-center">
                    <Gift className="h-5 w-5 mr-2" />
                    Points & Rewards
                  </span>
                </Link>
                <Link
                  to="/governance"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                >
                  <span className="flex items-center">
                    <Vote className="h-5 w-5 mr-2" />
                    Governance
                  </span>
                </Link>
                {isAdminUser ? (
                  <Link
                    to="/dashboard/admin"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  >
                    <span className="flex items-center">
                      <Shield className="h-5 w-5 mr-2" />
                      Admin Dashboard
                    </span>
                  </Link>
                ) : userType === 'service_agent' ? (
                  <Link
                    to="/dashboard/service-agent"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  >
                    <span className="flex items-center">
                      <Tool className="h-5 w-5 mr-2" />
                      Service Agent Dashboard
                    </span>
                  </Link>
                ) : (
                  <Link
                    to="/dashboard/client"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  >
                    <span className="flex items-center">
                      <UserCircle className="h-5 w-5 mr-2" />
                      Client Dashboard
                    </span>
                  </Link>
                )}
                <Link
                  to="/settings/profile"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                >
                  <span className="flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    Settings
                  </span>
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