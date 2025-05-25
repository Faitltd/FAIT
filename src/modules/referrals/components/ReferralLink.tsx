import React, { useState } from 'react';
import { ReferralCode } from '../../../types/referral.types';
import { referralService } from '../../../services/ReferralService';

interface ReferralLinkProps {
  referralCode: ReferralCode;
  className?: string;
}

/**
 * Component to display and share a referral link
 */
const ReferralLink: React.FC<ReferralLinkProps> = ({ 
  referralCode,
  className = ''
}) => {
  const [copied, setCopied] = useState(false);
  const referralLink = referralService.generateReferralLink(referralCode.code);

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
    <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
      <div className="mb-2">
        <h3 className="text-sm font-medium text-gray-900">Your Referral Link</h3>
        <p className="text-xs text-gray-500">Share this link to invite others to join FAIT Co-op</p>
      </div>
      
      <div className="flex items-center mt-2">
        <div className="flex-1 min-w-0">
          <div className="relative rounded-md shadow-sm">
            <input
              type="text"
              readOnly
              value={referralLink}
              className="block w-full pr-10 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm truncate"
            />
          </div>
        </div>
        <div className="ml-3 flex-shrink-0">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {copied ? (
              <>
                <svg className="-ml-0.5 mr-1.5 h-4 w-4 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg className="-ml-0.5 mr-1.5 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                  <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                </svg>
                Copy
              </>
            )}
          </button>
        </div>
      </div>
      
      <div className="mt-3">
        <button
          type="button"
          onClick={handleShare}
          className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
          </svg>
          Share
        </button>
      </div>
      
      <div className="mt-3 text-xs text-gray-500 text-center">
        <p>Your referral code: <span className="font-medium">{referralCode.code}</span></p>
      </div>
    </div>
  );
};

export default ReferralLink;
