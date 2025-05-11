import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ServicePackageForm from '../components/Pricing/ServicePackageForm';
import {
  getServicePackageById,
  updateServicePackage,
  addServicePackageFeatures,
  updateServicePackageFeature,
  deleteServicePackageFeature,
  addWarrantyPeriods,
} from '../lib/api/pricingApi';

interface EditServicePackageParams {
  id: string;
}

const EditServicePackagePage: React.FC = () => {
  const { id } = useParams<keyof EditServicePackageParams>() as EditServicePackageParams;
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  
  const [servicePackage, setServicePackage] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch service package details
  useEffect(() => {
    const fetchServicePackage = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const packageData = await getServicePackageById(id);
        
        // Check if the current user is the owner of this package
        if (packageData.service_agent_id !== user.id) {
          setError('You do not have permission to edit this service package');
          return;
        }
        
        setServicePackage(packageData);
      } catch (err) {
        console.error('Error fetching service package:', err);
        setError('Failed to load service package. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchServicePackage();
  }, [id, user]);

  // Handle form submission
  const handleSubmit = async (formData: any) => {
    if (!user || !servicePackage) return;

    if (userRole !== 'contractor') {
      setError('Only contractors can edit service packages');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Extract features and warranty periods from form data
      const { features, warranty_periods, ...packageData } = formData;

      // Update the service package
      await updateServicePackage(id, user.id, packageData);

      // Handle features
      if (features && features.length > 0) {
        // Get existing features
        const existingFeatures = servicePackage.features || [];
        
        // Features to update (those with IDs)
        const featuresToUpdate = features.filter((f: any) => f.id);
        
        // Features to add (those without IDs)
        const featuresToAdd = features.filter((f: any) => !f.id).map((f: any, index: number) => ({
          ...f,
          order_index: existingFeatures.length + index,
        }));
        
        // Features to delete (those in existingFeatures but not in features)
        const featureIdsToKeep = featuresToUpdate.map((f: any) => f.id);
        const featuresToDelete = existingFeatures.filter(
          (f: any) => !featureIdsToKeep.includes(f.id)
        );
        
        // Update existing features
        for (const feature of featuresToUpdate) {
          await updateServicePackageFeature(feature.id, user.id, {
            name: feature.name,
            description: feature.description,
            tier: feature.tier,
            is_included: feature.is_included,
            order_index: feature.order_index,
          });
        }
        
        // Add new features
        if (featuresToAdd.length > 0) {
          await addServicePackageFeatures(id, user.id, featuresToAdd);
        }
        
        // Delete removed features
        for (const feature of featuresToDelete) {
          await deleteServicePackageFeature(feature.id, user.id);
        }
      }

      // Handle warranty periods
      if (warranty_periods && warranty_periods.length > 0) {
        const validWarrantyPeriods = warranty_periods.filter(
          (w: any) => w.duration_days && parseInt(w.duration_days) > 0
        );

        if (validWarrantyPeriods.length > 0) {
          // For simplicity, we'll just replace all warranty periods
          // In a real implementation, you might want to update existing ones
          await addWarrantyPeriods(id, user.id, validWarrantyPeriods);
        }
      }

      // Redirect to the service package page
      navigate(`/services/${id}`);
    } catch (err) {
      console.error('Error updating service package:', err);
      setError('Failed to update service package. Please try again.');
    } finally {
      setSaving(false);
    }
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Service Package</h1>
      
      <ServicePackageForm
        initialData={servicePackage}
        onSubmit={handleSubmit}
        isLoading={saving}
      />
    </div>
  );
};

export default EditServicePackagePage;
