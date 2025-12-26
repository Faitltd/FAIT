import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/UnifiedAuthContext';
import HomeForm from '../../modules/homeAssets/components/HomeForm';
import { createHome, listHomes } from '../../api/homeAssetsApi';
import type { HomeAssetHome } from '../../modules/homeAssets/types';

const HomesListPage: React.FC = () => {
  const { user } = useAuth();
  const [homes, setHomes] = useState<HomeAssetHome[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHomes = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await listHomes(user.id);
      setHomes(data);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Failed to load homes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomes();
  }, [user]);

  const handleCreateHome = async (values: any) => {
    if (!user) return;
    await createHome(user.id, values);
    await fetchHomes();
  };

  if (loading) {
    return <div className="p-6">Loading homes...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Home Asset Profile</h1>
        <p className="text-gray-600">
          Treat your home like an asset: track appliances, warranties, and service history so you can prevent breakdowns and protect long-term value.
        </p>
        <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
          <p className="font-semibold">Preventative Maintenance Plan</p>
          <p className="text-blue-800">
            Get ahead of costly repairs with recommended service windows, risk alerts, and member discounts on vetted pros.
          </p>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <HomeForm onSubmit={handleCreateHome} submitLabel="Add Home" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {homes.map(home => (
          <Link
            key={home.id}
            to={`/portal/homes/${home.id}`}
            className="block rounded-lg border border-gray-200 bg-white p-5 shadow-sm hover:shadow"
          >
            <h2 className="text-lg font-semibold text-gray-900">{home.name}</h2>
            <p className="text-sm text-gray-600">{home.address}</p>
            <p className="text-sm text-gray-600">{home.city}, {home.state} {home.zip_code}</p>
            <div className="mt-3 text-xs text-gray-500">
              {home.year_built ? `Built ${home.year_built}` : 'Year built unknown'}
              {home.square_footage ? ` • ${home.square_footage} sq ft` : ''}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default HomesListPage;
