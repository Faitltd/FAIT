import React from 'react';
import { MapPin, Trash2 } from 'lucide-react';
import ServiceAreaMap from './ServiceAreaMap';
import type { Database } from '../lib/database.types';

type ServiceArea = Database['public']['Tables']['service_agent_service_areas']['Row'];

interface ServiceAreasListProps {
  areas: ServiceArea[];
  onDelete: (id: string) => void;
}

const ServiceAreasList: React.FC<ServiceAreasListProps> = ({ areas, onDelete }) => {
  return (
    <div className="space-y-6">
      <ServiceAreaMap areas={areas} className="h-[400px] mb-6" />

      <div className="space-y-4">
        {areas.map((area) => (
          <div
            key={area.id}
            className="flex items-center justify-between bg-gray-50 p-4 rounded-lg"
          >
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-gray-400 mr-2" />
              <div>
                <p className="font-medium text-gray-900">ZIP Code: {area.zip_code}</p>
                <p className="text-sm text-gray-500">Service radius: {area.radius_miles} miles</p>
              </div>
            </div>
            <button
              onClick={() => onDelete(area.id)}
              className="text-gray-400 hover:text-red-500 transition-colors"
              title="Remove service area"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceAreasList;