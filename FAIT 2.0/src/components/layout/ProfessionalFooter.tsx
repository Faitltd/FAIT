import React from 'react';
import { Link } from 'react-router-dom';

const ProfessionalFooter: React.FC = () => {
  return (
    <footer className="bg-white border-t border-neutral-200">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 tracking-wider uppercase">
              Company
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link to="/about" className="text-base text-neutral-600 hover:text-primary-600">
                  About
                </Link>
              </li>
              <li>
                <Link to="/careers" className="text-base text-neutral-600 hover:text-primary-600">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-base text-neutral-600 hover:text-primary-600">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/press" className="text-base text-neutral-600 hover:text-primary-600">
                  Press
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Services */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 tracking-wider uppercase">
              Services
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link to="/services/home-improvement" className="text-base text-neutral-600 hover:text-primary-600">
                  Home Improvement
                </Link>
              </li>
              <li>
                <Link to="/services/maintenance" className="text-base text-neutral-600 hover:text-primary-600">
                  Maintenance
                </Link>
              </li>
              <li>
                <Link to="/services/installation" className="text-base text-neutral-600 hover:text-primary-600">
                  Installation
                </Link>
              </li>
              <li>
                <Link to="/services/design" className="text-base text-neutral-600 hover:text-primary-600">
                  Design
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 tracking-wider uppercase">
              Support
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link to="/help" className="text-base text-neutral-600 hover:text-primary-600">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-base text-neutral-600 hover:text-primary-600">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-base text-neutral-600 hover:text-primary-600">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/safety" className="text-base text-neutral-600 hover:text-primary-600">
                  Safety
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 tracking-wider uppercase">
              Legal
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link to="/privacy" className="text-base text-neutral-600 hover:text-primary-600">
                  Privacy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-base text-neutral-600 hover:text-primary-600">
                  Terms
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="text-base text-neutral-600 hover:text-primary-600">
                  Cookies
                </Link>
              </li>
              <li>
                <Link to="/licenses" className="text-base text-neutral-600 hover:text-primary-600">
                  Licenses
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 border-t border-neutral-200 pt-8">
          <p className="text-base text-neutral-500 text-center">
            &copy; {new Date().getFullYear()} FAIT Co-op. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default ProfessionalFooter;
