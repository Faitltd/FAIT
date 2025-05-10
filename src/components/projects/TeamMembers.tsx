import React, { useState } from 'react';
import { ProjectMember, User } from '../../types/project';
import {
  Card,
  CardContent,
  Heading,
  Text,
  Button,
  Select
} from '../ui';
import {
  UserPlus,
  UserMinus,
  Mail,
  Phone,
  User as UserIcon,
  Shield,
  Edit,
  Trash2
} from 'lucide-react';

interface TeamMembersProps {
  projectId: string;
  members: ProjectMember[];
  onAddMember?: () => void;
  onRemoveMember?: (memberId: string) => void;
  onUpdateRole?: (memberId: string, role: string) => void;
  className?: string;
}

const TeamMembers: React.FC<TeamMembersProps> = ({
  projectId,
  members,
  onAddMember,
  onRemoveMember,
  onUpdateRole,
  className = ''
}) => {
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('');

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'owner':
        return 'Owner';
      case 'admin':
        return 'Admin';
      case 'member':
        return 'Member';
      case 'viewer':
        return 'Viewer';
      default:
        return role;
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-100 text-purple-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      case 'member':
        return 'bg-green-100 text-green-800';
      case 'viewer':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEditRole = (member: ProjectMember) => {
    setEditingMemberId(member.id);
    setSelectedRole(member.role);
  };

  const handleSaveRole = (memberId: string) => {
    if (onUpdateRole && selectedRole) {
      onUpdateRole(memberId, selectedRole);
    }
    setEditingMemberId(null);
  };

  const roleOptions = [
    { value: 'owner', label: 'Owner' },
    { value: 'admin', label: 'Admin' },
    { value: 'member', label: 'Member' },
    { value: 'viewer', label: 'Viewer' }
  ];

  return (
    <div className={className}>
      {members.length === 0 ? (
        <div className="text-center py-8">
          <Text variant="muted">No team members added yet.</Text>
          {onAddMember && (
            <Button 
              variant="primary" 
              className="mt-4"
              onClick={onAddMember}
            >
              Add Team Member
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {members.map(member => (
            <Card key={member.id} className="hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                    {member.user.avatar_url ? (
                      <img 
                        src={member.user.avatar_url} 
                        alt={member.user.full_name || member.user.email} 
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <UserIcon size={24} className="text-gray-500" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">
                      {member.user.full_name || member.user.email}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center space-x-4">
                      {member.user.email && (
                        <span className="flex items-center">
                          <Mail size={14} className="mr-1" />
                          {member.user.email}
                        </span>
                      )}
                      {member.user.phone && (
                        <span className="flex items-center">
                          <Phone size={14} className="mr-1" />
                          {member.user.phone}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {editingMemberId === member.id ? (
                      <div className="flex items-center space-x-2">
                        <Select
                          options={roleOptions}
                          value={selectedRole}
                          onChange={setSelectedRole}
                          className="w-32"
                        />
                        <Button 
                          variant="primary" 
                          size="sm"
                          onClick={() => handleSaveRole(member.id)}
                        >
                          Save
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className={`flex items-center px-3 py-1 rounded-full text-xs ${getRoleBadgeClass(member.role)}`}>
                          <Shield size={14} className="mr-1" />
                          {getRoleLabel(member.role)}
                        </div>
                        
                        <div className="flex space-x-2">
                          {onUpdateRole && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEditRole(member)}
                              title="Edit Role"
                            >
                              <Edit size={16} />
                            </Button>
                          )}
                          
                          {onRemoveMember && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => onRemoveMember(member.id)}
                              title="Remove Member"
                            >
                              <Trash2 size={16} className="text-red-500" />
                            </Button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeamMembers;
