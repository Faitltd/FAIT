import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui';

interface CTAProps {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  backgroundImage?: string;
  className?: string;
  variant?: 'primary' | 'light';
}

const CTA: React.FC<CTAProps> = ({
  title = 'Ready to transform your workflow?',
  subtitle = 'Join FAIT Co-op today and experience the power of collaborative contracting.',
  ctaText = 'Get Started',
  ctaLink = '/register',
  secondaryCtaText = 'Learn More',
  secondaryCtaLink = '/about',
  backgroundImage,
  className = '',
  variant = 'primary',
}) => {
  const isPrimary = variant === 'primary';
  
  const bgClasses = isPrimary 
    ? 'bg-primary-600' 
    : 'bg-neutral-50';
  
  const textClasses = isPrimary 
    ? 'text-white' 
    : 'text-neutral-800';
  
  const subtitleClasses = isPrimary 
    ? 'text-primary-100' 
    : 'text-neutral-600';
  
  const primaryBtnClasses = isPrimary 
    ? 'bg-white text-primary-600 hover:bg-neutral-100' 
    : 'bg-primary-600 text-white hover:bg-primary-700';
  
  const secondaryBtnClasses = isPrimary 
    ? 'border-white text-white hover:bg-white/10' 
    : 'border-primary-600 text-primary-600 hover:bg-primary-50';

  return (
    <section className={`py-12 ${bgClasses} ${className}`}>
      {backgroundImage && (
        <div className="absolute inset-0 z-0">
          <div className={`absolute inset-0 ${isPrimary ? 'bg-primary-600/90' : 'bg-white/90'} mix-blend-multiply`} />
          <img
            src={backgroundImage}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
      )}
      
      <div className="container-wide relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className={`text-3xl font-bold mb-4 ${textClasses}`}>{title}</h2>
          <p className={`text-lg mb-8 ${subtitleClasses}`}>{subtitle}</p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              as={Link} 
              to={ctaLink} 
              variant="primary" 
              size="lg" 
              className={primaryBtnClasses}
            >
              {ctaText}
            </Button>
            
            <Button 
              as={Link} 
              to={secondaryCtaLink} 
              variant="outline" 
              size="lg"
              className={secondaryBtnClasses}
            >
              {secondaryCtaText}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
