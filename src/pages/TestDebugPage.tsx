import React from 'react';

const TestDebugPage: React.FC = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Test Debug Page</h1>
      <p className="mt-4">This is a simple test page to verify routing.</p>
      <div className="mt-6 p-4 bg-gray-100 rounded">
        <h2 className="text-xl font-semibold">Debug Information</h2>
        <pre className="mt-2 p-2 bg-white rounded">
          {JSON.stringify({
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV,
            route: '/services/debug-test'
          }, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default TestDebugPage;
