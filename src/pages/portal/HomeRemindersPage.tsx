import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/UnifiedAuthContext';
import { listMaintenanceReminders, updateReminderStatus } from '../../api/maintenanceApi';
import type { MaintenanceReminder } from '../../modules/homeAssets/maintenanceTypes';

const statusTabs = ['open', 'snoozed', 'completed'];

const formatDate = (value?: string | null) => (value ? new Date(value).toLocaleDateString() : '—');

const HomeRemindersPage: React.FC = () => {
  const { homeId } = useParams();
  const { user } = useAuth();
  const [reminders, setReminders] = useState<MaintenanceReminder[]>([]);
  const [status, setStatus] = useState('open');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReminders = async () => {
    if (!user || !homeId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await listMaintenanceReminders(user.id, homeId, status);
      setReminders(data);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Failed to load reminders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, [user, homeId, status]);

  const handleUpdateStatus = async (reminderId: string, nextStatus: string, snoozedUntil?: string | null) => {
    if (!user) return;
    await updateReminderStatus(user.id, reminderId, { status: nextStatus, snoozed_until: snoozedUntil });
    await fetchReminders();
  };

  const snoozeOptions = useMemo(() => [7, 14, 30], []);

  if (loading) {
    return <div className="p-6">Loading reminders...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Link to={`/portal/homes/${homeId}`} className="text-sm text-blue-600">← Back to home</Link>
      <h1 className="text-2xl font-semibold text-gray-900">Maintenance Reminders</h1>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="rounded-lg border border-amber-100 bg-amber-50 p-4 text-sm text-amber-900">
        <p className="font-semibold">Stay ahead of failures</p>
        <p className="text-amber-800">
          Reminders are generated from service history, warranty dates, and asset age so you can schedule care before issues arise.
        </p>
      </div>

      <div className="flex gap-2">
        {statusTabs.map(tab => (
          <button
            key={tab}
            className={`px-4 py-2 rounded-md text-sm ${status === tab ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-700'}`}
            onClick={() => setStatus(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {reminders.length === 0 ? (
          <p className="text-sm text-gray-500">No reminders in this view.</p>
        ) : (
          reminders.map(reminder => (
            <div key={reminder.id} className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{reminder.reminder_type.replace('_', ' ')}</p>
                  <p className="text-xs text-gray-600">Due: {formatDate(reminder.due_date)}</p>
                  <p className="text-xs text-gray-500">Created: {formatDate(reminder.created_for_date)}</p>
                </div>
                <span className="text-xs font-semibold text-gray-500 uppercase">{reminder.status}</span>
              </div>
              {reminder.meta && (
                <div className="mt-2 text-xs text-gray-600">
                  <div>{(reminder.meta as any).assetDisplayName || 'Asset'}</div>
                  <div>{(reminder.meta as any).assetCategory || ''}</div>
                </div>
              )}
              {status === 'open' && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    className="text-xs text-green-700"
                    onClick={() => handleUpdateStatus(reminder.id, 'completed')}
                  >
                    Mark Completed
                  </button>
                  <button
                    className="text-xs text-gray-600"
                    onClick={() => handleUpdateStatus(reminder.id, 'dismissed')}
                  >
                    Dismiss
                  </button>
                  {snoozeOptions.map(days => (
                    <button
                      key={days}
                      className="text-xs text-blue-600"
                      onClick={() => {
                        const snoozeUntil = new Date();
                        snoozeUntil.setDate(snoozeUntil.getDate() + days);
                        handleUpdateStatus(reminder.id, 'snoozed', snoozeUntil.toISOString().split('T')[0]);
                      }}
                    >
                      Snooze {days}d
                    </button>
                  ))}
                </div>
              )}
              {status === 'snoozed' && reminder.snoozed_until && (
                <div className="mt-2 text-xs text-gray-500">Snoozed until {formatDate(reminder.snoozed_until)}</div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HomeRemindersPage;
