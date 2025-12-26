import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  createServiceEvent,
  createWarrantyCoverage,
  deleteAssetDocument,
  getAssetDetail,
  getAssetDocumentDownloadUrl,
  listAssetDocuments,
  updateAsset,
  uploadAssetDocument
} from '../../api/homeAssetsApi';
import AssetForm from '../../modules/homeAssets/components/AssetForm';
import AssetDocumentUpload from '../../modules/homeAssets/components/AssetDocumentUpload';
import ServiceEventForm from '../../modules/homeAssets/components/ServiceEventForm';
import WarrantyCoverageForm from '../../modules/homeAssets/components/WarrantyCoverageForm';
import type { AssetDetail, AssetDocument } from '../../modules/homeAssets/types';
import { useAuth } from '../../contexts/UnifiedAuthContext';

const formatDate = (value?: string | null) => (value ? new Date(value).toLocaleDateString() : '—');

const AssetDetailPage: React.FC = () => {
  const { assetId } = useParams();
  const { user } = useAuth();
  const [asset, setAsset] = useState<AssetDetail | null>(null);
  const [documents, setDocuments] = useState<AssetDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAsset = async () => {
    if (!assetId || !user) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await getAssetDetail(user.id, assetId);
      setAsset(data);
      const docs = await listAssetDocuments(user.id, assetId);
      setDocuments(docs);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Failed to load asset.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAsset();
  }, [assetId, user]);

  if (loading) {
    return <div className="p-6">Loading asset...</div>;
  }

  if (!asset) {
    return <div className="p-6">Asset not found.</div>;
  }

  const handleUpdate = async (values: any) => {
    if (!assetId) return;
    await updateAsset(assetId, values);
    setEditing(false);
    await fetchAsset();
  };

  const handleAddWarranty = async (values: any) => {
    if (!assetId) return;
    await createWarrantyCoverage(assetId, values);
    await fetchAsset();
  };

  const handleAddServiceEvent = async (values: any) => {
    if (!assetId) return;
    await createServiceEvent(asset.home_id, { ...values, asset_id: assetId });
    await fetchAsset();
  };

  const handleUploadDocument = async (docType: any, file: File) => {
    if (!assetId || !user) return;
    await uploadAssetDocument(user.id, assetId, { doc_type: docType, file });
    await fetchAsset();
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!user) return;
    await deleteAssetDocument(user.id, documentId);
    await fetchAsset();
  };

  const handleDownloadDocument = async (documentId: string) => {
    if (!user) return;
    const url = await getAssetDocumentDownloadUrl(user.id, documentId);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <Link to="/portal/homes" className="text-sm text-blue-600">← Back to homes</Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{asset.display_name}</h1>
            <p className="text-gray-600">{asset.category}</p>
          </div>
          <div className="text-sm text-gray-600">
            Risk: <span className="font-semibold">{asset.riskLevel}</span>
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <section className="bg-white p-6 rounded-lg shadow space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Overview</h2>
          <button
            onClick={() => setEditing(!editing)}
            className="text-sm text-blue-600"
          >
            {editing ? 'Cancel' : 'Edit asset'}
          </button>
        </div>
        {editing ? (
          <AssetForm initialValues={asset} onSubmit={handleUpdate} submitLabel="Update Asset" />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 text-sm text-gray-700">
            <div>
              <p className="font-medium">Brand / Model</p>
              <p>{[asset.brand, asset.model_number].filter(Boolean).join(' · ') || '—'}</p>
            </div>
            <div>
              <p className="font-medium">Install date</p>
              <p>{formatDate(asset.install_date)}</p>
            </div>
            <div>
              <p className="font-medium">Last service</p>
              <p>{formatDate(asset.last_service_date)}</p>
            </div>
            <div>
              <p className="font-medium">Next service due</p>
              <p>{formatDate(asset.next_service_due_date)}</p>
            </div>
            <div>
              <p className="font-medium">Warranty end</p>
              <p>{formatDate(asset.warranty_end_date)}</p>
            </div>
            <div>
              <p className="font-medium">Location</p>
              <p>{asset.location_in_home || '—'}</p>
            </div>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Warranty</h2>
        {asset.warranty_coverages.length === 0 ? (
          <p className="text-sm text-gray-500">No warranty coverage added.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {asset.warranty_coverages.map(coverage => (
              <div key={coverage.id} className="rounded-lg border border-gray-200 bg-white p-4 text-sm">
                <p className="font-medium">{coverage.coverage_type}</p>
                <p className="text-gray-600">{coverage.provider || 'Unknown provider'}</p>
                <p className="text-gray-500">{formatDate(coverage.start_date)} → {formatDate(coverage.end_date)}</p>
              </div>
            ))}
          </div>
        )}
        <WarrantyCoverageForm onSubmit={handleAddWarranty} />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Service history</h2>
        {asset.service_events.length === 0 ? (
          <p className="text-sm text-gray-500">No service events logged.</p>
        ) : (
          <div className="space-y-2">
            {asset.service_events.map(event => (
              <div key={event.id} className="rounded-lg border border-gray-200 bg-white p-4 text-sm">
                <p className="font-medium">{event.event_type}</p>
                <p className="text-gray-600">{formatDate(event.event_date)} • {event.performed_by || 'Unknown provider'}</p>
                {event.notes && <p className="text-gray-500">{event.notes}</p>}
              </div>
            ))}
          </div>
        )}
        <ServiceEventForm onSubmit={handleAddServiceEvent} submitLabel="Log Service" defaultAssetId={asset.id} />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Documents</h2>
        {documents.length === 0 ? (
          <p className="text-sm text-gray-500">No documents uploaded.</p>
        ) : (
          <div className="space-y-2">
            {documents.map(doc => (
              <div key={doc.id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 text-sm">
                <div>
                  <button
                    onClick={() => handleDownloadDocument(doc.id)}
                    className="font-medium text-blue-600"
                  >
                    {doc.file_name}
                  </button>
                  <p className="text-gray-500">{doc.doc_type}</p>
                </div>
                <button
                  onClick={() => handleDeleteDocument(doc.id)}
                  className="text-xs text-red-600"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
        <AssetDocumentUpload onUpload={handleUploadDocument} />
      </section>
    </div>
  );
};

export default AssetDetailPage;
