import React from 'react';
import RevealSection from './RevealSection';
import ParallaxLayer from './ParallaxLayer';
import SectionDivider from '../ui/SectionDivider';
import { Calendar, Users, Briefcase, Award, TrendingUp, Shield } from 'lucide-react';

/**
 * ScrollRevealSections Component
 * 
 * Demonstrates scroll-activated reveal sections with various animations.
 * Each section contains an icon, heading, and short description.
 */
const ScrollRevealSections: React.FC = () => {
  return (
    <div className="relative overflow-hidden">
      {/* Background parallax elements */}
      <ParallaxLayer
        speed={-0.2}
        direction="horizontal"
        className="absolute top-20 left-0 w-64 h-64"
        opacity={0.05}
        zIndex={-1}
      >
        <div className="w-full h-full rounded-full bg-blue-500"></div>
      </ParallaxLayer>
      
      <ParallaxLayer
        speed={0.3}
        direction="vertical"
        className="absolute top-[40%] right-10 w-48 h-48"
        opacity={0.05}
        zIndex={-1}
      >
        <div className="w-full h-full rounded-full bg-purple-500"></div>
      </ParallaxLayer>
      
      <ParallaxLayer
        speed={-0.15}
        direction="vertical"
        className="absolute bottom-20 left-20 w-56 h-56"
        opacity={0.05}
        zIndex={-1}
      >
        <div className="w-full h-full rounded-full bg-green-500"></div>
      </ParallaxLayer>
      
      <div className="max-w-5xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
        <div className="space-y-40">
          {/* Section 1 */}
          <RevealSection direction="up" className="flex flex-col items-center text-center">
            <Calendar className="w-16 h-16 text-blue-600 mb-8" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Seamless Booking</h2>
            <p className="text-lg text-gray-600 max-w-md mx-auto">
              Our intuitive booking system makes it easy to schedule services
              with just a few clicks. Find the perfect time that works for you.
            </p>
          </RevealSection>
          
          {/* Section divider */}
          <SectionDivider type="wave" color="#f9fafb" height={80} />
          
          {/* Section 2 */}
          <RevealSection direction="left" className="flex flex-col items-center text-center">
            <Users className="w-16 h-16 text-green-600 mb-8" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Verified Professionals</h2>
            <p className="text-lg text-gray-600 max-w-md mx-auto">
              Every service provider on our platform undergoes a thorough verification process.
              Work with confidence knowing you're hiring trusted experts.
            </p>
          </RevealSection>
          
          {/* Section divider */}
          <SectionDivider type="curve" color="#f9fafb" height={80} />
          
          {/* Section 3 */}
          <RevealSection direction="right" className="flex flex-col items-center text-center">
            <Briefcase className="w-16 h-16 text-purple-600 mb-8" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Project Management</h2>
            <p className="text-lg text-gray-600 max-w-md mx-auto">
              Keep track of all your projects in one place. Monitor progress,
              communicate with service providers, and manage payments seamlessly.
            </p>
          </RevealSection>
          
          {/* Section divider */}
          <SectionDivider type="diagonal" color="#f9fafb" height={80} />
          
          {/* Section 4 */}
          <RevealSection direction="up" className="flex flex-col items-center text-center">
            <Award className="w-16 h-16 text-amber-600 mb-8" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Quality Guarantee</h2>
            <p className="text-lg text-gray-600 max-w-md mx-auto">
              We stand behind the quality of our service providers. If you're not
              satisfied, we'll work with you to make it right.
            </p>
          </RevealSection>
          
          {/* Section divider */}
          <SectionDivider type="triangle" color="#f9fafb" height={80} />
          
          {/* Section 5 */}
          <RevealSection direction="left" className="flex flex-col items-center text-center">
            <TrendingUp className="w-16 h-16 text-red-600 mb-8" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Growth Opportunities</h2>
            <p className="text-lg text-gray-600 max-w-md mx-auto">
              For service providers, our platform offers a steady stream of clients
              and tools to help you grow your business.
            </p>
          </RevealSection>
          
          {/* Section divider */}
          <SectionDivider type="wave" color="#f9fafb" height={80} />
          
          {/* Section 6 */}
          <RevealSection direction="right" className="flex flex-col items-center text-center">
            <Shield className="w-16 h-16 text-indigo-600 mb-8" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Secure Payments</h2>
            <p className="text-lg text-gray-600 max-w-md mx-auto">
              Our secure payment system ensures that your transactions are protected.
              Pay with confidence using our trusted platform.
            </p>
          </RevealSection>
        </div>
      </div>
    </div>
  );
};

export default ScrollRevealSections;
