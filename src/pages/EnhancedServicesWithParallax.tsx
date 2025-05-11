import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { getRandomPhoto, getPhotoByIndex, PHOTO_CATEGORIES } from '../utils/homeServicePhotos';

// Service interface
interface Service {
  id: string;
  name: string;
  description: string;
  image: string;
  popular?: boolean;
}

const EnhancedServicesWithParallax: React.FC = () => {
  const { scrollY } = useScroll();
  
  // Create parallax effects for different sections
  const heroParallax = useTransform(scrollY, [0, 500], [0, 150]);
  const servicesParallax = useTransform(scrollY, [300, 800], [0, 100]);
  const processParallax = useTransform(scrollY, [800, 1300], [0, 100]);
  
  // Services data
  const services: Service[] = [
    {
      id: 'kitchen-remodeling',
      name: 'Kitchen Remodeling',
      description: 'Transform your kitchen with custom designs, premium materials, and expert installation.',
      image: getRandomPhoto(PHOTO_CATEGORIES.KITCHEN),
      popular: true,
    },
    {
      id: 'bathroom-remodeling',
      name: 'Bathroom Remodeling',
      description: 'Create your dream bathroom with our expert remodeling services and quality fixtures.',
      image: getRandomPhoto(PHOTO_CATEGORIES.BATHROOM),
      popular: true,
    },
    {
      id: 'flooring',
      name: 'Flooring Installation',
      description: 'Quality flooring solutions from hardwood to tile, installed by experienced professionals.',
      image: getPhotoByIndex(PHOTO_CATEGORIES.LIVING_ROOM, 2),
    },
    {
      id: 'painting',
      name: 'Professional Painting',
      description: 'Interior and exterior painting services with premium materials and attention to detail.',
      image: getPhotoByIndex(PHOTO_CATEGORIES.LIVING_ROOM, 4),
    },
    {
      id: 'home-renovation',
      name: 'Home Renovation',
      description: 'Complete home renovation services including kitchen, bathroom, basement, and whole-house remodels.',
      image: getPhotoByIndex(PHOTO_CATEGORIES.LIVING_ROOM, 6),
      popular: true,
    },
    {
      id: 'handyman',
      name: 'Handyman Services',
      description: 'Professional handyman services for repairs, installations, and maintenance around your home.',
      image: getPhotoByIndex(PHOTO_CATEGORIES.LIVING_ROOM, 8),
    },
  ];

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
            <span className="block">Our Services</span>
          </motion.h1>

          <motion.p
            className="mt-6 max-w-2xl mx-auto text-xl text-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Professional home services for every need, delivered by verified experts
          </motion.p>
        </div>
      </div>

      {/* Services Grid with Parallax */}
      <div className="py-16" style={{ backgroundColor: '#c0e2ff' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-extrabold text-gray-900">
              Explore Our Services
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600">
              Quality craftsmanship and exceptional customer service for all your home improvement needs
            </p>
          </motion.div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                className="relative h-96 rounded-xl overflow-hidden shadow-xl"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              >
                {/* Parallax Background */}
                <motion.div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${service.image})`,
                    y: useTransform(scrollY, [(index * 100), (index * 100) + 500], [0, 50]),
                    height: '120%',
                    top: '-10%'
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-70"></div>
                </motion.div>

                <div className="absolute top-4 right-4 z-10">
                  {service.popular && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-600 text-white">
                      Popular
                    </span>
                  )}
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <h3 className="text-2xl font-bold mb-2">{service.name}</h3>
                  <p className="mb-4">{service.description}</p>
                  <Link
                    to={`/services/${service.id}`}
                    className="inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Learn More
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Section with Parallax */}
      <div className="relative py-16 overflow-hidden">
        {/* Parallax Background */}
        <motion.div
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{
            backgroundImage: `url(${getRandomPhoto(PHOTO_CATEGORIES.BLUEPRINTS)})`,
            y: processParallax,
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
              How It Works
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-blue-100">
              Our simple process makes it easy to get the services you need
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            {/* Step 1 */}
            <motion.div
              className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-lg p-8 border border-white border-opacity-20 text-white"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              <div className="flex justify-center mb-4">
                <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-xl font-bold">1</div>
              </div>
              <h3 className="text-xl font-medium text-center mb-4">Browse Services</h3>
              <p className="text-blue-100">
                Explore our range of services and find the right solution for your home improvement needs.
              </p>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-lg p-8 border border-white border-opacity-20 text-white"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="flex justify-center mb-4">
                <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-xl font-bold">2</div>
              </div>
              <h3 className="text-xl font-medium text-center mb-4">Get an Estimate</h3>
              <p className="text-blue-100">
                Use our estimation tools to get a detailed, no-obligation quote for your project.
              </p>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-lg p-8 border border-white border-opacity-20 text-white"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div className="flex justify-center mb-4">
                <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-xl font-bold">3</div>
              </div>
              <h3 className="text-xl font-medium text-center mb-4">Book a Service</h3>
              <p className="text-blue-100">
                Schedule your service at a time that works for you with our easy booking system.
              </p>
            </motion.div>

            {/* Step 4 */}
            <motion.div
              className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-lg p-8 border border-white border-opacity-20 text-white"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="flex justify-center mb-4">
                <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-xl font-bold">4</div>
              </div>
              <h3 className="text-xl font-medium text-center mb-4">Enjoy Results</h3>
              <p className="text-blue-100">
                Sit back and enjoy your beautifully completed project, backed by our satisfaction guarantee.
              </p>
            </motion.div>
          </div>

          <motion.div
            className="mt-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <Link
              to="/calculator/estimate"
              className="inline-block px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
            >
              Get a Free Estimate
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
            Ready to Transform Your Home?
          </motion.h2>
          <motion.p
            className="max-w-2xl mx-auto text-xl text-gray-600 mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            Start your project today with FAIT Co-op's trusted service providers.
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
              Get Started
            </Link>
            <Link
              to="/services/search"
              className="inline-block px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 transition-colors"
            >
              Find Services
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedServicesWithParallax;
