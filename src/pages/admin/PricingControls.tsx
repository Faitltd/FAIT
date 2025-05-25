import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  Save,
  XCircle,
  CheckCircle,
  AlertTriangle,
  Lock,
  Unlock,
  Edit,
  RefreshCw
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

type PricingTier = {
  id: string;
  name: string;
  description: string;
  monthly_price: number;
  annual_price: number;
  user_type: string;
  is_locked: boolean;
};

type CommissionRate = {
  id: string;
  supplier_name: string;
  rate: number;
  is_default: boolean;
};

const PricingControls: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [contractorTiers, setContractorTiers] = useState<PricingTier[]>([]);
  const [homeownerTiers, setHomeownerTiers] = useState<PricingTier[]>([]);
  const [membershipFee, setMembershipFee] = useState<PricingTier | null>(null);
  const [commissionRates, setCommissionRates] = useState<CommissionRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editingTier, setEditingTier] = useState<string | null>(null);
  const [editingCommission, setEditingCommission] = useState<string | null>(null);

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        if (!user) {
          navigate('/login');
          return;
        }

        // Check if user is admin
        const { data: adminData, error: adminError } = await supabase
          .from('admin_users')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single();

        if (adminError || !adminData) {
          throw new Error('Unauthorized access');
        }

        // In a real app, you would fetch this data from your database
        // For this example, we'll use hardcoded data that matches the wireframe

        // Service Agent tiers
        setContractorTiers([
          {
            id: 'free-contractor',
            name: 'Free Tier',
            description: 'Basic access with limited features',
            monthly_price: 0,
            annual_price: 0,
            user_type: 'service_agent',
            is_locked: true
          },
          {
            id: 'pro-contractor',
            name: 'Pro Tier',
            description: 'Enhanced features for professional contractors',
            monthly_price: 75,
            annual_price: 750,
            user_type: 'service_agent',
            is_locked: false
          },
          {
            id: 'business-contractor',
            name: 'Business Tier',
            description: 'Full-featured plan for contractor businesses',
            monthly_price: 200,
            annual_price: 2000,
            user_type: 'service_agent',
            is_locked: false
          }
        ]);

        // Homeowner tiers
        setHomeownerTiers([
          {
            id: 'free-homeowner',
            name: 'Free',
            description: 'Basic access for homeowners',
            monthly_price: 0,
            annual_price: 0,
            user_type: 'homeowner',
            is_locked: true
          },
          {
            id: 'fait-plus',
            name: 'FAIT Plus',
            description: 'Premium features for homeowners',
            monthly_price: 4.99,
            annual_price: 49,
            user_type: 'homeowner',
            is_locked: false
          }
        ]);

        // Membership fee
        setMembershipFee({
          id: 'membership-fee',
          name: 'Co-op Membership Fee',
          description: 'Annual cooperative membership',
          monthly_price: 0,
          annual_price: 100,
          user_type: 'all',
          is_locked: false
        });

        // Commission rates
        setCommissionRates([
          {
            id: 'default-rate',
            supplier_name: 'Default Commission Rate',
            rate: 0.02,
            is_default: true
          },
          {
            id: 'home-depot-rate',
            supplier_name: 'Home Depot',
            rate: 0.03,
            is_default: false
          },
          {
            id: 'lowes-rate',
            supplier_name: 'Lowe\'s',
            rate: 0.025,
            is_default: false
          },
          {
            id: 'build-supply-rate',
            supplier_name: 'Build Supply',
            rate: 0.02,
            is_default: false
          }
        ]);
      } catch (err) {
        console.error('Error loading pricing controls:', err);
        setError(err instanceof Error ? err.message : 'Failed to load pricing controls');
        navigate('/admin');
      } finally {
        setLoading(false);
      }
    };

    checkAdminAccess();
  }, [user, navigate]);

  const handlePriceChange = (
    id: string,
    field: 'monthly_price' | 'annual_price',
    value: string,
    tierType: 'contractor' | 'homeowner' | 'membership'
  ) => {
    const numValue = parseFloat(value);

    if (tierType === 'contractor') {
      setContractorTiers(prev =>
        prev.map(tier =>
          tier.id === id ? { ...tier, [field]: numValue } : tier
        )
      );
    } else if (tierType === 'homeowner') {
      setHomeownerTiers(prev =>
        prev.map(tier =>
          tier.id === id ? { ...tier, [field]: numValue } : tier
        )
      );
    } else if (tierType === 'membership' && membershipFee) {
      setMembershipFee({ ...membershipFee, [field]: numValue });
    }
  };

  const handleCommissionRateChange = (id: string, value: string) => {
    const numValue = parseFloat(value) / 100; // Convert from percentage to decimal

    setCommissionRates(prev =>
      prev.map(rate =>
        rate.id === id ? { ...rate, rate: numValue } : rate
      )
    );
  };

  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      // In a real app, you would save these changes to your database
      // For this example, we'll just simulate a delay and show a success message

      await new Promise(resolve => setTimeout(resolve, 1000));

      setSuccessMessage('Pricing changes saved successfully');
      setEditingTier(null);
      setEditingCommission(null);
    } catch (err) {
      console.error('Error saving pricing changes:', err);
      setError(err instanceof Error ? err.message : 'Failed to save pricing changes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">Pricing Controls</h1>
        <div className="flex space-x-4">
          <button
            onClick={handleSaveChanges}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            disabled={saving}
          >
            {saving ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </button>
          <button
            onClick={() => navigate('/admin')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8">
        {/* Contractor Pricing */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Service Agent Pricing</h2>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {contractorTiers.map((tier) => (
                <div key={tier.id} className="flex flex-col md:flex-row md:items-center md:justify-between p-4 border rounded-lg">
                  <div className="mb-4 md:mb-0">
                    <div className="flex items-center">
                      <h3 className="text-lg font-medium text-gray-900 mr-2">{tier.name}</h3>
                      {tier.is_locked && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          <Lock className="h-3 w-3 mr-1" />
                          Locked
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{tier.description}</p>
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
                    <div>
                      <label htmlFor={`${tier.id}-monthly`} className="block text-sm font-medium text-gray-700">
                        Monthly
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                        </div>
                        {editingTier === `${tier.id}-monthly` ? (
                          <input
                            type="number"
                            id={`${tier.id}-monthly`}
                            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                            value={tier.monthly_price}
                            onChange={(e) => handlePriceChange(tier.id, 'monthly_price', e.target.value, 'contractor')}
                            disabled={tier.is_locked || saving}
                            step="0.01"
                            min="0"
                          />
                        ) : (
                          <div className="flex items-center">
                            <div className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 py-2 sm:text-sm border-gray-300 rounded-md bg-gray-50">
                              {tier.monthly_price}
                            </div>
                            {!tier.is_locked && (
                              <button
                                onClick={() => setEditingTier(`${tier.id}-monthly`)}
                                className="ml-2 text-blue-600 hover:text-blue-800"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        )}
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">/mo</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label htmlFor={`${tier.id}-annual`} className="block text-sm font-medium text-gray-700">
                        Annual
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                        </div>
                        {editingTier === `${tier.id}-annual` ? (
                          <input
                            type="number"
                            id={`${tier.id}-annual`}
                            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                            value={tier.annual_price}
                            onChange={(e) => handlePriceChange(tier.id, 'annual_price', e.target.value, 'contractor')}
                            disabled={tier.is_locked || saving}
                            step="0.01"
                            min="0"
                          />
                        ) : (
                          <div className="flex items-center">
                            <div className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 py-2 sm:text-sm border-gray-300 rounded-md bg-gray-50">
                              {tier.annual_price}
                            </div>
                            {!tier.is_locked && (
                              <button
                                onClick={() => setEditingTier(`${tier.id}-annual`)}
                                className="ml-2 text-blue-600 hover:text-blue-800"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        )}
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">/yr</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Homeowner Pricing */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Homeowner Pricing</h2>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {homeownerTiers.map((tier) => (
                <div key={tier.id} className="flex flex-col md:flex-row md:items-center md:justify-between p-4 border rounded-lg">
                  <div className="mb-4 md:mb-0">
                    <div className="flex items-center">
                      <h3 className="text-lg font-medium text-gray-900 mr-2">{tier.name}</h3>
                      {tier.is_locked && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          <Lock className="h-3 w-3 mr-1" />
                          Locked
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{tier.description}</p>
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
                    <div>
                      <label htmlFor={`${tier.id}-monthly`} className="block text-sm font-medium text-gray-700">
                        Monthly
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                        </div>
                        {editingTier === `${tier.id}-monthly` ? (
                          <input
                            type="number"
                            id={`${tier.id}-monthly`}
                            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                            value={tier.monthly_price}
                            onChange={(e) => handlePriceChange(tier.id, 'monthly_price', e.target.value, 'homeowner')}
                            disabled={tier.is_locked || saving}
                            step="0.01"
                            min="0"
                          />
                        ) : (
                          <div className="flex items-center">
                            <div className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 py-2 sm:text-sm border-gray-300 rounded-md bg-gray-50">
                              {tier.monthly_price}
                            </div>
                            {!tier.is_locked && (
                              <button
                                onClick={() => setEditingTier(`${tier.id}-monthly`)}
                                className="ml-2 text-blue-600 hover:text-blue-800"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        )}
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">/mo</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label htmlFor={`${tier.id}-annual`} className="block text-sm font-medium text-gray-700">
                        Annual
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                        </div>
                        {editingTier === `${tier.id}-annual` ? (
                          <input
                            type="number"
                            id={`${tier.id}-annual`}
                            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                            value={tier.annual_price}
                            onChange={(e) => handlePriceChange(tier.id, 'annual_price', e.target.value, 'homeowner')}
                            disabled={tier.is_locked || saving}
                            step="0.01"
                            min="0"
                          />
                        ) : (
                          <div className="flex items-center">
                            <div className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 py-2 sm:text-sm border-gray-300 rounded-md bg-gray-50">
                              {tier.annual_price}
                            </div>
                            {!tier.is_locked && (
                              <button
                                onClick={() => setEditingTier(`${tier.id}-annual`)}
                                className="ml-2 text-blue-600 hover:text-blue-800"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        )}
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">/yr</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Co-op Membership Fee */}
        {membershipFee && (
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Co-op Membership Fee</h2>
            </div>
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between p-4 border rounded-lg">
                <div className="mb-4 md:mb-0">
                  <h3 className="text-lg font-medium text-gray-900">{membershipFee.name}</h3>
                  <p className="text-sm text-gray-500">{membershipFee.description}</p>
                </div>
                <div>
                  <label htmlFor="membership-fee" className="block text-sm font-medium text-gray-700">
                    Annual Fee
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                    </div>
                    {editingTier === 'membership-fee' ? (
                      <input
                        type="number"
                        id="membership-fee"
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                        value={membershipFee.annual_price}
                        onChange={(e) => handlePriceChange(membershipFee.id, 'annual_price', e.target.value, 'membership')}
                        disabled={membershipFee.is_locked || saving}
                        step="0.01"
                        min="0"
                      />
                    ) : (
                      <div className="flex items-center">
                        <div className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 py-2 sm:text-sm border-gray-300 rounded-md bg-gray-50">
                          {membershipFee.annual_price}
                        </div>
                        {!membershipFee.is_locked && (
                          <button
                            onClick={() => setEditingTier('membership-fee')}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    )}
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">/yr</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Supplier Commission Rates */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Supplier Commission Rates</h2>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {commissionRates.map((rate) => (
                <div key={rate.id} className="flex flex-col md:flex-row md:items-center md:justify-between p-4 border rounded-lg">
                  <div className="mb-4 md:mb-0">
                    <div className="flex items-center">
                      <h3 className="text-lg font-medium text-gray-900 mr-2">{rate.supplier_name}</h3>
                      {rate.is_default && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Default
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label htmlFor={`${rate.id}-rate`} className="block text-sm font-medium text-gray-700">
                      Commission Rate
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      {editingCommission === rate.id ? (
                        <input
                          type="number"
                          id={`${rate.id}-rate`}
                          className="focus:ring-blue-500 focus:border-blue-500 block w-full pr-12 sm:text-sm border-gray-300 rounded-md"
                          value={(rate.rate * 100).toFixed(2)}
                          onChange={(e) => handleCommissionRateChange(rate.id, e.target.value)}
                          disabled={saving}
                          step="0.01"
                          min="0"
                          max="100"
                        />
                      ) : (
                        <div className="flex items-center">
                          <div className="focus:ring-blue-500 focus:border-blue-500 block w-full pr-12 py-2 sm:text-sm border-gray-300 rounded-md bg-gray-50">
                            {(rate.rate * 100).toFixed(2)}
                          </div>
                          <button
                            onClick={() => setEditingCommission(rate.id)}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingControls;
