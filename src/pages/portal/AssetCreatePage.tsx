import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AssetForm from '../../modules/homeAssets/components/AssetForm';
import { createAsset } from '../../api/homeAssetsApi';

const AssetCreatePage: React.FC = () => {
  const { homeId } = useParams();
  const navigate = useNavigate();

  const handleCreate = async (values: any) => {
    if (!homeId) return;
    await createAsset(homeId, values);
    navigate(`/portal/homes/${homeId}`);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Link to={`/portal/homes/${homeId}`} className="text-sm text-blue-600">← Back to home</Link>
      <h1 className="text-2xl font-semibold text-gray-900">Add Asset</h1>
      <AssetForm onSubmit={handleCreate} submitLabel="Create Asset" />
    </div>
  );
};

export default AssetCreatePage;
