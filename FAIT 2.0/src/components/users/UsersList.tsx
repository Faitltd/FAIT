import React from 'react';

interface UsersListProps {
  limit?: number;
}

const UsersList: React.FC<UsersListProps> = ({ limit = 5 }) => {
  return (
    <div className="p-4 bg-gray-50 rounded-lg text-center">
      <p className="text-gray-500">This component is a placeholder and will be implemented in a future update.</p>
      <p className="text-sm text-gray-400 mt-2">Will display a list of users with pagination, filtering, and sorting options.</p>
    </div>
  );
};

export default UsersList;
