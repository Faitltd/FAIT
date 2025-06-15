import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  HelpCircle, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  MessageCircle, 
  Phone, 
  Mail, 
  Clock, 
  Calendar, 
  Tool, 
  DollarSign, 
  Shield, 
  AlertCircle, 
  CheckCircle 
} from 'lucide-react';

// FAQ Item component
interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  toggleOpen: () => void;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer, isOpen, toggleOpen }) => {
  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        className="w-full py-5 px-4 flex justify-between items-center focus:outline-none"
        onClick={toggleOpen}
        aria-expanded={isOpen}
      >
        <span className="text-left font-medium text-gray-900">{question}</span>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-company-lightpink" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-500" />
        )}
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="p-4 pt-0 text-gray-600">
          {answer}
        </div>
      </motion.div>
    </div>
  );
};

// Help Category component
interface HelpCategoryProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const HelpCategory: React.FC<HelpCategoryProps> = ({ icon, title, description }) => {
  return (
    <motion.div
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="flex items-center mb-4">
        <div className="h-12 w-12 rounded-full bg-company-lightpink bg-opacity-10 flex items-center justify-center text-company-lightpink">
          {icon}
        </div>
        <h3 className="ml-4 text-xl font-semibold text-gray-900">{title}</h3>
      </div>
      <p className="text-gray-600">{description}</p>
    </motion.div>
  );
};

const HelpPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [openFAQs, setOpenFAQs] = useState<number[]>([]);

  // FAQ data
  const faqs = [
    {
      id: 1,
      category: 'booking',
      question: 'How do I book a service?',
      answer: 'To book a service, browse our services page, select the service you need, choose a date and time that works for you, and complete the booking process. You'll receive a confirmation email with all the details.'
    },
    {
      id: 2,
      category: 'booking',
      question: 'Can I reschedule or cancel my booking?',
      answer: 'Yes, you can reschedule or cancel your booking up to 24 hours before the scheduled time without any penalty. Simply go to your dashboard, find the booking, and select the reschedule or cancel option.'
    },
    {
      id: 3,
      category: 'payment',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, PayPal, and Apple Pay. Payment is processed securely through our platform at the time of booking.'
    },
    {
      id: 4,
      category: 'payment',
      question: 'When will I be charged for a service?',
      answer: 'You'll be charged when you book the service. For larger projects, we may collect a deposit upfront with the remainder due upon completion.'
    },
    {
      id: 5,
      category: 'services',
      question: 'Are your service providers vetted?',
      answer: 'Yes, all service providers on our platform undergo a thorough vetting process including background checks, license verification, and insurance validation. We also collect and monitor customer reviews.'
    },
    {
      id: 6,
      category: 'services',
      question: 'What if I'm not satisfied with the service?',
      answer: 'Your satisfaction is our priority. If you're not completely satisfied, please contact us within 48 hours of service completion. We'll work with you and the service provider to resolve any issues.'
    },
    {
      id: 7,
      category: 'account',
      question: 'How do I create an account?',
      answer: 'Click the "Sign Up" button in the top right corner of the page. You can create an account using your email address or sign up with Google or Facebook for faster access.'
    },
    {
      id: 8,
      category: 'account',
      question: 'I forgot my password. How do I reset it?',
      answer: 'On the login page, click "Forgot password?" and enter your email address. We'll send you a link to reset your password. For security reasons, the link expires after 24 hours.'
    }
  ];

  // Toggle FAQ open/closed state
  const toggleFAQ = (id: number) => {
    if (openFAQs.includes(id)) {
      setOpenFAQs(openFAQs.filter(faqId => faqId !== id));
    } else {
      setOpenFAQs([...openFAQs, id]);
    }
  };

  // Filter FAQs based on search term and active category
  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = searchTerm === '' || 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-company-lightblue via-company-lightpink to-company-lightorange py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            className="text-4xl font-extrabold text-white sm:text-5xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            How can we help you?
          </motion.h1>
          <motion.p 
            className="mt-4 text-xl text-white text-opacity-90 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Find answers to common questions or get in touch with our support team
          </motion.p>
          
          {/* Search Bar */}
          <motion.div 
            className="mt-8 max-w-xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for answers..."
                className="block w-full pl-10 pr-3 py-4 border border-transparent rounded-md leading-5 bg-white bg-opacity-90 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-company-lightpink focus:border-company-lightpink sm:text-sm"
              />
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Help Categories */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 
            className="text-3xl font-bold text-gray-900 text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Browse by Category
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <HelpCategory
              icon={<Calendar className="h-6 w-6" />}
              title="Booking Help"
              description="Get assistance with scheduling, rescheduling, or canceling your service appointments."
            />
            <HelpCategory
              icon={<DollarSign className="h-6 w-6" />}
              title="Payment Issues"
              description="Find information about payment methods, refunds, and billing questions."
            />
            <HelpCategory
              icon={<Tool className="h-6 w-6" />}
              title="Service Questions"
              description="Learn about our service providers, quality guarantees, and service policies."
            />
            <HelpCategory
              icon={<Shield className="h-6 w-6" />}
              title="Account Support"
              description="Get help with account creation, login issues, and profile management."
            />
          </div>
        </div>
      </div>
      
      {/* FAQ Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 
            className="text-3xl font-bold text-gray-900 text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Frequently Asked Questions
          </motion.h2>
          
          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center mb-8 gap-2">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                activeCategory === 'all' 
                  ? 'bg-company-lightpink text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveCategory('booking')}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                activeCategory === 'booking' 
                  ? 'bg-company-lightpink text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Booking
            </button>
            <button
              onClick={() => setActiveCategory('payment')}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                activeCategory === 'payment' 
                  ? 'bg-company-lightpink text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Payment
            </button>
            <button
              onClick={() => setActiveCategory('services')}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                activeCategory === 'services' 
                  ? 'bg-company-lightpink text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Services
            </button>
            <button
              onClick={() => setActiveCategory('account')}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                activeCategory === 'account' 
                  ? 'bg-company-lightpink text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Account
            </button>
          </div>
          
          {/* FAQ List */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {filteredFAQs.length > 0 ? (
              filteredFAQs.map(faq => (
                <FAQItem
                  key={faq.id}
                  question={faq.question}
                  answer={faq.answer}
                  isOpen={openFAQs.includes(faq.id)}
                  toggleOpen={() => toggleFAQ(faq.id)}
                />
              ))
            ) : (
              <div className="p-8 text-center">
                <AlertCircle className="h-12 w-12 text-company-lightpink mx-auto mb-4" />
                <p className="text-gray-600">No FAQs found matching your search criteria.</p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setActiveCategory('all');
                  }}
                  className="mt-4 text-company-lightpink hover:text-company-lighterpink font-medium"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Contact Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 
            className="text-3xl font-bold text-gray-900 text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Still Need Help?
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              className="bg-gray-50 rounded-lg p-8 text-center"
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="h-16 w-16 bg-company-lightpink rounded-full flex items-center justify-center text-white mx-auto mb-4">
                <MessageCircle className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Live Chat</h3>
              <p className="text-gray-600 mb-4">Chat with our support team in real-time for immediate assistance.</p>
              <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-company-lightpink hover:bg-company-lighterpink focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-company-lightpink">
                Start Chat
              </button>
            </motion.div>
            
            <motion.div 
              className="bg-gray-50 rounded-lg p-8 text-center"
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="h-16 w-16 bg-company-lightpink rounded-full flex items-center justify-center text-white mx-auto mb-4">
                <Phone className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Call Us</h3>
              <p className="text-gray-600 mb-4">Speak directly with our customer support team.</p>
              <p className="text-xl font-semibold text-company-lightpink">1-800-FAIT-HELP</p>
              <p className="text-sm text-gray-500 mt-2">Available 9am-6pm EST, Mon-Fri</p>
            </motion.div>
            
            <motion.div 
              className="bg-gray-50 rounded-lg p-8 text-center"
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="h-16 w-16 bg-company-lightpink rounded-full flex items-center justify-center text-white mx-auto mb-4">
                <Mail className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Email Support</h3>
              <p className="text-gray-600 mb-4">Send us an email and we'll get back to you within 24 hours.</p>
              <a 
                href="mailto:support@itsfait.com" 
                className="text-company-lightpink hover:text-company-lighterpink font-medium"
              >
                support@itsfait.com
              </a>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
