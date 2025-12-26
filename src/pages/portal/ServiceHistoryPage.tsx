import React, { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { createServiceEvent, listAssets, listServiceEvents } from '../../api/homeAssetsApi';
import { useAuth } from '../../contexts/UnifiedAuthContext';
import ServiceEventForm from '../../modules/homeAssets/components/ServiceEventForm';
import type { AssetWithComputed, ServiceEvent } from '../../modules/homeAssets/types';

const formatDate = (value?: string | null) => (value ? new Date(value).toLocaleDateString() : '—');

const ServiceHistoryPage: React.FC = () => {
  const { homeId } = useParams();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [assets, setAssets] = useState<AssetWithComputed[]>([]);
  const [events, setEvents] = useState<ServiceEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const assetIdFilter = searchParams.get('assetId');

  const fetchData = async () => {
    if (!user || !homeId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const assetList = await listAssets(user.id, homeId);
      setAssets(assetList);
      const eventList = await listServiceEvents(user.id, homeId, assetIdFilter);
      setEvents(eventList);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Failed to load service history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user, homeId, assetIdFilter]);

  const handleCreateEvent = async (values: any) => {
    if (!homeId) return;
    await createServiceEvent(homeId, values);
    await fetchData();
  };

  if (loading) {
    return <div className="p-6">Loading service history...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <Link to={`/portal/homes/${homeId}`} className="text-sm text-blue-600">← Back to home</Link>
      <h1 className="text-2xl font-semibold text-gray-900">Service History</h1>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
        <p className="font-semibold text-slate-900">Protect your home’s value</p>
        <p>Consistent service records help predict future maintenance needs and preserve warranty coverage.</p>
      </div>

      <ServiceEventForm
        assets={assets}
        onSubmit={handleCreateEvent}
        submitLabel="Add Service Event"
        defaultAssetId={assetIdFilter}
      />

      <div className="space-y-2">
        {events.length === 0 ? (
          <p className="text-sm text-gray-500">No service events logged yet.</p>
        ) : (
          events.map(event => (
            <div key={event.id} className="rounded-lg border border-gray-200 bg-white p-4 text-sm">
              <p className="font-medium">{event.event_type}</p>
              <p className="text-gray-600">{formatDate(event.event_date)} • {event.performed_by || 'Unknown provider'}</p>
              {event.notes && <p className="text-gray-500">{event.notes}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ServiceHistoryPage;
