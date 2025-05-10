import React from 'react';
import MainLayout from '../layouts/MainLayout';
import RevealSection from '../components/animations/RevealSection';
import SectionDivider from '../components/animations/SectionDivider';
import DynamicFooter from '../components/animations/DynamicFooter';
import { motion } from 'framer-motion';

const AboutPage: React.FC = () => {
  // Team members data
  const teamMembers = [
    {
      name: "Alex Johnson",
      role: "Founder & CEO",
      image: "/images/team/alex.jpg",
      bio: "Alex founded FAIT Co-op after 15 years in the construction industry, with a vision to create a more equitable platform for both homeowners and contractors."
    },
    {
      name: "Maria Rodriguez",
      role: "Chief Operations Officer",
      image: "/images/team/maria.jpg",
      bio: "With a background in cooperative business models, Maria ensures our platform operates with transparency and fairness at its core."
    },
    {
      name: "David Chen",
      role: "Technology Director",
      image: "/images/team/david.jpg",
      bio: "David leads our development team, building technology that makes home services more accessible and efficient for everyone."
    },
    {
      name: "Sarah Williams",
      role: "Community Manager",
      image: "/images/team/sarah.jpg",
      bio: "Sarah works directly with our members to ensure both homeowners and contractors have a voice in how our cooperative evolves."
    }
  ];

  // Timeline data
  const timeline = [
    {
      year: "2018",
      title: "The Idea",
      description: "FAIT Co-op was conceived as a solution to the broken contractor-homeowner relationship model."
    },
    {
      year: "2019",
      title: "First Members",
      description: "We welcomed our first 50 contractors and 100 homeowners to the platform."
    },
    {
      year: "2020",
      title: "Cooperative Formation",
      description: "Officially incorporated as a multi-stakeholder cooperative with democratic governance."
    },
    {
      year: "2021",
      title: "Mobile App Launch",
      description: "Expanded our platform with native mobile apps for iOS and Android."
    },
    {
      year: "2022",
      title: "National Expansion",
      description: "Grew from our initial city to serving members across 15 states."
    },
    {
      year: "2023",
      title: "Today",
      description: "Over 5,000 contractors and 20,000 homeowners are now part of our thriving cooperative community."
    }
  ];

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-fuchsia-600 to-purple-700 text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <motion.div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: "url('/images/pattern-bg.svg')",
              backgroundSize: "cover"
            }}
            animate={{
              x: [0, 10, 0],
              y: [0, 15, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <RevealSection>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">About FAIT Co-op</h1>
            <p className="text-xl text-center max-w-3xl mx-auto">
              We're building a new model for home services—one that puts people before profits and community before competition.
            </p>
          </RevealSection>
        </div>
      </section>
      
      {/* Section Divider */}
      <SectionDivider type="wave" topColor="bg-purple-700" bottomColor="bg-white" />
      
      {/* Our Mission */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <RevealSection direction="left" className="md:w-1/2">
              <img 
                src="/images/about/mission.jpg" 
                alt="Our Mission" 
                className="rounded-lg shadow-lg w-full"
              />
            </RevealSection>
            
            <RevealSection direction="right" className="md:w-1/2">
              <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
              <p className="text-gray-600 mb-4">
                FAIT Co-op exists to create a more equitable home services marketplace where both homeowners and contractors thrive through cooperation rather than exploitation.
              </p>
              <p className="text-gray-600 mb-4">
                We believe that by operating as a cooperative—owned and governed by the very people who use it—we can build a platform that truly serves its members rather than extracting value from them.
              </p>
              <p className="text-gray-600">
                Our mission is to transform the home services industry by demonstrating that a fair, transparent, and democratic model isn't just possible—it's more sustainable and beneficial for everyone involved.
              </p>
            </RevealSection>
          </div>
        </div>
      </section>
      
      {/* Section Divider */}
      <SectionDivider type="diagonal" topColor="bg-white" bottomColor="bg-gray-50" />
      
      {/* Our Values */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <RevealSection>
            <h2 className="text-3xl font-bold mb-12 text-center">Our Values</h2>
          </RevealSection>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <RevealSection delay={0.1}>
              <div className="bg-white p-8 rounded-lg shadow-sm h-full">
                <div className="w-12 h-12 bg-fuchsia-100 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-fuchsia-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-4">Community Ownership</h3>
                <p className="text-gray-600">
                  Our platform is owned by the people who use it. Both homeowners and contractors have a real stake and voice in how we operate and grow.
                </p>
              </div>
            </RevealSection>
            
            <RevealSection delay={0.2}>
              <div className="bg-white p-8 rounded-lg shadow-sm h-full">
                <div className="w-12 h-12 bg-fuchsia-100 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-fuchsia-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-4">Transparency & Trust</h3>
                <p className="text-gray-600">
                  We believe in complete transparency in pricing, reviews, and operations. No hidden fees, no manipulated ratings—just honest connections.
                </p>
              </div>
            </RevealSection>
            
            <RevealSection delay={0.3}>
              <div className="bg-white p-8 rounded-lg shadow-sm h-full">
                <div className="w-12 h-12 bg-fuchsia-100 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-fuchsia-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-4">Fair Economics</h3>
                <p className="text-gray-600">
                  We charge fair fees that sustain the platform without exploiting our members. The majority of value stays with those who create it.
                </p>
              </div>
            </RevealSection>
          </div>
        </div>
      </section>
      
      {/* Section Divider */}
      <SectionDivider type="curve" topColor="bg-gray-50" bottomColor="bg-white" />
      
      {/* Our Team */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <RevealSection>
            <h2 className="text-3xl font-bold mb-12 text-center">Meet Our Team</h2>
          </RevealSection>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <RevealSection key={index} delay={index * 0.1}>
                <div className="bg-white rounded-lg overflow-hidden shadow-sm h-full">
                  <div className="h-64 overflow-hidden">
                    <img 
                      src={member.image} 
                      alt={member.name} 
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-xl mb-1">{member.name}</h3>
                    <p className="text-fuchsia-600 mb-4">{member.role}</p>
                    <p className="text-gray-600">{member.bio}</p>
                  </div>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>
      
      {/* Section Divider */}
      <SectionDivider type="wave" topColor="bg-white" bottomColor="bg-gray-50" />
      
      {/* Our History */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <RevealSection>
            <h2 className="text-3xl font-bold mb-12 text-center">Our Journey</h2>
          </RevealSection>
          
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-fuchsia-200"></div>
            
            {/* Timeline items */}
            {timeline.map((item, index) => (
              <RevealSection key={index} delay={index * 0.1}>
                <div className={`flex items-center mb-12 ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className="w-1/2"></div>
                  
                  {/* Timeline dot */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full bg-fuchsia-500 border-4 border-white flex items-center justify-center z-10">
                    <span className="text-white text-xs font-bold">{item.year.slice(2)}</span>
                  </div>
                  
                  {/* Content */}
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pl-12' : 'pr-12'}`}>
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                      <div className="text-fuchsia-600 font-bold mb-2">{item.year}</div>
                      <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  </div>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>
      
      {/* Section Divider */}
      <SectionDivider type="diagonal" topColor="bg-gray-50" bottomColor="bg-fuchsia-50" />
      
      {/* Join Us CTA */}
      <section className="bg-fuchsia-50 py-16">
        <div className="container mx-auto px-4">
          <RevealSection>
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">Join Our Cooperative</h2>
              <p className="text-gray-600 mb-8">
                Become part of a movement that's reimagining how home services work. Whether you're a homeowner or a contractor, there's a place for you in our community.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <motion.button 
                  className="px-6 py-3 bg-fuchsia-600 text-white font-medium rounded-lg hover:bg-fuchsia-700 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Join as a Homeowner
                </motion.button>
                <motion.button 
                  className="px-6 py-3 bg-white text-fuchsia-600 font-medium rounded-lg border border-fuchsia-600 hover:bg-fuchsia-50 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Join as a Contractor
                </motion.button>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>
      
      {/* Dynamic Footer */}
      <DynamicFooter />
    </MainLayout>
  );
};

export default AboutPage;
