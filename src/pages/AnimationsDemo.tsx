import React from 'react';
import ScrollRevealSections from '../components/animations/ScrollRevealSections';
import RevealSection from '../components/animations/RevealSection';
import ParallaxLayer from '../components/animations/ParallaxLayer';
import SectionDivider from '../components/ui/SectionDivider';

/**
 * Animations Demo Page
 * 
 * A standalone page that showcases all the animation components.
 */
const AnimationsDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        {/* Background parallax elements */}
        <ParallaxLayer
          speed={-0.2}
          direction="horizontal"
          className="absolute top-20 right-20 w-64 h-64"
          opacity={0.1}
          zIndex={0}
        >
          <div className="w-full h-full rounded-full bg-white"></div>
        </ParallaxLayer>
        
        <ParallaxLayer
          speed={0.1}
          direction="vertical"
          className="absolute bottom-10 left-10 w-48 h-48"
          opacity={0.1}
          zIndex={0}
        >
          <div className="w-full h-full rounded-full bg-white"></div>
        </ParallaxLayer>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 z-10">
          <RevealSection direction="up" delay={0.2}>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Animation Components</h1>
            <p className="text-xl text-blue-100 max-w-3xl">
              Scroll down to explore our collection of animation components including reveal sections,
              parallax effects, and section dividers.
            </p>
          </RevealSection>
        </div>
      </header>
      
      <SectionDivider type="wave" color="white" height={100} />
      
      <main className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <RevealSection direction="up" className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Animation Components</h2>
            <p className="text-lg text-gray-600 max-w-3xl">
              These components use Framer Motion to create smooth, performant animations that enhance
              the user experience without being distracting.
            </p>
          </RevealSection>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
            <RevealSection direction="left" delay={0.1} className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold text-gray-900 mb-3">RevealSection</h3>
              <p className="text-gray-600 mb-4">
                A component that reveals its children when they enter the viewport.
                Supports different directions, delays, and durations.
              </p>
              <div className="bg-gray-100 p-4 rounded-md">
                <code className="text-sm text-gray-800">
                  {`<RevealSection direction="up" delay={0.2}>\n  <h2>Your content here</h2>\n</RevealSection>`}
                </code>
              </div>
            </RevealSection>
            
            <RevealSection direction="right" delay={0.2} className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold text-gray-900 mb-3">ParallaxLayer</h3>
              <p className="text-gray-600 mb-4">
                Creates a parallax scrolling effect for background elements.
                Supports vertical and horizontal movement with configurable speeds.
              </p>
              <div className="bg-gray-100 p-4 rounded-md">
                <code className="text-sm text-gray-800">
                  {`<ParallaxLayer speed={0.2} direction="vertical">\n  <div>Your background element</div>\n</ParallaxLayer>`}
                </code>
              </div>
            </RevealSection>
            
            <RevealSection direction="left" delay={0.3} className="bg-white p-6 rounded-lg shadow-md md:col-span-2">
              <h3 className="text-xl font-bold text-gray-900 mb-3">SectionDivider</h3>
              <p className="text-gray-600 mb-4">
                Creates visually appealing dividers between sections using SVG shapes.
                Supports different shapes and parallax effects.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Wave</p>
                  <SectionDivider type="wave" color="#f0f4f8" height={50} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Curve</p>
                  <SectionDivider type="curve" color="#f0f4f8" height={50} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Diagonal</p>
                  <SectionDivider type="diagonal" color="#f0f4f8" height={50} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Triangle</p>
                  <SectionDivider type="triangle" color="#f0f4f8" height={50} />
                </div>
              </div>
            </RevealSection>
          </div>
        </div>
        
        <SectionDivider type="curve" color="#f9fafb" height={100} />
        
        <div className="bg-gray-50 py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <RevealSection direction="up" className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Scroll Reveal Sections Demo</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Scroll down to see how these components work together to create an engaging user experience.
              </p>
            </RevealSection>
          </div>
          
          <ScrollRevealSections />
        </div>
      </main>
    </div>
  );
};

export default AnimationsDemo;
