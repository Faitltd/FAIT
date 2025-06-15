import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { ArrowLeft, Copy, Share2, Users, Gift, Award } from 'lucide-react';

const ServiceAgentReferrals: React.FC = () => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  
  // Generate a mock referral link
  const referralLink = `${window.location.origin}/signup?referral=${user?.id || 'demo'}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join me on FAIT Co-op',
          text: 'I\'m inviting you to join FAIT Co-op. Use my referral link to sign up!',
          url: referralLink
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link to="/dashboard/service-agent" className="inline-flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Grow Your Network</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Refer Other Professionals</h2>
          <p className="text-gray-600 mb-6">
            Invite other service agents to join FAIT Co-op and earn rewards when they complete verification.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-2">How It Works</h3>
              <ol className="list-decimal pl-5 space-y-2 text-gray-600">
                <li>Share your unique referral link with other professionals in your network</li>
                <li>When they sign up using your link, you'll be connected as their referrer</li>
                <li>
                  Once they complete verification, you'll earn{' '}
                  <span className="font-medium text-blue-600">200 points</span>
                </li>
                <li>They'll also receive a welcome bonus of 50 points</li>
              </ol>
            </div>

            <div>
              <h3 className="text-md font-medium text-gray-900 mb-2">Your Referral Link</h3>
              <div className="mt-2 flex items-center">
                <div className="flex-grow">
                  <div className="relative">
                    <input
                      type="text"
                      value={referralLink}
                      readOnly
                      className="block w-full pr-10 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
                <div className="ml-3 flex-shrink-0">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div className="ml-3 flex-shrink-0">
                  <button
                    type="button"
                    onClick={handleShare}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Share2 className="h-4 w-4 mr-1" />
                    Share
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 mr-4">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Referrals</p>
              <p className="text-2xl font-semibold text-gray-900">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 mr-4">
              <Gift className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Successful Referrals</p>
              <p className="text-2xl font-semibold text-gray-900">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 mr-4">
              <Award className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Points Earned</p>
              <p className="text-2xl font-semibold text-gray-900">0</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Your Referrals</h2>
          <div className="text-center py-10">
            <p className="text-gray-500 mb-4">You haven't referred anyone yet.</p>
            <p className="text-gray-600">
              Share your referral link with other professionals to start earning rewards.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceAgentReferrals;
