import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getServicePackageById } from '../lib/api/pricingApi';
import ServicePackageDetail from '../components/Pricing/ServicePackageDetail';
import ServicePackageList from '../components/Pricing/ServicePackageList';
import { PricingTier } from '../components/Pricing/TierSelector';
import { useAuth } from '../contexts/AuthContext';

interface ServicePackageParams {
  id: string;
}

const ServicePackagePage: React.FC = () => {
  const { id } = useParams<keyof ServicePackageParams>() as ServicePackageParams;
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  
  const [servicePackage, setServicePackage] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch service package details
  useEffect(() => {
    const fetchServicePackage = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const packageData = await getServicePackageById(id);
        setServicePackage(packageData);
      } catch (err) {
        console.error('Error fetching service package:', err);
        setError('Failed to load service package. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchServicePackage();
  }, [id]);

  // Handle booking service
  const handleBookService = (tier: PricingTier, price: number) => {
    if (!user) {
      // Redirect to login if not authenticated
      navigate('/login', { state: { from: `/services/${id}` } });
      return;
    }
    
    // Redirect to booking page with service package details
    navigate('/booking/new', {
      state: {
        servicePackageId: id,
        selectedTier: tier,
        price,
      },
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !servicePackage) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-100 p-6 rounded-md text-red-700">
          <h2 className="text-lg font-medium mb-2">Error</h2>
          <p>{error || 'Service package not found'}</p>
          <button
            onClick={() => navigate('/services')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Services
          </button>
        </div>
      </div>
    );
  }

  // Check if the current user is the service provider
  const isServiceProvider = user && servicePackage.service_agent_id === user.id;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Service Package Detail */}
      <ServicePackageDetail
        servicePackage={servicePackage}
        onBookService={handleBookService}
        showBookButton={userRole === 'client' && !isServiceProvider}
      />
      
      {/* Related Services */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Similar Services</h2>
        <ServicePackageList
          categoryId={servicePackage.category_id}
          limit={3}
          showFilters={false}
          showPagination={false}
        />
      </div>
    </div>
  );
};

export default ServicePackagePage;
