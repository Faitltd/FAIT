import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import ParallaxBackground from '../components/ParallaxBackground';
import EnhancedServiceCard from '../components/services/EnhancedServiceCard';
import ServiceCategoryNav from '../components/services/ServiceCategoryNav';
import AdvancedSearchBar from '../components/search/AdvancedSearchBar';
import CategoryBubbles from '../components/services/CategoryBubbles';
import {
  Search,
  ArrowRight,
  CheckCircle,
  Star,
  Clock,
  Shield,
  Tool,
  Home,
  Zap,
  Droplet,
  Paintbrush,
  Leaf,
  MessageCircle,
  ChevronRight
} from 'lucide-react';

interface ServicePackage {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: number;
  duration_unit: string;
  category: string;
  subcategory?: string;
  service_agent_id: string;
  created_at: string;
  image_url?: string;
  service_agent: {
    id: string;
    full_name: string;
    avatar_url?: string;
    zip_code?: string;
  };
  avg_rating?: number;
  review_count?: number;
  featured?: boolean;
  verified?: boolean;
  top_rated?: boolean;
}

interface Testimonial {
  id: number;
  name: string;
  role: string;
  avatar: string;
  content: string;
  rating: number;
  service: string;
}

const EnhancedHomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { scrollY } = useScroll();

  // Parallax effects
  const featuredParallax = useTransform(scrollY, [0, 1000], [0, 200]);
  const howItWorksParallax = useTransform(scrollY, [500, 1500], [0, 200]);

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [featuredServices, setFeaturedServices] = useState<ServicePackage[]>([]);
  const [loading, setLoading] = useState(true);

  // Testimonials data
  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Homeowner',
      avatar: '/images/testimonials/avatar-1.jpg',
      content: 'I needed urgent plumbing repairs and found a professional through FAIT Co-Op within an hour. The service was excellent and the price was fair. Highly recommend!',
      rating: 5,
      service: 'Plumbing Repair'
    },
    {
      id: 2,
      name: 'Michael Chen',
      role: 'Apartment Renter',
      avatar: '/images/testimonials/avatar-2.jpg',
      content: 'Used FAIT Co-Op for furniture assembly when I moved into my new apartment. The service provider was punctual, professional, and did an amazing job. Will definitely use again!',
      rating: 5,
      service: 'Furniture Assembly'
    },
    {
      id: 3,
      name: 'Jessica Williams',
      role: 'Small Business Owner',
      avatar: '/images/testimonials/avatar-3.jpg',
      content: 'As a small business owner, I needed electrical work done quickly. FAIT Co-Op connected me with a licensed electrician who completed the job the same day. Excellent service!',
      rating: 4,
      service: 'Electrical Work'
    }
  ];

  // Service categories
  const serviceCategories = [
    { name: 'Home Repair', icon: <Home className="h-6 w-6" />, color: 'bg-blue-500' },
    { name: 'Plumbing', icon: <Droplet className="h-6 w-6" />, color: 'bg-cyan-500' },
    { name: 'Electrical', icon: <Zap className="h-6 w-6" />, color: 'bg-yellow-500' },
    { name: 'Painting', icon: <Paintbrush className="h-6 w-6" />, color: 'bg-pink-500' },
    { name: 'Landscaping', icon: <Leaf className="h-6 w-6" />, color: 'bg-green-500' },
    { name: 'Handyman', icon: <Tool className="h-6 w-6" />, color: 'bg-orange-500' }
  ];

  // How it works steps
  const howItWorksSteps = [
    {
      title: 'Search',
      description: 'Browse our wide selection of professional home services or search for exactly what you need.',
      icon: <Search className="h-8 w-8" />,
      color: 'bg-company-lightblue'
    },
    {
      title: 'Book',
      description: 'Choose a service provider based on ratings, reviews, and availability, then book instantly.',
      icon: <Clock className="h-8 w-8" />,
      color: 'bg-company-lightpink'
    },
    {
      title: 'Relax',
      description: 'Your professional will arrive on time and complete the job to your satisfaction.',
      icon: <CheckCircle className="h-8 w-8" />,
      color: 'bg-company-lightorange'
    }
  ];

  // Fetch featured services
  useEffect(() => {
    const fetchFeaturedServices = async () => {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from('service_packages')
          .select(`
            *,
            service_agent:profiles!service_packages_service_agent_id_fkey(
              id,
              full_name,
              avatar_url,
              zip_code
            )
          `)
          .eq('is_active', true)
          .limit(4);

        if (error) throw error;

        // Add demo properties for visual enhancement
        const enhancedServices = data.map((service, index) => ({
          ...service,
          avg_rating: 4 + Math.random(),
          review_count: Math.floor(Math.random() * 50) + 10,
          featured: true,
          verified: true,
          top_rated: index % 2 === 0
        }));

        setFeaturedServices(enhancedServices);
      } catch (err) {
        console.error('Error fetching featured services:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedServices();
  }, []);

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/services?search=${encodeURIComponent(searchTerm)}`);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section with Parallax - FAIT Style */}
      <div className="relative min-h-[90vh] bg-[#F9FAFB] overflow-hidden">
        <ParallaxBackground
          imageUrl="/images/hero-background.jpg"
          overlayColor="linear-gradient(to right, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9))"
          height="90vh"
          className="flex items-center"
        />

        {/* Decorative Images with Parallax */}
        <motion.img
          src="/images/decoration-1.png"
          alt=""
          className="absolute bottom-[80%] right-[10%] h-[262px] w-[446px] z-0 hidden md:block"
          style={{ y: useTransform(scrollY, [0, 500], [0, 100]) }}
        />

        <motion.img
          src="/images/decoration-2.png"
          alt=""
          className="absolute top-[10%] left-[5%] h-[462px] w-[146px] z-0 hidden md:block"
          style={{ y: useTransform(scrollY, [0, 500], [0, -50]) }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex flex-col items-center text-center">
            <motion.div
              className="mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight text-[#2B4C32] font-ivy">
                Home Services,
                <br />
                <span className="text-[#2B4C32]">Done Right</span>
              </h1>
            </motion.div>

            <motion.p
              className="mt-6 text-xl text-[#1A1E1D] max-w-2xl mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Find trusted professionals for all your home service needs.
              From plumbing to painting, we've got you covered.
            </motion.p>

            {/* Advanced Search Bar - FAIT Style */}
            <motion.div
              className="h-[64px] max-w-[646px] w-full px-2 mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="flex flex-col h-full w-full relative">
                <div className="flex h-[64px] w-full">
                  <AdvancedSearchBar
                    fullWidth
                    autoFocus
                    showAgentSearch
                    className="rounded-full border-2 border-[#595C5B] shadow-lg"
                  />
                </div>
              </div>
            </motion.div>

            {/* Trust Badges - FAIT Style */}
            <motion.div
              className="mt-10 flex flex-wrap gap-6 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <div className="flex items-center">
                <CheckCircle className="h-6 w-6 mr-2 text-[#0D7A5F]" />
                <span className="text-sm font-medium text-[#2B4C32]">Verified Professionals</span>
              </div>
              <div className="flex items-center">
                <Shield className="h-6 w-6 mr-2 text-[#0D7A5F]" />
                <span className="text-sm font-medium text-[#2B4C32]">Satisfaction Guaranteed</span>
              </div>
              <div className="flex items-center">
                <Star className="h-6 w-6 mr-2 text-[#0D7A5F]" />
                <span className="text-sm font-medium text-[#2B4C32]">Highly Rated Services</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Service Categories */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 font-ivy">Popular Service Categories</h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto font-inter">
              Browse our most popular service categories or search for exactly what you need
            </p>
          </motion.div>

          {/* TaskRabbit-style Service Category Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <ServiceCategoryNav />
          </motion.div>

          <div className="mt-12 text-center">
            <Link
              to="/services"
              className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-company-lightpink hover:bg-company-lighterpink"
            >
              View All Services
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Featured Services with Parallax */}
      <div className="py-20 bg-gray-50 relative overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-dots-pattern bg-repeat opacity-5"
          style={{ y: featuredParallax }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold text-gray-900">Featured Services</h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Discover our top-rated services from verified professionals
            </p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-company-lightpink"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredServices.map((service, index) => (
                <EnhancedServiceCard key={service.id} service={service} index={index} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* How It Works with Parallax */}
      <div className="py-20 bg-white relative overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-grid-pattern bg-repeat opacity-5"
          style={{ y: howItWorksParallax }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Getting the help you need is simple and straightforward
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorksSteps.map((step, index) => (
              <motion.div
                key={step.title}
                className="bg-white rounded-xl shadow-lg p-8 relative"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                whileHover={{ y: -10 }}
              >
                <div className={`h-16 w-16 ${step.color} rounded-full flex items-center justify-center text-white mb-6`}>
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{index + 1}. {step.title}</h3>
                <p className="text-gray-600">{step.description}</p>

                {/* Connector line between steps (only for desktop) */}
                {index < howItWorksSteps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 border-t-2 border-dashed border-gray-300"></div>
                )}
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/register"
              className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-company-lightpink hover:bg-company-lighterpink"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-20 bg-gradient-to-r from-company-lightblue via-company-lightpink to-company-lightorange">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold text-white">What Our Customers Say</h2>
            <p className="mt-4 text-xl text-white text-opacity-90 max-w-3xl mx-auto">
              Don't just take our word for it — hear from our satisfied customers
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                className="bg-white rounded-xl shadow-lg p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                whileHover={{ y: -5 }}
              >
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full overflow-hidden mr-4">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{testimonial.name}</h3>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>

                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>

                <p className="text-gray-600 mb-4">{testimonial.content}</p>

                <p className="text-sm text-company-lightpink font-medium">
                  Service: {testimonial.service}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/testimonials"
              className="inline-flex items-center px-6 py-3 border border-white rounded-md text-base font-medium text-company-lightpink bg-white hover:bg-gray-100"
            >
              Read More Testimonials
              <ChevronRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-50 rounded-2xl shadow-xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-10 lg:p-16 flex flex-col justify-center">
                <motion.h2
                  className="text-3xl font-bold text-gray-900"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  Ready to get started?
                </motion.h2>
                <motion.p
                  className="mt-4 text-xl text-gray-600"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  Join thousands of satisfied customers who have found reliable home service professionals through FAIT Co-Op.
                </motion.p>

                <motion.div
                  className="mt-8 flex flex-col sm:flex-row gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  <Link
                    to="/services"
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-company-lightpink hover:bg-company-lighterpink"
                  >
                    Find a Service
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Sign Up
                  </Link>
                </motion.div>

                <motion.div
                  className="mt-8 flex items-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                >
                  <MessageCircle className="h-5 w-5 text-company-lightpink mr-2" />
                  <span className="text-gray-600">
                    Have questions? <Link to="/help" className="text-company-lightpink font-medium">Contact our support team</Link>
                  </span>
                </motion.div>
              </div>

              <div className="hidden lg:block relative">
                <img
                  src="/images/cta-image.jpg"
                  alt="Happy customer with service provider"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedHomePage;
