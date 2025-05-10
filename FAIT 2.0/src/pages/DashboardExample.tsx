import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/ButtonNew';
import StatsCard from '../components/ui/StatsCard';
import ActionCard from '../components/ui/ActionCard';
import { Card, CardContent } from '../components/ui/CardNew';
import FadeInView from '../components/animations/FadeInView';
import ScaleInView from '../components/animations/ScaleInView';
import SlideInView from '../components/animations/SlideInView';
import ParticleBackground from '../components/animations/ParticleBackground';

// Mock icons (replace with your actual icons)
const CalendarIcon = () => (
  <svg className="h-3.5 w-3.5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const MessageIcon = () => (
  <svg className="h-3.5 w-3.5 text-secondary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
  </svg>
);

const ShieldIcon = () => (
  <svg className="h-3.5 w-3.5 text-accent-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const SearchIcon = () => (
  <svg className="h-3.5 w-3.5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const DashboardExample: React.FC = () => {
  const [loading, setLoading] = useState(false);

  return (
    <div className="bg-neutral-50 min-h-screen relative overflow-hidden">
      {/* Particle Background */}
      <div className="absolute inset-0 z-0 opacity-10">
        <ParticleBackground
          particleCount={50}
          color="#d946ef"
          minSize={2}
          maxSize={6}
        />
      </div>

      {/* Main Content */}
      <div className="py-10 relative z-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeInView>
              <h1 className="text-3xl font-bold text-neutral-900">Dashboard</h1>
            </FadeInView>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            {/* Stats Section */}
            <div className="px-4 py-6 sm:px-0">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <FadeInView delay={0.1}>
                  <StatsCard
                    title="Upcoming Bookings"
                    value={3}
                    icon={<CalendarIcon />}
                    iconBgColor="bg-primary-100"
                    linkText="View all bookings"
                    linkUrl="/bookings"
                    loading={loading}
                  />
                </FadeInView>

                <FadeInView delay={0.2}>
                  <StatsCard
                    title="Unread Messages"
                    value={5}
                    icon={<MessageIcon />}
                    iconBgColor="bg-secondary-100"
                    linkText="View messages"
                    linkUrl="/messages"
                    loading={loading}
                  />
                </FadeInView>

                <FadeInView delay={0.3}>
                  <StatsCard
                    title="Active Warranties"
                    value={2}
                    icon={<ShieldIcon />}
                    iconBgColor="bg-accent-100"
                    linkText="View warranties"
                    linkUrl="/warranties"
                    loading={loading}
                  />
                </FadeInView>
              </div>
            </div>

            {/* Search Section */}
            <div className="px-4 py-6 sm:px-0">
              <ScaleInView delay={0.4}>
                <Card>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-grow">
                        <input
                          type="text"
                          placeholder="Search for services..."
                          className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                      <Button>
                        Search
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </ScaleInView>
            </div>

            {/* Quick Actions Section */}
            <div className="px-4 py-6 sm:px-0">
              <SlideInView direction="up" delay={0.5}>
                <h2 className="text-lg font-medium text-neutral-900 mb-4">Quick Actions</h2>
              </SlideInView>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <SlideInView direction="up" delay={0.6}>
                  <ActionCard
                    title="Browse Services"
                    description="View all service categories"
                    icon={<SearchIcon />}
                    iconBgColor="bg-primary-100"
                    linkUrl="/services"
                  />
                </SlideInView>

                <SlideInView direction="up" delay={0.7}>
                  <ActionCard
                    title="My Bookings"
                    description="View your appointments"
                    icon={<CalendarIcon />}
                    iconBgColor="bg-green-100"
                    linkUrl="/bookings"
                  />
                </SlideInView>

                <SlideInView direction="up" delay={0.8}>
                  <ActionCard
                    title="Messages"
                    description="Contact service providers"
                    icon={<MessageIcon />}
                    iconBgColor="bg-secondary-100"
                    linkUrl="/messages"
                  />
                </SlideInView>

                <SlideInView direction="up" delay={0.9}>
                  <ActionCard
                    title="Warranties"
                    description="Manage your warranties"
                    icon={<ShieldIcon />}
                    iconBgColor="bg-accent-100"
                    linkUrl="/warranties"
                  />
                </SlideInView>
              </div>
            </div>

            {/* Additional Links */}
            <div className="px-4 py-6 sm:px-0 flex flex-wrap justify-center gap-4">
              <FadeInView delay={1.0}>
                <Button variant="outline" size="default">
                  Subscription Plans
                </Button>
              </FadeInView>

              <FadeInView delay={1.1}>
                <Button variant="outline" size="default">
                  Points & Rewards
                </Button>
              </FadeInView>

              <FadeInView delay={1.2}>
                <Button variant="outline" size="default">
                  Co-op Governance
                </Button>
              </FadeInView>

              <FadeInView delay={1.3}>
                <Button variant="outline" size="default">
                  Profile Settings
                </Button>
              </FadeInView>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardExample;
