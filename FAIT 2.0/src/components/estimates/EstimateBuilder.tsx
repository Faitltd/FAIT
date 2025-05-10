import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import {
  Plus,
  Trash2,
  Save,
  Send,
  Download,
  DollarSign,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface EstimateItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  good_unit_price: number;
  better_unit_price: number;
  best_unit_price: number;
  good_total: number;
  better_total: number;
  best_total: number;
  notes: string;
}

interface EstimateBuilderProps {
  projectId?: string;
  estimateId?: string;
  isReadOnly?: boolean;
}

const EstimateBuilder: React.FC<EstimateBuilderProps> = ({
  projectId,
  estimateId,
  isReadOnly = false
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const params = useParams();

  // Use params if props are not provided
  const activeProjectId = projectId || params.projectId;
  const activeEstimateId = estimateId || params.estimateId;

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [selectedTier, setSelectedTier] = useState<'good' | 'better' | 'best' | null>(null);
  const [items, setItems] = useState<EstimateItem[]>([]);
  const [project, setProject] = useState<any>(null);

  // Calculated totals
  const goodTotal = items.reduce((sum, item) => sum + (item.good_total || 0), 0);
  const betterTotal = items.reduce((sum, item) => sum + (item.better_total || 0), 0);
  const bestTotal = items.reduce((sum, item) => sum + (item.best_total || 0), 0);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);

        // If we have an estimate ID, fetch the estimate
        if (activeEstimateId) {
          const { data: estimate, error: estimateError } = await supabase
            .from('estimates')
            .select('*, estimate_items(*)')
            .eq('id', activeEstimateId)
            .single();

          if (estimateError) throw estimateError;

          setTitle(estimate.title);
          setDescription(estimate.description);
          setSelectedTier(estimate.selected_tier);
          setItems(estimate.estimate_items);

          // Fetch the project
          const { data: projectData, error: projectError } = await supabase
            .from('projects')
            .select('*')
            .eq('id', estimate.project_id)
            .single();

          if (!projectError) {
            setProject(projectData);
          }
        }
        // If we have a project ID but no estimate ID, fetch the project
        else if (activeProjectId) {
          const { data: projectData, error: projectError } = await supabase
            .from('projects')
            .select('*')
            .eq('id', activeProjectId)
            .single();

          if (projectError) throw projectError;

          setProject(projectData);
          setTitle(`Estimate for ${projectData.title}`);

          // Add a default empty item
          setItems([{
            id: 'new-item-1',
            description: '',
            quantity: 1,
            unit: 'each',
            good_unit_price: 0,
            better_unit_price: 0,
            best_unit_price: 0,
            good_total: 0,
            better_total: 0,
            best_total: 0,
            notes: ''
          }]);
        }

      } catch (err: any) {
        console.error('Error fetching estimate data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, activeEstimateId, activeProjectId]);

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: `new-item-${items.length + 1}`,
        description: '',
        quantity: 1,
        unit: 'each',
        good_unit_price: 0,
        better_unit_price: 0,
        best_unit_price: 0,
        good_total: 0,
        better_total: 0,
        best_total: 0,
        notes: ''
      }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items];
    const item = { ...newItems[index], [field]: value };

    // Recalculate totals if quantity or unit price changes
    if (['quantity', 'good_unit_price', 'better_unit_price', 'best_unit_price'].includes(field)) {
      item.good_total = item.quantity * item.good_unit_price;
      item.better_total = item.quantity * item.better_unit_price;
      item.best_total = item.quantity * item.best_unit_price;
    }

    newItems[index] = item;
    setItems(newItems);
  };

  const handleSave = async (status: 'draft' | 'sent' = 'draft') => {
    if (!user || !project) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      // Create or update the estimate
      let estimateId = activeEstimateId;

      if (!estimateId) {
        // Create a new estimate
        const { data: newEstimate, error: estimateError } = await supabase
          .from('estimates')
          .insert({
            project_id: project.id,
            title,
            description,
            good_price: goodTotal,
            better_price: betterTotal,
            best_price: bestTotal,
            selected_tier: selectedTier,
            status,
            created_by: user.id
          })
          .select()
          .single();

        if (estimateError) throw estimateError;

        estimateId = newEstimate.id;
      } else {
        // Update existing estimate
        const { error: updateError } = await supabase
          .from('estimates')
          .update({
            title,
            description,
            good_price: goodTotal,
            better_price: betterTotal,
            best_price: bestTotal,
            selected_tier: selectedTier,
            status,
            updated_at: new Date().toISOString()
          })
          .eq('id', estimateId);

        if (updateError) throw updateError;

        // Delete existing items to replace them
        const { error: deleteError } = await supabase
          .from('estimate_items')
          .delete()
          .eq('estimate_id', estimateId);

        if (deleteError) throw deleteError;
      }

      // Add all items
      const itemsToInsert = items.map(item => ({
        estimate_id: estimateId,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        good_unit_price: item.good_unit_price,
        better_unit_price: item.better_unit_price,
        best_unit_price: item.best_unit_price,
        good_total: item.good_total,
        better_total: item.better_total,
        best_total: item.best_total,
        notes: item.notes
      }));

      const { error: itemsError } = await supabase
        .from('estimate_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      setSuccess(status === 'draft'
        ? 'Estimate saved as draft'
        : 'Estimate sent to client');

      // Redirect if this is a new estimate
      if (!activeEstimateId) {
        navigate(`/estimates/${estimateId}`);
      }

    } catch (err: any) {
      console.error('Error saving estimate:', err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSend = async () => {
    await handleSave('sent');
  };

  const handleGenerateProposal = async () => {
    // In a real app, this would generate a PDF proposal
    alert('This would generate a PDF proposal in a real application');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {activeEstimateId ? 'Edit Estimate' : 'Create Estimate'}
        </h1>

        {!isReadOnly && (
          <div className="flex space-x-2">
            <button
              onClick={() => handleSave('draft')}
              disabled={saving}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition flex items-center"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </button>

            <button
              onClick={handleSend}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center"
            >
              <Send className="h-4 w-4 mr-2" />
              Send to Client
            </button>

            <button
              onClick={handleGenerateProposal}
              disabled={saving}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Generate Proposal
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
          <div>
            <h3 className="font-medium text-red-800">Error</h3>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start">
          <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
          <div>
            <h3 className="font-medium text-green-800">Success</h3>
            <p className="text-green-700">{success}</p>
          </div>
        </div>
      )}

      {/* Project Info */}
      {project && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h2 className="font-medium text-blue-800">Project: {project.title}</h2>
          <p className="text-blue-700">{project.address}, {project.city}, {project.state} {project.zip}</p>
        </div>
      )}

      {/* Estimate Details */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Estimate Details</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estimate Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isReadOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter estimate title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isReadOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter estimate description"
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* Tiered Pricing Options */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Tiered Pricing Options</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div
            className={`p-4 border-2 rounded-lg ${
              selectedTier === 'good'
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-primary-300'
            } cursor-pointer transition`}
            onClick={() => !isReadOnly && setSelectedTier('good')}
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-lg">Good</h3>
              {selectedTier === 'good' && (
                <CheckCircle className="h-5 w-5 text-primary-500" />
              )}
            </div>
            <p className="text-gray-600 text-sm mb-3">Basic option with essential features</p>
            <div className="text-2xl font-bold text-primary-600">${goodTotal.toLocaleString()}</div>
          </div>

          <div
            className={`p-4 border-2 rounded-lg ${
              selectedTier === 'better'
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-primary-300'
            } cursor-pointer transition`}
            onClick={() => !isReadOnly && setSelectedTier('better')}
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-lg">Better</h3>
              {selectedTier === 'better' && (
                <CheckCircle className="h-5 w-5 text-primary-500" />
              )}
            </div>
            <p className="text-gray-600 text-sm mb-3">Enhanced option with additional features</p>
            <div className="text-2xl font-bold text-primary-600">${betterTotal.toLocaleString()}</div>
          </div>

          <div
            className={`p-4 border-2 rounded-lg ${
              selectedTier === 'best'
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-primary-300'
            } cursor-pointer transition`}
            onClick={() => !isReadOnly && setSelectedTier('best')}
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-lg">Best</h3>
              {selectedTier === 'best' && (
                <CheckCircle className="h-5 w-5 text-primary-500" />
              )}
            </div>
            <p className="text-gray-600 text-sm mb-3">Premium option with all features</p>
            <div className="text-2xl font-bold text-primary-600">${bestTotal.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Line Items</h2>

          {!isReadOnly && (
            <button
              onClick={handleAddItem}
              className="px-3 py-1.5 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition flex items-center text-sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Item
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Qty
                </th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit
                </th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Good Price
                </th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Better Price
                </th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Best Price
                </th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Good Total
                </th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Better Total
                </th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Best Total
                </th>
                {!isReadOnly && (
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map((item, index) => (
                <tr key={item.id}>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      disabled={isReadOnly}
                      className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                      placeholder="Item description"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                      disabled={isReadOnly}
                      className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                      min="0"
                      step="0.01"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={item.unit}
                      onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                      disabled={isReadOnly}
                      className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                      placeholder="Unit"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <input
                        type="number"
                        value={item.good_unit_price}
                        onChange={(e) => handleItemChange(index, 'good_unit_price', parseFloat(e.target.value) || 0)}
                        disabled={isReadOnly}
                        className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <input
                        type="number"
                        value={item.better_unit_price}
                        onChange={(e) => handleItemChange(index, 'better_unit_price', parseFloat(e.target.value) || 0)}
                        disabled={isReadOnly}
                        className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <input
                        type="number"
                        value={item.best_unit_price}
                        onChange={(e) => handleItemChange(index, 'best_unit_price', parseFloat(e.target.value) || 0)}
                        disabled={isReadOnly}
                        className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right">
                    ${item.good_total.toLocaleString()}
                  </td>
                  <td className="px-3 py-2 text-right">
                    ${item.better_total.toLocaleString()}
                  </td>
                  <td className="px-3 py-2 text-right">
                    ${item.best_total.toLocaleString()}
                  </td>
                  {!isReadOnly && (
                    <td className="px-3 py-2">
                      <button
                        onClick={() => handleRemoveItem(index)}
                        className="text-red-600 hover:text-red-800 transition"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={6} className="px-3 py-3 text-right font-medium">
                  Totals:
                </td>
                <td className="px-3 py-3 text-right font-bold">
                  ${goodTotal.toLocaleString()}
                </td>
                <td className="px-3 py-3 text-right font-bold">
                  ${betterTotal.toLocaleString()}
                </td>
                <td className="px-3 py-3 text-right font-bold">
                  ${bestTotal.toLocaleString()}
                </td>
                {!isReadOnly && <td></td>}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EstimateBuilder;
