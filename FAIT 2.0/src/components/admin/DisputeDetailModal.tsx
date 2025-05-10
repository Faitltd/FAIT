import React, { useState } from 'react';
import { 
  X, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  XCircle, 
  MessageSquare, 
  FileText, 
  User, 
  Calendar 
} from 'lucide-react';
import { Dispute, DisputeStatus } from '../../types/dispute';
import { adminService } from '../../services/AdminService';
import { useAuth } from '../../contexts/AuthContext';
import { formatDistanceToNow, format } from 'date-fns';

interface DisputeDetailModalProps {
  dispute: Dispute;
  onClose: () => void;
  onDisputeUpdated: () => void;
}

const DisputeDetailModal: React.FC<DisputeDetailModalProps> = ({ 
  dispute, 
  onClose, 
  onDisputeUpdated 
}) => {
  const { user } = useAuth();
  const [resolution, setResolution] = useState('');
  const [status, setStatus] = useState<DisputeStatus>(dispute.status as DisputeStatus);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResolveDispute = async () => {
    if (!user || !resolution.trim()) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const success = await adminService.resolveDispute(dispute.id, resolution, user.id);
      if (success) {
        onDisputeUpdated();
      } else {
        setError('Failed to resolve dispute');
      }
    } catch (err) {
      console.error('Error resolving dispute:', err);
      setError('An error occurred while resolving the dispute');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!user || status === dispute.status) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const success = await adminService.updateDisputeStatus(dispute.id, status, user.id);
      if (success) {
        onDisputeUpdated();
      } else {
        setError('Failed to update dispute status');
      }
    } catch (err) {
      console.error('Error updating dispute status:', err);
      setError('An error occurred while updating the dispute status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: DisputeStatus) => {
    switch (status) {
      case 'open':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'resolved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'closed':
        return <XCircle className="h-5 w-5 text-gray-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadgeColor = (status: DisputeStatus) => {
    switch (status) {
      case 'open':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Dispute Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
            <div className="flex-1">
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">{dispute.title}</h3>
                <div className="flex items-center mb-4">
                  {getStatusIcon(dispute.status as DisputeStatus)}
                  <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(dispute.status as DisputeStatus)}`}>
                    {dispute.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-sm text-gray-600 whitespace-pre-line">{dispute.description}</p>
              </div>
              
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                  <FileText className="h-4 w-4 mr-1" />
                  Project Details
                </h4>
                {dispute.project ? (
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm font-medium text-gray-900">{dispute.project.name}</p>
                    <p className="text-sm text-gray-600 mt-1">{dispute.project.description}</p>
                    <div className="mt-2 flex items-center text-xs text-gray-500">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>Started: {format(new Date(dispute.project.start_date), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No project associated with this dispute</p>
                )}
              </div>
              
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Communication History
                </h4>
                <div className="space-y-4">
                  {dispute.messages && dispute.messages.length > 0 ? (
                    dispute.messages.map((message, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-md">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 overflow-hidden">
                              {message.sender?.avatar_url ? (
                                <img src={message.sender.avatar_url} alt={message.sender.full_name} className="h-full w-full object-cover" />
                              ) : (
                                message.sender?.full_name?.charAt(0).toUpperCase() || 'U'
                              )}
                            </div>
                            <span className="ml-2 text-sm font-medium text-gray-900">{message.sender?.full_name}</span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-gray-600 whitespace-pre-line">{message.content}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No messages in this dispute</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="md:w-80 space-y-6">
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  Filed By
                </h4>
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 overflow-hidden">
                    {dispute.filed_by?.avatar_url ? (
                      <img src={dispute.filed_by.avatar_url} alt={dispute.filed_by.full_name} className="h-full w-full object-cover" />
                    ) : (
                      dispute.filed_by?.full_name?.charAt(0).toUpperCase() || 'U'
                    )}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{dispute.filed_by?.full_name}</p>
                    <p className="text-xs text-gray-500">{dispute.filed_by?.email}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Timeline
                </h4>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs text-blue-600">1</span>
                    </div>
                    <div className="ml-2">
                      <p className="text-xs font-medium text-gray-900">Filed</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(dispute.created_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  
                  {dispute.status === 'in_progress' && (
                    <div className="flex items-start">
                      <div className="h-5 w-5 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs text-yellow-600">2</span>
                      </div>
                      <div className="ml-2">
                        <p className="text-xs font-medium text-gray-900">In Progress</p>
                        <p className="text-xs text-gray-500">
                          {dispute.updated_at && format(new Date(dispute.updated_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {dispute.status === 'resolved' && (
                    <>
                      <div className="flex items-start">
                        <div className="h-5 w-5 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs text-yellow-600">2</span>
                        </div>
                        <div className="ml-2">
                          <p className="text-xs font-medium text-gray-900">In Progress</p>
                          <p className="text-xs text-gray-500">
                            {dispute.updated_at && format(new Date(dispute.updated_at), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs text-green-600">3</span>
                        </div>
                        <div className="ml-2">
                          <p className="text-xs font-medium text-gray-900">Resolved</p>
                          <p className="text-xs text-gray-500">
                            {dispute.resolved_at && format(new Date(dispute.resolved_at), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                  
                  {dispute.status === 'closed' && (
                    <>
                      <div className="flex items-start">
                        <div className="h-5 w-5 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs text-yellow-600">2</span>
                        </div>
                        <div className="ml-2">
                          <p className="text-xs font-medium text-gray-900">In Progress</p>
                          <p className="text-xs text-gray-500">
                            {dispute.updated_at && format(new Date(dispute.updated_at), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs text-green-600">3</span>
                        </div>
                        <div className="ml-2">
                          <p className="text-xs font-medium text-gray-900">Resolved</p>
                          <p className="text-xs text-gray-500">
                            {dispute.resolved_at && format(new Date(dispute.resolved_at), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="h-5 w-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs text-gray-600">4</span>
                        </div>
                        <div className="ml-2">
                          <p className="text-xs font-medium text-gray-900">Closed</p>
                          <p className="text-xs text-gray-500">
                            {dispute.closed_at && format(new Date(dispute.closed_at), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              {dispute.status !== 'resolved' && dispute.status !== 'closed' && (
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Update Status</h4>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as DisputeStatus)}
                    className="w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 py-2 pl-3 pr-10 text-sm"
                    disabled={isSubmitting}
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                  <button
                    onClick={handleUpdateStatus}
                    disabled={isSubmitting || status === dispute.status}
                    className="mt-2 w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Updating...' : 'Update Status'}
                  </button>
                </div>
              )}
              
              {dispute.status !== 'resolved' && dispute.status !== 'closed' && (
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Resolve Dispute</h4>
                  <textarea
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    placeholder="Enter resolution details..."
                    className="w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 py-2 px-3 text-sm"
                    rows={4}
                    disabled={isSubmitting}
                  />
                  <button
                    onClick={handleResolveDispute}
                    disabled={isSubmitting || !resolution.trim()}
                    className="mt-2 w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Resolving...' : 'Resolve Dispute'}
                  </button>
                </div>
              )}
              
              {dispute.resolution && (
                <div className="bg-green-50 p-4 rounded-md">
                  <h4 className="text-sm font-medium text-green-900 mb-2 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                    Resolution
                  </h4>
                  <p className="text-sm text-green-800 whitespace-pre-line">{dispute.resolution}</p>
                  {dispute.resolved_by && (
                    <div className="mt-2 flex items-center text-xs text-green-700">
                      <span>Resolved by {dispute.resolved_by.full_name}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
        </div>
        
        <div className="p-6 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DisputeDetailModal;
