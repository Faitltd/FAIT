import React, { useState, useEffect } from 'react';
import { 
  Save, 
  AlertCircle, 
  Info, 
  Check, 
  Settings, 
  Mail, 
  FileText, 
  Upload, 
  DollarSign,
  Globe,
  Shield
} from 'lucide-react';
import { adminService } from '../../services/AdminService';
import { SystemSettings as SystemSettingsType } from '../../types/admin';
import { useAuth } from '../../contexts/AuthContext';

const SystemSettings: React.FC = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<SystemSettingsType[]>([]);
  const [editedSettings, setEditedSettings] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getSystemSettings();
      setSettings(data);
      
      // Initialize edited settings with current values
      const initialValues: Record<string, string> = {};
      data.forEach(setting => {
        initialValues[setting.setting_key] = setting.setting_value;
      });
      setEditedSettings(initialValues);
      
      setError(null);
    } catch (err) {
      console.error('Error fetching system settings:', err);
      setError('Failed to load system settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingChange = (key: string, value: string) => {
    setEditedSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = async () => {
    if (!user) return;
    
    setIsSaving(true);
    setSaveSuccess(false);
    setError(null);
    
    try {
      // Find settings that have changed
      const changedSettings = Object.entries(editedSettings).filter(([key, value]) => {
        const originalSetting = settings.find(s => s.setting_key === key);
        return originalSetting && originalSetting.setting_value !== value;
      });
      
      if (changedSettings.length === 0) {
        setSaveSuccess(true);
        setIsSaving(false);
        return;
      }
      
      // Update each changed setting
      for (const [key, value] of changedSettings) {
        await adminService.updateSystemSetting(key, value, user.id);
      }
      
      // Refresh settings
      await fetchSettings();
      setSaveSuccess(true);
    } catch (err) {
      console.error('Error saving system settings:', err);
      setError('Failed to save system settings');
    } finally {
      setIsSaving(false);
      
      // Clear success message after 3 seconds
      if (saveSuccess) {
        setTimeout(() => {
          setSaveSuccess(false);
        }, 3000);
      }
    }
  };

  const getSettingIcon = (key: string) => {
    if (key.includes('platform')) {
      return <Globe className="h-5 w-5 text-blue-500" />;
    } else if (key.includes('email') || key.includes('contact')) {
      return <Mail className="h-5 w-5 text-purple-500" />;
    } else if (key.includes('token') || key.includes('withdrawal')) {
      return <DollarSign className="h-5 w-5 text-green-500" />;
    } else if (key.includes('file') || key.includes('allowed')) {
      return <Upload className="h-5 w-5 text-orange-500" />;
    } else if (key.includes('terms') || key.includes('privacy')) {
      return <FileText className="h-5 w-5 text-gray-500" />;
    } else if (key.includes('maintenance') || key.includes('registration')) {
      return <Shield className="h-5 w-5 text-red-500" />;
    } else {
      return <Settings className="h-5 w-5 text-gray-500" />;
    }
  };

  const renderSettingInput = (setting: SystemSettingsType) => {
    const value = editedSettings[setting.setting_key] || '';
    
    switch (setting.setting_type) {
      case 'boolean':
        return (
          <select
            id={setting.setting_key}
            value={value}
            onChange={(e) => handleSettingChange(setting.setting_key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            disabled={isSaving}
          >
            <option value="true">Enabled</option>
            <option value="false">Disabled</option>
          </select>
        );
      case 'number':
        return (
          <input
            type="number"
            id={setting.setting_key}
            value={value}
            onChange={(e) => handleSettingChange(setting.setting_key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            disabled={isSaving}
          />
        );
      default:
        return (
          <input
            type="text"
            id={setting.setting_key}
            value={value}
            onChange={(e) => handleSettingChange(setting.setting_key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            disabled={isSaving}
          />
        );
    }
  };

  // Group settings by category
  const groupedSettings: Record<string, SystemSettingsType[]> = {};
  settings.forEach(setting => {
    const category = setting.setting_key.split('_')[0];
    if (!groupedSettings[category]) {
      groupedSettings[category] = [];
    }
    groupedSettings[category].push(setting);
  });

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">System Settings</h2>
          <button
            onClick={handleSaveSettings}
            disabled={isSaving || isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSaving ? (
              <>Saving...</>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
        
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        
        {saveSuccess && (
          <div className="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded flex items-start">
            <Check className="h-5 w-5 mr-2 mt-0.5" />
            <span>Settings saved successfully</span>
          </div>
        )}
      </div>
      
      <div className="p-6">
        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="md:col-span-2 h-10 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedSettings).map(([category, categorySettings]) => (
              <div key={category}>
                <h3 className="text-lg font-medium text-gray-900 mb-4 capitalize">
                  {category} Settings
                </h3>
                
                <div className="space-y-4">
                  {categorySettings.map((setting) => (
                    <div key={setting.setting_key} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                      <div>
                        <label htmlFor={setting.setting_key} className="block text-sm font-medium text-gray-700">
                          <div className="flex items-center">
                            {getSettingIcon(setting.setting_key)}
                            <span className="ml-2">{setting.setting_key.split('_').join(' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                          </div>
                        </label>
                        {setting.description && (
                          <p className="mt-1 text-xs text-gray-500">{setting.description}</p>
                        )}
                      </div>
                      
                      <div className="md:col-span-2">
                        {renderSettingInput(setting)}
                        <div className="flex items-center mt-1">
                          <Info className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="text-xs text-gray-500">
                            {setting.is_public ? 'Public setting' : 'Private setting'} • Type: {setting.setting_type}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemSettings;
