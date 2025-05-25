import { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle } from 'lucide-react';

interface ProcessMonitorProps {
  isActive: boolean;
  onStop?: () => void;
  processName?: string;
}

const ProcessMonitor: React.FC<ProcessMonitorProps> = ({
  isActive,
  onStop,
  processName = 'Scraping'
}) => {
  const [logs, setLogs] = useState<Array<{ message: string; timestamp: string; type: 'info' | 'error' | 'success' }>>([]);

  useEffect(() => {
    if (isActive) {
      addLog(`${processName} process started`, 'info');
    }
  }, [isActive, processName]);

  const addLog = (message: string, type: 'info' | 'error' | 'success' = 'info') => {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    setLogs(prev => [...prev, { message, timestamp, type }]);
  };

  const handleStop = () => {
    addLog(`${processName} process stopped by user`, 'error');
    onStop?.();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          {isActive ? (
            <div className="flex items-center">
              <div className="animate-pulse w-2 h-2 bg-green-500 rounded-full mr-2" />
              <span className="text-sm font-medium">{processName} in Progress</span>
            </div>
          ) : (
            <div className="flex items-center">
              <div className="w-2 h-2 bg-gray-400 rounded-full mr-2" />
              <span className="text-sm font-medium">{processName} Inactive</span>
            </div>
          )}
        </div>
        {isActive && (
          <button
            onClick={handleStop}
            className="p-1 hover:bg-gray-100 rounded-full"
            title="Stop Process"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        )}
      </div>

      <div className="bg-gray-50 rounded-md p-2 h-48 overflow-y-auto">
        <div className="space-y-1">
          {logs.map((log, index) => (
            <div
              key={index}
              className="flex items-start text-sm font-mono"
            >
              <span className="text-gray-400 min-w-[60px]">{log.timestamp}</span>
              <span className="mx-2">
                {log.type === 'error' && <AlertCircle className="h-4 w-4 text-red-500 inline mr-1" />}
                {log.type === 'success' && <CheckCircle className="h-4 w-4 text-green-500 inline mr-1" />}
              </span>
              <span className={`
                ${log.type === 'error' ? 'text-red-600' : ''}
                ${log.type === 'success' ? 'text-green-600' : ''}
                ${log.type === 'info' ? 'text-gray-600' : ''}
              `}>
                {log.message}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProcessMonitor;