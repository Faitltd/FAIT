import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Star, Clock, MapPin, DollarSign, Award, Shield, ThumbsUp } from 'lucide-react';
import { formatCurrency, formatDuration } from '../../utils/formatters';

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

interface EnhancedServiceCardProps {
  service: ServicePackage;
  index?: number;
}

const EnhancedServiceCard: React.FC<EnhancedServiceCardProps> = ({ service, index = 0 }) => {
  const navigate = useNavigate();

  // Default image if none provided
  const defaultImages = [
    '/images/services/home-repair.jpg',
    '/images/services/plumbing.jpg',
    '/images/services/electrical.jpg',
    '/images/services/cleaning.jpg',
    '/images/services/landscaping.jpg',
  ];

  const serviceImage = service.image_url || defaultImages[index % defaultImages.length];

  // Handle card click
  const handleCardClick = () => {
    navigate(`/services/${service.id}`);
  };

  // Handle book now click
  const handleBookNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/service-request/${service.id}`);
  };

  // Render stars for rating
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <Star className="h-4 w-4 text-gray-300" />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            </div>
          </div>
        );
      } else {
        stars.push(<Star key={i} className="h-4 w-4 text-gray-300" />);
      }
    }

    return stars;
  };

  // Card animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        delay: index * 0.1
      }
    },
    hover: {
      y: -10,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 20
      }
    }
  };

  return (
    <motion.div
      className="rounded-xl overflow-hidden bg-white shadow-md cursor-pointer"
      onClick={handleCardClick}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      layout
    >
      {/* Service Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={serviceImage}
          alt={service.title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />

        {/* Price Badge */}
        <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-1 shadow-md">
          <div className="flex items-center text-company-lightpink font-bold">
            <DollarSign className="h-4 w-4 mr-1" />
            {formatCurrency(service.price)}
          </div>
        </div>

        {/* Featured Badge */}
        {service.featured && (
          <div className="absolute top-4 left-4 bg-company-lightpink text-white rounded-full px-3 py-1 text-xs font-semibold shadow-md">
            Featured
          </div>
        )}
      </div>

      {/* Service Content */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-gray-900 line-clamp-1">{service.title}</h3>

          {/* Badges */}
          <div className="flex space-x-1">
            {service.verified && (
              <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center" title="Verified Provider">
                <Shield className="h-3 w-3 text-blue-600" />
              </div>
            )}
            {service.top_rated && (
              <div className="h-6 w-6 rounded-full bg-yellow-100 flex items-center justify-center" title="Top Rated">
                <Award className="h-3 w-3 text-yellow-600" />
              </div>
            )}
            {(service.avg_rating || 0) >= 4.5 && (
              <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center" title="Highly Rated">
                <ThumbsUp className="h-3 w-3 text-green-600" />
              </div>
            )}
          </div>
        </div>

        {/* Service Provider */}
        <div className="flex items-center mb-3">
          <div className="h-8 w-8 rounded-full overflow-hidden mr-2">
            <img
              src={service.service_agent.avatar_url || '/default-avatar.png'}
              alt={service.service_agent.full_name}
              className="h-full w-full object-cover"
            />
          </div>
          <span className="text-sm text-gray-600">{service.service_agent.full_name}</span>
        </div>

        {/* Description */}
        <p className="text-gray-600 mb-4 line-clamp-2">{service.description}</p>

        {/* Service Details */}
        <div className="flex flex-wrap gap-y-2 mb-4">
          {/* Duration */}
          <div className="w-1/2 flex items-center text-sm text-gray-500">
            <Clock className="h-4 w-4 mr-1 text-company-lightpink" />
            {formatDuration(service.duration)}
          </div>

          {/* Location */}
          {service.service_agent.zip_code && (
            <div className="w-1/2 flex items-center text-sm text-gray-500">
              <MapPin className="h-4 w-4 mr-1 text-company-lightpink" />
              {service.service_agent.zip_code}
            </div>
          )}

          {/* Category */}
          {service.category && (
            <div className="w-1/2 flex items-center text-sm text-gray-500">
              <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                {service.category}
              </span>
            </div>
          )}

          {/* Subcategory */}
          {service.subcategory && (
            <div className="w-1/2 flex items-center text-sm text-gray-500">
              <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                {service.subcategory}
              </span>
            </div>
          )}
        </div>

        {/* Rating */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex mr-1">
              {renderStars(service.avg_rating || 0)}
            </div>
            <span className="text-sm text-gray-500">
              ({service.review_count || 0})
            </span>
          </div>

          {/* Book Now Button */}
          <motion.button
            onClick={handleBookNow}
            className="px-4 py-2 bg-company-lightpink text-white rounded-md text-sm font-medium hover:bg-company-lighterpink"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Book Now
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default EnhancedServiceCard;
