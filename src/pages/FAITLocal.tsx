import React, { useState, useEffect } from 'react';
import { MainLayout } from '../components/MainLayout';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import LoadingSpinner from '../components/LoadingSpinner';
import VoterInfo from '../components/local/VoterInfo';
import LegislationTracker from '../components/local/LegislationTracker';
import CommunityEvents from '../components/local/CommunityEvents';
import AirQuality from '../components/local/AirQuality';
import Weather from '../components/local/Weather';

// Types for the Civic Information API responses
interface Election {
  id: string;
  name: string;
  electionDay: string;
  ocdDivisionId?: string;
}

interface Address {
  line1?: string;
  city?: string;
  state?: string;
  zip?: string;
  locationName?: string;
}

interface RepresentativeInfo {
  officials: Official[];
  offices: Office[];
  normalizedInput?: Address;
}

interface Official {
  name: string;
  address?: Address[];
  party?: string;
  phones?: string[];
  urls?: string[];
  photoUrl?: string;
  emails?: string[];
  channels?: {
    type: string;
    id: string;
  }[];
}

interface Office {
  name: string;
  divisionId: string;
  levels?: string[];
  roles?: string[];
  officialIndices: number[];
}

const FAITLocal: React.FC = () => {
  const [address, setAddress] = useState('');
  const [representatives, setRepresentatives] = useState<RepresentativeInfo | null>(null);
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // API Key
  const API_KEY = 'AIzaSyCMbpCUgNl7acYkY9bwo1C4c36vWVJXqfY';
  const AIR_QUALITY_API_KEY = 'AIzaSyDC28nIiG3r8OcumtROEZnERpMp09dyRjI';

  // Animation settings
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  // Intersection Observer for scroll animations
  const [headerRef, headerInView] = useInView({
    threshold: 0.2,
    triggerOnce: true
  });

  const [resourcesRef, resourcesInView] = useInView({
    threshold: 0.2,
    triggerOnce: true
  });

  const [formRef, formInView] = useInView({
    threshold: 0.2,
    triggerOnce: true
  });

  const [voterInfoRef, voterInfoInView] = useInView({
    threshold: 0.2,
    triggerOnce: true
  });

  const [legislationRef, legislationInView] = useInView({
    threshold: 0.2,
    triggerOnce: true
  });

  const [eventsRef, eventsInView] = useInView({
    threshold: 0.2,
    triggerOnce: true
  });

  const [airQualityRef, airQualityInView] = useInView({
    threshold: 0.2,
    triggerOnce: true
  });

  const [weatherRef, weatherInView] = useInView({
    threshold: 0.2,
    triggerOnce: true
  });

  // Fetch elections when component mounts
  useEffect(() => {
    const fetchElections = async () => {
      try {
        const response = await fetch(
          `https://www.googleapis.com/civicinfo/v2/elections?key=${API_KEY}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch elections');
        }

        const data = await response.json();
        setElections(data.elections || []);
      } catch (err) {
        console.error('Error fetching elections:', err);
        setError('Failed to load elections. Please try again later.');
      }
    };

    fetchElections();
  }, []);

  // Handle form submission to find representatives
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address.trim()) {
      setError('Please enter an address');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://www.googleapis.com/civicinfo/v2/representatives?key=${API_KEY}&address=${encodeURIComponent(address)}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch representative data');
      }

      const data = await response.json();
      setRepresentatives(data);
    } catch (err) {
      console.error('Error fetching representatives:', err);
      setError('Failed to find representatives. Please check your address and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Render officials with their offices
  const renderRepresentatives = () => {
    if (!representatives) return null;

    return (
      <div className="mt-8 space-y-6">
        <h3 className="text-2xl font-bold text-blue-800">Your Representatives</h3>

        {representatives.offices?.map((office, officeIndex) => (
          <div key={officeIndex} className="bg-white rounded-lg shadow-md p-6 mb-4">
            <h4 className="text-xl font-semibold text-blue-700 mb-3">{office.name}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {office.officialIndices.map((index) => {
                const official = representatives.officials[index];
                return (
                  <div key={index} className="border rounded-lg p-4 bg-blue-50">
                    <div className="flex flex-col md:flex-row gap-4">
                      {official.photoUrl && (
                        <img
                          src={official.photoUrl}
                          alt={official.name}
                          className="w-24 h-24 object-cover rounded-full"
                          onError={(e) => {
                            // Handle broken image URLs
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      )}
                      <div>
                        <h5 className="text-lg font-medium">{official.name}</h5>
                        {official.party && <p className="text-gray-600">{official.party}</p>}

                        {official.phones && official.phones.length > 0 && (
                          <p className="mt-2">
                            <span className="font-medium">Phone:</span>{' '}
                            <a href={`tel:${official.phones[0]}`} className="text-blue-600 hover:underline">
                              {official.phones[0]}
                            </a>
                          </p>
                        )}

                        {official.emails && official.emails.length > 0 && (
                          <p className="mt-1">
                            <span className="font-medium">Email:</span>{' '}
                            <a href={`mailto:${official.emails[0]}`} className="text-blue-600 hover:underline">
                              {official.emails[0]}
                            </a>
                          </p>
                        )}

                        {official.urls && official.urls.length > 0 && (
                          <p className="mt-1">
                            <span className="font-medium">Website:</span>{' '}
                            <a href={official.urls[0]} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              Visit Website
                            </a>
                          </p>
                        )}

                        {official.channels && official.channels.length > 0 && (
                          <div className="mt-2">
                            <span className="font-medium">Social Media:</span>
                            <div className="flex gap-2 mt-1">
                              {official.channels.map((channel, i) => (
                                <SocialMediaLink key={i} channel={channel} />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <MainLayout currentPage="local">
      <div className="bg-blue-50 min-h-screen">
        {/* Hero Section */}
        <motion.section
          ref={headerRef}
          initial="hidden"
          animate={headerInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-600 to-blue-800 text-white"
        >
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">FAIT Local</h1>
            <p className="text-xl md:text-2xl mb-8">Your hub for local information and resources</p>
            <p className="text-lg">
              Discover how to make a difference in your community, connect with your elected officials,
              and stay informed about upcoming elections and civic events.
            </p>
          </div>
        </motion.section>

        {/* Find Your Representatives Section */}
        <motion.section
          ref={formRef}
          initial="hidden"
          animate={formInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto"
        >
          <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
            <h2 className="text-3xl font-bold text-blue-800 mb-6">Find Your Representatives</h2>
            <p className="text-lg mb-6">
              Enter your address to find information about your elected officials at all levels of government.
            </p>

            <form onSubmit={handleSubmit} className="mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter your full address"
                  className="flex-grow px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  aria-label="Your address"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition duration-200 disabled:bg-blue-400"
                >
                  {loading ? 'Searching...' : 'Find Representatives'}
                </button>
              </div>
              {error && <p className="mt-2 text-red-600">{error}</p>}
            </form>

            {/* Loading indicator */}
            {loading && <LoadingSpinner />}

            {/* Representatives Results */}
            {renderRepresentatives()}
          </div>
        </motion.section>

        {/* Weather Section */}
        <motion.section
          ref={weatherRef}
          initial="hidden"
          animate={weatherInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto"
        >
          <Weather />
        </motion.section>

        {/* Air Quality Section */}
        <motion.section
          ref={airQualityRef}
          initial="hidden"
          animate={airQualityInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto"
        >
          <AirQuality apiKey={AIR_QUALITY_API_KEY} />
        </motion.section>

        {/* Voter Information Section */}
        <motion.section
          ref={voterInfoRef}
          initial="hidden"
          animate={voterInfoInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto"
        >
          <VoterInfo apiKey={API_KEY} />
        </motion.section>

        {/* Legislation Tracker Section */}
        <motion.section
          ref={legislationRef}
          initial="hidden"
          animate={legislationInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto"
        >
          <LegislationTracker />
        </motion.section>

        {/* Community Events Section */}
        <motion.section
          ref={eventsRef}
          initial="hidden"
          animate={eventsInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto"
        >
          <CommunityEvents />
        </motion.section>

        {/* Upcoming Elections Section */}
        {elections.length > 0 && (
          <motion.section
            initial="hidden"
            animate={resourcesInView ? "visible" : "hidden"}
            variants={fadeInUp}
            className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto"
          >
            <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
              <h2 className="text-3xl font-bold text-blue-800 mb-6">Upcoming Elections</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Election Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {elections.map((election) => (
                      <tr key={election.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {election.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(election.electionDay).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.section>
        )}

        {/* Civic Resources Section */}
        <motion.section
          ref={resourcesRef}
          initial="hidden"
          animate={resourcesInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto"
        >
          <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
            <h2 className="text-3xl font-bold text-blue-800 mb-6">Local Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ResourceCard
                title="Local Events"
                description="Find concerts, festivals, and other events happening in your area."
                link="https://www.eventbrite.com/"
              />
              <ResourceCard
                title="Traffic & Road Safety"
                description="Get real-time traffic updates and road safety information."
                link="https://www.waze.com/"
              />
              <ResourceCard
                title="Crime Statistics"
                description="Access local crime data and safety information for your neighborhood."
                link="https://www.crimereports.com/"
              />
              <ResourceCard
                title="Public Transportation"
                description="Find schedules and routes for buses, trains, and other public transit."
                link="https://www.transit.app/"
              />
              <ResourceCard
                title="Local News"
                description="Stay informed about what's happening in your community."
                link="https://www.patch.com/"
              />
              <ResourceCard
                title="Volunteer Opportunities"
                description="Find ways to get involved and make a difference in your community."
                link="https://www.volunteermatch.org/"
              />
            </div>
          </div>
        </motion.section>
      </div>
    </MainLayout>
  );
};

// Resource Card Component
const ResourceCard: React.FC<{ title: string; description: string; link: string }> = ({
  title,
  description,
  link
}) => {
  return (
    <div className="bg-blue-50 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
      <h3 className="text-xl font-semibold text-blue-700 mb-3">{title}</h3>
      <p className="text-gray-700 mb-4">{description}</p>
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
      >
        Learn More
      </a>
    </div>
  );
};

// Social Media Link Component
const SocialMediaLink: React.FC<{ channel: { type: string; id: string } }> = ({ channel }) => {
  const getChannelUrl = () => {
    switch (channel.type.toLowerCase()) {
      case 'facebook':
        return `https://facebook.com/${channel.id}`;
      case 'twitter':
        return `https://twitter.com/${channel.id}`;
      case 'youtube':
        return `https://youtube.com/user/${channel.id}`;
      case 'instagram':
        return `https://instagram.com/${channel.id}`;
      default:
        return '#';
    }
  };

  return (
    <a
      href={getChannelUrl()}
      target="_blank"
      rel="noopener noreferrer"
      className="px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors duration-200"
    >
      {channel.type}
    </a>
  );
};

export default FAITLocal;
