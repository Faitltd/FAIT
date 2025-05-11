import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight, Search } from 'lucide-react';

interface Section {
  id: string;
  title: string;
  content: React.ReactNode;
  subsections?: Section[];
}

const UserGuide: React.FC = () => {
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const sections: Section[] = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      content: (
        <div>
          <p>Welcome to the FAIT Co-Op Platform! This guide will help you get started with our platform.</p>
          <p className="mt-2">The FAIT Co-Op Platform connects homeowners with skilled service agents for home improvement and maintenance services.</p>
        </div>
      ),
      subsections: [
        {
          id: 'creating-account',
          title: 'Creating an Account',
          content: (
            <div>
              <p>To create an account:</p>
              <ol className="list-decimal list-inside mt-2 space-y-2">
                <li>Click on the "Register" button in the top right corner of the homepage</li>
                <li>Choose your account type: Client or Service Agent</li>
                <li>Fill in your personal information</li>
                <li>Verify your email address</li>
                <li>Complete your profile</li>
              </ol>
            </div>
          ),
        },
        {
          id: 'logging-in',
          title: 'Logging In',
          content: (
            <div>
              <p>To log in to your account:</p>
              <ol className="list-decimal list-inside mt-2 space-y-2">
                <li>Click on the "Login" button in the top right corner of the homepage</li>
                <li>Enter your email address and password</li>
                <li>Click "Sign In"</li>
              </ol>
              <p className="mt-2">You can also log in using your Google account by clicking "Sign in with Google".</p>
            </div>
          ),
        },
      ],
    },
    {
      id: 'client-guide',
      title: 'Client Guide',
      content: (
        <div>
          <p>This section covers everything you need to know as a client using the FAIT Co-Op Platform.</p>
        </div>
      ),
      subsections: [
        {
          id: 'finding-services',
          title: 'Finding Services',
          content: (
            <div>
              <p>To find services:</p>
              <ol className="list-decimal list-inside mt-2 space-y-2">
                <li>Go to the "Services" page from the main navigation</li>
                <li>Use the search bar to find specific services</li>
                <li>Filter services by category, price range, and location</li>
                <li>Click on a service to view details</li>
              </ol>
            </div>
          ),
        },
        {
          id: 'booking-services',
          title: 'Booking Services',
          content: (
            <div>
              <p>To book a service:</p>
              <ol className="list-decimal list-inside mt-2 space-y-2">
                <li>Find a service you're interested in</li>
                <li>Click "Book Now"</li>
                <li>Select your preferred date and time</li>
                <li>Provide any additional details</li>
                <li>Review and confirm your booking</li>
                <li>Complete the payment process</li>
              </ol>
            </div>
          ),
        },
        {
          id: 'managing-bookings',
          title: 'Managing Bookings',
          content: (
            <div>
              <p>To manage your bookings:</p>
              <ol className="list-decimal list-inside mt-2 space-y-2">
                <li>Go to your Client Dashboard</li>
                <li>Click on "Bookings"</li>
                <li>View your upcoming and past bookings</li>
                <li>Click on a booking to view details</li>
                <li>You can reschedule or cancel bookings (subject to the service agent's cancellation policy)</li>
              </ol>
            </div>
          ),
        },
        {
          id: 'messaging',
          title: 'Messaging Service Agents',
          content: (
            <div>
              <p>To message a service agent:</p>
              <ol className="list-decimal list-inside mt-2 space-y-2">
                <li>Go to your Client Dashboard</li>
                <li>Click on "Messages"</li>
                <li>Select an existing conversation or start a new one</li>
                <li>Type your message and click "Send"</li>
              </ol>
              <p className="mt-2">You can also message a service agent directly from their profile or from a booking.</p>
            </div>
          ),
        },
      ],
    },
    {
      id: 'service-agent-guide',
      title: 'Service Agent Guide',
      content: (
        <div>
          <p>This section covers everything you need to know as a service agent using the FAIT Co-Op Platform.</p>
        </div>
      ),
      subsections: [
        {
          id: 'creating-services',
          title: 'Creating Services',
          content: (
            <div>
              <p>To create a service:</p>
              <ol className="list-decimal list-inside mt-2 space-y-2">
                <li>Go to your Service Agent Dashboard</li>
                <li>Click on "Listings"</li>
                <li>Click "Create New Service"</li>
                <li>Fill in the service details (title, description, price, etc.)</li>
                <li>Upload photos</li>
                <li>Set your availability</li>
                <li>Click "Publish"</li>
              </ol>
            </div>
          ),
        },
        {
          id: 'managing-jobs',
          title: 'Managing Jobs',
          content: (
            <div>
              <p>To manage your jobs:</p>
              <ol className="list-decimal list-inside mt-2 space-y-2">
                <li>Go to your Service Agent Dashboard</li>
                <li>Click on "Jobs"</li>
                <li>View your upcoming and past jobs</li>
                <li>Click on a job to view details</li>
                <li>Update the status of jobs as they progress</li>
              </ol>
            </div>
          ),
        },
        {
          id: 'creating-estimates',
          title: 'Creating Estimates',
          content: (
            <div>
              <p>To create an estimate for additional work:</p>
              <ol className="list-decimal list-inside mt-2 space-y-2">
                <li>Go to your Service Agent Dashboard</li>
                <li>Click on "Jobs"</li>
                <li>Select the job you want to create an estimate for</li>
                <li>Click "Create Estimate"</li>
                <li>Add line items with descriptions and prices</li>
                <li>Add any notes or terms</li>
                <li>Click "Send to Client"</li>
              </ol>
            </div>
          ),
        },
      ],
    },
    {
      id: 'subscription-plans',
      title: 'Subscription Plans',
      content: (
        <div>
          <p>The FAIT Co-Op Platform offers various subscription plans for both clients and service agents.</p>
          
          <h3 className="text-lg font-semibold mt-4">Service Agent Plans</h3>
          <ul className="list-disc list-inside mt-2 space-y-2">
            <li><strong>Free Tier:</strong> Basic access with limited features</li>
            <li><strong>Pro Tier ($75/month):</strong> Enhanced features for professional service agents</li>
            <li><strong>Business Tier ($200/month):</strong> Full-featured plan for service agent businesses</li>
          </ul>
          
          <h3 className="text-lg font-semibold mt-4">Client Plans</h3>
          <ul className="list-disc list-inside mt-2 space-y-2">
            <li><strong>Free Tier:</strong> Basic access to the platform</li>
            <li><strong>FAIT Plus ($4.99/month):</strong> Enhanced features including extended warranties</li>
          </ul>
          
          <p className="mt-4">To manage your subscription, go to the Subscription page from your dashboard.</p>
        </div>
      ),
    },
    {
      id: 'payments',
      title: 'Payments',
      content: (
        <div>
          <p>The FAIT Co-Op Platform uses secure payment processing for all transactions.</p>
          
          <h3 className="text-lg font-semibold mt-4">For Clients</h3>
          <p>When you book a service, you'll be asked to provide payment information. Your payment will be processed securely through our payment provider.</p>
          
          <h3 className="text-lg font-semibold mt-4">For Service Agents</h3>
          <p>When a client books your service, the payment will be held in escrow until the service is completed. Once the service is marked as completed and the client confirms, the payment will be released to you.</p>
          
          <h3 className="text-lg font-semibold mt-4">Refunds</h3>
          <p>Refund policies vary by service. Please review the specific cancellation and refund policy before making a booking.</p>
        </div>
      ),
    },
  ];

  const renderSection = (section: Section, level = 0) => {
    const isExpanded = expandedSections.includes(section.id);
    const matchesSearch = searchQuery
      ? section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (section.subsections?.some((subsection) =>
          subsection.title.toLowerCase().includes(searchQuery.toLowerCase())
        ))
      : true;

    if (!matchesSearch) return null;

    return (
      <div key={section.id} className="mb-4">
        <button
          className={`flex items-center w-full text-left p-3 rounded-md ${
            level === 0
              ? 'bg-gray-100 hover:bg-gray-200'
              : 'hover:bg-gray-50'
          }`}
          onClick={() => toggleSection(section.id)}
        >
          {section.subsections?.length ? (
            isExpanded ? (
              <ChevronDown className="h-5 w-5 mr-2 flex-shrink-0" />
            ) : (
              <ChevronRight className="h-5 w-5 mr-2 flex-shrink-0" />
            )
          ) : (
            <div className="w-5 mr-2" />
          )}
          <span className={`${level === 0 ? 'font-semibold' : ''}`}>
            {section.title}
          </span>
        </button>

        {isExpanded && (
          <div className={`mt-2 ${level > 0 ? 'ml-7' : ''}`}>
            <div className="p-3 bg-white rounded-md border border-gray-200">
              {section.content}
            </div>

            {section.subsections?.map((subsection) =>
              renderSection(subsection, level + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">User Guide</h1>
          <p className="mt-1 text-sm text-gray-500">
            Everything you need to know about using the FAIT Co-Op Platform
          </p>
        </div>

        <div className="px-4 py-5 sm:p-6">
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Search the documentation"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            {sections.map((section) => renderSection(section))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserGuide;
