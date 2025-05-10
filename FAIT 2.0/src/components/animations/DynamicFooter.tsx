import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

const DynamicFooter: React.FC = () => {
  const footerLinks = [
    {
      title: 'Company',
      links: [
        { name: 'About Us', url: '/about' },
        { name: 'Our Team', url: '/team' },
        { name: 'Careers', url: '/careers' },
        { name: 'Press', url: '/press' },
      ],
    },
    {
      title: 'Services',
      links: [
        { name: 'For Homeowners', url: '/homeowners' },
        { name: 'For Contractors', url: '/contractors' },
        { name: 'Pricing', url: '/pricing' },
        { name: 'FAQ', url: '/faq' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { name: 'Blog', url: '/blog' },
        { name: 'Guides', url: '/guides' },
        { name: 'Support', url: '/support' },
        { name: 'Contact', url: '/contact' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { name: 'Terms of Service', url: '/terms' },
        { name: 'Privacy Policy', url: '/privacy' },
        { name: 'Cookie Policy', url: '/cookies' },
        { name: 'Accessibility', url: '/accessibility' },
      ],
    },
  ];

  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Logo and info */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-block mb-6">
              <img src="/images/logo-white.svg" alt="FAIT Co-op" className="h-10" />
            </Link>
            <p className="text-gray-400 mb-6">
              A cooperative platform connecting homeowners with trusted contractors for all home service needs.
            </p>
            <div className="flex space-x-4">
              <motion.a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              >
                <Facebook size={20} />
              </motion.a>
              <motion.a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              >
                <Twitter size={20} />
              </motion.a>
              <motion.a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              >
                <Instagram size={20} />
              </motion.a>
              <motion.a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              >
                <Linkedin size={20} />
              </motion.a>
            </div>
          </div>
          
          {/* Links */}
          {footerLinks.map((column, index) => (
            <div key={index}>
              <h3 className="font-bold text-lg mb-4">{column.title}</h3>
              <ul className="space-y-2">
                {column.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link 
                      to={link.url} 
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="border-t border-gray-800 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} FAIT Co-op. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="mailto:info@faitcoop.com" className="text-gray-400 hover:text-white transition-colors flex items-center text-sm">
                <Mail size={16} className="mr-2" /> info@faitcoop.com
              </a>
              <a href="tel:+15551234567" className="text-gray-400 hover:text-white transition-colors flex items-center text-sm">
                <Phone size={16} className="mr-2" /> (555) 123-4567
              </a>
              <span className="text-gray-400 flex items-center text-sm">
                <MapPin size={16} className="mr-2" /> San Francisco, CA
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default DynamicFooter;
