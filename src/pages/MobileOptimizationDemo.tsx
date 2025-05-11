import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Mail, Lock, Phone, User, ArrowRight, RefreshCw, Image, Menu } from 'lucide-react';

import SwipeableContainer from '../components/common/SwipeableContainer';
import TouchFriendlyButton from '../components/common/TouchFriendlyButton';
import MobileFormInput from '../components/common/MobileFormInput';
import EnhancedResponsiveImage from '../components/common/EnhancedResponsiveImage';
import LazyLoadSection from '../components/common/LazyLoadSection';
import PullToRefresh from '../components/common/PullToRefresh';
import MobileGallery from '../components/common/MobileGallery';
import MobileDrawer from '../components/common/MobileDrawer';
import { useMobile } from '../hooks/useMediaQuery';

const MobileOptimizationDemo: React.FC = () => {
  const isMobile = useMobile();
  const [activeSection, setActiveSection] = useState<number>(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });
  const [swipeDirection, setSwipeDirection] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle swipe actions
  const handleSwipeLeft = () => {
    setSwipeDirection('left');
    if (activeSection < 7) {
      setActiveSection(prev => prev + 1);
    }
  };

  const handleSwipeRight = () => {
    setSwipeDirection('right');
    if (activeSection > 0) {
      setActiveSection(prev => prev - 1);
    }
  };

  // Handle pull-to-refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setRefreshCount(prev => prev + 1);
    setIsRefreshing(false);
  }, []);

  // Demo sections
  const sections = [
    {
      title: 'Touch-Optimized Buttons',
      description: 'Buttons with larger touch targets and visual feedback',
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TouchFriendlyButton variant="primary" size="lg" fullWidth>
              Primary Button
            </TouchFriendlyButton>

            <TouchFriendlyButton variant="secondary" size="lg" fullWidth>
              Secondary Button
            </TouchFriendlyButton>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <TouchFriendlyButton variant="outline" size="md">
              Outline
            </TouchFriendlyButton>

            <TouchFriendlyButton variant="ghost" size="md">
              Ghost
            </TouchFriendlyButton>

            <TouchFriendlyButton variant="danger" size="md">
              Danger
            </TouchFriendlyButton>

            <TouchFriendlyButton
              variant="primary"
              size="md"
              icon={<ArrowRight size={18} />}
              iconPosition="right"
            >
              With Icon
            </TouchFriendlyButton>
          </div>
        </div>
      ),
    },
    {
      title: 'Swipe Gestures',
      description: 'Swipe left or right to navigate between sections',
      content: (
        <div className="space-y-6">
          <div className="bg-blue-50 p-6 rounded-lg text-center">
            <p className="text-lg font-medium mb-2">
              Current swipe direction: {swipeDirection || 'None'}
            </p>
            <p className="text-gray-600">
              Swipe left or right on this container to navigate
            </p>
          </div>

          <div className="flex justify-center space-x-2 mt-4">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((index) => (
              <button
                key={index}
                onClick={() => setActiveSection(index)}
                className={`w-3 h-3 rounded-full ${
                  activeSection === index ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      ),
    },
    {
      title: 'Mobile-Optimized Forms',
      description: 'Form inputs with larger touch targets and better feedback',
      content: (
        <div className="space-y-4">
          <MobileFormInput
            id="name"
            name="name"
            label="Full Name"
            value={formData.name}
            onChange={handleInputChange}
            icon={<User size={20} />}
            required
          />

          <MobileFormInput
            id="email"
            name="email"
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            icon={<Mail size={20} />}
            required
            helpText="We'll never share your email with anyone else."
          />

          <MobileFormInput
            id="phone"
            name="phone"
            label="Phone Number"
            type="tel"
            value={formData.phone}
            onChange={handleInputChange}
            icon={<Phone size={20} />}
          />

          <MobileFormInput
            id="password"
            name="password"
            label="Password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            icon={<Lock size={20} />}
            required
            error={
              formData.password && formData.password.length < 8
                ? 'Password must be at least 8 characters'
                : ''
            }
          />

          <div className="pt-4">
            <TouchFriendlyButton variant="primary" size="lg" fullWidth>
              Submit Form
            </TouchFriendlyButton>
          </div>
        </div>
      ),
    },
    {
      title: 'Animations & Transitions',
      description: 'Smooth animations optimized for mobile devices',
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((item) => (
              <motion.div
                key={item}
                className="bg-white p-4 rounded-lg shadow-md"
                whileTap={{ scale: 0.95 }}
                whileHover={{ y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: item * 0.1 }}
              >
                <div className="h-20 bg-blue-100 rounded-md mb-2 flex items-center justify-center text-blue-500 font-bold text-xl">
                  {item}
                </div>
                <h3 className="font-medium">Item {item}</h3>
                <p className="text-sm text-gray-500">Tap me for feedback</p>
              </motion.div>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: 'Pull-to-Refresh',
      description: 'Native-feeling pull-to-refresh interaction',
      content: (
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg text-center mb-4">
            <p className="text-gray-600">
              Pull down on the content below to refresh
            </p>
          </div>

          <PullToRefresh onRefresh={handleRefresh} className="h-64 rounded-lg border border-gray-200">
            <div className="p-4">
              <h3 className="text-lg font-medium mb-2">Refreshable Content</h3>
              <p className="text-gray-600 mb-4">
                Pull down to refresh this content. This simulates refreshing a feed or list.
              </p>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <p className="font-medium">Refresh Count: {refreshCount}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Last refreshed: {refreshCount > 0 ? new Date().toLocaleTimeString() : 'Never'}
                </p>
              </div>
            </div>
          </PullToRefresh>
        </div>
      ),
    },
    {
      title: 'Responsive Images',
      description: 'Optimized image loading with proper sizing',
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">Standard Image</h3>
              <EnhancedResponsiveImage
                src="https://images.unsplash.com/photo-1580587771525-78b9dba3b914"
                alt="Beautiful house"
                className="rounded-lg"
                width="100%"
                height="200px"
                animation="fade"
              />
            </div>

            <div>
              <h3 className="font-medium mb-2">Lazy Loaded Image</h3>
              <EnhancedResponsiveImage
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c"
                alt="Modern interior"
                className="rounded-lg"
                width="100%"
                height="200px"
                animation="zoom"
                loading="lazy"
              />
            </div>
          </div>

          <LazyLoadSection
            className="mt-4 rounded-lg overflow-hidden"
            animation="slide-up"
            minHeight="200px"
          >
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Lazy Loaded Section</h3>
              <p className="text-gray-600 mb-4">
                This entire section was lazy loaded when it entered the viewport.
              </p>
              <EnhancedResponsiveImage
                src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c"
                alt="Kitchen renovation"
                className="rounded-lg"
                width="100%"
                height="200px"
                animation="slide-left"
              />
            </div>
          </LazyLoadSection>
        </div>
      ),
    },
    {
      title: 'Mobile Gallery',
      description: 'Touch-optimized image gallery with swipe gestures',
      content: (
        <div className="space-y-4">
          <MobileGallery
            images={[
              {
                src: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
                alt: 'Modern home interior',
                thumbnail: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=200'
              },
              {
                src: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c',
                alt: 'Kitchen renovation',
                thumbnail: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=200'
              },
              {
                src: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914',
                alt: 'Beautiful house exterior',
                thumbnail: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=200'
              },
              {
                src: 'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83',
                alt: 'Modern bathroom',
                thumbnail: 'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=200'
              },
            ]}
            aspectRatio="16/9"
            className="rounded-lg overflow-hidden"
            showThumbnails={true}
            showDots={true}
            showArrows={true}
          />

          <div className="mt-4 text-center">
            <p className="text-gray-600">
              Swipe left or right on the gallery to navigate between images
            </p>
          </div>
        </div>
      ),
    },
    {
      title: 'Mobile Drawer',
      description: 'Off-canvas navigation with swipe gestures',
      content: (
        <div className="space-y-4">
          <div className="flex justify-center">
            <TouchFriendlyButton
              variant="primary"
              size="lg"
              icon={<Menu size={20} />}
              onClick={() => setIsDrawerOpen(true)}
            >
              Open Drawer
            </TouchFriendlyButton>
          </div>

          <MobileDrawer
            isOpen={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
            position="left"
            width="80%"
            swipeToClose={true}
          >
            <div className="p-6">
              <h3 className="text-xl font-bold mb-6">Mobile Drawer</h3>

              <nav className="space-y-4">
                {['Home', 'Services', 'Projects', 'About', 'Contact'].map((item) => (
                  <a
                    key={item}
                    href="#"
                    className="block py-2 px-4 text-gray-700 hover:bg-gray-100 rounded-md"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsDrawerOpen(false);
                    }}
                  >
                    {item}
                  </a>
                ))}
              </nav>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-gray-600 text-sm">
                  Swipe right to close this drawer or tap outside.
                </p>
              </div>
            </div>
          </MobileDrawer>

          <div className="bg-blue-50 p-4 rounded-lg text-center mt-4">
            <p className="text-gray-600">
              This drawer can be closed by swiping from left to right, tapping the X button, or tapping outside the drawer.
            </p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mobile Experience Optimization</h1>
          <p className="mt-2 text-lg text-gray-600">
            Explore the new mobile-optimized components and interactions
          </p>
        </div>

        <SwipeableContainer
          onSwipeLeft={handleSwipeLeft}
          onSwipeRight={handleSwipeRight}
          className="bg-white rounded-xl shadow-md overflow-hidden"
          showIndicators={isMobile}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {sections[activeSection].title}
              </h2>

              <div className="flex space-x-2">
                <TouchFriendlyButton
                  onClick={() => activeSection > 0 && setActiveSection(prev => prev - 1)}
                  disabled={activeSection === 0}
                  variant="ghost"
                  className="p-2"
                  ariaLabel="Previous section"
                >
                  <ChevronRight className="w-5 h-5 transform rotate-180" />
                </TouchFriendlyButton>

                <TouchFriendlyButton
                  onClick={() => activeSection < sections.length - 1 && setActiveSection(prev => prev + 1)}
                  disabled={activeSection === sections.length - 1}
                  variant="ghost"
                  className="p-2"
                  ariaLabel="Next section"
                >
                  <ChevronRight className="w-5 h-5" />
                </TouchFriendlyButton>
              </div>
            </div>

            <p className="text-gray-600 mb-6">
              {sections[activeSection].description}
            </p>

            {sections[activeSection].content}
          </div>
        </SwipeableContainer>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            {isMobile
              ? "You're viewing the mobile-optimized version"
              : "Resize your browser or view on a mobile device for the full experience"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MobileOptimizationDemo;
