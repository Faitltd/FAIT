import React from 'react';
import { Estimate } from './EstimateBuilder';
import { Save, Send, X } from 'lucide-react';
import LoadingSpinner from '../LoadingSpinner';
import { formatCurrency } from '../../utils/formatters';

interface EstimateActionsProps {
  estimate: Estimate;
  onSave: () => void;
  onSend: () => void;
  onCancel: () => void;
  saving: boolean;
}

const EstimateActions: React.FC<EstimateActionsProps> = ({
  estimate,
  onSave,
  onSend,
  onCancel,
  saving
}) => {
  const isEditing = !!estimate.id;
  const canSend = estimate.items && estimate.items.length > 0 && estimate.title && estimate.description;
  
  return (
    <div className="border-t border-gray-200 pt-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center">
        <div className="mb-4 md:mb-0">
          <div className="text-sm text-gray-500">Total Estimate Amount</div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(estimate.total_amount)}
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </button>
          
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {saving ? (
              <>
                <LoadingSpinner size="small" />
                <span className="ml-2">Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save as Draft
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={onSend}
            disabled={saving || !canSend}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {saving ? (
              <>
                <LoadingSpinner size="small" />
                <span className="ml-2">Sending...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                {isEditing ? 'Update & Send to Client' : 'Send to Client'}
              </>
            )}
          </button>
        </div>
      </div>
      
      {!canSend && (
        <p className="mt-2 text-sm text-yellow-600">
          Please add at least one item and complete all required fields before sending to the client.
        </p>
      )}
    </div>
  );
};

export default EstimateActions;
