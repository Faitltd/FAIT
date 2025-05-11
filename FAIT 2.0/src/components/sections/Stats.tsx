import React from 'react';

interface Stat {
  value: string;
  label: string;
  description?: string;
}

interface StatsProps {
  title?: string;
  subtitle?: string;
  stats?: Stat[];
  className?: string;
}

const Stats: React.FC<StatsProps> = ({
  title = 'FAIT Co-op by the Numbers',
  subtitle = 'Our cooperative platform is growing and making a real impact in the contracting industry.',
  stats = [],
  className = '',
}) => {
  // Default stats if none provided
  const defaultStats: Stat[] = [
    {
      value: '500+',
      label: 'Co-op Members',
      description: 'Contractors and service providers across the country',
    },
    {
      value: '2,500+',
      label: 'Projects Completed',
      description: 'Successfully delivered through our platform',
    },
    {
      value: '$15M+',
      label: 'Revenue Generated',
      description: 'For our co-op members in the last year',
    },
    {
      value: '95%',
      label: 'Client Satisfaction',
      description: 'Based on post-project surveys',
    },
  ];

  const displayStats = stats.length > 0 ? stats : defaultStats;

  return (
    <section className={`py-12 bg-primary-50 ${className}`}>
      <div className="container-wide">
        {(title || subtitle) && (
          <div className="text-center max-w-3xl mx-auto mb-12">
            {title && <h2 className="heading-2 mb-4">{title}</h2>}
            {subtitle && <p className="text-body text-neutral-600">{subtitle}</p>}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {displayStats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary-600 mb-2">{stat.value}</div>
              <div className="text-xl font-semibold mb-1">{stat.label}</div>
              {stat.description && <p className="text-neutral-600 text-sm">{stat.description}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
