import React from 'react';
import { Briefcase, Star, Trash2 } from 'lucide-react';
import type { Database } from '../lib/database.types';

type Specialty = Database['public']['Tables']['service_agent_specialties']['Row'];

interface SpecialtiesListProps {
  specialties: Specialty[];
  onDelete: (id: string) => void;
}

const SpecialtiesList: React.FC<SpecialtiesListProps> = ({ specialties, onDelete }) => {
  return (
    <div className="space-y-4">
      {specialties.map((specialty) => (
        <div
          key={specialty.id}
          className="bg-gray-50 rounded-lg p-4"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center">
                <Briefcase className="h-5 w-5 text-gray-400 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">
                  {specialty.specialty}
                </h3>
              </div>
              <div className="mt-1 flex items-center text-sm text-gray-500">
                <Star className="h-4 w-4 text-yellow-400 mr-1" />
                <span>{specialty.years_experience} years of experience</span>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                {specialty.description}
              </p>
            </div>
            <button
              onClick={() => onDelete(specialty.id)}
              className="ml-4 text-gray-400 hover:text-red-500 transition-colors"
              title="Remove specialty"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SpecialtiesList;