import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui';

interface HeroProps {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  backgroundImage?: string;
  className?: string;
}

const Hero: React.FC<HeroProps> = ({
  title = 'Transforming Contractor-Client Relationships',
  subtitle = 'FAIT Co-op enables contractors, clients, and allied service providers to collaborate through a cooperative platform with standardized pricing and streamlined communication.',
  ctaText = 'Get Started',
  ctaLink = '/register',
  secondaryCtaText = 'Learn More',
  secondaryCtaLink = '/about',
  backgroundImage = '/images/hero-bg.jpg',
  className = '',
}) => {
  return (
    <div className={`relative overflow-hidden bg-white ${className}`}>
      {/* Background image with overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/90 to-primary-800/80 mix-blend-multiply" />
        {backgroundImage && (
          <img
            src={backgroundImage}
            alt=""
            className="h-full w-full object-cover"
          />
        )}
      </div>
      
      {/* Content */}
      <div className="relative z-10 px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl font-display">
            {title}
          </h1>
          <p className="mt-6 text-lg leading-8 text-white/90">
            {subtitle}
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button 
              as={Link} 
              to={ctaLink} 
              variant="primary" 
              size="lg" 
              className="bg-white text-primary-600 hover:bg-neutral-100"
            >
              {ctaText}
            </Button>
            <Button 
              as={Link} 
              to={secondaryCtaLink} 
              variant="outline" 
              size="lg"
              className="border-white text-white hover:bg-white/10"
            >
              {secondaryCtaText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
