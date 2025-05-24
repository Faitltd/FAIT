import React from 'react';

interface NotificationsStepProps {
  notificationPreferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const NotificationsStep: React.FC<NotificationsStepProps> = ({ 
  notificationPreferences, 
  onChange 
}) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Notification Preferences</h2>
      <p className="text-gray-600 mb-6">
        Choose how you'd like to receive updates and notifications from FAIT Co-op.
      </p>
      
      <div className="space-y-6">
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="notification-email"
              name="notification-email"
              type="checkbox"
              data-cy="notifications-email"
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              checked={notificationPreferences.email}
              onChange={onChange}
            />
          </div>
          <div className="ml-3">
            <label htmlFor="notification-email" className="font-medium text-gray-700">
              Email Notifications
            </label>
            <p className="text-gray-500 text-sm">
              Receive updates, quotes, and messages via email.
            </p>
          </div>
        </div>
        
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="notification-sms"
              name="notification-sms"
              type="checkbox"
              data-cy="notifications-sms"
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              checked={notificationPreferences.sms}
              onChange={onChange}
            />
          </div>
          <div className="ml-3">
            <label htmlFor="notification-sms" className="font-medium text-gray-700">
              SMS Notifications
            </label>
            <p className="text-gray-500 text-sm">
              Receive text messages for important updates and appointment reminders.
            </p>
          </div>
        </div>
        
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="notification-push"
              name="notification-push"
              type="checkbox"
              data-cy="notifications-push"
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              checked={notificationPreferences.push}
              onChange={onChange}
            />
          </div>
          <div className="ml-3">
            <label htmlFor="notification-push" className="font-medium text-gray-700">
              Push Notifications
            </label>
            <p className="text-gray-500 text-sm">
              Receive push notifications on your device when using our mobile app.
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h3 className="font-medium text-blue-800 mb-2">Privacy Note</h3>
        <p className="text-sm text-blue-700">
          We respect your privacy and will only send you notifications based on your preferences.
          You can change these settings at any time from your account settings.
        </p>
      </div>
    </div>
  );
};

export default NotificationsStep;
