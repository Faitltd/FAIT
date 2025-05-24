import React from 'react';
import ServiceForm from '../../components/ServiceForm';

const CreateService: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Create New Service</h1>
      <ServiceForm />
    </div>
  );
};

export default CreateService;
