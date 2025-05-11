import React from 'react';
import { CTA } from '../components/sections';
import { Card } from '../components/ui';
import SEO from '../components/SEO';

const About: React.FC = () => {
  return (
    <>
      <SEO 
        title="About FAIT Co-op"
        description="Learn about FAIT Co-op, our mission, values, and how we're transforming the contractor-client relationship through cooperative principles."
        keywords={['FAIT', 'co-op', 'about', 'mission', 'values', 'cooperative principles']}
      />
      
      {/* Hero Section */}
      <section className="py-12 md:py-20 bg-primary-600 text-white">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 font-display">About FAIT Co-op</h1>
            <p className="text-xl text-primary-100 mb-8">
              We're transforming the contractor-client relationship through cooperative principles.
            </p>
          </div>
        </div>
      </section>
      
      {/* Mission Section */}
      <section className="py-16 bg-white">
        <div className="container-wide">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="heading-2 mb-6">Our Mission</h2>
              <p className="text-body mb-6">
                FAIT Co-op was founded with a simple but powerful mission: to create a more equitable, transparent, and efficient marketplace for contractors, clients, and allied service providers.
              </p>
              <p className="text-body mb-6">
                We believe that by operating as a cooperative, we can address many of the pain points in the traditional contractor-client relationship. Our platform provides standardized pricing, streamlined communication, automated workflows, and behavioral incentives that benefit all parties involved.
              </p>
              <p className="text-body">
                By putting ownership in the hands of our members, we ensure that the platform evolves to meet their needs, rather than prioritizing external shareholders or venture capital returns.
              </p>
            </div>
            <div className="rounded-lg overflow-hidden shadow-md">
              <img 
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80" 
                alt="Team collaboration" 
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Values Section */}
      <section className="py-16 bg-neutral-50">
        <div className="container-wide">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="heading-2 mb-4">Our Values</h2>
            <p className="text-body text-neutral-600">
              These core principles guide everything we do at FAIT Co-op.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card hover className="h-full">
              <Card.Content>
                <div className="mb-4 p-2 rounded-full w-12 h-12 flex items-center justify-center bg-primary-100">
                  <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Cooperation</h3>
                <p className="text-neutral-600">We believe in the power of working together. Our cooperative model ensures that all members have a voice and share in the success of the platform.</p>
              </Card.Content>
            </Card>
            
            <Card hover className="h-full">
              <Card.Content>
                <div className="mb-4 p-2 rounded-full w-12 h-12 flex items-center justify-center bg-primary-100">
                  <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Transparency</h3>
                <p className="text-neutral-600">We promote clear communication, honest pricing, and open governance. No hidden fees, no surprises—just straightforward business practices.</p>
              </Card.Content>
            </Card>
            
            <Card hover className="h-full">
              <Card.Content>
                <div className="mb-4 p-2 rounded-full w-12 h-12 flex items-center justify-center bg-primary-100">
                  <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Quality</h3>
                <p className="text-neutral-600">We're committed to excellence in every aspect of our platform. From the contractors we verify to the tools we build, quality is our top priority.</p>
              </Card.Content>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Team Section */}
      <section className="py-16 bg-white">
        <div className="container-wide">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="heading-2 mb-4">Our Team</h2>
            <p className="text-body text-neutral-600">
              Meet the dedicated people behind FAIT Co-op.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah Johnson',
                role: 'Co-Founder & CEO',
                bio: 'With 15 years of experience in the construction industry, Sarah founded FAIT Co-op to address the challenges she saw firsthand.',
                image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80'
              },
              {
                name: 'Michael Chen',
                role: 'Co-Founder & CTO',
                bio: 'Michael brings 10+ years of software development experience to FAIT, with a focus on creating intuitive, user-friendly platforms.',
                image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80'
              },
              {
                name: 'David Rodriguez',
                role: 'Head of Member Relations',
                bio: 'As a former contractor, David understands the needs of our members and works to ensure the platform serves them effectively.',
                image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80'
              },
            ].map((member, index) => (
              <Card key={index} variant="bordered" className="overflow-hidden">
                <img 
                  src={member.image} 
                  alt={member.name} 
                  className="w-full h-64 object-cover"
                />
                <Card.Content>
                  <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                  <p className="text-primary-600 mb-3">{member.role}</p>
                  <p className="text-neutral-600">{member.bio}</p>
                </Card.Content>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* History Timeline */}
      <section className="py-16 bg-neutral-50">
        <div className="container-wide">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="heading-2 mb-4">Our Journey</h2>
            <p className="text-body text-neutral-600">
              The story of FAIT Co-op's growth and evolution.
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <div className="relative border-l-2 border-primary-200 pl-8 pb-8">
              <div className="absolute -left-2 top-0 w-6 h-6 rounded-full bg-primary-500"></div>
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-1">2020: The Idea</h3>
                <p className="text-sm text-primary-600 mb-2">January 2020</p>
                <p className="text-neutral-600">FAIT Co-op was conceived as a solution to the fragmented, inefficient contractor marketplace. Our founders envisioned a platform that would bring transparency and cooperation to the industry.</p>
              </div>
            </div>
            
            <div className="relative border-l-2 border-primary-200 pl-8 pb-8">
              <div className="absolute -left-2 top-0 w-6 h-6 rounded-full bg-primary-500"></div>
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-1">2021: Platform Launch</h3>
                <p className="text-sm text-primary-600 mb-2">March 2021</p>
                <p className="text-neutral-600">After months of development and testing, we launched the first version of the FAIT Co-op platform with core features for contractors and clients.</p>
              </div>
            </div>
            
            <div className="relative border-l-2 border-primary-200 pl-8 pb-8">
              <div className="absolute -left-2 top-0 w-6 h-6 rounded-full bg-primary-500"></div>
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-1">2022: Expansion</h3>
                <p className="text-sm text-primary-600 mb-2">June 2022</p>
                <p className="text-neutral-600">With growing membership and positive feedback, we expanded our platform to include more features, such as the Behavioral Incentives Engine and Marketplace & Resource Library.</p>
              </div>
            </div>
            
            <div className="relative pl-8">
              <div className="absolute -left-2 top-0 w-6 h-6 rounded-full bg-primary-500"></div>
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-1">2023: FAIT 2.0</h3>
                <p className="text-sm text-primary-600 mb-2">Present</p>
                <p className="text-neutral-600">Today, we're launching FAIT 2.0 with a completely redesigned interface, enhanced features, and new tools to better serve our growing community of contractors, clients, and service providers.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <CTA 
        title="Join Our Cooperative"
        subtitle="Become part of a community that's transforming the contractor-client relationship."
        ctaText="Sign up now"
        ctaLink="/register"
        secondaryCtaText="Contact us"
        secondaryCtaLink="/contact"
      />
    </>
  );
};

export default About;
