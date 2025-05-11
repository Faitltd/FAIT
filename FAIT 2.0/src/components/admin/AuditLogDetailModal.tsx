import React from 'react';
import { 
  X, 
  User, 
  Clock, 
  Settings, 
  Shield, 
  FileText, 
  AlertTriangle,
  Globe,
  Hash
} from 'lucide-react';
import { AuditLog } from '../../types/admin';
import { format } from 'date-fns';

interface AuditLogDetailModalProps {
  log: AuditLog;
  onClose: () => void;
}

const AuditLogDetailModal: React.FC<AuditLogDetailModalProps> = ({ log, onClose }) => {
  const getActionIcon = (action: string) => {
    if (action.includes('user')) {
      return <User className="h-5 w-5 text-blue-500" />;
    } else if (action.includes('setting')) {
      return <Settings className="h-5 w-5 text-purple-500" />;
    } else if (action.includes('verification')) {
      return <Shield className="h-5 w-5 text-green-500" />;
    } else if (action.includes('project')) {
      return <FileText className="h-5 w-5 text-orange-500" />;
    } else if (action.includes('dispute')) {
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    } else {
      return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatChanges = (changes: Record<string, any>) => {
    if (!changes) return null;
    
    return Object.entries(changes).map(([key, value]) => {
      const oldValue = value.old;
      const newValue = value.new;
      
      return (
        <div key={key} className="mb-2">
          <div className="text-sm font-medium text-gray-700">{key.replace(/_/g, ' ')}</div>
          <div className="flex flex-col sm:flex-row sm:items-center mt-1">
            <div className="bg-red-50 text-red-800 px-2 py-1 rounded text-xs flex-1">
              {oldValue === null || oldValue === undefined ? 'null' : 
               typeof oldValue === 'object' ? JSON.stringify(oldValue) : String(oldValue)}
            </div>
            <div className="text-gray-500 mx-2 my-1 sm:my-0">→</div>
            <div className="bg-green-50 text-green-800 px-2 py-1 rounded text-xs flex-1">
              {newValue === null || newValue === undefined ? 'null' : 
               typeof newValue === 'object' ? JSON.stringify(newValue) : String(newValue)}
            </div>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Audit Log Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
          <div className="space-y-6">
            <div className="flex items-center">
              {getActionIcon(log.action)}
              <h3 className="ml-2 text-lg font-medium text-gray-900">
                {log.action.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex items-center mb-2">
                  <Clock className="h-4 w-4 text-gray-500 mr-2" />
                  <h4 className="text-sm font-medium text-gray-900">Timestamp</h4>
                </div>
                <p className="text-sm text-gray-700">
                  {format(new Date(log.created_at), 'PPpp')}
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex items-center mb-2">
                  <User className="h-4 w-4 text-gray-500 mr-2" />
                  <h4 className="text-sm font-medium text-gray-900">User</h4>
                </div>
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 overflow-hidden">
                    {log.user?.avatar_url ? (
                      <img src={log.user.avatar_url} alt={log.user.full_name} className="h-full w-full object-cover" />
                    ) : (
                      log.user?.full_name?.charAt(0).toUpperCase() || 'U'
                    )}
                  </div>
                  <div className="ml-2">
                    <p className="text-sm font-medium text-gray-900">{log.user?.full_name || 'Unknown User'}</p>
                    <p className="text-xs text-gray-500">{log.user?.email || 'No email'}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex items-center mb-2">
                  <Globe className="h-4 w-4 text-gray-500 mr-2" />
                  <h4 className="text-sm font-medium text-gray-900">IP Address</h4>
                </div>
                <p className="text-sm text-gray-700">{log.ip_address || 'N/A'}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex items-center mb-2">
                  <Hash className="h-4 w-4 text-gray-500 mr-2" />
                  <h4 className="text-sm font-medium text-gray-900">Entity ID</h4>
                </div>
                <p className="text-sm text-gray-700">{log.entity_id || 'N/A'}</p>
              </div>
            </div>
            
            {log.changes && Object.keys(log.changes).length > 0 && (
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex items-center mb-4">
                  <Settings className="h-4 w-4 text-gray-500 mr-2" />
                  <h4 className="text-sm font-medium text-gray-900">Changes</h4>
                </div>
                <div className="space-y-2">
                  {formatChanges(log.changes)}
                </div>
              </div>
            )}
            
            {log.metadata && Object.keys(log.metadata).length > 0 && (
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex items-center mb-4">
                  <FileText className="h-4 w-4 text-gray-500 mr-2" />
                  <h4 className="text-sm font-medium text-gray-900">Additional Metadata</h4>
                </div>
                <pre className="text-xs text-gray-700 bg-gray-100 p-3 rounded overflow-x-auto">
                  {JSON.stringify(log.metadata, null, 2)}
                </pre>
              </div>
            )}
          </div>
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

export default AuditLogDetailModal;
