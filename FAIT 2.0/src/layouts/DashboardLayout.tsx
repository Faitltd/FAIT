import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useFAIT } from '../contexts/FAITContext';
import { UserRole } from '../types/UserRoles';
import NotificationCenter from '../components/communication/NotificationCenter';
import ErrorDisplay from '../components/common/ErrorDisplay';
import { motion, AnimatePresence } from 'framer-motion';
import { ParticleBackground } from '../components/animations';
import {
  Home,
  Users,
  Briefcase,
  Calendar,
  MessageSquare,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  X,
  User,
  Award,
  DollarSign,
  FileText,
  Wrench,
  Shield,
  CreditCard,
  Bank
} from 'lucide-react';

// Navigation items based on user role
const getNavigationItems = (userRole: UserRole | null) => {
  const commonItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
  ];

  const roleSpecificItems = {
    [UserRole.CLIENT]: [
      { name: 'My Projects', href: '/dashboard/projects', icon: Briefcase },
      { name: 'Find Contractors', href: '/dashboard/contractors', icon: Wrench },
      { name: 'Payments', href: '/dashboard/payments', icon: CreditCard },
    ],
    [UserRole.CONTRACTOR]: [
      { name: 'My Jobs', href: '/dashboard/jobs', icon: Briefcase },
      { name: 'Schedule', href: '/dashboard/schedule', icon: Calendar },
      { name: 'Warranty Claims', href: '/dashboard/warranty', icon: Shield },
      { name: 'Payments', href: '/dashboard/payments', icon: CreditCard },
    ],
    [UserRole.ADMIN]: [
      { name: 'Users', href: '/dashboard/users', icon: Users },
      { name: 'Projects', href: '/dashboard/projects', icon: Briefcase },
      { name: 'Reports', href: '/dashboard/reports', icon: FileText },
      { name: 'Payouts', href: '/admin/payouts', icon: Bank },
      { name: 'Stripe Connect', href: '/admin/stripe-connect', icon: CreditCard },
    ],
    [UserRole.ALLY]: [
      { name: 'Partner Projects', href: '/dashboard/partner-projects', icon: Briefcase },
      { name: 'Resources', href: '/dashboard/resources', icon: FileText },
      { name: 'Payments', href: '/dashboard/payments', icon: CreditCard },
    ],
  };

  return [
    ...commonItems,
    ...(userRole && roleSpecificItems[userRole] ? roleSpecificItems[userRole] : []),
  ];
};

