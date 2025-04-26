import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import BookingForm from '../components/BookingForm';
import type { Database } from '../lib/database.types';

type ServicePackage = Database['public']['Tables']['service_packages']['Row'];

const BookService = () => {
  const { serviceId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [service, setService] = useState<ServicePackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchService = async () => {
      try {
        if (!serviceId) throw new Error('Service ID is required');

        const { data, error } = await supabase
          .from('service_packages')
          .select('*')
          .eq('id', serviceId)
          .single();

        if (error) throw error;
        if (!data) throw new Error('Service not found');

        setService(data as ServicePackage);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load service');
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [serviceId]);

  const handleBookingSuccess = () => {
    navigate('/dashboard/client', {
      state: { message: 'Booking confirmed successfully!' }
    });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </>
    );
  }

  if (error || !service) {
    return (
      <>
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <XCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error || 'Service not found'}</p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BookingForm
          service={service}
          onSuccess={handleBookingSuccess}
          onCancel={() => navigate(-1)}
        />
      </div>
    </>
  );
};

export default BookService;