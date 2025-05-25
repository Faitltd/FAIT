import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

type FeatureItem = {
  name: string;
  freeTier: boolean;
  proTier: boolean;
  businessTier: boolean;
  description?: string;
};

type HomeownerFeatureItem = {
  name: string;
  freeTier: boolean;
  faitPlusTier: boolean;
  description?: string;
};

interface SubscriptionFeaturesProps {
  userType: 'contractor' | 'service_agent' | 'homeowner' | 'client';
}

const SubscriptionFeatures: React.FC<SubscriptionFeaturesProps> = ({ userType }) => {
  const isContractor = userType === 'contractor' || userType === 'service_agent';

  const serviceAgentFeatures: FeatureItem[] = [
    {
      name: 'Project Leads',
      freeTier: true,
      proTier: true,
      businessTier: true,
      description: 'Access to project leads from homeowners'
    },
    {
      name: 'Lead Limit',
      freeTier: true,
      proTier: true,
      businessTier: true,
      description: 'Free: 5/month, Pro: 50/month, Business: 200/month'
    },
    {
      name: 'Basic Profile',
      freeTier: true,
      proTier: true,
      businessTier: true,
      description: 'Create and manage your service agent profile'
    },
    {
      name: 'Material Sourcing',
      freeTier: false,
      proTier: true,
      businessTier: true,
      description: 'Access to discounted materials from suppliers'
    },
    {
      name: 'ROI Data',
      freeTier: false,
      proTier: true,
      businessTier: true,
      description: 'Return on investment data for projects'
    },
    {
      name: 'Pricing Templates',
      freeTier: false,
      proTier: true,
      businessTier: true,
      description: 'Templates for pricing different types of projects'
    },
    {
      name: 'Multi-user Access',
      freeTier: false,
      proTier: false,
      businessTier: true,
      description: 'Add up to 5 team members to your account'
    },
    {
      name: 'Priority Leads',
      freeTier: false,
      proTier: false,
      businessTier: true,
      description: 'Get priority access to new project leads'
    },
    {
      name: 'Premium Discounts',
      freeTier: false,
      proTier: false,
      businessTier: true,
      description: 'Access to premium discounts from suppliers'
    },
    {
      name: 'Co-op Membership',
      freeTier: false,
      proTier: true,
      businessTier: true,
      description: 'Membership in the FAIT Cooperative (included in Pro and Business tiers)'
    }
  ];

  const homeownerFeatures: HomeownerFeatureItem[] = [
    {
      name: 'Project Posting',
      freeTier: true,
      faitPlusTier: true,
      description: 'Post projects to find contractors'
    },
    {
      name: 'Basic Warranty',
      freeTier: true,
      faitPlusTier: true,
      description: 'Standard 1-year warranty on projects'
    },
    {
      name: 'ROI Reports',
      freeTier: false,
      faitPlusTier: true,
      description: 'Detailed return on investment reports for your projects'
    },
    {
      name: 'Extended Warranty',
      freeTier: false,
      faitPlusTier: true,
      description: 'Extended warranty coverage (1yr → 2yr, 2yr → 3yr)'
    },
    {
      name: 'Discounts',
      freeTier: false,
      faitPlusTier: true,
      description: 'Access to discounts on materials and services'
    },
    {
      name: 'Priority Support',
      freeTier: false,
      faitPlusTier: true,
      description: 'Priority customer support'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">
          {isContractor ? 'Contractor Subscription Features' : 'Homeowner Subscription Features'}
        </h2>
      </div>

      <div className="p-6">
        {isContractor ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Feature
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Free Tier
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pro Tier
                    <div className="text-sm font-normal text-gray-500">$75/mo or $750/yr</div>
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Business Tier
                    <div className="text-sm font-normal text-gray-500">$200/mo or $2,000/yr</div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contractorFeatures.map((feature, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div>{feature.name}</div>
                      {feature.description && (
                        <div className="text-xs text-gray-500">{feature.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {feature.freeTier ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 mx-auto" />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {feature.proTier ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 mx-auto" />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {feature.businessTier ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Feature
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Free Tier
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    FAIT Plus
                    <div className="text-sm font-normal text-gray-500">$4.99/mo or $49/yr</div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {homeownerFeatures.map((feature, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div>{feature.name}</div>
                      {feature.description && (
                        <div className="text-xs text-gray-500">{feature.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {feature.freeTier ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 mx-auto" />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {feature.faitPlusTier ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionFeatures;
