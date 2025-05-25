import React, { useState, useEffect } from 'react';
import { permitService } from '../../services/PermitService';
import type { PermitNotification } from '../../services/PermitService';
import { useAuth } from '../../contexts/AuthContext';

interface PermitNotificationsProps {
  onSelectPermit?: (permitId: string) => void;
  limit?: number;
}

const PermitNotifications: React.FC<PermitNotificationsProps> = ({ 
  onSelectPermit,
  limit = 5
}) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<PermitNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const notificationData = await permitService.getNotificationsForUser(user.id);
        setNotifications(notificationData.slice(0, limit));
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError('Failed to load notifications');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNotifications();
  }, [user?.id, limit]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await permitService.markNotificationAsRead(notificationId);
      
      // Update the local state
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.id === notificationId 
            ? { ...notification, is_read: true } 
            : notification
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    
    // If it's today, show the time
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    }
    
    // If it's within the last week, show the day of week
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    if (date > lastWeek) {
      return date.toLocaleDateString(undefined, { weekday: 'short' });
    }
    
    // Otherwise, show the date
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Permit Pulse</h3>
        <div className="text-center py-4">
          <svg className="animate-spin h-5 w-5 text-blue-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-2 text-sm text-gray-500">Loading notifications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Permit Pulse</h3>
        <div className="text-center py-4 text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-4">Permit Pulse</h3>
      
      {notifications.length === 0 ? (
        <div className="text-center py-4 text-gray-500">No notifications</div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {notifications.map((notification) => (
            <li key={notification.id} className={`py-4 ${!notification.is_read ? 'bg-blue-50' : ''}`}>
              <div className="flex space-x-3">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">{notification.notification_type}</h3>
                    <p className="text-sm text-gray-500">{formatDate(notification.created_at as unknown as string)}</p>
                  </div>
                  <p className="text-sm text-gray-500">{notification.message}</p>
                  <div className="flex space-x-2 mt-2">
                    {onSelectPermit && (
                      <button
                        onClick={() => onSelectPermit(notification.permit_id)}
                        className="text-xs text-blue-600 hover:text-blue-900"
                      >
                        View Permit
                      </button>
                    )}
                    {!notification.is_read && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id!)}
                        className="text-xs text-gray-600 hover:text-gray-900"
                      >
                        Mark as Read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      
      {notifications.length > 0 && (
        <div className="mt-4 text-center">
          <button
            className="text-sm text-blue-600 hover:text-blue-900"
            onClick={() => {/* Navigate to all notifications */}}
          >
            View All Notifications
          </button>
        </div>
      )}
    </div>
  );
};

export default PermitNotifications;
