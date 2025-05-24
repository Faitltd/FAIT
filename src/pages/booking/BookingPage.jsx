import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import supabase from '../../utils/supabaseClient';;
import MainLayout from '../../components/MainLayout';
import BookingForm from '../../components/booking/BookingForm';
import { getServiceById } from '../../api/servicesApi';
import { getAvailableTimeSlots } from '../../api/availabilityApi';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
// Using singleton Supabase client;

const BookingPage = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  // Fetch service and user data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Get authenticated user
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        if (!user) {
          navigate('/login', { state: { from: `/book/${serviceId}` } });
          return;
        }

        // Get service details
        const serviceData = await getServiceById(serviceId);
        setService(serviceData);

        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load service details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [serviceId, navigate]);

  // Handle booking submission
  const handleBookingSubmit = async (bookingData) => {
    try {
      // Create booking in database
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          service_id: service.id,
          client_id: user.id,
          service_agent_id: service.service_agent_id,
          service_date: bookingData.date,
          start_time: bookingData.time,
          status: 'pending',
          notes: bookingData.notes,
          price: service.price,
          address: bookingData.address,
          zip_code: bookingData.zipCode
        })
        .select()
        .single();

      if (error) throw error;

      // Navigate to booking confirmation page
      navigate(`/booking/confirmation/${data.id}`);
    } catch (err) {
      console.error('Error creating booking:', err);
      return { success: false, error: 'Failed to create booking. Please try again.' };
    }
  };

  if (loading) {
    return (
      <MainLayout currentPage="booking">
        <div className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !service) {
    return (
      <MainLayout currentPage="booking">
        <div className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error || 'Service not found'}
            </div>
            <div className="mt-4">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout currentPage="booking">
      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">Book Service</h1>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                {/* Service Details */}
                <div className="px-4 py-5 sm:px-6 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">{service.name}</h2>
                      <p className="mt-1 text-sm text-gray-500">{service.category}</p>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">${service.price.toFixed(2)}</div>
                  </div>
                </div>

                <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                      {/* Service Description */}
                      <div className="mb-6">
                        <h3 className="text-lg font-medium text-gray-900">Service Description</h3>
                        <p className="mt-2 text-sm text-gray-500">{service.description}</p>
                      </div>

                      {/* Service Provider */}
                      <div className="mb-6">
                        <h3 className="text-lg font-medium text-gray-900">Service Provider</h3>
                        <div className="mt-2 flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {service.service_agent_image ? (
                              <img
                                className="h-10 w-10 rounded-full"
                                src={service.service_agent_image}
                                alt={service.service_agent_name}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-500">
                                  {service.service_agent_name.charAt(0)}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{service.service_agent_name}</p>
                            <div className="flex items-center">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <svg
                                  key={star}
                                  className={`h-4 w-4 ${
                                    star <= Math.round(service.average_rating || 0)
                                      ? 'text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                              <span className="ml-1 text-sm text-gray-500">
                                {service.average_rating ? service.average_rating.toFixed(1) : 'No ratings'}
                                {service.review_count > 0 && ` (${service.review_count})`}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Service Details */}
                      <div className="mb-6">
                        <h3 className="text-lg font-medium text-gray-900">Service Details</h3>
                        <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div className="flex items-center">
                            <svg className="h-5 w-5 text-gray-400 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm text-gray-500">
                              Duration: {service.duration} {service.duration_unit || 'hours'}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <svg className="h-5 w-5 text-gray-400 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            <span className="text-sm text-gray-500">
                              {service.warranty_offered ? 'Warranty Offered' : 'No Warranty'}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <svg className="h-5 w-5 text-gray-400 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="text-sm text-gray-500">
                              Service Area: {service.service_area || 'Not specified'}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <svg className="h-5 w-5 text-gray-400 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm text-gray-500">
                              Price Type: {service.price_type || 'Fixed'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-1">
                      {/* Booking Form */}
                      <BookingForm
                        service={service}
                        onSubmit={handleBookingSubmit}
                        getAvailableTimeSlots={(date) => getAvailableTimeSlots(service.service_agent_id, date)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </MainLayout>
  );
};

export default BookingPage;
