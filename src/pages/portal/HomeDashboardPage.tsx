import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/UnifiedAuthContext';
import { createServiceEvent, getHomeSummary, listAssets } from '../../api/homeAssetsApi';
import { listMaintenanceReminders } from '../../api/maintenanceApi';
import type { AssetWithComputed, HomeAssetHome } from '../../modules/homeAssets/types';
import type { MaintenanceReminder } from '../../modules/homeAssets/maintenanceTypes';

const formatDate = (value?: string | null) => (value ? new Date(value).toLocaleDateString() : '—');

const RiskBadge = ({ level }: { level: string }) => {
  const colors = level === 'high' ? 'bg-red-100 text-red-700' : level === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700';
  return <span className={`px-2 py-1 text-xs font-semibold rounded ${colors}`}>{level}</span>;
};

const AssetCard = ({ asset, homeId, onRequestService }: { asset: AssetWithComputed; homeId: string; onRequestService: (assetId: string) => void }) => (
  <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
    <div className="flex items-start justify-between">
      <div>
        <Link to={`/portal/assets/${asset.id}`} className="text-lg font-semibold text-gray-900">
          {asset.display_name}
        </Link>
        <p className="text-sm text-gray-600">{asset.category}</p>
        <p className="text-xs text-gray-500">{[asset.brand, asset.model_number].filter(Boolean).join(' · ') || 'No model details'}</p>
      </div>
      <RiskBadge level={asset.riskLevel} />
    </div>
    <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-600">
      <div>Install: {formatDate(asset.install_date)}</div>
      <div>Last service: {formatDate(asset.last_service_date)}</div>
      <div>Next service: {formatDate(asset.next_service_due_date)}</div>
      <div>Warranty end: {formatDate(asset.warranty_end_date)}</div>
    </div>
    <div className="mt-4 flex flex-wrap gap-2">
      <Link
        to={`/portal/homes/${homeId}/service?assetId=${asset.id}`}
        className="text-xs font-medium text-blue-600"
      >
        Log Service
      </Link>
      <Link
        to={`/portal/assets/${asset.id}`}
        className="text-xs font-medium text-blue-600"
      >
        Upload Warranty Doc
      </Link>
      <button
        onClick={() => onRequestService(asset.id)}
        className="text-xs font-medium text-blue-600"
      >
        Request Service
      </button>
    </div>
  </div>
);

const HomeDashboardPage: React.FC = () => {
  const { homeId } = useParams();
  const { user } = useAuth();
  const [home, setHome] = useState<HomeAssetHome | null>(null);
  const [assets, setAssets] = useState<AssetWithComputed[]>([]);
  const [reminders, setReminders] = useState<MaintenanceReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!user || !homeId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const summary = await getHomeSummary(user.id, homeId);
      if (!summary) {
        setHome(null);
        setAssets([]);
        return;
      }
      setHome(summary.home);
      const assetList = await listAssets(user.id, homeId);
      setAssets(assetList);
      const reminderList = await listMaintenanceReminders(user.id, homeId, 'open');
      setReminders(reminderList.slice(0, 5));
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Failed to load home.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user, homeId]);

  const dueSoon = useMemo(() => assets.filter(asset => asset.isDueSoon), [assets]);
  const overdue = useMemo(() => assets.filter(asset => asset.overdueDays), [assets]);
  const underWarranty = useMemo(() => assets.filter(asset => asset.warranty_end_date && new Date(asset.warranty_end_date) > new Date()), [assets]);
  const highRisk = useMemo(() => assets.filter(asset => asset.riskLevel === 'high'), [assets]);

  const handleRequestService = async (assetId: string) => {
    if (!homeId) return;
    await createServiceEvent(homeId, {
      asset_id: assetId,
      event_type: 'inspection',
      event_date: new Date().toISOString().split('T')[0],
      notes: 'Service request created from Home Dashboard.'
    });
    await fetchData();
  };

  if (loading) {
    return <div className="p-6">Loading home dashboard...</div>;
  }

  if (!home) {
    return <div className="p-6">Home not found.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <Link to="/portal/homes" className="text-sm text-blue-600">← Back to homes</Link>
        <h1 className="text-2xl font-semibold text-gray-900">{home.name}</h1>
        <p className="text-gray-600">{home.address}, {home.city}, {home.state} {home.zip_code}</p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
        <p className="font-semibold text-slate-900">Home Asset Portfolio</p>
        <p>
          Track the systems and appliances that protect your home’s value. We use service history and age to
          flag risk and recommend preventative maintenance before failures happen.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link to={`/portal/homes/${homeId}/assets/new`} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm">Add Asset</Link>
        <Link to={`/portal/homes/${homeId}/service`} className="px-4 py-2 bg-white border border-blue-600 text-blue-600 rounded-md text-sm">Log Service</Link>
        <Link to={`/portal/homes/${homeId}/reminders`} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-md text-sm">View Reminders</Link>
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-900">
          <p className="font-semibold">Preventative Maintenance Plan</p>
          <p className="text-emerald-800">
            Stay ahead of breakdowns with service reminders, seasonal checkups, and discounted maintenance
            through FAIT service partners.
          </p>
          <Link to="/services" className="mt-3 inline-flex text-sm font-medium text-emerald-900 underline">
            Explore service options
          </Link>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-700">
          <p className="font-semibold text-gray-900">Risk Snapshot</p>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-600">
            <div>High risk assets: {highRisk.length}</div>
            <div>Due soon: {dueSoon.length}</div>
            <div>Overdue: {overdue.length}</div>
            <div>Under warranty: {underWarranty.length}</div>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Due Soon</h2>
        {dueSoon.length === 0 ? <p className="text-sm text-gray-500">No assets due in the next 30 days.</p> : (
          <div className="grid gap-4 md:grid-cols-2">
            {dueSoon.map(asset => <AssetCard key={asset.id} asset={asset} homeId={home.id} onRequestService={handleRequestService} />)}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Maintenance</h2>
          <Link to={`/portal/homes/${homeId}/reminders`} className="text-sm text-blue-600">View all</Link>
        </div>
        {reminders.length === 0 ? (
          <p className="text-sm text-gray-500">No open reminders right now.</p>
        ) : (
          <div className="space-y-2">
            {reminders.map(reminder => (
              <div key={reminder.id} className="rounded-lg border border-gray-200 bg-white p-3 text-sm">
                <p className="font-medium text-gray-900">{reminder.reminder_type.replace('_', ' ')}</p>
                <p className="text-xs text-gray-600">
                  Due: {formatDate(reminder.due_date)} • {(reminder.meta as any)?.assetDisplayName || 'Asset'}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Overdue</h2>
        {overdue.length === 0 ? <p className="text-sm text-gray-500">No overdue assets.</p> : (
          <div className="grid gap-4 md:grid-cols-2">
            {overdue.map(asset => <AssetCard key={asset.id} asset={asset} homeId={home.id} onRequestService={handleRequestService} />)}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Under Warranty</h2>
        {underWarranty.length === 0 ? <p className="text-sm text-gray-500">No active warranties.</p> : (
          <div className="grid gap-4 md:grid-cols-2">
            {underWarranty.map(asset => <AssetCard key={asset.id} asset={asset} homeId={home.id} onRequestService={handleRequestService} />)}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">High Risk</h2>
        {highRisk.length === 0 ? <p className="text-sm text-gray-500">No assets flagged as high risk.</p> : (
          <div className="grid gap-4 md:grid-cols-2">
            {highRisk.map(asset => <AssetCard key={asset.id} asset={asset} homeId={home.id} onRequestService={handleRequestService} />)}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomeDashboardPage;
