import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ChevronDown,
  Menu,
  X,
  Home,
  Wrench,
  Info,
  Mail,
  MapPin,
  Users,
  FileText,
  Calculator,
  Hammer,
  DollarSign
} from 'lucide-react';

// Define the menu item interface
interface MenuItem {
  label: string;
  path?: string;
  children?: MenuItem[];
  isExternal?: boolean;
  icon?: React.ReactNode;
}

// Define the menu items
const menuItems: MenuItem[] = [
  {
    label: 'Home',
    path: '/',
    icon: <Home size={16} />
  },
  {
    label: 'Services',
    icon: <Wrench size={16} />,
    children: [
      {
        label: 'All Services',
        path: '/services',
        icon: <Wrench size={16} />
      },
      {
        label: 'Remodeling',
        path: '/calculator/remodeling',
        icon: <Calculator size={16} />
      },
      {
        label: 'Handyman Tasks',
        path: '/calculator/handyman',
        icon: <Hammer size={16} />
      },
      {
        label: 'Get Estimate',
        path: '/calculator/estimate',
        icon: <DollarSign size={16} />
      }
    ]
  },
  {
    label: 'About Us',
    icon: <Info size={16} />,
    children: [
      {
        label: 'Our Story',
        path: '/enhanced-about',
        icon: <FileText size={16} />
      },
      {
        label: 'Team',
        path: '/team',
        icon: <Users size={16} />
      },
      {
        label: 'Mission & Values',
        path: '/mission',
        icon: <Info size={16} />
      }
    ]
  },
  {
    label: 'Projects',
    path: '/projects',
    icon: <FileText size={16} />
  },
  {
    label: 'Contact',
    path: '/contact',
    icon: <Mail size={16} />
  },
  {
    label: 'FAIT Local',
    path: '/local',
    icon: <MapPin size={16} />
  }
];

interface MenuBarProps {
  className?: string;
}

const MenuBar: React.FC<MenuBarProps> = ({ className = '' }) => {
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSubmenuOpen, setMobileSubmenuOpen] = useState<number | null>(null);
  const dropdownRefs = useRef<(HTMLDivElement | null)[]>([]);
  const navigate = useNavigate();
  const location = useLocation();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuIndex !== null) {
        const dropdown = dropdownRefs.current[openMenuIndex];
        if (dropdown && !dropdown.contains(event.target as Node)) {
          setOpenMenuIndex(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuIndex]);

  // Handle menu item click
  const handleMenuItemClick = (index: number, item: MenuItem) => {
    if (item.children) {
      setOpenMenuIndex(openMenuIndex === index ? null : index);
    } else if (item.path) {
      if (item.isExternal) {
        window.open(item.path, '_blank');
      } else {
        navigate(item.path);
        setOpenMenuIndex(null);
        setMobileMenuOpen(false);
      }
    }
  };

  // Toggle mobile submenu
  const toggleMobileSubmenu = (index: number) => {
    setMobileSubmenuOpen(mobileSubmenuOpen === index ? null : index);
  };

  // Check if a menu item is active
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className={`bg-white border-b border-gray-200 ${className}`} style={{ backgroundColor: '#f0f8ff' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop Menu */}
        <div className="hidden md:flex justify-between">
          <div className="flex space-x-4 lg:space-x-8 overflow-x-auto">
            {menuItems.map((item, index) => (
              <div
                key={index}
                ref={el => dropdownRefs.current[index] = el}
                className="relative group hover:bg-blue-50 rounded-md transition-colors duration-150"
              >
                {item.path && !item.children ? (
                  <Link
                    to={item.path}
                    className={`inline-flex items-center px-3 py-3 text-sm font-medium border-b-2 ${
                      isActive(item.path)
                        ? 'border-company-lightpink text-gray-900 font-semibold'
                        : 'border-transparent text-gray-700 hover:border-gray-300 hover:text-gray-900'
                    }`}
                  >
                    {item.icon && <span className="mr-1.5">{item.icon}</span>}
                    {item.label}
                  </Link>
                ) : (
                  <button
                    onClick={() => handleMenuItemClick(index, item)}
                    className={`inline-flex items-center px-3 py-3 text-sm font-medium border-b-2 border-transparent text-gray-700 hover:border-gray-300 hover:text-gray-900`}
                  >
                    {item.icon && <span className="mr-1.5">{item.icon}</span>}
                    {item.label}
                    {item.children && (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    )}
                  </button>
                )}

                {/* Dropdown menu */}
                {item.children && (
                  <div
                    className={`absolute left-0 mt-1 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 transition-all duration-200 ${
                      openMenuIndex === index ? 'opacity-100 transform translate-y-0' : 'opacity-0 invisible transform -translate-y-2'
                    }`}
                  >
                    <div className="py-1" role="menu" aria-orientation="vertical">
                      {item.children.map((child, childIndex) => (
                        <Link
                          key={childIndex}
                          to={child.path || '#'}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                          onClick={() => setOpenMenuIndex(null)}
                        >
                          {child.icon && <span className="mr-2">{child.icon}</span>}
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex justify-between items-center py-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-300"
            aria-expanded="false"
          >
            <span className="sr-only">Open main menu</span>
            {mobileMenuOpen ? (
              <X className="block h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="block h-6 w-6" aria-hidden="true" />
            )}
          </button>
          <span className="text-sm font-medium text-gray-700">Services & Navigation</span>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200">
          <div className="pt-2 pb-3 space-y-1">
            {menuItems.map((item, index) => (
              <div key={index}>
                {item.children ? (
                  <div>
                    <button
                      onClick={() => toggleMobileSubmenu(index)}
                      className="w-full flex justify-between items-center px-4 py-2 text-base font-medium text-gray-700 hover:bg-blue-50"
                    >
                      <div className="flex items-center">
                        {item.icon && <span className="mr-2">{item.icon}</span>}
                        {item.label}
                      </div>
                      <ChevronDown
                        className={`h-5 w-5 transition-transform ${mobileSubmenuOpen === index ? 'transform rotate-180' : ''}`}
                      />
                    </button>
                    {mobileSubmenuOpen === index && (
                      <div className="pl-4 bg-blue-50">
                        {item.children.map((child, childIndex) => (
                          <Link
                            key={childIndex}
                            to={child.path || '#'}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-100"
                            onClick={() => {
                              setMobileMenuOpen(false);
                              setMobileSubmenuOpen(null);
                            }}
                          >
                            {child.icon && <span className="mr-2">{child.icon}</span>}
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    to={item.path || '#'}
                    className={`flex items-center px-4 py-2 text-base font-medium ${
                      item.path && isActive(item.path)
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.icon && <span className="mr-2">{item.icon}</span>}
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuBar;
