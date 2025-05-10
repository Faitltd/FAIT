import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Coins, CreditCard, Package } from 'lucide-react';
import { creditsService, CreditPackage } from '../../services/CreditsService';

const CreditsPurchaseForm: React.FC = () => {
  const { user } = useAuth();
  const [creditPackages, setCreditPackages] = useState<CreditPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch credit packages
    const fetchPackages = async () => {
      try {
        const packages = await creditsService.getCreditPackages();
        setCreditPackages(packages);

        // Set default selected package to the popular one or the middle one
        const popularPackage = packages.find(pkg => pkg.popular);
        setSelectedPackage(popularPackage?.id || packages[Math.floor(packages.length / 2)]?.id || '');
      } catch (err) {
        console.error('Error fetching credit packages:', err);
        setError('Failed to load credit packages. Please try again.');
      }
    };

    fetchPackages();
  }, []);

  const handlePurchase = async () => {
    if (!user) {
      setError('You must be logged in to purchase credits');
      return;
    }

    if (!selectedPackage) {
      setError('Please select a credit package');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create a checkout session
      const sessionId = await creditsService.createCheckoutSession(
        user.id,
        user.email || '',
        selectedPackage,
        `${window.location.origin}/dashboard/credits?purchase=success`,
        `${window.location.origin}/dashboard/credits?purchase=canceled`
      );

      // Redirect to Stripe Checkout
      await creditsService.redirectToCheckout(sessionId);
    } catch (err) {
      console.error('Error creating checkout session:', err);
      setError(err.message || 'An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-6">
        <Coins className="h-6 w-6 text-primary-500 mr-2" />
        <h2 className="text-xl font-semibold text-gray-800">Purchase Credits</h2>
      </div>

      <div className="mb-6">
        <p className="text-gray-600 mb-4">
          Credits are used for API access and advanced features. Choose a package below:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {creditPackages.map((pkg) => (
            <div
              key={pkg.id}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                selectedPackage === pkg.id
                  ? 'border-primary-500 bg-primary-50 shadow-sm'
                  : 'border-gray-200 hover:border-primary-300'
              } ${pkg.popular ? 'relative' : ''}`}
              onClick={() => setSelectedPackage(pkg.id)}
            >
              {pkg.popular && (
                <div className="absolute -top-3 -right-3 bg-primary-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  POPULAR
                </div>
              )}
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center">
                  <Package className="h-5 w-5 text-primary-500 mr-2" />
                  <h3 className="font-medium text-gray-900">{pkg.name}</h3>
                </div>
                <div className="h-5 w-5 rounded-full border border-primary-500 flex items-center justify-center">
                  {selectedPackage === pkg.id && (
                    <div className="h-3 w-3 rounded-full bg-primary-500"></div>
                  )}
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">${pkg.price}</div>
              {pkg.savings && (
                <div className="text-green-600 text-sm mb-2">Save {pkg.savings}</div>
              )}
              <div className="text-gray-500 text-sm">${(pkg.price / pkg.credits).toFixed(2)} per credit</div>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      <button
        onClick={handlePurchase}
        disabled={isLoading || !user}
        className={`w-full flex items-center justify-center py-2 px-4 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
          isLoading || !user
            ? 'bg-gray-400 text-white cursor-not-allowed'
            : 'bg-primary-500 text-white hover:bg-primary-600'
        }`}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="h-5 w-5 mr-2" />
            Proceed to Checkout
          </>
        )}
      </button>

      <div className="mt-4 text-xs text-gray-500 text-center">
        Secure payment processing by Stripe. Your payment information is never stored on our servers.
      </div>
    </div>
  );
};

export default CreditsPurchaseForm;
