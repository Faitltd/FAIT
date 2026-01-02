import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/UnifiedAuthContext';
import { supabase } from '../../lib/supabaseClient';
import type { AssetWithComputed, CreateAssetInput, CreateHomeInput, HomeAssetHome } from '../../modules/homeAssets/types';
import AssetForm from '../../modules/homeAssets/components/AssetForm';
import { createAsset, createHome, listAssets, listHomes, updateAsset, updateHome } from '../../api/homeAssetsApi';

interface ProfileUser {
  id: string;
  email: string;
  user_type: string;
  full_name?: string | null;
  created_at?: string | null;
}

const emptyHomeInput: CreateHomeInput = {
  name: '',
  address_line1: '',
  address_line2: null,
  city: '',
  state: '',
  postal_code: '',
  year_built: null,
  square_feet: null
};

const AdminHomeAssetsManagementPage: React.FC = () => {
  const { isLocalAuth, userType } = useAuth();
  const [users, setUsers] = useState<ProfileUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [homes, setHomes] = useState<HomeAssetHome[]>([]);
  const [assetsByHome, setAssetsByHome] = useState<Record<string, AssetWithComputed[]>>({});
  const [search, setSearch] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingHomes, setLoadingHomes] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newHome, setNewHome] = useState<CreateHomeInput>({ ...emptyHomeInput });
  const [editingHomeId, setEditingHomeId] = useState<string | null>(null);
  const [editingHome, setEditingHome] = useState<CreateHomeInput>({ ...emptyHomeInput });

  const [assetEditor, setAssetEditor] = useState<{ homeId: string; assetId: string | null } | null>(null);
  const [assetInitialValues, setAssetInitialValues] = useState<Partial<AssetWithComputed> | undefined>(undefined);

  useEffect(() => {
    const loadUsers = async () => {
      setLoadingUsers(true);
      setError(null);

      try {
        if (isLocalAuth) {
          setUsers([
            {
              id: 'admin-uuid',
              email: 'admin@itsfait.com',
              user_type: 'admin',
              full_name: 'Admin User',
              created_at: new Date().toISOString()
            },
            {
              id: 'client-uuid',
              email: 'client@itsfait.com',
              user_type: 'client',
              full_name: 'Client User',
              created_at: new Date().toISOString()
            }
          ]);
          return;
        }

        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('id, email, user_type, full_name, created_at')
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;
        setUsers((data || []) as ProfileUser[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load users.');
      } finally {
        setLoadingUsers(false);
      }
    };

    loadUsers();
  }, [isLocalAuth]);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return users;
    return users.filter(user =>
      [user.email, user.full_name, user.user_type].filter(Boolean).some(value =>
        String(value).toLowerCase().includes(term)
      )
    );
  }, [search, users]);

  const loadHomes = async (userId: string) => {
    setLoadingHomes(true);
    setError(null);

    try {
      const homeList = await listHomes(userId);
      setHomes(homeList);

      const assetsEntries = await Promise.all(
        homeList.map(async (home) => ({
          homeId: home.id,
          assets: await listAssets(userId, home.id)
        }))
      );

      const assetsMap: Record<string, AssetWithComputed[]> = {};
      assetsEntries.forEach(({ homeId, assets }) => {
        assetsMap[homeId] = assets;
      });

      setAssetsByHome(assetsMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load homes.');
    } finally {
      setLoadingHomes(false);
    }
  };

  useEffect(() => {
    if (!selectedUserId) {
      setHomes([]);
      setAssetsByHome({});
      return;
    }
    loadHomes(selectedUserId);
  }, [selectedUserId]);

  const handleCreateHome = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedUserId) return;

    try {
      await createHome(selectedUserId, newHome);
      setNewHome({ ...emptyHomeInput });
      await loadHomes(selectedUserId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create home.');
    }
  };

  const startEditHome = (home: HomeAssetHome) => {
    setEditingHomeId(home.id);
    setEditingHome({
      name: home.name,
      address_line1: home.address,
      address_line2: null,
      city: home.city,
      state: home.state,
      postal_code: home.zip_code,
      year_built: home.year_built ?? null,
      square_feet: home.square_footage ?? null
    });
  };

  const handleUpdateHome = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedUserId || !editingHomeId) return;

    try {
      await updateHome(selectedUserId, editingHomeId, editingHome);
      setEditingHomeId(null);
      await loadHomes(selectedUserId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update home.');
    }
  };

  const startAssetCreate = (homeId: string) => {
    setAssetEditor({ homeId, assetId: null });
    setAssetInitialValues(undefined);
  };

  const startAssetEdit = (homeId: string, asset: AssetWithComputed) => {
    setAssetEditor({ homeId, assetId: asset.id });
    setAssetInitialValues(asset);
  };

  const handleAssetSubmit = async (values: CreateAssetInput) => {
    if (!assetEditor) return;

    if (assetEditor.assetId) {
      await updateAsset(assetEditor.assetId, values);
    } else {
      await createAsset(assetEditor.homeId, values);
    }

    setAssetEditor(null);
    setAssetInitialValues(undefined);
    if (selectedUserId) {
      await loadHomes(selectedUserId);
    }
  };

  if (userType && userType !== 'admin') {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-semibold">Home Asset Management</h1>
        <p className="mt-4 text-red-600">You do not have permission to access this page.</p>
        <Link to="/" className="mt-4 inline-block text-blue-600">Return home</Link>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Home Assets (Admin)</h1>
          <p className="text-gray-600">Manage homes and assets for any user.</p>
        </div>
        <Link
          to="/dashboard/admin"
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          Back to Dashboard
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <section className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-xl font-semibold">Select User</h2>
        <input
          type="search"
          placeholder="Search by email, name, or role"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2"
        />
        {loadingUsers ? (
          <div className="text-sm text-gray-500">Loading users...</div>
        ) : (
          <select
            value={selectedUserId}
            onChange={(event) => setSelectedUserId(event.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="">Select a user</option>
            {filteredUsers.map(user => (
              <option key={user.id} value={user.id}>
                {user.full_name ? `${user.full_name} • ` : ''}{user.email} ({user.user_type})
              </option>
            ))}
          </select>
        )}
      </section>

      {selectedUserId && (
        <>
          <section className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-xl font-semibold">Add Home</h2>
            <form onSubmit={handleCreateHome} className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <input
                type="text"
                placeholder="Home name"
                value={newHome.name}
                onChange={(event) => setNewHome(prev => ({ ...prev, name: event.target.value }))}
                className="border border-gray-300 rounded-md px-3 py-2"
                required
              />
              <input
                type="text"
                placeholder="Address"
                value={newHome.address_line1}
                onChange={(event) => setNewHome(prev => ({ ...prev, address_line1: event.target.value }))}
                className="border border-gray-300 rounded-md px-3 py-2"
                required
              />
              <input
                type="text"
                placeholder="City"
                value={newHome.city}
                onChange={(event) => setNewHome(prev => ({ ...prev, city: event.target.value }))}
                className="border border-gray-300 rounded-md px-3 py-2"
                required
              />
              <input
                type="text"
                placeholder="State"
                value={newHome.state}
                onChange={(event) => setNewHome(prev => ({ ...prev, state: event.target.value }))}
                className="border border-gray-300 rounded-md px-3 py-2"
                required
              />
              <input
                type="text"
                placeholder="Postal code"
                value={newHome.postal_code}
                onChange={(event) => setNewHome(prev => ({ ...prev, postal_code: event.target.value }))}
                className="border border-gray-300 rounded-md px-3 py-2"
                required
              />
              <input
                type="number"
                placeholder="Year built"
                value={newHome.year_built ?? ''}
                onChange={(event) => setNewHome(prev => ({
                  ...prev,
                  year_built: event.target.value ? Number(event.target.value) : null
                }))}
                className="border border-gray-300 rounded-md px-3 py-2"
              />
              <input
                type="number"
                placeholder="Square feet"
                value={newHome.square_feet ?? ''}
                onChange={(event) => setNewHome(prev => ({
                  ...prev,
                  square_feet: event.target.value ? Number(event.target.value) : null
                }))}
                className="border border-gray-300 rounded-md px-3 py-2"
              />
              <button
                type="submit"
                className="md:col-span-2 inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md"
              >
                Create Home
              </button>
            </form>
          </section>

          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Homes & Assets</h2>
              {loadingHomes && <span className="text-sm text-gray-500">Loading...</span>}
            </div>

            {homes.length === 0 && !loadingHomes ? (
              <div className="bg-white rounded-lg shadow p-6 text-gray-500">
                No homes found for this user.
              </div>
            ) : (
              homes.map(home => (
                <div key={home.id} className="bg-white rounded-lg shadow p-6 space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-semibold">{home.name}</h3>
                      <p className="text-gray-600">{home.address}, {home.city}, {home.state} {home.zip_code}</p>
                    </div>
                    <button
                      type="button"
                      className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md"
                      onClick={() => startEditHome(home)}
                    >
                      Edit Home
                    </button>
                  </div>

                  {editingHomeId === home.id && (
                    <form onSubmit={handleUpdateHome} className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <input
                        type="text"
                        placeholder="Home name"
                        value={editingHome.name}
                        onChange={(event) => setEditingHome(prev => ({ ...prev, name: event.target.value }))}
                        className="border border-gray-300 rounded-md px-3 py-2"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Address"
                        value={editingHome.address_line1}
                        onChange={(event) => setEditingHome(prev => ({ ...prev, address_line1: event.target.value }))}
                        className="border border-gray-300 rounded-md px-3 py-2"
                        required
                      />
                      <input
                        type="text"
                        placeholder="City"
                        value={editingHome.city}
                        onChange={(event) => setEditingHome(prev => ({ ...prev, city: event.target.value }))}
                        className="border border-gray-300 rounded-md px-3 py-2"
                        required
                      />
                      <input
                        type="text"
                        placeholder="State"
                        value={editingHome.state}
                        onChange={(event) => setEditingHome(prev => ({ ...prev, state: event.target.value }))}
                        className="border border-gray-300 rounded-md px-3 py-2"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Postal code"
                        value={editingHome.postal_code}
                        onChange={(event) => setEditingHome(prev => ({ ...prev, postal_code: event.target.value }))}
                        className="border border-gray-300 rounded-md px-3 py-2"
                        required
                      />
                      <input
                        type="number"
                        placeholder="Year built"
                        value={editingHome.year_built ?? ''}
                        onChange={(event) => setEditingHome(prev => ({
                          ...prev,
                          year_built: event.target.value ? Number(event.target.value) : null
                        }))}
                        className="border border-gray-300 rounded-md px-3 py-2"
                      />
                      <input
                        type="number"
                        placeholder="Square feet"
                        value={editingHome.square_feet ?? ''}
                        onChange={(event) => setEditingHome(prev => ({
                          ...prev,
                          square_feet: event.target.value ? Number(event.target.value) : null
                        }))}
                        className="border border-gray-300 rounded-md px-3 py-2"
                      />
                      <div className="md:col-span-2 flex gap-3">
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">
                          Save Home
                        </button>
                        <button
                          type="button"
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md"
                          onClick={() => setEditingHomeId(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold">Assets</h4>
                      <button
                        type="button"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md"
                        onClick={() => startAssetCreate(home.id)}
                      >
                        Add Asset
                      </button>
                    </div>

                    {assetEditor?.homeId === home.id && (
                      <AssetForm
                        initialValues={assetInitialValues}
                        onSubmit={handleAssetSubmit}
                        submitLabel={assetEditor.assetId ? 'Update Asset' : 'Create Asset'}
                      />
                    )}

                    {assetsByHome[home.id]?.length ? (
                      <div className="space-y-3">
                        {assetsByHome[home.id].map(asset => (
                          <div key={asset.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <div className="text-sm font-semibold">{asset.display_name}</div>
                                <div className="text-xs text-gray-500">{asset.category} · {asset.brand || 'Unknown brand'}</div>
                                <div className="text-xs text-gray-500">Serial: {asset.serial_number || '—'}</div>
                              </div>
                              <button
                                type="button"
                                className="text-blue-600 text-sm"
                                onClick={() => startAssetEdit(home.id, asset)}
                              >
                                Edit
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">No assets added yet.</div>
                    )}
                  </div>
                </div>
              ))
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default AdminHomeAssetsManagementPage;
