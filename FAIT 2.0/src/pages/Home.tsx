import React from 'react';
import { Link } from 'react-router-dom';
import { Hero, Features, Testimonials, CTA } from '../components/sections';
import SEO from '../components/SEO';
import { Card, Badge, Button } from '../components/ui';
import {
  Home as HomeIcon,
  Wrench,
  Paintbrush,
  Leaf,
  Lightbulb,
  Droplet,
  Hammer,
  Thermometer
} from 'lucide-react';

const Home: React.FC = () => {
  return (
    <>
      <SEO
        title="FAIT Co-op - Transforming Contractor-Client Relationships"
        description="FAIT Co-op enables contractors, clients, and allied service providers to collaborate through a cooperative platform with standardized pricing and streamlined communication."
        keywords={['FAIT', 'co-op', 'contractors', 'clients', 'service providers', 'collaboration', 'platform']}
      />

      {/* Modern Hero Section with House Image */}
      <div className="relative bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 lg:mt-16 lg:px-8 xl:mt-20">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block">Find trusted professionals</span>
                  <span className="block text-blue-600">for your home projects</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  FAIT Co-op connects clients with skilled service agents in a cooperative platform that prioritizes fair compensation, quality work, and community ownership.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Button
                      as={Link}
                      to="/register"
                      variant="primary"
                      size="lg"
                      className="w-full"
                    >
                      Get Started
                    </Button>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Button
                      as={Link}
                      to="/services"
                      variant="outline"
                      size="lg"
                      className="w-full"
                    >
                      Browse Services
                    </Button>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <img
            className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
            src="https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80"
            alt="Modern home exterior"
          />
        </div>
      </div>

      {/* Service Category Icons */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Find the right service for your home
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Browse our wide range of professional services offered by verified co-op members.
            </p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
              <div className="text-center">
                <div className="flex items-center justify-center h-20 w-20 rounded-full bg-blue-100 mx-auto">
                  <HomeIcon className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="mt-3 text-lg font-medium text-gray-900">Home Renovation</h3>
                <p className="mt-2 text-sm text-gray-500">24 Providers</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center h-20 w-20 rounded-full bg-blue-100 mx-auto">
                  <Lightbulb className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="mt-3 text-lg font-medium text-gray-900">Electrical Work</h3>
                <p className="mt-2 text-sm text-gray-500">18 Providers</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center h-20 w-20 rounded-full bg-blue-100 mx-auto">
                  <Droplet className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="mt-3 text-lg font-medium text-gray-900">Plumbing</h3>
                <p className="mt-2 text-sm text-gray-500">15 Providers</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center h-20 w-20 rounded-full bg-blue-100 mx-auto">
                  <Leaf className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="mt-3 text-lg font-medium text-gray-900">Landscaping</h3>
                <p className="mt-2 text-sm text-gray-500">12 Providers</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center h-20 w-20 rounded-full bg-blue-100 mx-auto">
                  <Paintbrush className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="mt-3 text-lg font-medium text-gray-900">Interior Design</h3>
                <p className="mt-2 text-sm text-gray-500">9 Providers</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center h-20 w-20 rounded-full bg-blue-100 mx-auto">
                  <Hammer className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="mt-3 text-lg font-medium text-gray-900">Roofing</h3>
                <p className="mt-2 text-sm text-gray-500">8 Providers</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center h-20 w-20 rounded-full bg-blue-100 mx-auto">
                  <Thermometer className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="mt-3 text-lg font-medium text-gray-900">HVAC Services</h3>
                <p className="mt-2 text-sm text-gray-500">7 Providers</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center h-20 w-20 rounded-full bg-blue-100 mx-auto">
                  <Wrench className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="mt-3 text-lg font-medium text-gray-900">Maintenance</h3>
                <p className="mt-2 text-sm text-gray-500">14 Providers</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <Features
        title="A better way to connect"
        subtitle="Our platform offers unique benefits for both service professionals and clients."
        features={[
          {
            title: "Cooperative Ownership",
            description: "Service professionals are co-owners of the platform, ensuring fair compensation and democratic decision-making.",
            icon: (
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            )
          },
          {
            title: "Verified Professionals",
            description: "All service agents undergo thorough verification, including background checks, license verification, and insurance validation.",
            icon: (
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            )
          },
          {
            title: "Transparent Pricing",
            description: "Clear, upfront pricing with no hidden fees. Service agents set their own rates and keep more of what they earn.",
            icon: (
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            )
          },
          {
            title: "Secure Messaging",
            description: "Built-in messaging system allows clients and service agents to communicate directly, share details, and coordinate services.",
            icon: (
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            )
          }
        ]}
      />

      {/* How It Works Section */}
      <section className="py-16 bg-white">
        <div className="container-wide">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="heading-2 mb-4">How It Works</h2>
            <p className="text-body text-neutral-600">
              Our platform simplifies the entire contracting process from initial consultation to project completion.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="text-center">
              <div className="bg-primary-100 text-primary-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
              <h3 className="text-xl font-semibold mb-2">Join the Co-op</h3>
              <p className="text-neutral-600">Sign up as a contractor, client, or service provider and complete your profile.</p>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 text-primary-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
              <h3 className="text-xl font-semibold mb-2">Create or Find Projects</h3>
              <p className="text-neutral-600">Post new projects or browse existing opportunities in your area.</p>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 text-primary-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
              <h3 className="text-xl font-semibold mb-2">Collaborate & Complete</h3>
              <p className="text-neutral-600">Use our tools to manage the project from start to finish with full transparency.</p>
            </div>
          </div>
        </div>
      </section>

      {/* App Promotion Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                The only app you'll need to get your projects done
              </h2>
              <p className="mt-3 max-w-3xl text-lg text-gray-500">
                Download our mobile app to manage your projects on the go. Track progress, communicate with contractors, and approve changes all from your smartphone.
              </p>
              <div className="mt-8 sm:flex">
                <div className="rounded-md shadow">
                  <a
                    href="#"
                    className="flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <svg className="h-6 w-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.26-.85-.29-.15-.65-.06-.83.22l-1.88 3.24c-2.86-1.21-6.08-1.21-8.94 0L5.65 5.67c-.19-.29-.58-.38-.87-.2-.28.18-.37.54-.22.83L6.4 9.48C3.3 11.25 1.28 14.44 1 18h22c-.28-3.56-2.3-6.75-5.4-8.52zM7 15.25c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25zm10 0c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25z" />
                    </svg>
                    Android App
                  </a>
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-3">
                  <a
                    href="#"
                    className="flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                  >
                    <svg className="h-6 w-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 8.42 7.31c1.33.07 2.25.78 3.13.84 1.25-.24 2.44-.94 3.69-.83 1.71.16 2.96.91 3.76 2.41-3.35 2.14-2.77 6.82.05 8.54-.73 1.91-1.7 3.8-3.01 5.01zM11.89 7.09c-.08-2.62 2.16-4.94 4.78-5.09.27 2.92-2.6 5.35-4.78 5.09z" />
                    </svg>
                    iOS App
                  </a>
                </div>
              </div>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-0.5 md:grid-cols-3 lg:mt-0 lg:ml-8">
              <div className="col-span-1 flex justify-center py-8 px-8 bg-white">
                <img className="max-h-12" src="https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&q=80" alt="App screenshot" />
              </div>
              <div className="col-span-1 flex justify-center py-8 px-8 bg-white">
                <img className="max-h-12" src="https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&q=80" alt="App screenshot" />
              </div>
              <div className="col-span-1 flex justify-center py-8 px-8 bg-white">
                <img className="max-h-12" src="https://images.unsplash.com/photo-1573497620053-ea5300f94f21?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&q=80" alt="App screenshot" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="py-16 bg-neutral-50">
        <div className="container-wide">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="heading-2 mb-4">Featured Projects</h2>
            <p className="text-body text-neutral-600">
              Browse through our showcase of recently completed projects by our verified co-op members.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg overflow-hidden shadow-md">
              <img
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80"
                alt="Modern kitchen renovation"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <Badge variant="primary" size="sm" className="mb-2">Kitchen Renovation</Badge>
                <h3 className="text-xl font-semibold mb-2">Modern Kitchen Makeover</h3>
                <p className="text-neutral-600 mb-4">Complete kitchen renovation with custom cabinets, quartz countertops, and energy-efficient appliances.</p>
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mr-3">
                    <span className="text-sm font-medium">JD</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900">Johnson Design</p>
                    <p className="text-xs text-neutral-500">Completed May 2023</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg overflow-hidden shadow-md">
              <img
                src="https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80"
                alt="Home exterior renovation"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <Badge variant="primary" size="sm" className="mb-2">Exterior Renovation</Badge>
                <h3 className="text-xl font-semibold mb-2">Colonial Home Restoration</h3>
                <p className="text-neutral-600 mb-4">Historical home exterior restoration including siding replacement, window upgrades, and landscaping.</p>
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mr-3">
                    <span className="text-sm font-medium">HC</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900">Heritage Contractors</p>
                    <p className="text-xs text-neutral-500">Completed July 2023</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg overflow-hidden shadow-md">
              <img
                src="https://images.unsplash.com/photo-1600607687644-c7f34b5e8d97?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80"
                alt="Bathroom renovation"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <Badge variant="primary" size="sm" className="mb-2">Bathroom Remodel</Badge>
                <h3 className="text-xl font-semibold mb-2">Luxury Bathroom Spa</h3>
                <p className="text-neutral-600 mb-4">Complete bathroom transformation with walk-in shower, freestanding tub, and heated flooring.</p>
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mr-3">
                    <span className="text-sm font-medium">MP</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900">Modern Plumbing Co.</p>
                    <p className="text-xs text-neutral-500">Completed June 2023</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-10">
            <Button as={Link} to="/projects" variant="outline" size="lg">
              View All Projects
            </Button>
          </div>
        </div>
      </section>

      {/* Enhanced Testimonials Section */}
      <section className="py-16 bg-white">
        <div className="container-wide">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="heading-2 mb-4">What Our Members Say</h2>
            <p className="text-body text-neutral-600">
              Hear from contractors and clients who have transformed their workflow with FAIT Co-op.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
              <div className="mb-6">
                {/* Quote icon */}
                <svg className="h-8 w-8 text-blue-400" fill="currentColor" viewBox="0 0 32 32">
                  <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                </svg>
              </div>

              <p className="text-neutral-700 mb-6 flex-grow italic">"FAIT Co-op has completely transformed how we manage projects. The standardized pricing and streamlined communication have saved us countless hours and improved client satisfaction."</p>

              <div className="flex items-center mt-auto">
                <img
                  src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&q=80"
                  alt="Sarah Johnson"
                  className="h-10 w-10 rounded-full mr-3 object-cover"
                />
                <div>
                  <h4 className="font-semibold text-neutral-800">Sarah Johnson</h4>
                  <p className="text-sm text-neutral-500">General Contractor, Johnson Building Co.</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
              <div className="mb-6">
                {/* Quote icon */}
                <svg className="h-8 w-8 text-blue-400" fill="currentColor" viewBox="0 0 32 32">
                  <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                </svg>
              </div>

              <p className="text-neutral-700 mb-6 flex-grow italic">"As a homeowner, I was always anxious about renovation projects. The FAIT platform gave me transparency and control I never had before. I could track progress and communicate directly with all parties involved."</p>

              <div className="flex items-center mt-auto">
                <img
                  src="https://images.unsplash.com/photo-1566492031773-4f4e44671857?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&q=80"
                  alt="Michael Chen"
                  className="h-10 w-10 rounded-full mr-3 object-cover"
                />
                <div>
                  <h4 className="font-semibold text-neutral-800">Michael Chen</h4>
                  <p className="text-sm text-neutral-500">Homeowner</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
              <div className="mb-6">
                {/* Quote icon */}
                <svg className="h-8 w-8 text-blue-400" fill="currentColor" viewBox="0 0 32 32">
                  <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                </svg>
              </div>

              <p className="text-neutral-700 mb-6 flex-grow italic">"The cooperative model makes all the difference. We're not just service providers, we're members of a community with shared values and standards. It's changed how we approach our business."</p>

              <div className="flex items-center mt-auto">
                <img
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&q=80"
                  alt="David Rodriguez"
                  className="h-10 w-10 rounded-full mr-3 object-cover"
                />
                <div>
                  <h4 className="font-semibold text-neutral-800">David Rodriguez</h4>
                  <p className="text-sm text-neutral-500">Electrical Contractor, Rodriguez Electric</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Resource Center Section */}
      <section className="py-16 bg-gray-50">
        <div className="container-wide">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="heading-2 mb-4">Visit our Resource Center</h2>
            <p className="text-body text-neutral-600">
              Access guides, articles, and tools to help you make the most of your home improvement projects.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg overflow-hidden shadow">
              <img
                src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80"
                alt="Planning a renovation"
                className="w-full h-40 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Planning Your Renovation</h3>
                <p className="text-neutral-600 mb-4">Learn how to plan your renovation project from start to finish with our comprehensive guide.</p>
                <Button as={Link} to="/resources/planning-guide" variant="text" className="text-blue-600">
                  Read More →
                </Button>
              </div>
            </div>

            <div className="bg-white rounded-lg overflow-hidden shadow">
              <img
                src="https://images.unsplash.com/photo-1484154218962-a197022b5858?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80"
                alt="Budgeting for home projects"
                className="w-full h-40 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Budgeting for Home Projects</h3>
                <p className="text-neutral-600 mb-4">Tips and strategies for creating and sticking to a realistic budget for your home improvement projects.</p>
                <Button as={Link} to="/resources/budgeting-guide" variant="text" className="text-blue-600">
                  Read More →
                </Button>
              </div>
            </div>

            <div className="bg-white rounded-lg overflow-hidden shadow">
              <img
                src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80"
                alt="Working with contractors"
                className="w-full h-40 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Working with Contractors</h3>
                <p className="text-neutral-600 mb-4">How to effectively communicate with contractors and ensure your project runs smoothly from start to finish.</p>
                <Button as={Link} to="/resources/contractor-guide" variant="text" className="text-blue-600">
                  Read More →
                </Button>
              </div>
            </div>
          </div>

          <div className="text-center mt-10">
            <Button as={Link} to="/resources" variant="outline" size="lg">
              Explore All Resources
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="container-wide">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="heading-2 mb-4">Frequently Asked Questions</h2>
            <p className="text-body text-neutral-600">
              Find answers to common questions about FAIT Co-op and our platform.
            </p>
          </div>

          <div className="max-w-3xl mx-auto divide-y divide-neutral-200">
            <div className="py-6">
              <h3 className="text-lg font-medium text-neutral-900 mb-2">What is FAIT Co-op?</h3>
              <p className="text-neutral-600">FAIT Co-op is a cooperative platform that enables contractors, clients, and allied service providers to collaborate with standardized pricing, streamlined communication, and automated workflows.</p>
            </div>

            <div className="py-6">
              <h3 className="text-lg font-medium text-neutral-900 mb-2">How does the co-op model work?</h3>
              <p className="text-neutral-600">As a cooperative, FAIT is owned by its members. This means contractors and service providers have a say in how the platform operates and share in its success through patronage dividends.</p>
            </div>

            <div className="py-6">
              <h3 className="text-lg font-medium text-neutral-900 mb-2">What are the benefits for clients?</h3>
              <p className="text-neutral-600">Clients benefit from transparent pricing, vetted contractors, standardized documentation, and a streamlined communication process that reduces misunderstandings and delays.</p>
            </div>

            <div className="py-6">
              <h3 className="text-lg font-medium text-neutral-900 mb-2">How do I join FAIT Co-op?</h3>
              <p className="text-neutral-600">You can sign up as a contractor, client, or service provider through our registration page. After creating an account, you'll complete a profile and verification process.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Resource Center CTA */}
      <section className="relative bg-gray-900">
        <div className="absolute inset-0">
          <img
            className="w-full h-full object-cover"
            src="https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80"
            alt="Team of professionals"
          />
          <div className="absolute inset-0 bg-gray-900 opacity-75"></div>
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">Visit our Resource Center</h2>
          <p className="mt-6 max-w-3xl text-xl text-gray-300">
            Get expert advice, tips, and resources to help you with your home improvement projects.
          </p>
          <div className="mt-10 flex items-center space-x-6">
            <Button
              as={Link}
              to="/register"
              variant="primary"
              size="lg"
              className="bg-white text-gray-900 hover:bg-gray-100"
            >
              Sign up now
            </Button>
            <Button
              as={Link}
              to="/login"
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white/10"
            >
              Log in
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
          <nav className="-mx-5 -my-2 flex flex-wrap justify-center" aria-label="Footer">
            <div className="px-5 py-2">
              <a href="#" className="text-base text-gray-500 hover:text-gray-900">About</a>
            </div>
            <div className="px-5 py-2">
              <a href="#" className="text-base text-gray-500 hover:text-gray-900">Services</a>
            </div>
            <div className="px-5 py-2">
              <a href="#" className="text-base text-gray-500 hover:text-gray-900">Projects</a>
            </div>
            <div className="px-5 py-2">
              <a href="#" className="text-base text-gray-500 hover:text-gray-900">Resources</a>
            </div>
            <div className="px-5 py-2">
              <a href="#" className="text-base text-gray-500 hover:text-gray-900">Contact</a>
            </div>
            <div className="px-5 py-2">
              <a href="#" className="text-base text-gray-500 hover:text-gray-900">Privacy</a>
            </div>
            <div className="px-5 py-2">
              <a href="#" className="text-base text-gray-500 hover:text-gray-900">Terms</a>
            </div>
          </nav>
          <div className="mt-8 flex justify-center space-x-6">
            <a href="#" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">Facebook</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
              </svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">Instagram</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
              </svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">Twitter</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
          </div>
          <p className="mt-8 text-center text-base text-gray-400">
            &copy; 2023 FAIT Co-op. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  );
};

export default Home;
