import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface MobileMenuProps {
  onClose: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ onClose }) => {
  return (
    <motion.div 
      className="fixed inset-0 z-50 bg-neutral-900/50 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div 
        className="fixed top-0 right-0 h-full w-4/5 max-w-sm bg-white shadow-xl"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'tween', duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end p-4">
          <button onClick={onClose}>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6 text-neutral-500" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </button>
        </div>
        
        <div className="flex flex-col space-y-4 p-4">
          <Link 
            to="/" 
            className="text-xl font-medium py-2 px-4 hover:bg-neutral-100 rounded-md"
            onClick={onClose}
          >
            Home
          </Link>
          <Link 
            to="/services" 
            className="text-xl font-medium py-2 px-4 hover:bg-neutral-100 rounded-md"
            onClick={onClose}
          >
            Services
          </Link>
          <Link 
            to="/pricing" 
            className="text-xl font-medium py-2 px-4 hover:bg-neutral-100 rounded-md"
            onClick={onClose}
          >
            Pricing
          </Link>
          <Link 
            to="/faq" 
            className="text-xl font-medium py-2 px-4 hover:bg-neutral-100 rounded-md"
            onClick={onClose}
          >
            FAQ
          </Link>
          <Link 
            to="/contact" 
            className="text-xl font-medium py-2 px-4 hover:bg-neutral-100 rounded-md"
            onClick={onClose}
          >
            Contact
          </Link>
          <Link 
            to="/login" 
            className="bg-primary-600 text-white text-center py-3 px-4 rounded-md hover:bg-primary-700 transition-colors mt-4"
            onClick={onClose}
          >
            Login
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MobileMenu;
