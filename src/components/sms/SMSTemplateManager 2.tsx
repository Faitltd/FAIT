import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { smsService } from '../../services/SMSService';
import { Plus, Edit, Trash, Save, X } from 'lucide-react';

const SMSTemplateManager: React.FC = () => {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<any | null>(null);
  const [newTemplate, setNewTemplate] = useState<{ name: string; text: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const data = await smsService.getSMSTemplates(user.id);
        setTemplates(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching SMS templates:', err);
        setError('Failed to load templates');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTemplates();
  }, [user]);

  const handleCreateTemplate = async () => {
    if (!user || !newTemplate) return;
    
    try {
      const createdTemplate = await smsService.createSMSTemplate(
        user.id,
        newTemplate.name,
        newTemplate.text
      );
      
      setTemplates(prev => [...prev, createdTemplate]);
      setNewTemplate(null);
    } catch (err) {
      console.error('Error creating template:', err);
      alert('Failed to create template');
    }
  };

  const handleUpdateTemplate = async () => {
    if (!user || !editingTemplate) return;
    
    try {
      // TODO: Implement update template in SMSService
      // For now, we'll just update the local state
      
      setTemplates(prev => 
        prev.map(t => 
          t.id === editingTemplate.id 
            ? { ...t, name: editingTemplate.name, templateText: editingTemplate.templateText } 
            : t
        )
      );
      
      setEditingTemplate(null);
    } catch (err) {
      console.error('Error updating template:', err);
      alert('Failed to update template');
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!user) return;
    
    if (!confirm('Are you sure you want to delete this template?')) {
      return;
    }
    
    try {
      // TODO: Implement delete template in SMSService
      // For now, we'll just update the local state
      
      setTemplates(prev => prev.filter(t => t.id !== templateId));
    } catch (err) {
      console.error('Error deleting template:', err);
      alert('Failed to delete template');
    }
  };

  if (loading && templates.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-gray-400">Loading templates...</div>
      </div>
    );
  }

  if (error && templates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-500">
        <div className="mb-2">Error loading templates</div>
        <button 
          className="px-4 py-2 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold">Message Templates</h2>
        <button
          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center"
          onClick={() => setNewTemplate({ name: '', text: '' })}
        >
          <Plus className="h-4 w-4 mr-1" />
          New Template
        </button>
      </div>
      
      {templates.length === 0 && !newTemplate ? (
        <div className="p-8 text-center text-gray-500">
          <p>No templates found</p>
          <p className="text-sm mt-1">Create a template to quickly send common messages</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {templates.map((template) => (
            <li key={template.id} className="p-4">
              {editingTemplate && editingTemplate.id === template.id ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Template Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={editingTemplate.name}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Template Text
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={4}
                      value={editingTemplate.templateText}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, templateText: e.target.value })}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md flex items-center"
                      onClick={() => setEditingTemplate(null)}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </button>
                    <button
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center"
                      onClick={handleUpdateTemplate}
                    >
                      <Save className="h-4 w-4 mr-1" />
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{template.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{template.templateText}</p>
                    </div>
                    <div className="flex space-x-2">
                      {!template.isGlobal && (
                        <>
                          <button
                            className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                            onClick={() => setEditingTemplate(template)}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                            onClick={() => handleDeleteTemplate(template.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      {template.isGlobal && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          Global
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </li>
          ))}
          
          {newTemplate && (
            <li className="p-4 bg-blue-50">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Template Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                    placeholder="e.g., Appointment Reminder"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Template Text
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    value={newTemplate.text}
                    onChange={(e) => setNewTemplate({ ...newTemplate, text: e.target.value })}
                    placeholder="e.g., Hi, this is a reminder about your upcoming appointment on {{booking_date}} at {{booking_time}}."
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md flex items-center"
                    onClick={() => setNewTemplate(null)}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </button>
                  <button
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center"
                    onClick={handleCreateTemplate}
                    disabled={!newTemplate.name || !newTemplate.text}
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Create
                  </button>
                </div>
              </div>
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

export default SMSTemplateManager;
