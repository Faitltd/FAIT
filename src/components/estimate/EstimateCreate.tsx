import React, { useState, useEffect } from 'react';
import { ProjectEstimate, EstimateTemplate, EstimateStatus } from '../../types/estimate';
import { estimateService } from '../../services/EstimateService';
import { useAuth } from '../../contexts/AuthContext';

interface EstimateCreateProps {
  projectId: string;
  onClose?: () => void;
  onEstimateCreated?: (estimate: ProjectEstimate) => void;
}

const EstimateCreate: React.FC<EstimateCreateProps> = ({ 
  projectId, 
  onClose,
  onEstimateCreated
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'draft' as EstimateStatus
  });
  const [useTemplate, setUseTemplate] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [templates, setTemplates] = useState<EstimateTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      if (!user) return;
      
      setIsLoadingTemplates(true);
      
      try {
        const templatesData = await estimateService.getEstimateTemplates(true, user.id);
        setTemplates(templatesData);
        
        if (templatesData.length > 0) {
          setSelectedTemplateId(templatesData[0].id);
        }
      } catch (err: any) {
        console.error('Error fetching templates:', err);
        // Don't set error here, just log it
      } finally {
        setIsLoadingTemplates(false);
      }
    };
    
    fetchTemplates();
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to create an estimate');
      return;
    }
    
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      let estimate: ProjectEstimate;
      
      if (useTemplate && selectedTemplateId) {
        // Create from template
        estimate = await estimateService.createEstimateFromTemplate(
          projectId,
          selectedTemplateId,
          user.id
        );
      } else {
        // Create blank estimate
        estimate = await estimateService.createEstimate({
          project_id: projectId,
          name: formData.name,
          description: formData.description,
          created_by: user.id,
          status: formData.status,
          total_cost: 0
        });
      }
      
      if (onEstimateCreated) {
        onEstimateCreated(estimate);
      }
      
      if (onClose) {
        onClose();
      }
    } catch (err: any) {
      console.error('Error creating estimate:', err);
      setError(err.message || 'Failed to create estimate');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center bg-gray-50">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Create New Estimate</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      
      {error && (
        <div className="px-4 py-3 bg-red-50 border-l-4 border-red-400 text-red-700 mb-4">
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6">
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <div className="sm:col-span-6">
            <div className="flex items-center">
              <input
                id="use-template"
                name="use-template"
                type="checkbox"
                checked={useTemplate}
                onChange={() => setUseTemplate(!useTemplate)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="use-template" className="ml-2 block text-sm text-gray-900">
                Create from template
              </label>
            </div>
          </div>
          
          {useTemplate ? (
            <div className="sm:col-span-6">
              <label htmlFor="template" className="block text-sm font-medium text-gray-700">
                Select Template
              </label>
              <div className="mt-1">
                {isLoadingTemplates ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500 mr-2"></div>
                    <span className="text-sm text-gray-500">Loading templates...</span>
                  </div>
                ) : templates.length === 0 ? (
                  <div className="text-sm text-gray-500">No templates available</div>
                ) : (
                  <select
                    id="template"
                    name="template"
                    value={selectedTemplateId}
                    onChange={(e) => setSelectedTemplateId(e.target.value)}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  >
                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name} {template.is_public ? '(Public)' : '(Private)'}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <p className="mt-2 text-sm text-gray-500">
                The template will be used to create a new estimate with predefined categories and items.
              </p>
            </div>
          ) : (
            <>
              <div className="sm:col-span-6">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Estimate Name *
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Estimate name"
                  />
                </div>
              </div>
              
              <div className="sm:col-span-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <div className="mt-1">
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Describe the purpose of this estimate"
                  />
                </div>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <div className="mt-1">
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  >
                    <option value="draft">Draft</option>
                    <option value="in_review">In Review</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
            </>
          )}
        </div>
        
        <div className="mt-6 flex justify-end space-x-3">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading || (useTemplate && (!selectedTemplateId || templates.length === 0))}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
          >
            {isLoading ? 'Creating...' : 'Create Estimate'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EstimateCreate;
