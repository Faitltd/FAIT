import React, { useState } from 'react';
import { Shield, PenTool as Tool, Users, Mail, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import CostCalculator from '../components/CostCalculator';

const LandingPage = () => {
  // We don't need the email/zipCode state anymore since we're showing the calculator directly
  const [showCalculator, setShowCalculator] = useState(true); // Default to true to show calculator immediately

  return (
    <div className="relative">
      {/* Hero Section */}
      <div
        className="relative bg-cover bg-center h-[800px]"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1631679706909-1844bbd07221?ixlib=rb-1.2.1&auto=format&fit=crop&w=2400&q=80")',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent opacity-90" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Transform Your Home with Trusted Experts
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-8 leading-relaxed">
              Connect with verified contractors, earn rewards, and be part of a community that's redefining home services. Experience quality work backed by our comprehensive warranty.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/register"
                className="bg-blue-600 text-white px-8 py-4 rounded-md text-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center"
              >
                Get Started
                <svg className="ml-2 -mr-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <button
                onClick={() => {
                  const calculatorSection = document.getElementById('calculator-section');
                  calculatorSection?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-white text-gray-900 px-8 py-4 rounded-md text-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Calculate Cost
              </button>
            </div>
            <div className="mt-12 flex items-center space-x-8">
              <div className="flex items-center">
                <Shield className="h-6 w-6 text-blue-400" />
                <span className="ml-2 text-gray-200">Verified Contractors</span>
              </div>
              <div className="flex items-center">
                <Users className="h-6 w-6 text-blue-400" />
                <span className="ml-2 text-gray-200">Community-Driven</span>
              </div>
              <div className="flex items-center">
                <Tool className="h-6 w-6 text-blue-400" />
                <span className="ml-2 text-gray-200">Quality Guaranteed</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calculator Section */}
      <div id="calculator-section" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Calculate Your Project Cost</h2>
            <p className="mt-4 text-lg text-gray-600">
              Get an instant estimate for your home improvement project
            </p>
          </div>

          <div className="mb-8 bg-white p-4 rounded-lg shadow-sm">
            <p className="text-center text-gray-600 mb-4">
              Use our free calculator to estimate costs for your renovation or handyman tasks.
              <br />
              <span className="text-sm text-blue-600">No sign-up required!</span>
            </p>

            <div className="flex justify-center">
              <Link
                to="/register"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Sign Up for More Features
              </Link>
            </div>
          </div>

          <CostCalculator />

          <div className="mt-8 bg-blue-50 p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-blue-900 mb-2">Want to save your estimates?</h3>
            <p className="text-blue-700 mb-4">
              Create a free account to save your calculations, get personalized recommendations, and connect with verified contractors in your area.
            </p>
            <div className="flex justify-center">
              <Link
                to="/register"
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Sign Up Now
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Why Choose FAIT Co-Op?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <Feature
              icon={<Shield className="h-12 w-12 text-blue-600" />}
              title="Extended Warranty"
              description="Every job comes with our comprehensive warranty protection for your peace of mind."
            />
            <Feature
              icon={<Tool className="h-12 w-12 text-blue-600" />}
              title="Verified Contractors"
              description="All our contractors undergo thorough background checks and verification processes."
            />
            <Feature
              icon={<Users className="h-12 w-12 text-blue-600" />}
              title="Community-Driven"
              description="A cooperative model that benefits both contractors and clients through shared success."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const Feature = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => {
  return (
    <div className="text-center">
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

export default LandingPage;