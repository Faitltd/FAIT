import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const DebugPage: React.FC = () => {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [supabaseInfo, setSupabaseInfo] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get Supabase connection info
        setSupabaseInfo({
          url: supabase.supabaseUrl,
          hasAnon: !!supabase.supabaseKey,
        });

        // Fetch profiles
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .limit(10);

        if (profilesError) throw profilesError;
        setProfiles(profilesData || []);

        // Fetch subscriptions
        const { data: subscriptionsData, error: subscriptionsError } = await supabase
          .from('subscriptions')
          .select('*')
          .limit(10);

        if (subscriptionsError) throw subscriptionsError;
        setSubscriptions(subscriptionsData || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Debug Page</h1>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Supabase Connection</h2>
          <div className="overflow-x-auto">
            <pre className="bg-gray-100 p-4 rounded-lg">
              {JSON.stringify(supabaseInfo, null, 2)}
            </pre>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Profiles ({profiles.length})</h2>
              <div className="overflow-x-auto">
                <pre className="bg-gray-100 p-4 rounded-lg">
                  {JSON.stringify(profiles, null, 2)}
                </pre>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Subscriptions ({subscriptions.length})</h2>
              <div className="overflow-x-auto">
                <pre className="bg-gray-100 p-4 rounded-lg">
                  {JSON.stringify(subscriptions, null, 2)}
                </pre>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DebugPage;
