import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../modules/core/contexts/AuthContext';
import { UserRole } from '../modules/core/types/common';
import { Button } from '../modules/core/components/ui/Button';
import { Navigation } from '../modules/core/components/layout/Navigation';
import HomeRemodellingGallery from '../components/HomeRemodellingGallery';

const serviceImages = [
  {
    src: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=800&q=80',
    alt: 'Modern kitchen remodel with white cabinets, island, and pendant lighting',
    title: 'Kitchen Remodeling',
    desc: 'Transform your kitchen with custom designs and professional craftsmanship.',
    link: '/services/kitchen-remodeling',
  },
  {
    src: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=800&q=80',
    alt: 'Luxury bathroom remodel with walk-in shower and modern fixtures',
    title: 'Bathroom Remodeling',
    desc: 'Upgrade your bathroom with elegant finishes and modern amenities.',
    link: '/services/bathroom-remodeling',
  },
  {
    src: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=800&q=80',
    alt: 'Hardwood flooring installation in a bright living room',
    title: 'Flooring Installation',
    desc: 'Quality flooring solutions from hardwood to tile, installed by experts.',
    link: '/services/flooring-installation',
  },
  {
    src: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=800&q=80',
    alt: 'Professional painting of a modern living room with accent wall',
    title: 'Professional Painting',
    desc: 'Interior and exterior painting services with premium materials and attention to detail.',
    link: '/services/painting',
  },
];

/**
 * HomePage component for the landing page
 */
const HomePage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  // Refs for scroll animations
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  // Force image reload
  useEffect(() => {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      const src = img.src;
      img.src = '';
      setTimeout(() => {
        img.src = src;
      }, 100);
    });
  }, []);

  // Setup intersection observer for scroll animations
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.2,
    };

    const handleIntersect = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          observer.unobserve(entry.target);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);

    // Observe all section refs
    [heroRef, featuresRef, servicesRef, testimonialsRef, ctaRef].forEach((ref) => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  // Get dashboard link based on user role
  const getDashboardLink = () => {
    if (!isAuthenticated || !user) return '/login';

    switch (user.role) {
      case UserRole.ADMIN:
        return '/admin';
      case UserRole.SERVICE_AGENT:
        return '/projects';
      case UserRole.CLIENT:
        return '/projects';
      default:
        return '/login';
    }
  };

  return (
    <div className="min-h-screen bg-[#c0e2ff]">
      <Navigation />

      {/* HERO SECTION */}
      <div className="relative w-full" style={{ minHeight: 480 }}>
        {/* Background image */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1500&q=80')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: 0,
          }}
          aria-hidden="true"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40" style={{ zIndex: 1 }} />
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 py-24 sm:py-32">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-4 drop-shadow-lg">
            Welcome to
            <br />
            <span className="text-blue-200">FAIT Co-Op Platform</span>
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-blue-100 font-medium drop-shadow">
            Connecting homeowners with trusted service agents for all your home improvement needs.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/calculator/estimate"
              className="px-10 py-4 border border-transparent text-lg font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center"
            >
              <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Free Instant Estimate
            </a>
            <Link
              to="/register"
              className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-pink-400 hover:bg-pink-500 md:py-4 md:text-lg md:px-10 transition-colors"
            >
              Get Started
            </Link>
            <Link
              to="/services/search"
              className="px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 transition-colors"
            >
              Find Services
            </Link>
          </div>
        </div>
      </div>

      {/* SERVICES SECTION */}
      <section className="bg-[#c0e2ff] py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-2">Our Services</h2>
          <p className="text-lg text-gray-700 text-center mb-10">
            Professional home services for every need
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {serviceImages.map((service) => (
              <div
                key={service.title}
                className="relative rounded-xl shadow-card hover:shadow-card-hover transition-shadow overflow-hidden flex flex-col min-h-[220px]"
              >
                {/* Card background image */}
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `url('${service.src}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    zIndex: 0,
                  }}
                  aria-hidden="true"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/40" style={{ zIndex: 1 }} />
                {/* Card content */}
                <div className="relative p-6 flex-1 flex flex-col z-10">
                  <h3 className="text-xl font-bold text-white drop-shadow mb-2">{service.title}</h3>
                  <p className="text-white text-opacity-90 mb-4 flex-1 drop-shadow">
                    {service.desc}
                  </p>
                  <Link
                    to={service.link}
                    className="inline-block px-6 py-2 rounded-md bg-pink-400 text-white font-semibold hover:bg-pink-500 transition-colors"
                  >
                    Learn More
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <div
        ref={featuresRef}
        className="py-12 bg-gray-50 transition-all duration-600 opacity-0 transform translate-y-8"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              A better way to manage your projects
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Our platform provides all the tools you need to manage your home improvement projects from start to finish.
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                    <svg
                      className="h-6 w-6"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Project Management</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Keep track of all your projects in one place. Monitor progress, communicate with service agents, and manage payments.
                  </p>
                </div>
              </div>

              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                    <svg
                      className="h-6 w-6"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Booking System</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Book service appointments with ease. Choose from available time slots and receive confirmation instantly.
                  </p>
                </div>
              </div>

              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                    <svg
                      className="h-6 w-6"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Secure Payments</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Make secure payments through our platform. Pay for services with confidence using our trusted payment system.
                  </p>
                </div>
              </div>

              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                    <svg
                      className="h-6 w-6"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Warranty Management</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Keep track of warranties for completed projects. File claims and get support when you need it.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div
        ref={ctaRef}
        className="bg-blue-700 transition-all duration-600 opacity-0 transform translate-y-8"
      >
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">Ready to get started?</span>
            <span className="block">Sign up today.</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-blue-200">
            Join our platform and connect with skilled service agents for your home improvement projects.
          </p>
          <Link
            to="/register"
            className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 sm:w-auto"
          >
            Sign up for free
          </Link>
        </div>
      </div>

      {/* Add the gallery component */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <HomeRemodellingGallery
          title="Our Stunning Remodelling Projects"
          description="Browse through our portfolio of completed home renovation projects. Each image showcases our commitment to quality craftsmanship and attention to detail."
        />
      </div>

      {/* Footer */}
      <footer className="bg-gray-800">
        <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
          <nav className="-mx-5 -my-2 flex flex-wrap justify-center" aria-label="Footer">
            <div className="px-5 py-2">
              <Link to="/about" className="text-base text-gray-400 hover:text-white">
                About
              </Link>
            </div>
            <div className="px-5 py-2">
              <Link to="/services" className="text-base text-gray-400 hover:text-white">
                Services
              </Link>
            </div>
            <div className="px-5 py-2">
              <Link to="/pricing" className="text-base text-gray-400 hover:text-white">
                Pricing
              </Link>
            </div>
            <div className="px-5 py-2">
              <Link to="/contact" className="text-base text-gray-400 hover:text-white">
                Contact
              </Link>
            </div>
            <div className="px-5 py-2">
              <Link to="/privacy" className="text-base text-gray-400 hover:text-white">
                Privacy
              </Link>
            </div>
            <div className="px-5 py-2">
              <Link to="/terms" className="text-base text-gray-400 hover:text-white">
                Terms
              </Link>
            </div>
          </nav>
          <p className="mt-8 text-center text-base text-gray-400">
            &copy; 2023 FAIT Co-op. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
