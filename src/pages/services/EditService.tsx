import React from 'react';
import { useParams } from 'react-router-dom';
import ServiceForm from '../../components/ServiceForm';

const EditService: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  if (!id) {
    return <div>Service ID is required</div>;
  }
  
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Service</h1>
      <ServiceForm serviceId={id} />
    </div>
  );
};

export default EditService;
