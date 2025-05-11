import React from 'react';
import ScrollRevealSections from '../components/ScrollRevealSections';

const ScrollRevealDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white py-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Discover Our Services
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto px-4">
          Scroll down to explore the features that make our platform the perfect choice for your service needs.
        </p>
      </header>

      <main>
        <ScrollRevealSections />
      </main>

      <footer className="bg-white py-12 text-center">
        <p className="text-gray-600">
          Ready to get started? <a href="#" className="text-blue-600 font-medium">Sign up now</a>
        </p>
      </footer>
    </div>
  );
};

export default ScrollRevealDemo;
