import React from 'react';
import Bell from 'lucide-react/dist/esm/icons/bell';

/**
 * A simplified version of the NotificationBell component that doesn't rely on Supabase
 * This is used when running in local authentication mode to avoid errors
 */
const MockNotificationBell = () => {
  return (
    <div className="relative">
      <button
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
      >
        <Bell className="h-6 w-6" />
      </button>
    </div>
  );
};

export default MockNotificationBell;
