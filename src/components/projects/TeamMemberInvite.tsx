import React, { useState } from 'react';
import { projectService } from '../../services/projectService';
import {
  Card,
  CardContent,
  CardFooter,
  Heading,
  Text,
  Button,
  Input,
  Select
} from '../ui';
import {
  UserPlus,
  Mail,
  Shield
} from 'lucide-react';

interface TeamMemberInviteProps {
  projectId: string;
  onMemberInvited?: (member: any) => void;
  onCancel?: () => void;
  className?: string;
}

const TeamMemberInvite: React.FC<TeamMemberInviteProps> = ({
  projectId,
  onMemberInvited,
  onCancel,
  className = ''
}) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [message, setMessage] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleInvite = async () => {
    if (!email) {
      setError('Please enter an email address');
      return;
    }

    if (!role) {
      setError('Please select a role');
      return;
    }

    try {
      setIsInviting(true);
      setError(null);
      setSuccessMessage(null);
      
      // In a real implementation, this would call a service to send an invitation
      // For now, we'll simulate a successful invitation
      setTimeout(() => {
        const mockMember: any = {
          id: `member-${Date.now()}`,
          project_id: projectId,
          user: {
            id: `user-${Date.now()}`,
            email,
            full_name: email.split('@')[0],
            avatar_url: null
          },
          role,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        setSuccessMessage(`Invitation sent to ${email}`);
        
        if (onMemberInvited) {
          onMemberInvited(mockMember);
        }
        
        // Reset form
        setEmail('');
        setRole('member');
        setMessage('');
        
        setIsInviting(false);
      }, 1500);
    } catch (err) {
      console.error('Error inviting team member:', err);
      setError(err instanceof Error ? err.message : 'Failed to send invitation');
      setIsInviting(false);
    }
  };

  const roleOptions = [
    { value: 'owner', label: 'Owner' },
    { value: 'admin', label: 'Admin' },
    { value: 'member', label: 'Member' },
    { value: 'viewer', label: 'Viewer' }
  ];

  return (
    <div className={className}>
      <div className="space-y-6">
        <div>
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            leftIcon={<Mail size={16} />}
            placeholder="colleague@example.com"
          />
        </div>
        
        <div>
          <Select
            label="Role"
            options={roleOptions}
            value={role}
            onChange={setRole}
            leftIcon={<Shield size={16} />}
          />
          <Text size="sm" variant="muted" className="mt-1">
            Select the appropriate role for this team member.
          </Text>
        </div>
        
        <div>
          <Input
            label="Personal Message (Optional)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="I'd like to invite you to collaborate on this project..."
          />
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {successMessage && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{successMessage}</p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex justify-end space-x-4 mt-6">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}
        
        <Button
          type="button"
          variant="primary"
          onClick={handleInvite}
          isLoading={isInviting}
          leftIcon={<UserPlus size={16} />}
        >
          Send Invitation
        </Button>
      </div>
    </div>
  );
};

export default TeamMemberInvite;
