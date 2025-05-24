import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { getSimulatedBookings } from '../utils/simulatedBookings';
import { migrateToRealBookings, checkDatabaseSetup } from '../utils/migrationUtils';

const MigrateBookingsButton = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [dbReady, setDbReady] = useState<{ready: boolean; reason?: string}>({ ready: false });
  const [result, setResult] = useState<{ 
    migrated: number; 
    total: number;
    errors?: any[];
    error?: any 
  } | null>(null);
  
  const [simulatedCount, setSimulatedCount] = useState(0);
  
  useEffect(() => {
    if (user) {
      const count = getSimulatedBookings(user.id).length;
      setSimulatedCount(count);
      
      // Check if the database is ready for migration
      const checkDb = async () => {
        setChecking(true);
        const readyStatus = await checkDatabaseSetup(supabase);
        setDbReady(readyStatus);
        setChecking(false);
      };
      
      checkDb();
    }
  }, [user]);
  
  const handleMigrate = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const migrationResult = await migrateToRealBookings(supabase, user.id);
      setResult(migrationResult);
      
      // Update the simulated count after migration
      if (migrationResult.migrated === migrationResult.total) {
        setSimulatedCount(0);
      } else {
        setSimulatedCount(migrationResult.total - migrationResult.migrated);
      }
    } catch (error) {
      setResult({ migrated: 0, total: simulatedCount, error });
    } finally {
      setLoading(false);
    }
  };
  
  if (simulatedCount === 0) {
    return null;
  }
  
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
      <h3 className="text-lg font-medium text-blue-800 mb-2">Simulated Bookings Detected</h3>
      <p className="text-blue-700 mb-4">
        You have {simulatedCount} simulated booking(s) that were created during the demo. 
        {dbReady.ready 
          ? ' You can now migrate them to real bookings in the database.'
          : ' The database is not yet ready for migration.'}
      </p>
      
      {!dbReady.ready && !checking && (
        <div className="mb-4 p-3 rounded-md bg-yellow-100 text-yellow-700">
          <p className="font-medium">Database Not Ready</p>
          <p>{dbReady.reason || 'The database migrations need to be applied before migration can proceed.'}</p>
        </div>
      )}
      
      {checking && (
        <div className="mb-4 p-3 rounded-md bg-gray-100 text-gray-700 flex items-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Checking database status...
        </div>
      )}
      
      {result && (
        <div className={`mb-4 p-3 rounded-md ${result.error ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {result.error 
            ? (
              <>
                <p className="font-medium">Error during migration</p>
                <p>{result.error.message || 'Unknown error'}</p>
              </>
            )
            : (
              <>
                <p className="font-medium">Migration Result</p>
                <p>Successfully migrated {result.migrated} of {result.total} booking(s).</p>
                {result.errors && result.errors.length > 0 && (
                  <p className="mt-2">Some bookings could not be migrated. Please try again later.</p>
                )}
              </>
            )
          }
        </div>
      )}
      
      <button
        onClick={handleMigrate}
        disabled={loading || !dbReady.ready}
        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Migrating...' : 'Migrate Bookings'}
      </button>
    </div>
  );
};

export default MigrateBookingsButton;
