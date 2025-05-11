import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Calendar,
  Plus,
  Edit2,
  FileText
} from 'lucide-react';
import { Warranty, WarrantyType } from '../../types/warranty';
import { warrantyService } from '../../services/WarrantyService';

interface WarrantyEligibilityTrackerProps {
  projectId: string;
  isEditable?: boolean;
}

const WarrantyEligibilityTracker: React.FC<WarrantyEligibilityTrackerProps> = ({ 
  projectId, 
  isEditable = false 
}) => {
  const [warranties, setWarranties] = useState<Warranty[]>([]);
  const [warrantyTypes, setWarrantyTypes] = useState<WarrantyType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingWarranty, setIsAddingWarranty] = useState(false);
  const [editingWarrantyId, setEditingWarrantyId] = useState<string | null>(null);
  
  // Form state for adding/editing warranties
  const [formData, setFormData] = useState({
    warranty_type_id: '',
    start_date: '',
    is_premium: false,
    auto_renewal: false,
    terms_document_url: '',
    notes: ''
  });

  useEffect(() => {
    fetchWarranties();
    fetchWarrantyTypes();
  }, [projectId]);

  const fetchWarranties = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user role from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_role')
        .eq('id', user.id)
        .single();

      const userRole = profile?.user_role || 'client';
      
      // Get warranties for the project
      const data = await warrantyService.getWarranties(userRole);
      const projectWarranties = data.filter(w => w.project_id === projectId);
      setWarranties(projectWarranties);
      setError(null);
    } catch (err) {
      setError('Failed to load warranties');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWarrantyTypes = async () => {
    try {
      const data = await warrantyService.getWarrantyTypes();
      setWarrantyTypes(data);
      
      // Set default warranty type if available
      if (data.length > 0 && !formData.warranty_type_id) {
        setFormData(prev => ({ ...prev, warranty_type_id: data[0].id }));
      }
    } catch (err) {
      console.error('Failed to load warranty types:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddWarranty = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const newWarranty = await warrantyService.createWarranty({
        project_id: projectId,
        client_id: warranties[0]?.client_id || '', // Assuming client_id is available from project
        contractor_id: user.id,
        warranty_type_id: formData.warranty_type_id,
        start_date: formData.start_date,
        is_premium: formData.is_premium,
        auto_renewal: formData.auto_renewal,
        terms_document_url: formData.terms_document_url || null,
        notes: formData.notes || null
      });

      if (newWarranty) {
        setWarranties([...warranties, newWarranty]);
        setIsAddingWarranty(false);
        setFormData({
          warranty_type_id: warrantyTypes[0]?.id || '',
          start_date: '',
          is_premium: false,
          auto_renewal: false,
          terms_document_url: '',
          notes: ''
        });
      }
    } catch (err) {
      console.error('Failed to add warranty:', err);
    }
  };

  const handleEditWarranty = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingWarrantyId) return;
    
    try {
      const updatedWarranty = await warrantyService.updateWarranty(
        editingWarrantyId,
        {
          warranty_type_id: formData.warranty_type_id,
          start_date: formData.start_date,
          is_premium: formData.is_premium,
          auto_renewal: formData.auto_renewal,
          terms_document_url: formData.terms_document_url || null,
          notes: formData.notes || null
        }
      );

      if (updatedWarranty) {
        setWarranties(warranties.map(w => 
          w.id === editingWarrantyId ? updatedWarranty : w
        ));
        setEditingWarrantyId(null);
        setFormData({
          warranty_type_id: warrantyTypes[0]?.id || '',
          start_date: '',
          is_premium: false,
          auto_renewal: false,
          terms_document_url: '',
          notes: ''
        });
      }
    } catch (err) {
      console.error('Failed to update warranty:', err);
    }
  };

  const startEditWarranty = (warranty: Warranty) => {
    setFormData({
      warranty_type_id: warranty.warranty_type_id,
      start_date: warranty.start_date,
      is_premium: warranty.is_premium,
      auto_renewal: warranty.auto_renewal,
      terms_document_url: warranty.terms_document_url || '',
      notes: warranty.notes || ''
    });
    setEditingWarrantyId(warranty.id);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'expired':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'void':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'void':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <div className="text-red-500 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Warranty Eligibility</h3>
        {isEditable && (
          <button
            onClick={() => setIsAddingWarranty(true)}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Warranty
          </button>
        )}
      </div>

      {isAddingWarranty && (
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <form onSubmit={handleAddWarranty} className="space-y-4">
            <div>
              <label htmlFor="warranty_type_id" className="block text-sm font-medium text-gray-700">
                Warranty Type
              </label>
              <select
                name="warranty_type_id"
                id="warranty_type_id"
                required
                value={formData.warranty_type_id}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                {warrantyTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name} ({type.duration_days} days)
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <input
                type="date"
                name="start_date"
                id="start_date"
                required
                value={formData.start_date}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_premium"
                id="is_premium"
                checked={formData.is_premium}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_premium" className="ml-2 block text-sm text-gray-700">
                Premium Warranty (Extended Duration)
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                name="auto_renewal"
                id="auto_renewal"
                checked={formData.auto_renewal}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="auto_renewal" className="ml-2 block text-sm text-gray-700">
                Auto-Renewal
              </label>
            </div>
            
            <div>
              <label htmlFor="terms_document_url" className="block text-sm font-medium text-gray-700">
                Terms Document URL (Optional)
              </label>
              <input
                type="url"
                name="terms_document_url"
                id="terms_document_url"
                value={formData.terms_document_url}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                Notes (Optional)
              </label>
              <textarea
                name="notes"
                id="notes"
                rows={3}
                value={formData.notes}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsAddingWarranty(false)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Add Warranty
              </button>
            </div>
          </form>
        </div>
      )}

      {editingWarrantyId && (
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <form onSubmit={handleEditWarranty} className="space-y-4">
            <div>
              <label htmlFor="edit-warranty_type_id" className="block text-sm font-medium text-gray-700">
                Warranty Type
              </label>
              <select
                name="warranty_type_id"
                id="edit-warranty_type_id"
                required
                value={formData.warranty_type_id}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                {warrantyTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name} ({type.duration_days} days)
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="edit-start_date" className="block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <input
                type="date"
                name="start_date"
                id="edit-start_date"
                required
                value={formData.start_date}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_premium"
                id="edit-is_premium"
                checked={formData.is_premium}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="edit-is_premium" className="ml-2 block text-sm text-gray-700">
                Premium Warranty (Extended Duration)
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                name="auto_renewal"
                id="edit-auto_renewal"
                checked={formData.auto_renewal}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="edit-auto_renewal" className="ml-2 block text-sm text-gray-700">
                Auto-Renewal
              </label>
            </div>
            
            <div>
              <label htmlFor="edit-terms_document_url" className="block text-sm font-medium text-gray-700">
                Terms Document URL (Optional)
              </label>
              <input
                type="url"
                name="terms_document_url"
                id="edit-terms_document_url"
                value={formData.terms_document_url}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="edit-notes" className="block text-sm font-medium text-gray-700">
                Notes (Optional)
              </label>
              <textarea
                name="notes"
                id="edit-notes"
                rows={3}
                value={formData.notes}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setEditingWarrantyId(null)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Update Warranty
              </button>
            </div>
          </form>
        </div>
      )}

      {warranties.length === 0 ? (
        <div className="p-8 text-center">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Warranties</h3>
          <p className="text-gray-500 mb-4">
            This project doesn't have any warranties yet.
          </p>
          {isEditable && (
            <button
              onClick={() => setIsAddingWarranty(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add First Warranty
            </button>
          )}
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {warranties.map((warranty) => (
            <div key={warranty.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-start">
                <div className="mr-3">
                  {getStatusIcon(warranty.status)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between">
                    <div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(warranty.status)}`}>
                        {warranty.status.charAt(0).toUpperCase() + warranty.status.slice(1)}
                      </span>
                      {warranty.is_premium && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Premium
                        </span>
                      )}
                    </div>
                    {isEditable && (
                      <button
                        onClick={() => startEditWarranty(warranty)}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  
                  <h4 className="mt-1 text-sm font-medium text-gray-900">
                    {warranty.warranty_type?.name || 'Standard Warranty'}
                  </h4>
                  
                  <div className="mt-2 flex items-center text-xs text-gray-500">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>
                      {formatDate(warranty.start_date)} - {formatDate(warranty.end_date)}
                    </span>
                  </div>
                  
                  {warranty.status === 'active' && (
                    <div className="mt-2">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-blue-600 h-2.5 rounded-full" 
                            style={{ 
                              width: `${Math.max(0, Math.min(100, 
                                (1 - getDaysRemaining(warranty.end_date) / 
                                (new Date(warranty.end_date).getTime() - new Date(warranty.start_date).getTime()) * 
                                (1000 * 60 * 60 * 24)
                                ) * 100
                              ))}%` 
                            }}
                          ></div>
                        </div>
                        <span className="ml-2 text-xs text-gray-500">
                          {getDaysRemaining(warranty.end_date)} days left
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {warranty.notes && (
                    <p className="mt-2 text-xs text-gray-500">
                      <span className="font-medium">Notes:</span> {warranty.notes}
                    </p>
                  )}
                  
                  {warranty.terms_document_url && (
                    <a 
                      href={warranty.terms_document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center text-xs text-blue-600 hover:text-blue-800"
                    >
                      <FileText className="h-3 w-3 mr-1" />
                      View Warranty Terms
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WarrantyEligibilityTracker;
