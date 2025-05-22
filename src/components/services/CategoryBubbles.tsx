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
      <div className="flex space-x-4">
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
                    ? 'ring-4 ring-company-lightpink ring-offset-2'
                    : ''
                } ${category.color}`}
              >
                {category.icon}
              </div>
              <span className="text-sm font-medium text-center whitespace-nowrap">
                {category.name}
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CategoryBubbles;
