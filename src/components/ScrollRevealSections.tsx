import React from 'react';
import Reveal from './ui/Reveal';
import { Calendar, Users, Briefcase, Award, TrendingUp, Shield } from 'lucide-react';

const ScrollRevealSections: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
      <div className="space-y-40">
        {/* Section 1 */}
        <section className="flex flex-col items-center text-center">
          <Reveal direction="up">
            <Calendar className="w-16 h-16 text-blue-600 mb-8" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Seamless Booking</h2>
            <p className="text-lg text-gray-600 max-w-md mx-auto">
              Our intuitive booking system makes it easy to schedule services
              with just a few clicks. Find the perfect time that works for you.
            </p>
          </Reveal>
        </section>

        {/* Section 2 */}
        <section className="flex flex-col items-center text-center">
          <Reveal direction="left">
            <Users className="w-16 h-16 text-green-600 mb-8" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Verified Professionals</h2>
            <p className="text-lg text-gray-600 max-w-md mx-auto">
              Every service provider on our platform undergoes a thorough verification process.
              Work with confidence knowing you're hiring trusted experts.
            </p>
          </Reveal>
        </section>

        {/* Section 3 */}
        <section className="flex flex-col items-center text-center">
          <Reveal direction="right">
            <Briefcase className="w-16 h-16 text-purple-600 mb-8" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Project Management</h2>
            <p className="text-lg text-gray-600 max-w-md mx-auto">
              Keep track of all your projects in one place. Monitor progress,
              communicate with service providers, and manage payments seamlessly.
            </p>
          </Reveal>
        </section>

        {/* Section 4 */}
        <section className="flex flex-col items-center text-center">
          <Reveal direction="up">
            <Award className="w-16 h-16 text-yellow-600 mb-8" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Quality Guarantee</h2>
            <p className="text-lg text-gray-600 max-w-md mx-auto">
              We stand behind the quality of our service providers. If you're not
              satisfied, we'll work with you to make it right.
            </p>
          </Reveal>
        </section>

        {/* Section 5 */}
        <section className="flex flex-col items-center text-center">
          <Reveal direction="left">
            <TrendingUp className="w-16 h-16 text-red-600 mb-8" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Growth Opportunities</h2>
            <p className="text-lg text-gray-600 max-w-md mx-auto">
              For service providers, our platform offers unparalleled opportunities to grow
              your business and connect with new clients in your area.
            </p>
          </Reveal>
        </section>

        {/* Section 6 */}
        <section className="flex flex-col items-center text-center">
          <Reveal direction="right">
            <Shield className="w-16 h-16 text-indigo-600 mb-8" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Secure Payments</h2>
            <p className="text-lg text-gray-600 max-w-md mx-auto">
              Our secure payment system ensures that your transactions are protected.
              Pay with confidence using our trusted platform.
            </p>
          </Reveal>
        </section>
      </div>
    </div>
  );
};

export default ScrollRevealSections;
