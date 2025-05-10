import React, { useState, useEffect } from 'react';
import { updateSupabaseCredentials } from '../lib/supabase';

const SupabaseCredentialsManager: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    // Get current values from localStorage
    const storedUrl = localStorage.getItem('supabaseUrl');
    const storedKey = localStorage.getItem('supabaseAnonKey');
    
    if (storedUrl) setUrl(storedUrl);
    if (storedKey) setKey(storedKey);
  }, []);

  const handleSave = () => {
    if (!url || !key) {
      setMessage('Please enter both URL and API key');
      return;
    }

    try {
      updateSupabaseCredentials(url, key);
      setMessage('Credentials updated! Please refresh the page.');
      
      // Auto-refresh after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      setMessage(`Error updating credentials: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleReset = () => {
    // Default values from your project
    const defaultUrl = 'https://sjrehyseqqptdcnadvod.supabase.co';
    const defaultKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqcmVoeXNlcXFwdGRjbmFkdm9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0MzMxMzcsImV4cCI6MjA1OTAwOTEzN30.fPyawZcgteRLZUH0MvtVSmNmZSdbxUOyN9lo6BDe8-8';
    
    setUrl(defaultUrl);
    setKey(defaultKey);
    updateSupabaseCredentials(defaultUrl, defaultKey);
    setMessage('Credentials reset to defaults! Please refresh the page.');
    
    // Auto-refresh after 2 seconds
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  if (!isOpen) {
    return (
      <div 
        className="fixed bottom-4 right-4 bg-primary-600 text-white p-2 rounded-full shadow-lg cursor-pointer z-50"
        onClick={() => setIsOpen(true)}
        title="Supabase Credentials Manager"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Supabase Credentials Manager</h2>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {message && (
          <div className={`p-3 mb-4 rounded ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message}
          </div>
        )}
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Supabase URL
          </label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="https://your-project.supabase.co"
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Supabase Anon Key
          </label>
          <input
            type="text"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="your-anon-key"
          />
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={handleSave}
            className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Save & Refresh
          </button>
          <button
            onClick={handleReset}
            className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Reset to Default
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupabaseCredentialsManager;
