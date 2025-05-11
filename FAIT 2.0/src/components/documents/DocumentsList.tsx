import React from 'react';

interface DocumentsListProps {
  limit?: number;
  type?: 'contract' | 'proposal' | 'invoice' | 'plan' | 'photo' | 'all';
}

const DocumentsList: React.FC<DocumentsListProps> = ({ limit = 5, type = 'all' }) => {
  return (
    <div className="p-4 bg-gray-50 rounded-lg text-center">
      <p className="text-gray-500">This component is a placeholder and will be implemented in a future update.</p>
      <p className="text-sm text-gray-400 mt-2">Will display a list of documents with type: {type}</p>
    </div>
  );
};

export default DocumentsList;
