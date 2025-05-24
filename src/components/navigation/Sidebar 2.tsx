import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Briefcase, 
  Users, 
  MessageSquare, 
  Calendar, 
  FileText, 
  CreditCard, 
  Settings, 
  HelpCircle 
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };
  
  const navItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: <Home className="h-5 w-5" />,
      dataCy: 'sidebar-dashboard'
    },
    {
      name: 'Projects',
      path: '/projects',
      icon: <Briefcase className="h-5 w-5" />,
      dataCy: 'sidebar-projects'
    },
    {
      name: 'Service Providers',
      path: '/service-providers',
      icon: <Users className="h-5 w-5" />,
      dataCy: 'sidebar-service-providers'
    },
    {
      name: 'Messages',
      path: '/messages',
      icon: <MessageSquare className="h-5 w-5" />,
      dataCy: 'sidebar-messages'
    },
    {
      name: 'Bookings',
      path: '/bookings',
      icon: <Calendar className="h-5 w-5" />,
      dataCy: 'sidebar-bookings'
    },
    {
      name: 'Estimates',
      path: '/estimates',
      icon: <FileText className="h-5 w-5" />,
      dataCy: 'sidebar-estimates'
    },
    {
      name: 'Billing',
      path: '/billing',
      icon: <CreditCard className="h-5 w-5" />,
      dataCy: 'sidebar-billing'
    }
  ];
  
  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex flex-col h-0 flex-1 border-r border-gray-200 bg-white">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex-1 px-2 space-y-1 bg-white">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  data-cy={item.dataCy}
                  className={`${
                    isActive(item.path)
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                >
                  <div
                    className={`${
                      isActive(item.path)
                        ? 'text-gray-500'
                        : 'text-gray-400 group-hover:text-gray-500'
                    } mr-3 flex-shrink-0`}
                  >
                    {item.icon}
                  </div>
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <Link
              to="/settings"
              className="flex-shrink-0 w-full group block"
            >
              <div className="flex items-center">
                <div>
                  <Settings className="inline-block h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    Settings
                  </p>
                </div>
              </div>
            </Link>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <Link
              to="/help"
              className="flex-shrink-0 w-full group block"
            >
              <div className="flex items-center">
                <div>
                  <HelpCircle className="inline-block h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    Help & Support
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
