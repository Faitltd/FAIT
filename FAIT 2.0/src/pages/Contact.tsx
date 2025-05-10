import React, { useState } from 'react';
import { Button } from '../components/ui';
import SEO from '../components/SEO';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  
  const [formStatus, setFormStatus] = useState<{
    submitted: boolean;
    success: boolean;
    message: string;
  }>({
    submitted: false,
    success: false,
    message: '',
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulate form submission
    setFormStatus({
      submitted: true,
      success: true,
      message: 'Thank you for your message! We will get back to you soon.',
    });
    
    // Reset form after successful submission
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: '',
    });
  };
  
  return (
    <>
      <SEO 
        title="Contact FAIT Co-op"
        description="Get in touch with FAIT Co-op. We're here to answer your questions and help you get started."
        keywords={['FAIT', 'co-op', 'contact', 'support', 'help', 'questions']}
      />
      
      {/* Hero Section */}
      <section className="py-12 md:py-20 bg-primary-600 text-white">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 font-display">Contact Us</h1>
            <p className="text-xl text-primary-100 mb-8">
              We're here to help. Reach out with any questions or feedback.
            </p>
          </div>
        </div>
      </section>
      
      {/* Contact Form Section */}
      <section className="py-16 bg-white">
        <div className="container-narrow">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="heading-2 mb-6">Get in Touch</h2>
              <p className="text-body mb-8">
                Have questions about FAIT Co-op? Want to learn more about our platform or how to join? Fill out the form and we'll get back to you as soon as possible.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 p-2 bg-primary-100 rounded-full">
                    <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-neutral-900">Phone</h3>
                    <p className="mt-1 text-neutral-600">(555) 123-4567</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 p-2 bg-primary-100 rounded-full">
                    <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-neutral-900">Email</h3>
                    <p className="mt-1 text-neutral-600">info@faitcoop.com</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 p-2 bg-primary-100 rounded-full">
                    <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-neutral-900">Office</h3>
                    <p className="mt-1 text-neutral-600">123 Main Street, Suite 100<br />Denver, CO 80202</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              {formStatus.submitted && formStatus.success ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                  <svg className="h-12 w-12 text-green-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-xl font-semibold text-green-800 mb-2">Message Sent!</h3>
                  <p className="text-green-700">{formStatus.message}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-neutral-200 p-6 shadow-sm">
                  <div className="mb-6">
                    <label htmlFor="name" className="form-label">Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Your name"
                      required
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="subject" className="form-label">Subject</label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="form-select"
                      required
                    >
                      <option value="">Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="membership">Membership Information</option>
                      <option value="support">Technical Support</option>
                      <option value="feedback">Feedback</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="message" className="form-label">Message</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      className="form-input min-h-[150px]"
                      placeholder="How can we help you?"
                      required
                    ></textarea>
                  </div>
                  
                  <Button type="submit" variant="primary" fullWidth>
                    Send Message
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
      
      {/* Map Section */}
      <section className="py-16 bg-neutral-50">
        <div className="container-wide">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="heading-2 mb-4">Visit Our Office</h2>
            <p className="text-body text-neutral-600">
              We're located in downtown Denver, easily accessible by public transportation.
            </p>
          </div>
          
          <div className="rounded-lg overflow-hidden shadow-md h-[400px] bg-neutral-200">
            {/* This would be replaced with an actual Google Maps embed */}
            <div className="w-full h-full flex items-center justify-center bg-neutral-200">
              <p className="text-neutral-600">Google Maps would be embedded here</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="container-wide">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="heading-2 mb-4">Frequently Asked Questions</h2>
            <p className="text-body text-neutral-600">
              Find quick answers to common questions.
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto divide-y divide-neutral-200">
            <div className="py-6">
              <h3 className="text-lg font-medium text-neutral-900 mb-2">What are your business hours?</h3>
              <p className="text-neutral-600">Our office is open Monday through Friday, 9:00 AM to 5:00 PM Mountain Time. Support is available 24/7 through our platform for urgent matters.</p>
            </div>
            
            <div className="py-6">
              <h3 className="text-lg font-medium text-neutral-900 mb-2">How quickly will I receive a response?</h3>
              <p className="text-neutral-600">We aim to respond to all inquiries within 24 business hours. For urgent matters, please call our support line.</p>
            </div>
            
            <div className="py-6">
              <h3 className="text-lg font-medium text-neutral-900 mb-2">Can I schedule a demo of the platform?</h3>
              <p className="text-neutral-600">Yes! We offer personalized demos for potential members. Please select "Membership Information" in the contact form and mention that you'd like a demo.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;
