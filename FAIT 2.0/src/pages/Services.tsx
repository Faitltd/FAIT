import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Badge, Button } from '../components/ui';
import { CTA } from '../components/sections';
import SEO from '../components/SEO';

interface Service {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  popular?: boolean;
}

const Services: React.FC = () => {
  const services: Service[] = [
    {
      id: 'home-renovation',
      name: 'Home Renovation',
      description: 'Complete home renovation services including kitchen, bathroom, basement, and whole-house remodels.',
      icon: (
        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      popular: true,
    },
    {
      id: 'electrical',
      name: 'Electrical Work',
      description: 'Professional electrical services including installation, repair, and upgrades for residential and commercial properties.',
      icon: (
        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      id: 'plumbing',
      name: 'Plumbing',
      description: 'Comprehensive plumbing services including repairs, installations, and maintenance for all your plumbing needs.',
      icon: (
        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: 'landscaping',
      name: 'Landscaping',
      description: 'Professional landscaping services to transform your outdoor space, including design, installation, and maintenance.',
      icon: (
        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
      popular: true,
    },
    {
      id: 'interior-design',
      name: 'Interior Design',
      description: 'Creative interior design services to help you transform your space into a beautiful and functional environment.',
      icon: (
        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      ),
    },
    {
      id: 'roofing',
      name: 'Roofing',
      description: 'Expert roofing services including installation, repair, and maintenance for all types of roofs.',
      icon: (
        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V10M9 21h6" />
        </svg>
      ),
    },
    {
      id: 'hvac',
      name: 'HVAC Services',
      description: 'Heating, ventilation, and air conditioning services for installation, repair, and maintenance.',
      icon: (
        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: 'painting',
      name: 'Painting',
      description: 'Professional painting services for interior and exterior surfaces, including walls, ceilings, trim, and more.',
      icon: (
        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      ),
      popular: true,
    },
  ];
  
  return (
    <>
      <SEO 
        title="Our Services - FAIT Co-op"
        description="Explore the services offered by FAIT Co-op, including home renovation, electrical work, plumbing, landscaping, and more."
        keywords={['FAIT', 'co-op', 'services', 'home renovation', 'electrical', 'plumbing', 'landscaping']}
      />
      
      {/* Hero Section */}
      <section className="py-12 md:py-20 bg-primary-600 text-white">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 font-display">Our Services</h1>
            <p className="text-xl text-primary-100 mb-8">
              Quality services provided by verified professionals in our cooperative.
            </p>
          </div>
        </div>
      </section>
      
      {/* Services Grid */}
      <section className="py-16 bg-white">
        <div className="container-wide">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <Card key={service.id} hover variant="bordered" className="h-full">
                <Card.Content>
                  <div className="flex items-start mb-4">
                    <div className="p-2 rounded-full bg-primary-100 text-primary-600">
                      {service.icon}
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold">{service.name}</h3>
                        {service.popular && (
                          <Badge variant="accent" size="sm">Popular</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="text-neutral-600 mb-6">{service.description}</p>
                  <div className="mt-auto">
                    <Button 
                      as={Link} 
                      to={`/services/${service.id}`} 
                      variant="outline" 
                      className="w-full"
                    >
                      Learn More
                    </Button>
                  </div>
                </Card.Content>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* How It Works */}
      <section className="py-16 bg-neutral-50">
        <div className="container-wide">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="heading-2 mb-4">How It Works</h2>
            <p className="text-body text-neutral-600">
              Finding and booking services through FAIT Co-op is simple and transparent.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 text-primary-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
              <h3 className="text-lg font-semibold mb-2">Browse Services</h3>
              <p className="text-neutral-600">Explore our wide range of services provided by verified professionals.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary-100 text-primary-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
              <h3 className="text-lg font-semibold mb-2">Request a Quote</h3>
              <p className="text-neutral-600">Submit your project details and receive transparent pricing options.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary-100 text-primary-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
              <h3 className="text-lg font-semibold mb-2">Book a Service</h3>
              <p className="text-neutral-600">Schedule your service at a time that works for you.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary-100 text-primary-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">4</div>
              <h3 className="text-lg font-semibold mb-2">Enjoy Quality Work</h3>
              <p className="text-neutral-600">Relax as our verified professionals complete your project to your satisfaction.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="container-wide">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="heading-2 mb-4">What Our Clients Say</h2>
            <p className="text-body text-neutral-600">
              Hear from clients who have used our services.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card variant="bordered" className="h-full">
              <Card.Content className="flex flex-col h-full">
                <div className="mb-6">
                  {/* Quote icon */}
                  <svg className="h-8 w-8 text-primary-300" fill="currentColor" viewBox="0 0 32 32">
                    <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                  </svg>
                </div>
                
                <p className="text-neutral-700 mb-6 flex-grow italic">"The home renovation team from FAIT Co-op was exceptional. They were professional, skilled, and completed the project on time and within budget. I couldn't be happier with the results!"</p>
                
                <div className="flex items-center mt-auto">
                  <div className="h-10 w-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mr-3">
                    <span className="text-sm font-medium">JD</span>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-neutral-800">John Doe</h4>
                    <p className="text-sm text-neutral-500">Home Renovation Client</p>
                  </div>
                </div>
              </Card.Content>
            </Card>
            
            <Card variant="bordered" className="h-full">
              <Card.Content className="flex flex-col h-full">
                <div className="mb-6">
                  {/* Quote icon */}
                  <svg className="h-8 w-8 text-primary-300" fill="currentColor" viewBox="0 0 32 32">
                    <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                  </svg>
                </div>
                
                <p className="text-neutral-700 mb-6 flex-grow italic">"I had an electrical emergency and the FAIT Co-op electrician was at my house within an hour. He quickly identified and fixed the problem. The transparent pricing was a refreshing change from other services I've used."</p>
                
                <div className="flex items-center mt-auto">
                  <div className="h-10 w-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mr-3">
                    <span className="text-sm font-medium">JS</span>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-neutral-800">Jane Smith</h4>
                    <p className="text-sm text-neutral-500">Electrical Services Client</p>
                  </div>
                </div>
              </Card.Content>
            </Card>
            
            <Card variant="bordered" className="h-full">
              <Card.Content className="flex flex-col h-full">
                <div className="mb-6">
                  {/* Quote icon */}
                  <svg className="h-8 w-8 text-primary-300" fill="currentColor" viewBox="0 0 32 32">
                    <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                  </svg>
                </div>
                
                <p className="text-neutral-700 mb-6 flex-grow italic">"The landscaping team transformed my backyard into a beautiful oasis. They listened to my ideas and provided valuable suggestions. The result exceeded my expectations, and the price was fair and transparent."</p>
                
                <div className="flex items-center mt-auto">
                  <div className="h-10 w-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mr-3">
                    <span className="text-sm font-medium">RJ</span>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-neutral-800">Robert Johnson</h4>
                    <p className="text-sm text-neutral-500">Landscaping Client</p>
                  </div>
                </div>
              </Card.Content>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Service Guarantees */}
      <section className="py-16 bg-neutral-50">
        <div className="container-wide">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="heading-2 mb-4">Our Service Guarantees</h2>
            <p className="text-body text-neutral-600">
              When you book a service through FAIT Co-op, you can expect:
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="p-3 bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Verified Professionals</h3>
              <p className="text-neutral-600">All service providers undergo thorough background checks, license verification, and insurance validation.</p>
            </div>
            
            <div className="text-center">
              <div className="p-3 bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Transparent Pricing</h3>
              <p className="text-neutral-600">No hidden fees or surprises. You'll know exactly what you're paying for before work begins.</p>
            </div>
            
            <div className="text-center">
              <div className="p-3 bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Satisfaction Guarantee</h3>
              <p className="text-neutral-600">If you're not completely satisfied with the service, we'll make it right or provide a refund.</p>
            </div>
          </div>
        </div>
      </section>
      
      <CTA 
        title="Ready to get started?"
        subtitle="Book a service today and experience the FAIT Co-op difference."
        ctaText="Browse Services"
        ctaLink="/services"
        secondaryCtaText="Contact Us"
        secondaryCtaLink="/contact"
      />
    </>
  );
};

export default Services;
