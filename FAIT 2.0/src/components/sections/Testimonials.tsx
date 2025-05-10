import React from 'react';
import { Card } from '../ui';

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  company?: string;
  avatar?: string;
}

interface TestimonialsProps {
  title?: string;
  subtitle?: string;
  testimonials?: Testimonial[];
  className?: string;
}

const Testimonials: React.FC<TestimonialsProps> = ({
  title = 'What Our Members Say',
  subtitle = 'Hear from contractors and clients who have transformed their workflow with FAIT Co-op.',
  testimonials = [],
  className = '',
}) => {
  // Default testimonials if none provided
  const defaultTestimonials: Testimonial[] = [
    {
      quote: "FAIT Co-op has completely transformed how we manage projects. The standardized pricing and streamlined communication have saved us countless hours and improved client satisfaction.",
      author: "Sarah Johnson",
      role: "General Contractor",
      company: "Johnson Building Co.",
      avatar: "/images/testimonials/avatar-1.jpg",
    },
    {
      quote: "As a homeowner, I was always anxious about renovation projects. The FAIT platform gave me transparency and control I never had before. I could track progress and communicate directly with all parties involved.",
      author: "Michael Chen",
      role: "Homeowner",
      avatar: "/images/testimonials/avatar-2.jpg",
    },
    {
      quote: "The cooperative model makes all the difference. We're not just service providers, we're members of a community with shared values and standards. It's changed how we approach our business.",
      author: "David Rodriguez",
      role: "Electrical Contractor",
      company: "Rodriguez Electric",
      avatar: "/images/testimonials/avatar-3.jpg",
    },
  ];

  const displayTestimonials = testimonials.length > 0 ? testimonials : defaultTestimonials;

  return (
    <section className={`py-12 bg-white ${className}`}>
      <div className="container-wide">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="heading-2 mb-4">{title}</h2>
          <p className="text-body text-neutral-600">{subtitle}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {displayTestimonials.map((testimonial, index) => (
            <Card key={index} variant="bordered" className="h-full">
              <Card.Content className="flex flex-col h-full">
                <div className="mb-6">
                  {/* Quote icon */}
                  <svg className="h-8 w-8 text-primary-300" fill="currentColor" viewBox="0 0 32 32">
                    <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                  </svg>
                </div>
                
                <p className="text-neutral-700 mb-6 flex-grow italic">"{testimonial.quote}"</p>
                
                <div className="flex items-center mt-auto">
                  {testimonial.avatar ? (
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.author}
                      className="h-10 w-10 rounded-full mr-3 object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mr-3">
                      <span className="text-sm font-medium">
                        {testimonial.author.split(' ').map(name => name[0]).join('')}
                      </span>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="font-semibold text-neutral-800">{testimonial.author}</h4>
                    <p className="text-sm text-neutral-500">
                      {testimonial.role}
                      {testimonial.company && `, ${testimonial.company}`}
                    </p>
                  </div>
                </div>
              </Card.Content>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
