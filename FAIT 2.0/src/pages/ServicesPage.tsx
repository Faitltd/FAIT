import React from 'react';
import { motion } from 'framer-motion';
import MainLayout from '../layouts/MainLayout';
import RevealSection from '../components/animations/RevealSection';
import SectionDivider from '../components/animations/SectionDivider';
import InteractiveCard from '../components/animations/InteractiveCard';
import { Button } from '../components/ui';
import SEO from '../components/SEO';

const ServicesPage: React.FC = () => {
  const services = [
    {
      title: 'Service 1',
      description: 'Description of service 1',
      icon: '/images/service1.svg'
    },
    // More services...
  ];

  return (
    <MainLayout>
      <RevealSection>
        <div className="container-wide py-16">
          <h1 className="text-4xl font-bold text-center mb-8">Our Services</h1>
          <p className="text-lg text-center max-w-2xl mx-auto mb-12">
            Comprehensive solutions for all your home service needs.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <InteractiveCard key={index}>
                {/* Service card content */}
              </InteractiveCard>
            ))}
          </div>
        </div>
      </RevealSection>
      
      <SectionDivider type="wave" />
      
      {/* Additional sections */}
    </MainLayout>
  );
};

export default ServicesPage;
