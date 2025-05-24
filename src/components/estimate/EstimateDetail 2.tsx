import React, { useState, useEffect } from 'react';
import { 
  ProjectEstimate, 
  EstimateCategory, 
  EstimateItem, 
  EstimateAssumption,
  EstimateStatus
} from '../../types/estimate';
import { estimateService } from '../../services/EstimateService';
import { useAuth } from '../../contexts/AuthContext';
import EstimateItemDetail from './EstimateItemDetail';
import EstimateCalculator from './EstimateCalculator';

interface EstimateDetailProps {
  estimate: ProjectEstimate;
  onClose?: () => void;
  onUpdate?: (updatedEstimate: ProjectEstimate) => void;
  onDelete?: () => void;
}

const EstimateDetail: React.FC<EstimateDetailProps> = ({ 
  estimate, 
  onClose,
  onUpdate,
  onDelete
}) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedEstimate, setEditedEstimate] = useState<ProjectEstimate>(estimate);
  const [selectedItem, setSelectedItem] = useState<EstimateItem | null>(null);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Initialize all categories as expanded
    if (estimate.categories) {
      const expanded: Record<string, boolean> = {};
      estimate.categories.forEach(category => {
        expanded[category.id] = true;
      });
      setExpandedCategories(expanded);
    }
  }, [estimate.categories]);

  const handleSaveEstimate = async () => {
    if (!onUpdate) return;
    
    setIsSaving(true);
    
    try {
      const updatedEstimate = await estimateService.updateEstimate(estimate.id, {
        name: editedEstimate.name,
        description: editedEstimate.description,
        status: editedEstimate.status
      });
      
      onUpdate(updatedEstimate);
      setIsEditing(false);
    } catch (err: any) {
      console.error('Error updating estimate:', err);
      setError(err.message || 'Failed to update estimate');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEstimate = async () => {
    if (!onDelete) return;
    
    if (!window.confirm('Are you sure you want to delete this estimate? This action cannot be undone.')) {
      return;
    }
    
    setIsDeleting(true);
    
    try {
      await estimateService.deleteEstimate(estimate.id);
      onDelete();
    } catch (err: any) {
      console.error('Error deleting estimate:', err);
      setError(err.message || 'Failed to delete estimate');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEditedEstimate(prev => ({ ...prev, [name]: value }));
  };

  const handleItemSelect = (item: EstimateItem) => {
    setSelectedItem(item);
    setIsCalculatorOpen(false);
  };

  const handleItemUpdate = (updatedItem: EstimateItem) => {
    // Update the item in the estimate
    if (estimate.categories) {
      const updatedCategories = estimate.categories.map(category => {
        if (category.id === updatedItem.category_id) {
          return {
            ...category,
            items: category.items?.map(item => 
              item.id === updatedItem.id ? updatedItem : item
            )
          };
        }
        return category;
      });
      
      const updatedEstimate = {
        ...estimate,
        categories: updatedCategories
      };
      
      if (onUpdate) {
        onUpdate(updatedEstimate);
      }
      
      // Update selected item if it's the one that was updated
      if (selectedItem && selectedItem.id === updatedItem.id) {
        setSelectedItem(updatedItem);
      }
    }
  };

  const handleOpenCalculator = (item: EstimateItem) => {
    setSelectedItem(item);
    setIsCalculatorOpen(true);
  };

  const handleCalculationComplete = (updatedItem: EstimateItem) => {
    handleItemUpdate(updatedItem);
    setIsCalculatorOpen(false);
  };

  const toggleCategoryExpand = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadgeClass = (status: EstimateStatus) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'in_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'archived':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: EstimateStatus) => {
    switch (status) {
      case 'draft':
        return 'Draft';
      case 'in_review':
        return 'In Review';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case 'archived':
        return 'Archived';
      default:
        return status;
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center bg-gray-50">
        <div>
          {isEditing ? (
            <input
              type="text"
              name="name"
              value={editedEstimate.name}
              onChange={handleChange}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-lg border-gray-300 rounded-md"
              placeholder="Estimate name"
            />
          ) : (
            <h3 className="text-lg leading-6 font-medium text-gray-900">{estimate.name}</h3>
          )}
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Estimate #{estimate.id.substring(0, 8)}
          </p>
        </div>
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEstimate}
                disabled={isSaving}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </>
          ) : (
            <>
              {onUpdate && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Edit
                </button>
              )}
              {onDelete && (
                <button
                  onClick={handleDeleteEstimate}
                  disabled={isDeleting}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-300"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              )}
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
            </>
          )}
        </div>
      </div>
      
      {error && (
        <div className="px-4 py-3 bg-red-50 border-l-4 border-red-400 text-red-700 mb-4">
          <p>{error}</p>
        </div>
      )}
      
      <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
        <dl className="sm:divide-y sm:divide-gray-200">
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {isEditing ? (
                <select
                  name="status"
                  value={editedEstimate.status}
                  onChange={handleChange}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="draft">Draft</option>
                  <option value="in_review">In Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="archived">Archived</option>
                </select>
              ) : (
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(estimate.status)}`}>
                  {getStatusLabel(estimate.status)}
                </span>
              )}
            </dd>
          </div>
          
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Description</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {isEditing ? (
                <textarea
                  name="description"
                  value={editedEstimate.description || ''}
                  onChange={handleChange}
                  rows={4}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Estimate description"
                />
              ) : (
                estimate.description || 'No description provided'
              )}
            </dd>
          </div>
          
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Total Cost</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-bold">
              {formatCurrency(estimate.total_cost || 0)}
            </dd>
          </div>
          
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Created By</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {estimate.created_by === user?.id ? 'You' : estimate.created_by}
            </dd>
          </div>
          
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Created</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {formatDate(estimate.created_at)}
            </dd>
          </div>
          
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {formatDate(estimate.updated_at)}
            </dd>
          </div>
        </dl>
      </div>
      
      {/* Estimate Categories and Items */}
      <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Estimate Items</h4>
        
        {estimate.categories && estimate.categories.length > 0 ? (
          <div className="space-y-4">
            {estimate.categories.map((category) => (
              <div key={category.id} className="border border-gray-200 rounded-md overflow-hidden">
                <div 
                  className="bg-gray-50 px-4 py-3 flex justify-between items-center cursor-pointer"
                  onClick={() => toggleCategoryExpand(category.id)}
                >
                  <h5 className="text-md font-medium text-gray-900">{category.name}</h5>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500 mr-2">
                      {category.items?.length || 0} items
                    </span>
                    <svg 
                      className={`h-5 w-5 text-gray-500 transform ${expandedCategories[category.id] ? 'rotate-180' : ''}`} 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                    >
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                
                {expandedCategories[category.id] && (
                  <div className="px-4 py-3">
                    {category.description && (
                      <p className="text-sm text-gray-500 mb-3">{category.description}</p>
                    )}
                    
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Item
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Quantity
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Unit
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Unit Cost
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Total
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {category.items && category.items.length > 0 ? (
                            category.items.map((item) => (
                              <tr 
                                key={item.id} 
                                className={`hover:bg-gray-50 cursor-pointer ${selectedItem?.id === item.id ? 'bg-blue-50' : ''}`}
                                onClick={() => handleItemSelect(item)}
                              >
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {item.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {item.quantity}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {item.unit}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {formatCurrency(item.unit_cost)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                  {formatCurrency(item.total_cost)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenCalculator(item);
                                    }}
                                    className="text-blue-600 hover:text-blue-900"
                                  >
                                    Calculate
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={6} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                No items in this category
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 bg-gray-50 rounded-md">
            <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No categories or items</h3>
            <p className="mt-1 text-sm text-gray-500">
              This estimate doesn't have any categories or items yet.
            </p>
          </div>
        )}
      </div>
      
      {/* Assumptions */}
      {estimate.assumptions && estimate.assumptions.length > 0 && (
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Assumptions</h4>
          
          <ul className="space-y-2">
            {estimate.assumptions.map((assumption) => (
              <li key={assumption.id} className="flex items-start">
                <div className={`flex-shrink-0 h-5 w-5 rounded-full mt-1 ${
                  assumption.impact === 'high' ? 'bg-red-100' :
                  assumption.impact === 'medium' ? 'bg-yellow-100' : 'bg-green-100'
                }`}></div>
                <div className="ml-3">
                  <p className="text-sm text-gray-700">{assumption.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Impact: {assumption.impact.charAt(0).toUpperCase() + assumption.impact.slice(1)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Item Detail or Calculator */}
      {selectedItem && (
        <div className="border-t border-gray-200">
          {isCalculatorOpen ? (
            <EstimateCalculator 
              item={selectedItem}
              onCalculationComplete={handleCalculationComplete}
              onCancel={() => setIsCalculatorOpen(false)}
            />
          ) : (
            <EstimateItemDetail 
              item={selectedItem}
              onUpdate={handleItemUpdate}
              onCalculate={() => setIsCalculatorOpen(true)}
              onClose={() => setSelectedItem(null)}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default EstimateDetail;
