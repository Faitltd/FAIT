import React from 'react';
import { Link } from 'react-router-dom';

const HandymanTaskEstimator: React.FC = () => {
  return (
    <div className="bg-white p-8">
      <h1 className="text-2xl font-bold mb-4">Handyman Task Estimator</h1>
      <p>This is a simple version of the Handyman Task Estimator.</p>
      <div className="mt-4">
        <Link to="/" className="text-blue-500 hover:underline">Go Home</Link>
      </div>
    </div>
  );
};

export default HandymanTaskEstimator;
