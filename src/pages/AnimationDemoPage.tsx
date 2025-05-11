import React from 'react';
import ScrollRevealSections from '../components/animations/ScrollRevealSections';
import RevealSection from '../components/animations/RevealSection';
import ParallaxLayer from '../components/animations/ParallaxLayer';
import SectionDivider from '../components/ui/SectionDivider';
import { motion } from 'framer-motion';

/**
 * Animation Demo Page
 * 
 * This page showcases various animation components and effects
 * including scroll reveals, parallax effects, and section dividers.
 */
const AnimationDemoPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Parallax */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Parallax Layers */}
        <ParallaxLayer
          speed={-0.2}
          className="absolute inset-0 z-0"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500 to-purple-600 opacity-70" />
        </ParallaxLayer>
        
        <ParallaxLayer
          speed={0.1}
          className="absolute inset-0 z-10"
          opacity={0.2}
        >
          <div className="absolute inset-0 bg-[url('/images/parallax/grid-pattern.png')] bg-repeat opacity-20" />
        </ParallaxLayer>
        
        {/* Content */}
        <div className="relative z-20 text-center text-white px-4">
          <motion.h1 
            className="text-5xl md:text-7xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Animation Showcase
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Explore our collection of smooth, performant animations and transitions
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-10"
          >
            <a 
              href="#scroll-sections" 
              className="bg-white text-blue-600 px-8 py-3 rounded-full font-medium hover:bg-blue-50 transition-colors"
            >
              Explore Animations
            </a>
          </motion.div>
        </div>
        
        {/* Floating Elements */}
        <ParallaxLayer
          speed={0.3}
          className="absolute top-1/4 left-1/4 w-32 h-32 md:w-48 md:h-48"
          opacity={0.15}
        >
          <div className="w-full h-full rounded-full bg-yellow-300" />
        </ParallaxLayer>
        
        <ParallaxLayer
          speed={-0.2}
          className="absolute bottom-1/4 right-1/4 w-24 h-24 md:w-40 md:h-40"
          opacity={0.15}
        >
          <div className="w-full h-full rounded-full bg-green-300" />
        </ParallaxLayer>
      </section>
      
      {/* Wave Divider */}
      <SectionDivider 
        type="wave" 
        color="white" 
        bgColor="#4f46e5" 
        height={120} 
        parallax={true}
        parallaxSpeed={0.15}
      />
      
      {/* Scroll Reveal Sections */}
      <section id="scroll-sections" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <RevealSection direction="up" className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Scroll-Activated Animations</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Elements that animate into view as you scroll down the page
            </p>
          </RevealSection>
          
          <ScrollRevealSections />
        </div>
      </section>
      
      {/* Curved Divider */}
      <SectionDivider 
        type="curve" 
        color="#f3f4f6" 
        bgColor="white" 
        height={100} 
        parallax={true}
        parallaxSpeed={0.1}
      />
      
      {/* Parallax Image Section */}
      <section className="relative py-24 bg-gray-100 overflow-hidden">
        <ParallaxLayer
          speed={-0.15}
          className="absolute inset-0"
          opacity={0.2}
        >
          <div className="absolute inset-0 bg-[url('/images/parallax/dots-pattern.png')] bg-repeat" />
        </ParallaxLayer>
        
        <div className="container mx-auto px-4 relative z-10">
          <RevealSection direction="up" className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Parallax Effects</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Elements that move at different speeds as you scroll
            </p>
          </RevealSection>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <RevealSection direction="left" delay={0.2}>
              <div className="bg-white rounded-lg shadow-xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Depth Perception</h3>
                <p className="text-gray-600">
                  Parallax effects create a sense of depth and dimension on the page,
                  making the content feel more immersive and engaging.
                </p>
              </div>
            </RevealSection>
            
            <RevealSection direction="right" delay={0.4}>
              <div className="bg-white rounded-lg shadow-xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Visual Interest</h3>
                <p className="text-gray-600">
                  By adding subtle movement to background elements, parallax effects
                  create visual interest without distracting from the main content.
                </p>
              </div>
            </RevealSection>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AnimationDemoPage;
