import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Button from '../components/ui/Button';

// Import animation components
import AnimatedHero from '../components/animations/AnimatedHero';
import RevealSection from '../components/animations/RevealSection';
import SectionDivider from '../components/animations/SectionDivider';
import InteractiveCard from '../components/animations/InteractiveCard';
import DynamicFooter from '../components/animations/DynamicFooter';

// Icons
import { ArrowUp } from 'lucide-react';

const LandingPage: React.FC = () => {

  // No featured projects

  return (
    <MainLayout className="bg-white text-center">
      {/* Back to top button */}
      <button
        className="fixed bottom-8 right-8 p-3 rounded-full bg-fuchsia-600 hover:bg-fuchsia-700 transition-colors z-50 shadow-lg"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <ArrowUp size={20} className="text-white" />
      </button>

      {/* Hero Section with Animation */}
      <AnimatedHero
        title="Find Trusted Contractors for Your Home Projects"
        subtitle="Connect with verified professionals through our cooperative platform with fair pricing and streamlined communication."
        ctaText="Join the Co-op"
        ctaLink="/register"
        secondaryCtaText="Learn More"
        secondaryCtaLink="/about"
      />

      {/* Section Divider */}
      <SectionDivider type="wave" topColor="bg-fuchsia-700" bottomColor="bg-white" />

      {/* Services Section with Photos */}
      <section className="py-16 bg-white relative border-b-4 border-fuchsia-100">
        <div className="container mx-auto px-4">
          <RevealSection>
            <h2 className="text-3xl font-bold mb-8 text-center text-fuchsia-800">Our Professional Services</h2>
            <p className="text-gray-600 mb-12 text-center max-w-3xl mx-auto">
              We connect you with trusted professionals for all your home improvement needs.
            </p>
          </RevealSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <RevealSection direction="up" delay={0.1}>
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="mb-4 h-48 overflow-hidden rounded-lg">
                  <img
                    src="/images/service-plumbing.jpg"
                    alt="Plumbing Services"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-bold mb-2 text-fuchsia-700">Plumbing Services</h3>
                <p className="text-gray-600">Professional plumbing solutions for repairs, installations, and maintenance.</p>
              </div>
            </RevealSection>

            <RevealSection direction="up" delay={0.2}>
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="mb-4 h-48 overflow-hidden rounded-lg">
                  <img
                    src="/images/service-electrical.jpg"
                    alt="Electrical Services"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-bold mb-2 text-fuchsia-700">Electrical Services</h3>
                <p className="text-gray-600">Licensed electricians for all your electrical needs, from repairs to installations.</p>
              </div>
            </RevealSection>

            <RevealSection direction="up" delay={0.3}>
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="mb-4 h-48 overflow-hidden rounded-lg">
                  <img
                    src="/images/service-renovation.jpg"
                    alt="Home Renovation"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-bold mb-2 text-fuchsia-700">Home Renovation</h3>
                <p className="text-gray-600">Transform your living spaces with our expert renovation contractors.</p>
              </div>
            </RevealSection>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <SectionDivider type="curve" topColor="bg-white" bottomColor="bg-white" />

      {/* Testimonials */}
      <section className="py-16 relative bg-gray-50 border-y-4 border-fuchsia-100">
        <div className="container mx-auto px-4">
          <RevealSection>
            <h2 className="text-3xl font-bold mb-12 text-center text-fuchsia-800">What Our Members Say</h2>
          </RevealSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <RevealSection direction="up" delay={0.1}>
              <InteractiveCard className="bg-white p-6 shadow-md border border-gray-100 h-full rounded-lg" index={0}>
                <div className="flex flex-col items-center mb-4">
                  <div className="h-20 w-20 rounded-full bg-gray-200 overflow-hidden mb-4 border-2 border-fuchsia-200">
                    <img src="/images/testimonial-1.jpg" alt="User" className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-fuchsia-700">Sarah Johnson</h4>
                    <p className="text-sm text-gray-500">Homeowner</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">"I found a reliable plumber through FAIT Co-op in less than an hour. The transparent pricing and verified reviews gave me confidence in my choice."</p>
                <div className="flex justify-center text-yellow-400 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </InteractiveCard>
            </RevealSection>

            <RevealSection direction="up" delay={0.2}>
              <InteractiveCard className="bg-white p-6 shadow-md border border-gray-100 h-full rounded-lg" index={1}>
                <div className="flex flex-col items-center mb-4">
                  <div className="h-20 w-20 rounded-full bg-gray-200 overflow-hidden mb-4 border-2 border-fuchsia-200">
                    <img src="/images/testimonial-2.jpg" alt="User" className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-fuchsia-700">Michael Rodriguez</h4>
                    <p className="text-sm text-gray-500">Contractor</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">"As an electrician, joining the co-op has connected me with quality clients and eliminated the need for expensive advertising. The fair fee structure means I keep more of what I earn."</p>
                <div className="flex justify-center text-yellow-400 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </InteractiveCard>
            </RevealSection>

            <RevealSection direction="up" delay={0.3}>
              <InteractiveCard className="bg-white p-6 shadow-md border border-gray-100 h-full rounded-lg" index={2}>
                <div className="flex flex-col items-center mb-4">
                  <div className="h-20 w-20 rounded-full bg-gray-200 overflow-hidden mb-4 border-2 border-fuchsia-200">
                    <img src="/images/testimonial-3.jpg" alt="User" className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-fuchsia-700">Jennifer Lee</h4>
                    <p className="text-sm text-gray-500">Property Manager</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">"Managing multiple properties is so much easier with FAIT Co-op. I can quickly find reliable contractors for any job, and the platform handles all the scheduling and payment processing."</p>
                <div className="flex justify-center text-yellow-400 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5" fill={i < 4 ? "currentColor" : "none"} stroke={i < 4 ? "none" : "currentColor"} viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </InteractiveCard>
            </RevealSection>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <RevealSection>
            <h2 className="text-3xl font-bold mb-12 text-center text-fuchsia-800">How FAIT Co-op Works</h2>
          </RevealSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <RevealSection direction="up" delay={0.1}>
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 h-full">
                <div className="mb-6 flex justify-center">
                  <div className="w-24 h-24 rounded-full bg-fuchsia-100 flex items-center justify-center">
                    <span className="text-4xl font-bold text-fuchsia-600">1</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-fuchsia-700">Join the Co-op</h3>
                <p className="text-gray-600">Sign up as a homeowner or contractor and become part of our cooperative community.</p>
              </div>
            </RevealSection>

            <RevealSection direction="up" delay={0.2}>
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 h-full">
                <div className="mb-6 flex justify-center">
                  <div className="w-24 h-24 rounded-full bg-fuchsia-100 flex items-center justify-center">
                    <span className="text-4xl font-bold text-fuchsia-600">2</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-fuchsia-700">Connect & Collaborate</h3>
                <p className="text-gray-600">Find the right professionals or clients for your projects with our matching system.</p>
              </div>
            </RevealSection>

            <RevealSection direction="up" delay={0.3}>
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 h-full">
                <div className="mb-6 flex justify-center">
                  <div className="w-24 h-24 rounded-full bg-fuchsia-100 flex items-center justify-center">
                    <span className="text-4xl font-bold text-fuchsia-600">3</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-fuchsia-700">Complete Projects</h3>
                <p className="text-gray-600">Manage projects, payments, and communication all in one place with transparent pricing.</p>
              </div>
            </RevealSection>
          </div>

          <div className="mt-12 text-center">
            <Button as={Link} to="/register" size="lg">
              Join Today
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Project Section */}
      <section className="py-16 bg-gray-50 border-y-4 border-fuchsia-100">
        <div className="container mx-auto px-4">
          <RevealSection>
            <h2 className="text-3xl font-bold mb-12 text-center text-fuchsia-800">Featured Project</h2>
          </RevealSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <RevealSection direction="left">
              <div className="rounded-lg overflow-hidden shadow-lg">
                <img
                  src="/images/featured-project.jpg"
                  alt="Featured Home Renovation Project"
                  className="w-full h-auto"
                />
              </div>
            </RevealSection>

            <RevealSection direction="right">
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-bold mb-4 text-fuchsia-700">Complete Kitchen Renovation</h3>
                <p className="text-gray-600 mb-6">
                  This stunning kitchen renovation was completed by one of our top-rated contractors. The project included new cabinets, countertops, appliances, and flooring, transforming an outdated kitchen into a modern cooking space.
                </p>
                <div className="flex flex-wrap gap-3 justify-center md:justify-start mb-6">
                  <span className="px-3 py-1 bg-fuchsia-100 text-fuchsia-700 rounded-full text-sm">Kitchen</span>
                  <span className="px-3 py-1 bg-fuchsia-100 text-fuchsia-700 rounded-full text-sm">Renovation</span>
                  <span className="px-3 py-1 bg-fuchsia-100 text-fuchsia-700 rounded-full text-sm">Modern</span>
                </div>
                <Button as={Link} to="/projects" variant="outline">
                  View More Projects
                </Button>
              </div>
            </RevealSection>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-white border-b-4 border-fuchsia-100">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <RevealSection>
              <h2 className="text-2xl font-bold mb-4 text-fuchsia-800">Stay updated with FAIT Co-op</h2>
              <p className="text-gray-600 mb-8">Subscribe to our newsletter for the latest updates, tips, and special offers.</p>
              <form className="flex flex-col sm:flex-row gap-4 justify-center">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="flex-grow px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 max-w-md"
                />
                <Button type="submit">Subscribe</Button>
              </form>
            </RevealSection>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default LandingPage;
