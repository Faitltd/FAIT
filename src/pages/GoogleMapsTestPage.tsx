import React from 'react';
import GoogleMapsTest from '../components/GoogleMapsTest';

const GoogleMapsTestPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Google Maps API Test Page</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        <GoogleMapsTest />
      </div>
      
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h2 className="text-xl font-bold mb-2">Debugging Information</h2>
        <p className="mb-2">This page tests the Google Maps API integration.</p>
        <p className="mb-2">If you're seeing errors, check the following:</p>
        <ul className="list-disc pl-6">
          <li>Verify that the VITE_GOOGLE_MAPS_API_KEY environment variable is set correctly in your .env file</li>
          <li>Check if the API key has the correct permissions and restrictions</li>
          <li>Look for any JavaScript errors in the browser console</li>
          <li>Ensure that the Google Maps JavaScript API is enabled in your Google Cloud Console</li>
        </ul>
      </div>
    </div>
  );
};

export default GoogleMapsTestPage;
