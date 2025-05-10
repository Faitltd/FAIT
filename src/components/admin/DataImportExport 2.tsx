import React, { useState } from 'react';
import { dataImportExportService } from '../../services/DataImportExportService';
import { useChunkedProcessing } from '../../hooks/useChunkedProcessing';
import { Download, Upload, FileText, CheckCircle, AlertCircle, Loader } from 'lucide-react';

interface DataImportExportProps {
  /** CSS class name */
  className?: string;
}

/**
 * Component for importing and exporting large datasets
 */
const DataImportExport: React.FC<DataImportExportProps> = ({ className = '' }) => {
  // State for export options
  const [exportType, setExportType] = useState<'service_agents' | 'services'>('service_agents');
  const [includeServices, setIncludeServices] = useState(true);
  const [includeBookings, setIncludeBookings] = useState(false);
  const [includeReviews, setIncludeReviews] = useState(false);
  const [filterByStatus, setFilterByStatus] = useState('');
  const [filterByZipCode, setFilterByZipCode] = useState('');
  const [filterByCategory, setFilterByCategory] = useState('');
  
  // State for import
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importType, setImportType] = useState<'service_agents' | 'services'>('service_agents');
  
  // State for export results
  const [exportResult, setExportResult] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  
  // State for import results
  const [importResult, setImportResult] = useState<{
    imported: number;
    updated: number;
    failed: number;
    errors: string[];
  } | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  
  // Use chunked processing for file reading
  const {
    isProcessing: isReadingFile,
    progress: readProgress,
    result: fileContent,
    startProcessing: startReadingFile,
    error: readError
  } = useChunkedProcessing<string>(
    importFile ? [importFile] : [],
    async (chunk) => {
      const file = chunk[0] as File;
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = (e) => reject(new Error('Error reading file'));
        reader.readAsText(file);
      });
    },
    {
      autoStart: false
    }
  );
  
  // Handle export
  const handleExport = async () => {
    try {
      setExportResult(null);
      setExportError(null);
      
      let result: string;
      
      if (exportType === 'service_agents') {
        result = await dataImportExportService.exportServiceAgentsToCSV({
          includeServices,
          includeBookings,
          includeReviews,
          filterByStatus: filterByStatus || undefined,
          filterByZipCode: filterByZipCode || undefined
        });
      } else {
        result = await dataImportExportService.exportServicesToCSV({
          filterByCategory: filterByCategory || undefined,
          filterByStatus: filterByStatus || undefined,
          filterByZipCode: filterByZipCode || undefined
        });
      }
      
      setExportResult(result);
    } catch (error) {
      console.error('Export error:', error);
      setExportError(error instanceof Error ? error.message : String(error));
    }
  };
  
  // Handle import
  const handleImport = async () => {
    if (!fileContent) {
      startReadingFile();
      return;
    }
    
    try {
      setImportResult(null);
      setImportError(null);
      
      let result;
      
      if (importType === 'service_agents') {
        result = await dataImportExportService.importServiceAgentsFromCSV(fileContent);
      } else {
        result = await dataImportExportService.importServicesFromCSV(fileContent);
      }
      
      setImportResult(result);
    } catch (error) {
      console.error('Import error:', error);
      setImportError(error instanceof Error ? error.message : String(error));
    }
  };
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImportFile(file);
      setFileContent(null);
      setImportResult(null);
      setImportError(null);
    }
  };
  
  // Handle download
  const handleDownload = () => {
    if (!exportResult) return;
    
    const blob = new Blob([exportResult], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${exportType}_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className={`data-import-export ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Export Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Download className="h-5 w-5 mr-2 text-blue-600" />
            Export Data
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Export Type
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={exportType}
                onChange={(e) => setExportType(e.target.value as any)}
              >
                <option value="service_agents">Service Agents</option>
                <option value="services">Services</option>
              </select>
            </div>
            
            {exportType === 'service_agents' && (
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="includeServices"
                    checked={includeServices}
                    onChange={(e) => setIncludeServices(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="includeServices" className="ml-2 block text-sm text-gray-700">
                    Include Services
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="includeBookings"
                    checked={includeBookings}
                    onChange={(e) => setIncludeBookings(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="includeBookings" className="ml-2 block text-sm text-gray-700">
                    Include Bookings
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="includeReviews"
                    checked={includeReviews}
                    onChange={(e) => setIncludeReviews(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="includeReviews" className="ml-2 block text-sm text-gray-700">
                    Include Reviews
                  </label>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by Status
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filterByStatus}
                  onChange={(e) => setFilterByStatus(e.target.value)}
                  placeholder="e.g., active"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by ZIP Code
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filterByZipCode}
                  onChange={(e) => setFilterByZipCode(e.target.value)}
                  placeholder="e.g., 90210"
                />
              </div>
            </div>
            
            {exportType === 'services' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by Category
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filterByCategory}
                  onChange={(e) => setFilterByCategory(e.target.value)}
                  placeholder="e.g., Plumbing"
                />
              </div>
            )}
            
            <button
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={handleExport}
              disabled={!!exportResult}
            >
              Export to CSV
            </button>
            
            {exportError && (
              <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
                <div className="font-medium">Export failed</div>
                <div className="text-sm">{exportError}</div>
              </div>
            )}
            
            {exportResult && (
              <div className="mt-4">
                <div className="flex items-center text-green-600 mb-2">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  <span>Export successful!</span>
                </div>
                
                <button
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  onClick={handleDownload}
                >
                  Download CSV
                </button>
                
                <div className="mt-2 p-3 bg-gray-100 rounded-md">
                  <div className="font-medium">Preview</div>
                  <div className="text-xs overflow-auto max-h-32 mt-1">
                    {exportResult.substring(0, 500)}...
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Import Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Upload className="h-5 w-5 mr-2 text-green-600" />
            Import Data
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Import Type
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={importType}
                onChange={(e) => setImportType(e.target.value as any)}
              >
                <option value="service_agents">Service Agents</option>
                <option value="services">Services</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CSV File
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        accept=".csv"
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">CSV up to 10MB</p>
                </div>
              </div>
            </div>
            
            {importFile && (
              <div className="p-3 bg-blue-50 rounded-md">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="text-sm font-medium text-blue-700">{importFile.name}</span>
                  <span className="ml-2 text-xs text-blue-500">
                    ({Math.round(importFile.size / 1024)} KB)
                  </span>
                </div>
              </div>
            )}
            
            <button
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              onClick={handleImport}
              disabled={!importFile || isReadingFile}
            >
              {isReadingFile ? (
                <span className="flex items-center justify-center">
                  <Loader className="animate-spin h-5 w-5 mr-2" />
                  Reading file... {readProgress}%
                </span>
              ) : (
                'Import from CSV'
              )}
            </button>
            
            {readError && (
              <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
                <div className="font-medium">Error reading file</div>
                <div className="text-sm">{readError.message}</div>
              </div>
            )}
            
            {importError && (
              <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
                <div className="font-medium">Import failed</div>
                <div className="text-sm">{importError}</div>
              </div>
            )}
            
            {importResult && (
              <div className="mt-4">
                <div className="flex items-center text-green-600 mb-2">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  <span>Import completed</span>
                </div>
                
                <div className="p-3 bg-gray-100 rounded-md">
                  <div className="grid grid-cols-3 gap-2 text-center mb-2">
                    <div>
                      <div className="text-sm font-medium text-gray-500">Imported</div>
                      <div className="text-lg font-semibold text-green-600">{importResult.imported}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500">Updated</div>
                      <div className="text-lg font-semibold text-blue-600">{importResult.updated}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500">Failed</div>
                      <div className="text-lg font-semibold text-red-600">{importResult.failed}</div>
                    </div>
                  </div>
                  
                  {importResult.errors.length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-1">Errors</div>
                      <div className="text-xs overflow-auto max-h-32 bg-red-50 p-2 rounded">
                        {importResult.errors.slice(0, 5).map((error, index) => (
                          <div key={index} className="mb-1 text-red-600">
                            {error}
                          </div>
                        ))}
                        {importResult.errors.length > 5 && (
                          <div className="text-gray-500">
                            ...and {importResult.errors.length - 5} more errors
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataImportExport;
