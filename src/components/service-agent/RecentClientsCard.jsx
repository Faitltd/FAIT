import React from 'react';
import { Link } from 'react-router-dom';
import supabase from '../../utils/supabaseClient';;

// Card component showing recent clients

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
// Using singleton Supabase client;

const RecentClientsCard = ({ bookings }) => {
  // Process bookings to get unique clients
  const getUniqueClients = () => {
    if (!bookings || bookings.length === 0) return [];

    const clientMap = new Map();

    bookings.forEach(booking => {
      if (!clientMap.has(booking.client_id)) {
        clientMap.set(booking.client_id, {
          id: booking.client_id,
          name: booking.client_name,
          last_booking_date: booking.service_date,
          service_name: booking.service_name,
          booking_count: 1
        });
      } else {
        const client = clientMap.get(booking.client_id);
        client.booking_count += 1;

        // Update last booking date if this booking is more recent
        if (new Date(booking.service_date) > new Date(client.last_booking_date)) {
          client.last_booking_date = booking.service_date;
          client.service_name = booking.service_name;
        }
      }
    });

    return Array.from(clientMap.values());
  };

  const uniqueClients = getUniqueClients();

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Recent Clients
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Clients who have booked your services
          </p>
        </div>
        <Link
          to="/clients"
          className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          View All
        </Link>
      </div>
      <div className="border-t border-gray-200">
        {uniqueClients.length === 0 ? (
          <div className="text-center py-6">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No clients yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              You haven't had any clients book your services yet.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {uniqueClients.map((client) => (
              <li key={client.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-gray-600 font-medium">
                            {client.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-blue-600">
                          {client.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {client.booking_count} booking{client.booking_count !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">
                        Last service: {new Date(client.last_booking_date).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {client.service_name}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 flex justify-end space-x-2">
                    <Link
                      to={`/messages?client=${client.id}`}
                      className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Message
                    </Link>
                    <Link
                      to={`/clients/${client.id}`}
                      className="inline-flex items-center px-2.5 py-1.5 border border-transparent shadow-sm text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default RecentClientsCard;