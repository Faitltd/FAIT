import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  subcategories?: Subcategory[];
}

interface Subcategory {
  id: string;
  name: string;
}

interface CategoryBubblesProps {
  categories: Category[];
  selectedCategory?: string;
  onSelectCategory?: (categoryId: string) => void;
  className?: string;
}

const CategoryBubbles: React.FC<CategoryBubblesProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  className = ''
}) => {
  return (
    <div className={`overflow-x-auto pb-4 ${className}`}>
      <h3 className="text-lg font-medium text-[#2B4C32] mb-4 font-ivy">Popular Categories</h3>
      <div className="flex space-x-6 py-2">
        {categories.map((category) => (
          <motion.div
            key={category.id}
            className={`flex-shrink-0 cursor-pointer`}
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelectCategory && onSelectCategory(category.id)}
          >
            <Link
              to={`/services?category=${encodeURIComponent(category.id)}`}
              onClick={(e) => {
                if (onSelectCategory) {
                  e.preventDefault();
                  onSelectCategory(category.id);
                }
              }}
              className={`flex flex-col items-center`}
            >
              <div
                className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mb-2 ${
                  selectedCategory === category.id
                    ? 'ring-4 ring-[#0D7A5F] ring-offset-2'
                    : ''
                } bg-gradient-to-br from-[#BAE7FF]/50 to-[#F0F9FF]/50`}
              >
                <span className="text-2xl text-[#066599]">{category.icon}</span>
              </div>
              <span className="text-sm font-medium text-center whitespace-nowrap text-[#1A1E1D]">
                {category.name}
              </span>
              {selectedCategory === category.id && (
                <div className="h-[2px] w-10 bg-[#066599] mt-1.5 rounded-full"></div>
              )}
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CategoryBubbles;
