import React from 'react';
import RevealSection from '../components/animations/RevealSection';
import ParallaxLayer from '../components/animations/ParallaxLayer';
import ScrollMotionWrapper from '../components/animations/ScrollMotionWrapper';
import SectionDivider from '../components/ui/SectionDivider';
import WaveDivider from '../components/ui/WaveDivider';
import SimpleMotionTest from '../components/animations/SimpleMotionTest';
import { motion } from 'framer-motion';

/**
 * Animation Test Page
 *
 * A test page for the animation components with FAIT Co-op content.
 */
const AnimationTest: React.FC = () => {
  return (
    <div className="min-h-[300vh]">
      {/* Header */}
      <div className="relative overflow-hidden py-16 px-4">
        {/* Bright geometric shapes background */}
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-blue-600 to-indigo-700">
          {/* Geometric shapes */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400 rounded-full opacity-30 -translate-y-1/2 translate-x-1/4"></div>
          <div className="absolute top-1/4 left-0 w-96 h-96 bg-indigo-500 rounded-full opacity-20 -translate-x-1/2"></div>
          <div className="absolute bottom-0 right-1/3 w-80 h-80 bg-purple-500 rounded-full opacity-20 translate-y-1/2"></div>
          <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-blue-300 rounded-full opacity-30 -translate-y-1/2"></div>

          {/* Square shapes */}
          <div className="absolute top-10 left-1/3 w-32 h-32 bg-indigo-400 rounded-lg opacity-20 rotate-12"></div>
          <div className="absolute bottom-20 left-10 w-40 h-40 bg-blue-500 rounded-lg opacity-20 -rotate-12"></div>
          <div className="absolute top-1/3 right-20 w-24 h-24 bg-purple-400 rounded-lg opacity-30 rotate-45"></div>
        </div>

        <div className="container mx-auto relative z-10 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Transform Your Home with FAIT Co-op</h1>
            <p className="text-xl md:text-2xl max-w-3xl">
              Expert renovation services from trusted local contractors. Quality craftsmanship backed by our cooperative guarantee.
            </p>
          </motion.div>

          {/* Service badges */}
          <div className="mt-8 flex flex-wrap gap-4 justify-center md:justify-start">
            {['Kitchen Remodeling', 'Bathroom Renovation', 'Flooring', 'Electrical', 'Plumbing', 'Exterior'].map((service, index) => (
              <motion.div
                key={service}
                className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                {service}
              </motion.div>
            ))}
          </div>

          {/* Simple Motion Test */}
          <div className="mt-12">
            <SimpleMotionTest />
          </div>
        </div>
      </div>

      <WaveDivider
        height={100}
        color="white"
        bgColor="transparent"
        waveCount={4}
        amplitude={30}
        parallax={true}
      />

      {/* Reveal Sections */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-2 text-center">Premium Renovation Services</h2>
          <p className="text-gray-600 text-center mb-12 max-w-3xl mx-auto">Our cooperative connects you with skilled professionals for every aspect of your home renovation project.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <RevealSection direction="up" className="bg-blue-50 p-0 rounded-lg overflow-hidden shadow-lg">
              <div className="relative h-48 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1556912173-3bb406ef7e77?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80"
                  alt="Kitchen Renovation"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                  <h3 className="text-xl font-semibold mb-4 px-6 text-white">Kitchen Renovations</h3>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-700">Transform your kitchen with custom cabinetry, premium countertops, and energy-efficient appliances. Our certified contractors specialize in creating functional, beautiful cooking spaces.</p>
                <div className="mt-4 flex gap-2 flex-wrap">
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Custom Cabinets</span>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Countertops</span>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Appliance Installation</span>
                </div>
              </div>
            </RevealSection>

            <RevealSection direction="down" className="bg-green-50 p-0 rounded-lg overflow-hidden shadow-lg">
              <div className="relative h-48 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80"
                  alt="Bathroom Remodeling"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                  <h3 className="text-xl font-semibold mb-4 px-6 text-white">Bathroom Remodeling</h3>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-700">Create your dream bathroom with luxury fixtures, custom tile work, and modern vanities. Our bathroom specialists deliver waterproof, mold-resistant installations with premium finishes.</p>
                <div className="mt-4 flex gap-2 flex-wrap">
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Shower Conversion</span>
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Tile Installation</span>
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Plumbing Fixtures</span>
                </div>
              </div>
            </RevealSection>

            <RevealSection direction="left" className="bg-yellow-50 p-0 rounded-lg overflow-hidden shadow-lg">
              <div className="relative h-48 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1603969072881-b0fc7f3d6d7a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80"
                  alt="Flooring Installation"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                  <h3 className="text-xl font-semibold mb-4 px-6 text-white">Flooring Installation</h3>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-700">Upgrade your home with hardwood, luxury vinyl plank, tile, or eco-friendly flooring options. Our installation experts ensure proper subfloor preparation and flawless finishing.</p>
                <div className="mt-4 flex gap-2 flex-wrap">
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">Hardwood</span>
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">Luxury Vinyl</span>
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">Tile Flooring</span>
                </div>
              </div>
            </RevealSection>

            <RevealSection direction="right" className="bg-purple-50 p-0 rounded-lg overflow-hidden shadow-lg">
              <div className="relative h-48 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1621275471769-e6aa344546d5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80"
                  alt="Exterior Renovation"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                  <h3 className="text-xl font-semibold mb-4 px-6 text-white">Exterior Renovations</h3>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-700">Enhance your home's curb appeal with siding replacement, window installation, deck building, and exterior painting. Our contractors are experts in weather-resistant, energy-efficient solutions.</p>
                <div className="mt-4 flex gap-2 flex-wrap">
                  <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">Siding</span>
                  <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">Windows</span>
                  <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">Deck Construction</span>
                </div>
              </div>
            </RevealSection>
          </div>
        </div>
      </section>

      <SectionDivider
        type="straight"
        color="#f3f4f6"
        height={80}
        parallax={true}
      />

      {/* Parallax Layers */}
      <section className="py-16 px-4 bg-gray-100 relative overflow-hidden">
        <div className="container mx-auto relative z-10">
          <h2 className="text-3xl font-bold mb-2 text-center">The FAIT Co-op Advantage</h2>
          <p className="text-gray-600 text-center mb-12 max-w-3xl mx-auto">Our unique cooperative model benefits both homeowners and service providers.</p>

          <div className="bg-white rounded-lg shadow-xl mb-16 relative overflow-hidden">
            {/* Decorative elements with parallax effect */}
            <ParallaxLayer
              speed={0.2}
              direction="vertical"
              className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-blue-200 opacity-30"
            />

            <ParallaxLayer
              speed={0.4}
              direction="horizontal"
              className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-green-200 opacity-30"
            />

            <ParallaxLayer
              speed={0.3}
              direction="vertical"
              className="absolute top-40 right-40 w-24 h-24 rounded-full bg-yellow-200 opacity-30"
            />

            {/* Bright geometric shapes with parallax */}
            <ParallaxLayer
              speed={0.1}
              direction="horizontal"
              className="absolute top-0 right-0 w-64 h-64 bg-blue-200 rounded-lg opacity-30 rotate-12"
            />

            <ParallaxLayer
              speed={0.15}
              direction="vertical"
              className="absolute bottom-20 left-10 w-40 h-40 bg-green-200 rounded-lg opacity-30 -rotate-12"
            />

            <ParallaxLayer
              speed={0.2}
              direction="horizontal"
              className="absolute top-1/3 right-20 w-24 h-24 bg-yellow-200 rounded-lg opacity-30 rotate-45"
            />

            <ParallaxLayer
              speed={0.25}
              direction="vertical"
              className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-purple-200 rounded-lg opacity-30 -rotate-6"
            />

            <div className="relative z-10 p-8 md:p-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-2xl font-semibold mb-6 text-blue-800">Renovation Project Management</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <svg className="h-6 w-6 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <p className="text-gray-700"><span className="font-medium">Permit Assistance:</span> Our platform integrates with Denver ePermits system to streamline the approval process for your renovation projects.</p>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-6 w-6 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <p className="text-gray-700"><span className="font-medium">Interactive Planning Tools:</span> Access GIS & zoning data to ensure your renovation plans comply with local regulations.</p>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-6 w-6 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <p className="text-gray-700"><span className="font-medium">Infrastructure Information:</span> Get detailed water and utility infrastructure data to inform your renovation decisions.</p>
                    </li>
                  </ul>
                </div>
                <div className="relative h-64 md:h-auto overflow-hidden rounded-lg">
                  <img
                    src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1331&q=80"
                    alt="Renovation Planning"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end">
                    <p className="text-white p-4 text-sm">Our interactive tools help you visualize your renovation project before work begins.</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-xl font-semibold mb-4 text-blue-800">Cooperative Benefits</h3>
                <p className="text-gray-700 mb-6">
                  As a member of FAIT Co-op, you're not just a customer – you're a stakeholder in our success. Our cooperative model ensures that both homeowners and service providers benefit from the platform's growth.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">For Homeowners</h4>
                    <p className="text-sm text-gray-700">Receive dividends based on platform usage and enjoy member-only discounts on renovation services.</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">For Contractors</h4>
                    <p className="text-sm text-gray-700">Lower customer acquisition costs and build a stable client base through our cooperative network.</p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-medium text-yellow-800 mb-2">For Communities</h4>
                    <p className="text-sm text-gray-700">Support local businesses and contribute to sustainable neighborhood development.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <WaveDivider
        height={100}
        gradientFrom="#f3f4f6"
        gradientTo="#ffffff"
        flip={true}
      />

      {/* Scroll Motion Wrapper */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-2 text-center">Our Renovation Process</h2>
          <p className="text-gray-600 text-center mb-12 max-w-3xl mx-auto">We make home renovations simple with our streamlined, transparent process.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <ScrollMotionWrapper
              transforms={[
                {
                  property: 'y',
                  inputRange: [0, 0.5, 1],
                  outputRange: [50, 0, -50]
                },
                {
                  property: 'opacity',
                  inputRange: [0, 0.2, 0.8, 1],
                  outputRange: [0, 1, 1, 0]
                }
              ]}
              className="bg-white p-0 rounded-lg shadow-lg overflow-hidden"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1589939705384-5185137a7f0f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80"
                  alt="Consultation"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl">1</div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-blue-800">Consultation & Planning</h3>
                <p className="text-gray-700">
                  We begin with a detailed consultation to understand your vision. Our experts help you develop a comprehensive renovation plan, including budget estimates and timeline projections.
                </p>
                <ul className="mt-4 space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <span className="mr-2 text-blue-500">✓</span> Free initial consultation
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2 text-blue-500">✓</span> Detailed project scope
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2 text-blue-500">✓</span> Budget planning
                  </li>
                </ul>
              </div>
            </ScrollMotionWrapper>

            <ScrollMotionWrapper
              transforms={[
                {
                  property: 'y',
                  inputRange: [0, 0.5, 1],
                  outputRange: [50, 0, -50]
                },
                {
                  property: 'opacity',
                  inputRange: [0, 0.2, 0.8, 1],
                  outputRange: [0, 1, 1, 0]
                }
              ]}
              className="bg-white p-0 rounded-lg shadow-lg overflow-hidden md:mt-12"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80"
                  alt="Design"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl">2</div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-blue-800">Design & Material Selection</h3>
                <p className="text-gray-700">
                  Work with our design team to finalize your renovation plans. Select from premium materials and fixtures with guidance from our experienced designers.
                </p>
                <ul className="mt-4 space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <span className="mr-2 text-blue-500">✓</span> Professional design services
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2 text-blue-500">✓</span> Material samples and options
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2 text-blue-500">✓</span> 3D visualization
                  </li>
                </ul>
              </div>
            </ScrollMotionWrapper>

            <ScrollMotionWrapper
              transforms={[
                {
                  property: 'y',
                  inputRange: [0, 0.5, 1],
                  outputRange: [50, 0, -50]
                },
                {
                  property: 'opacity',
                  inputRange: [0, 0.2, 0.8, 1],
                  outputRange: [0, 1, 1, 0]
                }
              ]}
              className="bg-white p-0 rounded-lg shadow-lg overflow-hidden md:mt-24"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1574359411659-11a7e1b7fe9b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80"
                  alt="Construction"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl">3</div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-blue-800">Construction & Completion</h3>
                <p className="text-gray-700">
                  Our skilled contractors execute your renovation with precision and care. Track progress through our platform and receive regular updates until the final walkthrough.
                </p>
                <ul className="mt-4 space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <span className="mr-2 text-blue-500">✓</span> Licensed, insured contractors
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2 text-blue-500">✓</span> Real-time progress tracking
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2 text-blue-500">✓</span> Final inspection & warranty
                  </li>
                </ul>
              </div>
            </ScrollMotionWrapper>
          </div>

          <ScrollMotionWrapper
            transforms={[
              {
                property: 'scale',
                inputRange: [0, 0.5, 1],
                outputRange: [0.95, 1, 0.95]
              },
              {
                property: 'opacity',
                inputRange: [0, 0.2, 0.8, 1],
                outputRange: [0, 1, 1, 0]
              }
            ]}
            className="bg-blue-50 p-8 rounded-lg shadow-lg border border-blue-100"
          >
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="md:w-1/4 flex justify-center">
                <img
                  src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1773&q=80"
                  alt="Satisfied Homeowner"
                  className="w-32 h-32 object-cover rounded-full border-4 border-white shadow-md"
                />
              </div>
              <div className="md:w-3/4">
                <h3 className="text-xl font-semibold mb-2 text-blue-800">Our Satisfaction Guarantee</h3>
                <p className="text-gray-700 mb-4">
                  "FAIT Co-op transformed our outdated kitchen into a modern, functional space that exceeded our expectations. The process was transparent from start to finish, and the quality of work is outstanding."
                </p>
                <p className="text-blue-800 font-medium">- Sarah & Michael Johnson, Denver Homeowners</p>
                <div className="mt-4 flex items-center">
                  <div className="flex text-yellow-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    ))}
                  </div>
                  <span className="ml-2 text-gray-600 text-sm">Completed Kitchen Renovation, 2023</span>
                </div>
              </div>
            </div>
          </ScrollMotionWrapper>
        </div>
      </section>

      <SectionDivider
        type="wave"
        color="#3b82f6"
        height={100}
      />

      {/* Footer */}
      <footer className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16 px-4">
        {/* Bright geometric shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400 rounded-lg opacity-20 rotate-12"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-400 rounded-lg opacity-20 -rotate-12"></div>
        <div className="absolute top-1/4 right-1/4 w-40 h-40 bg-purple-400 rounded-lg opacity-20 rotate-45"></div>
        <div className="absolute bottom-1/3 right-1/3 w-32 h-32 bg-blue-300 rounded-lg opacity-20 -rotate-6"></div>
        <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-indigo-300 rounded-lg opacity-20 rotate-20"></div>

        <div className="container mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              <h2 className="text-3xl font-bold mb-6">Transform Your Home with FAIT Co-op</h2>
              <p className="mb-6 text-blue-100 max-w-md">
                Join our cooperative community today and experience premium home renovation services backed by our member-owned guarantee.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition duration-300">
                  Get Started
                </a>
                <a href="#" className="border border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white/10 transition duration-300">
                  Learn More
                </a>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4 border-b border-blue-500 pb-2">Renovation Services</h3>
              <ul className="space-y-2 text-blue-100">
                <li>Kitchen Remodeling</li>
                <li>Bathroom Renovation</li>
                <li>Flooring Installation</li>
                <li>Exterior Improvements</li>
                <li>Basement Finishing</li>
                <li>Home Additions</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4 border-b border-blue-500 pb-2">Member Benefits</h3>
              <ul className="space-y-2 text-blue-100">
                <li>Quality Guarantee</li>
                <li>Transparent Pricing</li>
                <li>Project Management</li>
                <li>Cooperative Ownership</li>
                <li>Community Support</li>
                <li>Exclusive Discounts</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-blue-500 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-blue-600 font-bold text-xl mr-3">
                F
              </div>
              <span className="text-xl font-bold">FAIT Co-op</span>
            </div>

            <div className="flex space-x-6 mb-4 md:mb-0">
              <a href="#" className="text-blue-100 hover:text-white transition duration-300">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-blue-100 hover:text-white transition duration-300">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-blue-100 hover:text-white transition duration-300">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
            </div>

            <p className="text-blue-200 text-sm">
              &copy; 2024 FAIT Co-Op. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AnimationTest;
