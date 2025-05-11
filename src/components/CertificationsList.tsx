import React from 'react';
import { Award, Trash2, Calendar } from 'lucide-react';
import type { Database } from '../lib/database.types';

type Certification = Database['public']['Tables']['service_agent_certifications']['Row'];

interface CertificationsListProps {
  certifications: Certification[];
  onDelete: (id: string) => void;
}

const CertificationsList: React.FC<CertificationsListProps> = ({ certifications, onDelete }) => {
  return (
    <div className="space-y-4">
      {certifications.map((cert) => (
        <div
          key={cert.id}
          className="bg-gray-50 rounded-lg p-4"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center">
                <Award className="h-5 w-5 text-blue-500 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">
                  {cert.certification_name}
                </h3>
              </div>
              <p className="mt-1 text-sm text-gray-600">
                Issued by {cert.issuing_organization}
              </p>
              {cert.certification_number && (
                <p className="mt-1 text-sm text-gray-600">
                  Certificate #{cert.certification_number}
                </p>
              )}
              <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Issued: {new Date(cert.issue_date).toLocaleDateString()}
                </span>
                {cert.expiry_date && (
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Expires: {new Date(cert.expiry_date).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => onDelete(cert.id)}
              className="text-gray-400 hover:text-red-500 transition-colors"
              title="Remove certification"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CertificationsList;