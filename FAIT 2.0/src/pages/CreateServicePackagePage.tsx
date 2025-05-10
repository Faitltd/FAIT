import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ServicePackageForm from '../components/Pricing/ServicePackageForm';
import { createServicePackage, addServicePackageFeatures, addWarrantyPeriods } from '../lib/api/pricingApi';

const CreateServicePackagePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Handle form submission
  const handleSubmit = async (formData: any) => {
    if (!user) {
      navigate('/login', { state: { from: '/services/create' } });
      return;
    }

    if (userRole !== 'contractor') {
      setError('Only contractors can create service packages');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Extract features and warranty periods from form data
      const { features, warranty_periods, ...packageData } = formData;

      // Create the service package
      const createdPackage = await createServicePackage(user.id, packageData);

      // Add features if any
      if (features && features.length > 0) {
        await addServicePackageFeatures(
          createdPackage.id,
          user.id,
          features.map((feature: any, index: number) => ({
            ...feature,
            order_index: index,
          }))
        );
      }

      // Add warranty periods if any
      if (warranty_periods && warranty_periods.length > 0) {
        const validWarrantyPeriods = warranty_periods.filter(
          (w: any) => w.duration_days && parseInt(w.duration_days) > 0
        );

        if (validWarrantyPeriods.length > 0) {
          await addWarrantyPeriods(
            createdPackage.id,
            user.id,
            validWarrantyPeriods
          );
        }
      }

      // Redirect to the new service package page
      navigate(`/services/${createdPackage.id}`);
    } catch (err) {
      console.error('Error creating service package:', err);
      setError('Failed to create service package. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Redirect if not a contractor
  if (userRole !== 'contractor') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-yellow-100 p-6 rounded-md text-yellow-700">
          <h2 className="text-lg font-medium mb-2">Access Denied</h2>
          <p>Only contractors can create service packages.</p>
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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Create Service Package</h1>
      
      {error && (
        <div className="bg-red-100 p-4 rounded-md text-red-700 mb-6">
          {error}
        </div>
      )}
      
      <ServicePackageForm onSubmit={handleSubmit} isLoading={loading} />
    </div>
  );
};

export default CreateServicePackagePage;
