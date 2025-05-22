import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
  subcategories: ServiceSubcategory[];
}

interface ServiceSubcategory {
  id: string;
  name: string;
  url: string;
}

const ServiceCategoryNav: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('assembly');

  const categories: ServiceCategory[] = [
    {
      id: 'assembly',
      name: 'Assembly',
      icon: '🔧',
      subcategories: [
        { id: 'general-furniture', name: 'General Furniture Assembly', url: '/services/assembly/general-furniture' },
        { id: 'ikea', name: 'IKEA Assembly', url: '/services/assembly/ikea' },
        { id: 'crib', name: 'Crib Assembly', url: '/services/assembly/crib' },
        { id: 'pax', name: 'PAX Assembly', url: '/services/assembly/pax' },
        { id: 'bookshelf', name: 'Bookshelf Assembly', url: '/services/assembly/bookshelf' },
        { id: 'desk', name: 'Desk Assembly', url: '/services/assembly/desk' }
      ]
    },
    {
      id: 'mounting',
      name: 'Mounting',
      icon: '📺',
      subcategories: [
        { id: 'tv-mounting', name: 'TV Mounting', url: '/services/mounting/tv' },
        { id: 'shelves', name: 'Shelf Mounting', url: '/services/mounting/shelves' },
        { id: 'pictures', name: 'Picture & Art Hanging', url: '/services/mounting/pictures' },
        { id: 'mirrors', name: 'Mirror Mounting', url: '/services/mounting/mirrors' }
      ]
    },
    {
      id: 'moving',
      name: 'Moving',
      icon: '📦',
      subcategories: [
        { id: 'small-moves', name: 'Small Moves', url: '/services/moving/small-moves' },
        { id: 'furniture-rearrangement', name: 'Furniture Rearrangement', url: '/services/moving/furniture-rearrangement' },
        { id: 'heavy-lifting', name: 'Heavy Lifting', url: '/services/moving/heavy-lifting' }
      ]
    },
    {
      id: 'cleaning',
      name: 'Cleaning',
      icon: '🧹',
      subcategories: [
        { id: 'house-cleaning', name: 'House Cleaning', url: '/services/cleaning/house' },
        { id: 'deep-cleaning', name: 'Deep Cleaning', url: '/services/cleaning/deep' },
        { id: 'move-out', name: 'Move-out Cleaning', url: '/services/cleaning/move-out' }
      ]
    },
    {
      id: 'outdoor',
      name: 'Outdoor Help',
      icon: '🌱',
      subcategories: [
        { id: 'yard-work', name: 'Yard Work & Removal', url: '/services/outdoor/yard-work' },
        { id: 'gardening', name: 'Gardening', url: '/services/outdoor/gardening' },
        { id: 'patio', name: 'Patio Cleaning', url: '/services/outdoor/patio' }
      ]
    },
    {
      id: 'repairs',
      name: 'Home Repairs',
      icon: '🔨',
      subcategories: [
        { id: 'drywall', name: 'Drywall Repair', url: '/services/repairs/drywall' },
        { id: 'electrical', name: 'Electrical Help', url: '/services/repairs/electrical' },
        { id: 'plumbing', name: 'Plumbing Help', url: '/services/repairs/plumbing' }
      ]
    },
    {
      id: 'painting',
      name: 'Painting',
      icon: '🎨',
      subcategories: [
        { id: 'interior', name: 'Interior Painting', url: '/services/painting/interior' },
        { id: 'exterior', name: 'Exterior Painting', url: '/services/painting/exterior' },
        { id: 'furniture', name: 'Furniture Painting', url: '/services/painting/furniture' }
      ]
    },
    {
      id: 'trending',
      name: 'Trending',
      icon: '🔥',
      subcategories: [
        { id: 'holiday-lights', name: 'Holiday Light Installation', url: '/services/trending/holiday-lights' },
        { id: 'smart-home', name: 'Smart Home Installation', url: '/services/trending/smart-home' },
        { id: 'organization', name: 'Home Organization', url: '/services/trending/organization' }
      ]
    }
  ];

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);
  };

  const activeSubcategories = categories.find(cat => cat.id === activeCategory)?.subcategories || [];

  return (
    <div className="service-category-nav w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Category Bubbles at the top - FAIT Style */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-[#2B4C32] mb-4 font-ivy">Popular Categories</h3>
        <div className="overflow-x-auto pb-4">
          <div className="flex space-x-6 py-2">
            {categories.map((category) => (
              <motion.div
                key={category.id}
                className="flex-shrink-0 cursor-pointer"
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCategoryClick(category.id)}
              >
                <div className="flex flex-col items-center">
                  <div
                    className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mb-2 ${
                      activeCategory === category.id
                        ? 'ring-4 ring-[#0D7A5F] ring-offset-2'
                        : ''
                    } bg-gradient-to-br from-[#BAE7FF]/50 to-[#F0F9FF]/50`}
                  >
                    <span className="text-2xl text-[#066599]">{category.icon}</span>
                  </div>
                  <span className="text-sm font-medium text-center whitespace-nowrap text-[#1A1E1D]">
                    {category.name}
                  </span>
                  {activeCategory === category.id && (
                    <div className="h-[2px] w-10 bg-[#066599] mt-1.5 rounded-full"></div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Buttons - FAIT Style */}
      <div className="overflow-x-auto pb-4">
        <div className="flex space-x-3 md:space-x-5">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={`flex flex-col items-center justify-center min-w-[120px] md:min-w-[150px] px-4 py-3 rounded-full border-2 transition-all duration-300 ${
                activeCategory === category.id
                  ? 'border-[#0D7A5F] bg-[#F0F9FF]'
                  : 'border-[#E5E7EB] hover:border-[#D1D5DB]'
              }`}
            >
              <div className="h-12 w-12 flex items-center justify-center relative">
                <svg
                  fill="none"
                  height="50"
                  viewBox="0 0 60 50"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18.8962 5.27305C25.849 -1.46104 32.1704 -0.338692 34.462 1.06424C39.9101 1.06424 51.4547 1.90601 54.049 5.27305C57.2919 9.48186 55.3461 21.0561 58.589 25.8662C61.8319 30.6762 56.2542 38.4926 44.4501 46.4593C32.646 54.4259 13.8374 46.4593 9.81618 46.4593C5.79502 46.4593 1.51443 40.146 0.606422 32.1794C-0.301583 24.2127 4.7573 22.1083 9.81618 21.0561C14.8751 20.0039 10.2053 13.6907 18.8962 5.27305Z"
                    fill={activeCategory === category.id ? "rgba(186, 231, 255, 0.5)" : "none"}
                  />
                </svg>
                <span className="absolute text-2xl">{category.icon}</span>
              </div>
              <label className="mt-2 text-sm font-medium font-inter text-[#1A1E1D]">
                {category.name}
              </label>
            </button>
          ))}
        </div>
      </div>

      <motion.div
        className="mt-6 bg-[#F9FAFB] rounded-lg p-4 border border-[#E5E7EB]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        key={activeCategory}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {activeSubcategories.map((subcategory) => (
            <div key={subcategory.id} className="p-2">
              <div className="hover:bg-[#F0F9FF] rounded-md transition-colors duration-200">
                <Link
                  to={subcategory.url}
                  className="block p-3 text-[#1A1E1D] hover:text-[#0D7A5F] font-inter"
                >
                  {subcategory.name}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default ServiceCategoryNav;
