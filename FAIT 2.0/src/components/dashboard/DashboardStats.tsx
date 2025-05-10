import React from 'react';
import { motion } from 'framer-motion';
import { AnimatedCounter } from '../animations';

interface DashboardStatsProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  detail?: string;
  change?: {
    value: number;
    isPositive: boolean;
  };
  delay?: number;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({
  title,
  value,
  icon,
  detail,
  change,
  delay = 0
}) => {
  // Determine if value is a number for animation
  const isNumeric = typeof value === 'number' || !isNaN(Number(value));
  const numericValue = isNumeric ? Number(value) : 0;

  return (
    <motion.div
      className="bg-white rounded-lg shadow p-5 overflow-hidden relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: delay,
        ease: "easeOut"
      }}
      whileHover={{
        scale: 1.02,
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
      }}
    >
      {/* Decorative gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-50" />

      <div className="flex items-center justify-between relative z-10">
        <div>
          <motion.p
            className="text-gray-500 text-sm font-medium"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: delay + 0.2, duration: 0.3 }}
          >
            {title}
          </motion.p>

          <div className="text-2xl font-bold mt-1">
            {isNumeric ? (
              <AnimatedCounter
                value={numericValue}
                duration={1.5}
                decimals={Number.isInteger(numericValue) ? 0 : 1}
              />
            ) : (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: delay + 0.3, duration: 0.5 }}
              >
                {value}
              </motion.span>
            )}
          </div>

          {detail && (
            <motion.p
              className="text-gray-500 text-xs mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: delay + 0.4, duration: 0.5 }}
            >
              {detail}
            </motion.p>
          )}

          {change && (
            <motion.div
              className={`flex items-center mt-1 text-xs ${
                change.isPositive ? 'text-green-600' : 'text-red-600'
              }`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: delay + 0.5, duration: 0.5 }}
            >
              <span>
                {change.isPositive ? '↑' : '↓'} {Math.abs(change.value)}%
              </span>
              <span className="ml-1">from last period</span>
            </motion.div>
          )}
        </div>

        <motion.div
          className="bg-blue-50 p-3 rounded-full"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: delay + 0.2
          }}
          whileHover={{
            rotate: 5,
            scale: 1.1,
            transition: { duration: 0.2 }
          }}
        >
          {icon}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DashboardStats;
