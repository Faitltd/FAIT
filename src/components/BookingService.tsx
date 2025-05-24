import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type Service = {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  service_agent_id: string;
  service_agent_name?: string;
};

type AvailabilitySlot = {
  date: string;
  times: string[];
};

const BookingService = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([]);
  const [notes, setNotes] = useState('');

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchService = async () => {
      try {
        if (!serviceId) return;

        const { data, error } = await supabase
          .from('services')
          .select(`
            *,
            profiles:service_agent_id (full_name)
          `)
          .eq('id', serviceId)
          .single();

        if (error) throw error;

        setService({
          ...data,
          service_agent_name: data.profiles.full_name,
        });

        // Fetch available dates for the next 14 days
        await fetchAvailableDates(data.service_agent_id);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load service');
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [serviceId]);

  const fetchAvailableDates = async (serviceAgentId: string) => {
    try {
      // Get service agent's availability for the next 14 days
      const dates: AvailabilitySlot[] = [];
      const today = new Date();

      // Get recurring weekly availability
      const { data: recurringAvailability, error: recurringError } = await supabase
        .from('service_agent_availability')
        .select('*')
        .eq('service_agent_id', serviceAgentId)
        .eq('is_recurring', true);

      if (recurringError) throw recurringError;

      // Get one-time availability
      const { data: oneTimeAvailability, error: oneTimeError } = await supabase
        .from('service_agent_availability')
        .select('*')
        .eq('service_agent_id', serviceAgentId)
        .eq('is_recurring', false)
        .gte('end_date', today.toISOString().split('T')[0]);

      if (oneTimeError) throw oneTimeError;

      // Generate available slots for the next 14 days
      for (let i = 0; i < 14; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        const dayOfWeek = date.getDay();

        // Check recurring availability for this day of week
        const recurringForDay = recurringAvailability?.filter(
          slot => slot.day_of_week === dayOfWeek
        ) || [];

        // Check one-time availability for this date
        const oneTimeForDay = oneTimeAvailability?.filter(
          slot => {
            const startDate = new Date(slot.start_date);
            const endDate = new Date(slot.end_date);
            const checkDate = new Date(dateStr);
            return checkDate >= startDate && checkDate <= endDate;
          }
        ) || [];

        // Combine all availability for this day
        const allAvailability = [...recurringForDay, ...oneTimeForDay];

        if (allAvailability.length > 0) {
          // Generate time slots based on availability
          const times: string[] = [];

          allAvailability.forEach(slot => {
            const [startHour, startMinute] = slot.start_time.split(':').map(Number);
            const [endHour, endMinute] = slot.end_time.split(':').map(Number);

            // Generate 30-minute slots
            let currentHour = startHour;
            let currentMinute = startMinute;

            while (
              currentHour < endHour ||
              (currentHour === endHour && currentMinute < endMinute)
            ) {
              times.push(
                `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`
              );

              currentMinute += 30;
              if (currentMinute >= 60) {
                currentHour += 1;
                currentMinute = 0;
              }
            }
          });

          if (times.length > 0) {
            dates.push({
              date: dateStr,
              times: [...new Set(times)].sort(),
            });
          }
        }
      }

      setAvailableSlots(dates);
    } catch (err) {
      console.error('Error fetching availability:', err);
      setError('Failed to load available dates');
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDate(e.target.value);
    setSelectedTime('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !service) return;

    try {
      // Create booking
      const { error } = await supabase
        .from('bookings')
        .insert({
          service_id: service.id,
          client_id: user.id,
          service_agent_id: service.service_agent_id,
          booking_date: selectedDate,
          booking_time: selectedTime,
          status: 'pending',
          notes: notes,
          price: service.price,
        });

      if (error) throw error;

      // Navigate to client dashboard
      navigate('/dashboard/client', {
        state: { message: 'Booking submitted successfully!' }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking');
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-yellow-100 text-yellow-700 p-4 rounded mb-4">
          Service not found
        </div>
        <button
          onClick={() => navigate('/services')}
          className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
        >
          Back to Services
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Book Service: {service.name}</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">{service.name}</h2>
          <p className="text-gray-600">{service.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <span className="text-gray-600">Price:</span>
            <span className="font-medium ml-2">${service.price.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-gray-600">Duration:</span>
            <span className="font-medium ml-2">{service.duration} minutes</span>
          </div>
          <div>
            <span className="text-gray-600">Service Agent:</span>
            <span className="font-medium ml-2">{service.service_agent_name}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Schedule Appointment</h2>

        {availableSlots.length === 0 ? (
          <div className="bg-yellow-100 text-yellow-700 p-4 rounded mb-4">
            No availability in the next 14 days. Please check back later.
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Date
              </label>
              <select
                value={selectedDate}
                onChange={handleDateChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Choose a date</option>
                {availableSlots.map(slot => (
                  <option key={slot.date} value={slot.date}>
                    {new Date(slot.date).toLocaleDateString(undefined, {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </option>
                ))}
              </select>
            </div