const DashboardLayout: React.FC = () => {
  const { user, signOut, loading } = useAuth();
  const { userRole, tokens, error, refreshUserData } = useFAIT();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navigationItems = getNavigationItems(userRole);

  useEffect(() => {
    // Close sidebar when location changes (mobile)
    setSidebarOpen(false);
  }, [location]);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <ParticleBackground particleCount={30} />
        <motion.div
          className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        />
      </div>
    );
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 relative">
      {/* Particle background */}
      <ParticleBackground
        particleCount={40}
        particleColor="rgba(100, 149, 237, 0.2)"
        interactive={true}
      />

      {/* Error display */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <ErrorDisplay
            error={error}
            onRetry={refreshUserData}
          />
        </div>
      )}

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="fixed inset-0 z-40 flex md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 bg-gray-600 bg-opacity-75"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setSidebarOpen(false)}
            />

            {/* Sidebar */}
            <motion.div
              className="relative flex-1 flex flex-col max-w-xs w-full bg-white"
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <motion.button
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={() => setSidebarOpen(false)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <span className="sr-only">Close sidebar</span>
                  <X className="h-6 w-6 text-white" />
                </motion.button>
              </div>

              <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                <div className="flex-shrink-0 flex items-center px-4">
                  <h1 className="text-xl font-bold text-blue-600">FAIT Platform</h1>
                </div>
                <nav className="mt-5 px-2 space-y-1">
                  {navigationItems.map((item, index) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: index * 0.05,
                        duration: 0.3
                      }}
                    >
                      <Link
                        to={item.href}
                        className={`${
                          location.pathname === item.href
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <motion.div
                          whileHover={{ rotate: 5 }}
                          transition={{ duration: 0.2 }}
                        >
                          <item.icon
                            className={`${
                              location.pathname === item.href ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                            } mr-4 flex-shrink-0 h-6 w-6`}
                          />
                        </motion.div>
                        {item.name}
                      </Link>
                    </motion.div>
                  ))}
                </nav>
              </div>

              <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                <div className="flex items-center">
                  <motion.div
                    className="flex-shrink-0"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                      {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  </motion.div>
                  <div className="ml-3">
                    <motion.p
                      className="text-base font-medium text-gray-700"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      {user?.email || 'User'}
                    </motion.p>
                    <motion.button
                      onClick={handleLogout}
                      className="text-sm font-medium text-gray-500 hover:text-gray-700 flex items-center"
                      whileHover={{ x: 3 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <LogOut className="h-4 w-4 mr-1" />
                      Sign out
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="flex-shrink-0 w-14" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <motion.div
          className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <motion.div
              className="flex items-center flex-shrink-0 px-4"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <h1 className="text-xl font-bold text-blue-600">FAIT Platform</h1>
            </motion.div>
            <nav className="mt-5 flex-1 px-2 bg-white space-y-1">
              {navigationItems.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: 0.3 + index * 0.05,
                    duration: 0.3
                  }}
                  whileHover={{ x: 3 }}
                >
                  <Link
                    to={item.href}
                    className={`${
                      location.pathname === item.href
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                  >
                    <motion.div
                      whileHover={{ rotate: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <item.icon
                        className={`${
                          location.pathname === item.href ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                        } mr-3 flex-shrink-0 h-6 w-6`}
                      />
                    </motion.div>
                    {item.name}
                  </Link>
                </motion.div>
              ))}
            </nav>
          </div>
          <motion.div
            className="flex-shrink-0 flex border-t border-gray-200 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <div className="flex items-center">
              <motion.div
                className="flex-shrink-0"
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <div className="h-9 w-9 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
              </motion.div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{user?.email || 'User'}</p>
                <motion.button
                  onClick={handleLogout}
                  className="text-xs font-medium text-gray-500 hover:text-gray-700 flex items-center"
                  whileHover={{ x: 3 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <LogOut className="h-3 w-3 mr-1" />
                  Sign out
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-white">
          <motion.button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            onClick={() => setSidebarOpen(true)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" />
          </motion.button>
        </div>

        {/* Top navigation */}
        <motion.div
          className="sticky top-0 z-10 bg-white shadow"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="hidden md:ml-6 md:flex md:space-x-8">
                  {/* Desktop navigation links if needed */}
                </div>
              </div>
              <div className="flex items-center">
                {/* FAIT Tokens */}
                <motion.div
                  className="flex items-center bg-blue-50 px-3 py-1 rounded-full mr-4"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 0 8px rgba(59, 130, 246, 0.5)"
                  }}
                >
                  <motion.div
                    animate={{ rotate: [0, 10, 0] }}
                    transition={{
                      repeat: Infinity,
                      repeatType: "mirror",
                      duration: 2,
                      ease: "easeInOut"
                    }}
                  >
                    <DollarSign className="h-4 w-4 text-blue-500 mr-1" />
                  </motion.div>
                  <span className="text-sm font-medium text-blue-700">{tokens || 0} Tokens</span>
                </motion.div>

                {/* Notifications Center */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.6 }}
                >
                  <NotificationCenter className="mr-3" />
                </motion.div>

                {/* Profile dropdown */}
                <motion.div
                  className="ml-3 relative"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.7 }}
                >
                  <div>
                    <motion.button
                      type="button"
                      className="bg-white rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="sr-only">Open user menu</span>
                      <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                        {user?.email?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    </motion.button>
                  </div>

                  {/* User menu dropdown */}
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        {[
                          { to: "/dashboard/profile", icon: User, label: "Your Profile" },
                          { to: "/dashboard/settings", icon: Settings, label: "Settings" },
                          { to: "/dashboard/mastery", icon: Award, label: "Mastery Score" },
                          { to: "/help", icon: HelpCircle, label: "Help & Support" }
                        ].map((item, index) => (
                          <motion.div
                            key={item.to}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{
                              opacity: 1,
                              x: 0,
                              transition: {
                                delay: 0.05 * index
                              }
                            }}
                          >
                            <Link
                              to={item.to}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              <div className="flex items-center">
                                <item.icon className="h-4 w-4 mr-2" />
                                {item.label}
                              </div>
                            </Link>
                          </motion.div>
                        ))}
                        <motion.div
                          className="border-t border-gray-100 mt-1 pt-1"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{
                            opacity: 1,
                            x: 0,
                            transition: {
                              delay: 0.2
                            }
                          }}
                        >
                          <motion.button
                            onClick={() => {
                              setUserMenuOpen(false);
                              handleLogout();
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            whileHover={{
                              backgroundColor: "rgba(243, 244, 246, 1)",
                              x: 3
                            }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="flex items-center">
                              <LogOut className="h-4 w-4 mr-2" />
                              Sign out
                            </div>
                          </motion.button>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main content */}
        <motion.main
          className="flex-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Outlet />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.main>
      </div>
    </div>
  );
};

export default DashboardLayout;
