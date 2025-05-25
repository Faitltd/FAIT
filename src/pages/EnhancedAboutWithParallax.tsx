import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { getRandomPhoto, getPhotoByIndex, PHOTO_CATEGORIES } from '../utils/homeServicePhotos';

const EnhancedAboutWithParallax: React.FC = () => {
  const { scrollY } = useScroll();
  
  // Create parallax effects for different sections
  const heroParallax = useTransform(scrollY, [0, 500], [0, 150]);
  const missionParallax = useTransform(scrollY, [300, 800], [0, 100]);
  const teamParallax = useTransform(scrollY, [800, 1300], [0, 100]);
  
  return (
    <div className="overflow-hidden">
      {/* Hero Section with Parallax */}
      <div className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        {/* Parallax Background */}
        <motion.div
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{
            backgroundImage: `url(${getRandomPhoto(PHOTO_CATEGORIES.LIVING_ROOM)})`,
            y: heroParallax,
            height: '120%',
            top: '-10%'
          }}
        >
          <div className="absolute inset-0 bg-blue-900 opacity-60"></div>
        </motion.div>

        {/* Content */}
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <motion.h1
            className="text-4xl font-extrabold text-white sm:text-5xl md:text-6xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="block">About</span>
            <span className="block text-blue-300">FAIT Co-Op Platform</span>
          </motion.h1>

          <motion.p
            className="mt-6 max-w-2xl mx-auto text-xl text-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            We're transforming the contractor-client relationship through cooperative principles.
          </motion.p>
        </div>
      </div>

      {/* Our Mission Section with Parallax */}
      <div className="relative py-16 overflow-hidden" style={{ backgroundColor: '#c0e2ff' }}>
        {/* Parallax Background Elements */}
        <motion.div
          className="absolute right-0 top-0 w-96 h-96 rounded-full bg-blue-200 opacity-30"
          style={{
            y: missionParallax,
            x: '10%',
            scale: 1.5,
          }}
        />
        
        <motion.div
          className="absolute left-0 bottom-0 w-64 h-64 rounded-full bg-green-200 opacity-30"
          style={{
            y: useTransform(missionParallax, v => -v * 0.5),
            x: '-10%',
            scale: 1.2,
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-extrabold text-gray-900">
              Our Mission
            </h2>
            <div className="mt-4 max-w-3xl mx-auto">
              <p className="text-xl text-gray-600 mb-6">
                FAIT Co-op was founded with a simple but powerful mission: to create a more equitable, transparent, and collaborative home services marketplace.
              </p>
              <p className="text-lg text-gray-600">
                We believe that by bringing together homeowners, contractors, and service providers in a cooperative platform, we can transform the industry and create better outcomes for everyone involved.
              </p>
            </div>
          </motion.div>

          {/* Mission Values */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <motion.div
              className="bg-white rounded-lg p-8 shadow-md"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center">
                  <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 text-center">Community</h3>
              <p className="mt-4 text-gray-600">
                We foster a community where members support each other and work together toward common goals.
              </p>
            </motion.div>

            <motion.div
              className="bg-white rounded-lg p-8 shadow-md"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center">
                  <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 text-center">Trust</h3>
              <p className="mt-4 text-gray-600">
                We build trust through transparency, accountability, and consistent delivery of quality services.
              </p>
            </motion.div>

            <motion.div
              className="bg-white rounded-lg p-8 shadow-md"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center">
                  <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 text-center">Fairness</h3>
              <p className="mt-4 text-gray-600">
                We ensure fair pricing, equitable treatment, and just compensation for all platform participants.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Our Team Section with Parallax */}
      <div className="relative py-16 overflow-hidden">
        {/* Parallax Background */}
        <motion.div
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{
            backgroundImage: `url(${getRandomPhoto(PHOTO_CATEGORIES.BLUEPRINTS)})`,
            y: teamParallax,
            height: '120%',
            top: '-10%'
          }}
        >
          <div className="absolute inset-0 bg-blue-900 opacity-80"></div>
        </motion.div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-extrabold text-white">
              Meet Our Team
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-blue-100">
              The passionate people behind FAIT Co-Op
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Team Member Cards */}
            <motion.div
              className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-lg overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              <div className="h-64 bg-cover bg-center" style={{ backgroundImage: `url(${getRandomPhoto(PHOTO_CATEGORIES.PEOPLE)})` }}></div>
              <div className="p-6 text-white">
                <h3 className="text-xl font-semibold">Alex Johnson</h3>
                <p className="text-blue-200 mb-4">Co-Founder & CEO</p>
                <p className="text-gray-200">
                  With over 15 years in construction management, Alex brings industry expertise and a vision for a more collaborative approach.
                </p>
              </div>
            </motion.div>

            <motion.div
              className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-lg overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="h-64 bg-cover bg-center" style={{ backgroundImage: `url(${getRandomPhoto(PHOTO_CATEGORIES.PEOPLE)})` }}></div>
              <div className="p-6 text-white">
                <h3 className="text-xl font-semibold">Maya Rodriguez</h3>
                <p className="text-blue-200 mb-4">Co-Founder & CTO</p>
                <p className="text-gray-200">
                  Maya's background in software development and platform design drives our innovative technical solutions.
                </p>
              </div>
            </motion.div>

            <motion.div
              className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-lg overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div className="h-64 bg-cover bg-center" style={{ backgroundImage: `url(${getRandomPhoto(PHOTO_CATEGORIES.PEOPLE)})` }}></div>
              <div className="p-6 text-white">
                <h3 className="text-xl font-semibold">David Chen</h3>
                <p className="text-blue-200 mb-4">Community Director</p>
                <p className="text-gray-200">
                  David focuses on building and nurturing our cooperative community of service providers and clients.
                </p>
              </div>
            </motion.div>
          </div>

          <motion.div
            className="mt-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Link
              to="/team"
              className="inline-block px-8 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-white hover:bg-opacity-10 transition-colors"
            >
              View Full Team
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-16" style={{ backgroundColor: '#c0e2ff' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            className="text-3xl font-extrabold text-gray-900 mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
          >
            Join Our Cooperative
          </motion.h2>
          <motion.p
            className="max-w-2xl mx-auto text-xl text-gray-600 mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            Become part of a community that's transforming the contractor-client relationship.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Link
              to="/register"
              className="inline-block px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10 transition-colors mr-4"
            >
              Sign up now
            </Link>
            <Link
              to="/contact"
              className="inline-block px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 transition-colors"
            >
              Contact us
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedAboutWithParallax;
