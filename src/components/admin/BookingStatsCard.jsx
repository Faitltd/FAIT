import React from 'react';

// Card component showing booking statistics

const BookingStatsCard = ({ stats }) => {
  if (!stats) {
    return null;
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Booking Statistics
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Overview of booking activity and status
        </p>
      </div>
      <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Total Bookings</dt>
            <dd className="mt-1 text-sm text-gray-900">{stats.total_bookings}</dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">New Bookings (30 days)</dt>
            <dd className="mt-1 text-sm text-gray-900">{stats.bookings_last_30_days}</dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Pending Bookings</dt>
            <dd className="mt-1 text-sm text-gray-900">{stats.pending_bookings}</dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Confirmed Bookings</dt>
            <dd className="mt-1 text-sm text-gray-900">{stats.confirmed_bookings}</dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Completed Bookings</dt>
            <dd className="mt-1 text-sm text-gray-900">{stats.completed_bookings}</dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Cancelled Bookings</dt>
            <dd className="mt-1 text-sm text-gray-900">{stats.cancelled_bookings}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500">Completion Rate</dt>
            <dd className="mt-1 text-sm text-gray-900">
              <div className="flex items-center">
                <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${stats.completion_rate}%` }}
                  ></div>
                </div>
                <span>{stats.completion_rate}%</span>
              </div>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
};

export default BookingStatsCard;