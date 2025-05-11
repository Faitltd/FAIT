import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center md:order-2 space-x-6">
            <Link to="/about" className="text-gray-400 hover:text-gray-500">
              About
            </Link>
            <Link to="/contact" className="text-gray-400 hover:text-gray-500">
              Contact
            </Link>
            <Link to="/terms" className="text-gray-400 hover:text-gray-500">
              Terms
            </Link>
            <Link to="/privacy" className="text-gray-400 hover:text-gray-500">
              Privacy
            </Link>
          </div>
          <div className="mt-8 md:mt-0 md:order-1">
            <p className="text-center text-sm text-gray-400">
              &copy; {new Date().getFullYear()} FAIT Co-op. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
