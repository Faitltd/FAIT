import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Search, Calendar, MessageSquare, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { isAdmin } from '../../lib/admin';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  userTypes: string[];
}

const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const userType = user?.user_metadata?.user_type || 'client';
  const isAdminUser = user ? isAdmin(user) : false;

  // Define navigation items with their respective icons and user type access
  const navItems: NavItem[] = [
    {
      path: '/',
      label: 'Home',
      icon: <Home size={24} />,
      userTypes: ['client', 'service_agent', 'contractor', 'admin'],
    },
    {
      path: '/services',
      label: 'Find',
      icon: <Search size={24} />,
      userTypes: ['client', 'service_agent', 'contractor', 'admin'],
    },
    {
      path: '/projects',
      label: 'Projects',
      icon: <Calendar size={24} />,
      userTypes: ['client', 'service_agent', 'contractor', 'admin'],
    },
    {
      path: '/messages',
      label: 'Messages',
      icon: <MessageSquare size={24} />,
      userTypes: ['client', 'service_agent', 'contractor', 'admin'],
    },
    {
      path: '/profile',
      label: 'Profile',
      icon: <User size={24} />,
      userTypes: ['client', 'service_agent', 'contractor', 'admin'],
    },
  ];

  // Filter nav items based on user type
  const filteredNavItems = navItems.filter(item => {
    if (isAdminUser) return true;
    return item.userTypes.includes(userType);
  });

  return (
    <AnimatePresence>
      <motion.div
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 md:hidden"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <div className="flex justify-around items-center h-16">
          {filteredNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex flex-col items-center justify-center w-full h-full"
              >
                <div className="relative">
                  {isActive ? (
                    <motion.div
                      className="absolute -top-1 -left-1 -right-1 -bottom-1 bg-blue-100 rounded-full"
                      layoutId="bottomNavIndicator"
                      transition={{ duration: 0.2 }}
                    />
                  ) : null}
                  <div className={`relative z-10 ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                    {item.icon}
                  </div>
                </div>
                <span className={`text-xs mt-1 ${isActive ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MobileBottomNav;
