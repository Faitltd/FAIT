import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useReferrals } from '../../modules/referrals/hooks/useReferrals';
import ReferralLink from '../../modules/referrals/components/ReferralLink';
import ReferralStats from '../../modules/referrals/components/ReferralStats';
import ReferralList from '../../modules/referrals/components/ReferralList';
import ShareOptions from '../../modules/referrals/components/ShareOptions';

/**
 * Dashboard for service agent referrals
 */
const ReferralDashboard: React.FC = () => {
  const { user } = useAuth();
  const { 
    isLoading, 
    error, 
    referralCode, 
    referrals, 
    stats, 
    referralProgram,
    getReferralLink
  } = useReferrals();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
        <div className="relative py-3 sm:max-w-xl sm:mx-auto">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
          <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
            <div className="max-w-md mx-auto">
              <div className="divide-y divide-gray-200">
                <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                  <p>Please log in to access your referral dashboard.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold leading-tight text-gray-900">Grow Your Network</h1>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            {/* Program Info Section */}
            <div className="px-4 py-6 sm:px-0">
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h2 className="text-lg leading-6 font-medium text-gray-900">Refer Other Professionals</h2>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Invite other service agents to join FAIT Co-op and earn rewards when they complete verification.
                  </p>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">How It Works</h3>
                      <div className="mt-2 text-sm text-gray-500">
                        <ol className="list-decimal pl-5 space-y-2">
                          <li>Share your unique referral link with other professionals in your network</li>
                          <li>When they sign up using your link, you'll be connected as their referrer</li>
                          <li>
                            Once they complete verification, you'll earn{' '}
                            <span className="font-medium text-blue-600">
                              {referralProgram?.service_agent_reward_amount || 200} points
                            </span>
                          </li>
                          <li>They'll also receive a welcome bonus of {referralProgram?.referred_service_agent_reward_amount || 50} points</li>
                        </ol>
                      </div>
                      
                      <div className="mt-4 p-4 bg-blue-50 rounded-md">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3 flex-1 md:flex md:justify-between">
                            <p className="text-sm text-blue-700">
                              You can also refer clients and earn {referralProgram?.client_reward_amount || 100} points for each client who completes their first transaction.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {isLoading ? (
                      <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                      </div>
                    ) : referralCode ? (
                      <div>
                        <ReferralLink referralCode={referralCode} />
                        <div className="mt-4">
                          <ShareOptions referralLink={getReferralLink()} />
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-center items-center h-64">
                        <p className="text-gray-500">Failed to load referral code.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Section */}
            {!isLoading && (
              <div className="px-4 py-6 sm:px-0">
                <ReferralStats stats={stats} />
              </div>
            )}

            {/* Referrals List */}
            <div className="px-4 py-6 sm:px-0">
              <h2 className="text-lg leading-6 font-medium text-gray-900 mb-4">Your Referrals</h2>
              
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <ReferralList referrals={referrals} />
              )}
            </div>
            
            {/* Marketing Materials */}
            <div className="px-4 py-6 sm:px-0">
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h2 className="text-lg leading-6 font-medium text-gray-900">Marketing Materials</h2>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Use these resources to help promote FAIT Co-op to your network
                  </p>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="border border-gray-200 rounded-md p-4">
                      <h3 className="text-sm font-medium text-gray-900">Email Template</h3>
                      <p className="mt-1 text-xs text-gray-500">
                        Ready-to-use email template to send to your contacts
                      </p>
                      <button
                        type="button"
                        className="mt-2 inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Copy Template
                      </button>
                    </div>
                    
                    <div className="border border-gray-200 rounded-md p-4">
                      <h3 className="text-sm font-medium text-gray-900">Social Media Posts</h3>
                      <p className="mt-1 text-xs text-gray-500">
                        Pre-written posts for LinkedIn, Facebook, and Twitter
                      </p>
                      <button
                        type="button"
                        className="mt-2 inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        View Posts
                      </button>
                    </div>
                    
                    <div className="border border-gray-200 rounded-md p-4">
                      <h3 className="text-sm font-medium text-gray-900">Digital Flyer</h3>
                      <p className="mt-1 text-xs text-gray-500">
                        Downloadable PDF flyer with your referral code
                      </p>
                      <button
                        type="button"
                        className="mt-2 inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Download PDF
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Terms and Conditions */}
            <div className="px-4 py-6 sm:px-0">
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h2 className="text-lg leading-6 font-medium text-gray-900">Terms & Conditions</h2>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                  <div className="text-sm text-gray-500">
                    <p className="mb-2">
                      By participating in the FAIT Co-op Referral Program, you agree to the following terms:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Referral rewards are issued only after the referred user completes verification</li>
                      <li>Referral links expire after {referralProgram?.expiration_days || 30} days</li>
                      <li>FAIT Co-op reserves the right to modify or terminate the referral program at any time</li>
                      <li>Abuse of the referral program, including self-referrals, may result in account suspension</li>
                      <li>Points earned through referrals are subject to the FAIT Co-op Points Program Terms</li>
                    </ul>
                    {referralProgram?.terms_and_conditions && (
                      <p className="mt-4">{referralProgram.terms_and_conditions}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ReferralDashboard;
