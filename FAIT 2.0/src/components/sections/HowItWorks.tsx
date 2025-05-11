import React from 'react';

interface Step {
  number: number;
  title: string;
  description: string;
}

interface HowItWorksProps {
  title?: string;
  subtitle?: string;
  steps?: Step[];
  className?: string;
}

const HowItWorks: React.FC<HowItWorksProps> = ({
  title = 'How It Works',
  subtitle = 'Join FAIT Co-op in just a few simple steps and start transforming your contracting experience.',
  steps = [],
  className = '',
}) => {
  // Default steps if none provided
  const defaultSteps: Step[] = [
    {
      number: 1,
      title: 'Join the Co-op',
      description: 'Apply for membership and become part of our cooperative community of contractors and service providers.',
    },
    {
      number: 2,
      title: 'Create Your Profile',
      description: 'Set up your professional profile, showcase your services, and define your service areas.',
    },
    {
      number: 3,
      title: 'Connect with Clients',
      description: 'Receive project requests, communicate with clients, and provide standardized estimates.',
    },
    {
      number: 4,
      title: 'Collaborate & Grow',
      description: 'Work together on projects, build your reputation, and grow your business within the co-op.',
    },
  ];

  const displaySteps = steps.length > 0 ? steps : defaultSteps;

  return (
    <section className={`py-12 bg-white ${className}`}>
      <div className="container-wide">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="heading-2 mb-4">{title}</h2>
          <p className="text-body text-neutral-600">{subtitle}</p>
        </div>
        
        <div className="relative">
          {/* Connecting line */}
          <div className="absolute top-24 left-0 w-full h-0.5 bg-primary-100 hidden md:block" />
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {displaySteps.map((step, index) => (
              <div key={index} className="flex flex-col items-center text-center">
                <div className="relative">
                  <div className="flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-600 rounded-full mb-4 font-bold text-xl z-10">
                    {step.number}
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-neutral-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
