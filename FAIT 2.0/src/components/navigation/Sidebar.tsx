import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Home,
  User,
  Package,
  MessageSquare,
  Calendar,
  Settings,
  Shield,
  LogOut,
  X,
  FileText,
  Star,
  CreditCard,
  Users,
  Bell,
  CheckSquare
} from 'lucide-react';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const { user, isAdmin, signOut } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  // Define navigation items based on user type
  const getNavItems = () => {
    const clientItems = [
      { name: 'Dashboard', path: '/dashboard/client', icon: <Home className="h-5 w-5" /> },
      { name: 'Service Providers', path: '/dashboard/client/providers', icon: <Users className="h-5 w-5" /> },
      { name: 'Bookings', path: '/dashboard/client/bookings', icon: <Calendar className="h-5 w-5" /> },
      { name: 'Tasks', path: '/dashboard/tasks', icon: <CheckSquare className="h-5 w-5" /> },
      { name: 'Messages', path: '/dashboard/client/messages', icon: <MessageSquare className="h-5 w-5" /> },
      { name: 'Warranties', path: '/dashboard/client/warranties', icon: <Shield className="h-5 w-5" /> },
      { name: 'Reviews', path: '/dashboard/client/reviews', icon: <Star className="h-5 w-5" /> },
      { name: 'Subscription', path: '/dashboard/client/subscription', icon: <CreditCard className="h-5 w-5" /> },
    ];

    const serviceAgentItems = [
      { name: 'Dashboard', path: '/dashboard/service-agent', icon: <Home className="h-5 w-5" /> },
      { name: 'Services', path: '/dashboard/service-agent/services', icon: <Package className="h-5 w-5" /> },
      { name: 'Bookings', path: '/dashboard/service-agent/bookings', icon: <Calendar className="h-5 w-5" /> },
      { name: 'Tasks', path: '/dashboard/tasks', icon: <CheckSquare className="h-5 w-5" /> },
      { name: 'Messages', path: '/dashboard/service-agent/messages', icon: <MessageSquare className="h-5 w-5" /> },
      { name: 'Warranties', path: '/dashboard/service-agent/warranties', icon: <Shield className="h-5 w-5" /> },
      { name: 'Reviews', path: '/dashboard/service-agent/reviews', icon: <Star className="h-5 w-5" /> },
      { name: 'Subscription', path: '/dashboard/service-agent/subscription', icon: <CreditCard className="h-5 w-5" /> },
    ];

    const adminItems = [
      { name: 'Dashboard', path: '/dashboard/admin', icon: <Home className="h-5 w-5" /> },
      { name: 'Users', path: '/dashboard/admin/users', icon: <Users className="h-5 w-5" /> },
      { name: 'Service Agents', path: '/dashboard/admin/service-agents', icon: <User className="h-5 w-5" /> },
      { name: 'Services', path: '/dashboard/admin/services', icon: <Package className="h-5 w-5" /> },
      { name: 'Bookings', path: '/dashboard/admin/bookings', icon: <Calendar className="h-5 w-5" /> },
      { name: 'Tasks', path: '/dashboard/tasks', icon: <CheckSquare className="h-5 w-5" /> },
      { name: 'Messages', path: '/dashboard/admin/messages', icon: <MessageSquare className="h-5 w-5" /> },
      { name: 'Warranties', path: '/dashboard/admin/warranties', icon: <Shield className="h-5 w-5" /> },
      { name: 'Subscriptions', path: '/dashboard/admin/subscriptions', icon: <CreditCard className="h-5 w-5" /> },
      { name: 'Reports', path: '/dashboard/admin/reports', icon: <FileText className="h-5 w-5" /> },
      { name: 'Settings', path: '/dashboard/admin/settings', icon: <Settings className="h-5 w-5" /> },
    ];

    if (isAdmin) {
      return adminItems;
    }

    // Check if user is service agent or client
    if (location.pathname.includes('/dashboard/service-agent')) {
      return serviceAgentItems;
    }

    return clientItems;
  };

  const navItems = getNavItems();

  // Mobile sidebar
  const mobileSidebar = (
    <div className={`fixed inset-0 flex z-40 md:hidden ${open ? 'block' : 'hidden'}`}>
      <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={onClose}></div>

      <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
        <div className="absolute top-0 right-0 -mr-12 pt-2">
          <button
            type="button"
            className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            onClick={onClose}
          >
            <span className="sr-only">Close sidebar</span>
            <X className="h-6 w-6 text-white" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
          <div className="flex-shrink-0 flex items-center px-4">
            <span className="text-xl font-bold text-primary-600">FAIT Co-op</span>
          </div>
          <nav className="mt-5 px-2 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`${
                  isActive(item.path)
                    ? 'bg-primary-100 text-primary-900'
                    : 'text-gray-600 hover:bg-primary-50 hover:text-primary-900'
                } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                onClick={onClose}
              >
                <div
                  className={`${
                    isActive(item.path)
                      ? 'text-primary-500'
                      : 'text-gray-400 group-hover:text-primary-500'
                  } mr-4 flex-shrink-0`}
                >
                  {item.icon}
                </div>
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
          <div className="flex-shrink-0 group block">
            <div className="flex items-center">
              <div>
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                  <User className="h-6 w-6" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-base font-medium text-gray-700 group-hover:text-gray-900">
                  {user?.email}
                </p>
                <button
                  onClick={signOut}
                  className="text-sm font-medium text-gray-500 group-hover:text-gray-700 flex items-center"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-shrink-0 w-14">
        {/* Force sidebar to shrink to fit close icon */}
      </div>
    </div>
  );

  // Desktop sidebar
  const desktopSidebar = (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex flex-col h-0 flex-1 border-r border-gray-200 bg-white">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <span className="text-xl font-bold text-primary-600">FAIT Co-op</span>
            </div>
            <nav className="mt-5 flex-1 px-2 bg-white space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`${
                    isActive(item.path)
                      ? 'bg-primary-100 text-primary-900'
                      : 'text-gray-600 hover:bg-primary-50 hover:text-primary-900'
                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                >
                  <div
                    className={`${
                      isActive(item.path)
                        ? 'text-primary-500'
                        : 'text-gray-400 group-hover:text-primary-500'
                    } mr-3 flex-shrink-0`}
                  >
                    {item.icon}
                  </div>
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex-shrink-0 w-full group block">
              <div className="flex items-center">
                <div>
                  <div className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                    <User className="h-5 w-5" />
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900 truncate">
                    {user?.email}
                  </p>
                  <button
                    onClick={signOut}
                    className="text-xs font-medium text-gray-500 group-hover:text-gray-700 flex items-center"
                  >
                    <LogOut className="h-3 w-3 mr-1" />
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {mobileSidebar}
      {desktopSidebar}
    </>
  );
};

export default Sidebar;
