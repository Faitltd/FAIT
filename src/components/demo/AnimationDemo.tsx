import React from 'react';
import RevealSection from '../animations/RevealSection';
import ParallaxLayer from '../animations/ParallaxLayer';
import ScrollMotionWrapper from '../animations/ScrollMotionWrapper';
import SectionDivider from '../animations/SectionDivider';
import WaveDivider from '../animations/WaveDivider';

const AnimationDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <ParallaxLayer
          speed={-0.2}
          className="absolute inset-0 z-0"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500 to-purple-600" />
        </ParallaxLayer>

        <ParallaxLayer
          speed={0.5}
          direction="horizontal"
          className="absolute inset-0 z-10 pointer-events-none"
        >
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-green-400 opacity-20" />
          <div className="absolute top-1/3 right-1/4 w-48 h-48 rounded-full bg-yellow-400 opacity-20" />
          <div className="absolute bottom-1/4 left-1/3 w-56 h-56 rounded-full bg-pink-400 opacity-20" />
        </ParallaxLayer>

        <div className="relative z-20 text-center text-white px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">Animation Components</h1>
          <p className="text-xl md:text-2xl max-w-2xl mx-auto">
            Scroll down to see our animation components in action
          </p>
        </div>
      </section>

      {/* Wave Divider */}
      <WaveDivider 
        wavePattern="wave3" 
        height={100} 
        gradient={{
          colors: ['#3b82f6', '#8b5cf6'],
          direction: 'horizontal'
        }}
      />

      {/* Reveal Sections */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Reveal Sections</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <RevealSection direction="left" className="bg-blue-50 p-8 rounded-lg shadow-md">
              <h3 className="text-2xl font-semibold mb-4">Slide from Left</h3>
              <p className="text-gray-700">
                This section slides in from the left when it enters the viewport.
              </p>
            </RevealSection>

            <RevealSection direction="right" className="bg-purple-50 p-8 rounded-lg shadow-md">
              <h3 className="text-2xl font-semibold mb-4">Slide from Right</h3>
              <p className="text-gray-700">
                This section slides in from the right when it enters the viewport.
              </p>
            </RevealSection>

            <RevealSection direction="up" className="bg-green-50 p-8 rounded-lg shadow-md">
              <h3 className="text-2xl font-semibold mb-4">Slide from Bottom</h3>
              <p className="text-gray-700">
                This section slides up from the bottom when it enters the viewport.
              </p>
            </RevealSection>

            <RevealSection direction="down" className="bg-yellow-50 p-8 rounded-lg shadow-md">
              <h3 className="text-2xl font-semibold mb-4">Slide from Top</h3>
              <p className="text-gray-700">
                This section slides down from the top when it enters the viewport.
              </p>
            </RevealSection>
          </div>

          <div className="mt-16">
            <RevealSection 
              staggerChildren={true} 
              staggerDelay={0.1} 
              className="bg-gray-50 p-8 rounded-lg shadow-md"
            >
              <h3 className="text-2xl font-semibold mb-4">Staggered Children</h3>
              <p className="text-gray-700 mb-4">
                Each child element animates with a slight delay after the previous one.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="bg-white p-4 rounded shadow">
                    <h4 className="font-medium">Item {item}</h4>
                    <p className="text-sm text-gray-600">This item animates with a delay.</p>
                  </div>
                ))}
              </div>
            </RevealSection>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <SectionDivider 
        type="curve" 
        height={80} 
        color="#f3f4f6" 
        position="bottom" 
      />

      {/* Parallax Layers */}
      <section className="py-20 px-4 bg-gray-100 relative overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10">
          <h2 className="text-4xl font-bold text-center mb-16">Parallax Layers</h2>
          
          <div className="relative h-96 bg-white rounded-lg shadow-lg overflow-hidden">
            <ParallaxLayer
              speed={0.2}
              className="absolute inset-0"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 opacity-20" />
            </ParallaxLayer>

            <ParallaxLayer
              speed={0.5}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="w-64 h-64 bg-yellow-300 rounded-full opacity-20" />
            </ParallaxLayer>

            <ParallaxLayer
              speed={-0.3}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="text-center z-20">
                <h3 className="text-3xl font-bold mb-4">Parallax Effect</h3>
                <p className="text-gray-700 max-w-md">
                  Layers move at different speeds as you scroll, creating a depth effect.
                </p>
              </div>
            </ParallaxLayer>
          </div>
        </div>
      </section>

      {/* Wave Divider */}
      <WaveDivider 
        wavePattern="wave5" 
        height={100} 
        gradient={{
          colors: ['#f3f4f6', '#ffffff'],
          direction: 'horizontal'
        }}
        position="top"
      />

      {/* Scroll Motion Wrapper */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Scroll Motion Effects</h2>
          
          <div className="h-96 bg-gray-50 rounded-lg shadow-md overflow-hidden relative">
            <ScrollMotionWrapper
              effects={{
                opacity: [0.3, 1],
                scale: [0.8, 1],
                rotate: [5, 0],
                translateY: [50, 0]
              }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="text-center">
                <h3 className="text-3xl font-bold mb-4">Scroll-Linked Animation</h3>
                <p className="text-gray-700 max-w-md mx-auto">
                  This element's properties change as you scroll through the section.
                </p>
              </div>
            </ScrollMotionWrapper>
          </div>
        </div>
      </section>

      {/* Final Wave Divider */}
      <WaveDivider 
        wavePattern="wave1" 
        height={120} 
        gradient={{
          colors: ['#ffffff', '#3b82f6'],
          direction: 'horizontal'
        }}
      />

      {/* Footer */}
      <footer className="bg-blue-600 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to add animations to your project?</h2>
          <p className="text-xl mb-8">
            Use these components to create engaging, scroll-activated experiences.
          </p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-full font-medium hover:bg-blue-50 transition-colors">
            Get Started
          </button>
        </div>
      </footer>
    </div>
  );
};

export default AnimationDemo;
