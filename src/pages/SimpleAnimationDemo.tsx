import React from 'react';
import { motion } from 'framer-motion';

/**
 * Simple Animation Demo Page
 * 
 * This page demonstrates basic animations using Framer Motion
 * without relying on custom components.
 */
const SimpleAnimationDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-white rounded-lg shadow-xl p-8 mb-12"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Simple Animation Demo
          </h1>
          <p className="text-gray-600">
            This page demonstrates basic animations using Framer Motion.
            Scroll down to see more animations.
          </p>
        </motion.div>

        {/* Fade In Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          className="bg-white rounded-lg shadow-xl p-8 mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Fade In Animation
          </h2>
          <p className="text-gray-600">
            This section fades in when it enters the viewport.
          </p>
        </motion.div>

        {/* Slide In From Left */}
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          className="bg-white rounded-lg shadow-xl p-8 mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Slide In From Left
          </h2>
          <p className="text-gray-600">
            This section slides in from the left when it enters the viewport.
          </p>
        </motion.div>

        {/* Slide In From Right */}
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          className="bg-white rounded-lg shadow-xl p-8 mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Slide In From Right
          </h2>
          <p className="text-gray-600">
            This section slides in from the right when it enters the viewport.
          </p>
        </motion.div>

        {/* Scale Up */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          className="bg-white rounded-lg shadow-xl p-8 mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Scale Up Animation
          </h2>
          <p className="text-gray-600">
            This section scales up when it enters the viewport.
          </p>
        </motion.div>

        {/* Staggered Children */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          className="bg-white rounded-lg shadow-xl p-8 mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Staggered Children
          </h2>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((item) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: item * 0.1 }}
                className="bg-gray-100 p-4 rounded"
              >
                <p className="text-gray-800">Staggered item {item}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Hover Effects */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          className="bg-white rounded-lg shadow-xl p-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Hover Effects
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-blue-500 text-white p-4 rounded-lg cursor-pointer"
            >
              <p className="font-medium">Hover me!</p>
            </motion.div>
            <motion.div
              whileHover={{ rotate: 5 }}
              whileTap={{ rotate: -5 }}
              className="bg-green-500 text-white p-4 rounded-lg cursor-pointer"
            >
              <p className="font-medium">Hover me!</p>
            </motion.div>
            <motion.div
              whileHover={{ backgroundColor: "#f59e0b" }}
              transition={{ duration: 0.2 }}
              className="bg-purple-500 text-white p-4 rounded-lg cursor-pointer"
            >
              <p className="font-medium">Hover me!</p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SimpleAnimationDemo;
