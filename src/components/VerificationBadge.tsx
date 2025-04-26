import React from 'react';
import { Shield, ShieldCheck } from 'lucide-react';
import type { Database } from '../lib/database.types';

type ServiceAgentVerification = Database['public']['Tables']['service_agent_verifications']['Row'];

interface VerificationBadgeProps {
  verification: ServiceAgentVerification | null;
  status?: 'verified' | 'pending' | 'rejected';
  size?: 'sm' | 'md' | 'lg';
}

const VerificationBadge: React.FC<VerificationBadgeProps> = ({ verification, status, size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const textClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  // Determine verification status
  let isVerified = false;

  if (status) {
    isVerified = status === 'verified';
  } else if (verification) {
    isVerified = verification.is_verified;
  } else {
    return null; // No verification data or status provided
  }

  return (
    <div className="inline-flex items-center gap-1">
      {isVerified ? (
        <>
          <ShieldCheck className={`${sizeClasses[size]} text-company-lightpink`} />
          <span className={`${textClasses[size]} font-medium text-gray-800`}>
            FAIT Verified
          </span>
        </>
      ) : (
        <>
          <Shield className={`${sizeClasses[size]} text-company-lightorange`} />
          <span className={`${textClasses[size]} font-medium text-gray-800`}>
            Verification Pending
          </span>
        </>
      )}
    </div>
  );
};

export default VerificationBadge;